import "server-only"

import { ObjectId } from "mongodb"
import type Stripe from "stripe"
import { CHECKOUT_PLANS } from "@/lib/billing-plans"
import { db } from "@/lib/auth"

type CheckoutRole = keyof typeof CHECKOUT_PLANS
type CheckoutPlan = {
  role: CheckoutRole
  plan: "growth" | "premium"
  planName: string
  amountCents: number
  currency: "usd"
  userId: string
}

export class CheckoutCompletionError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message)
    this.name = "CheckoutCompletionError"
  }
}

function getCheckoutPlan(session: Stripe.Checkout.Session): CheckoutPlan {
  const metadata = session.metadata
  const role = metadata?.role
  const audience = metadata?.audience
  const planName = metadata?.planName
  const userId = metadata?.userId
  const plan =
    role === "seekers"
      ? planName === "Pro"
        ? CHECKOUT_PLANS.seekers.Pro
        : planName === "Premium"
          ? CHECKOUT_PLANS.seekers.Premium
          : undefined
      : role === "recruiters"
        ? planName === "Growth"
          ? CHECKOUT_PLANS.recruiters.Growth
          : planName === "Enterprise"
            ? CHECKOUT_PLANS.recruiters.Enterprise
            : undefined
        : undefined

  if (
    metadata?.app !== "hireloop" ||
    (role !== "seekers" && role !== "recruiters") ||
    audience !== role ||
    typeof planName !== "string" ||
    !plan ||
    metadata.plan !== plan.plan ||
    !userId
  ) {
    throw new CheckoutCompletionError(
      "This checkout session is not a valid HireLoop plan purchase.",
      400,
      "INVALID_CHECKOUT_SESSION"
    )
  }

  return {
    role,
    plan: plan.plan,
    planName,
    amountCents: plan.amountCents,
    currency: "usd",
    userId,
  }
}

export async function activatePaidCheckout(
  session: Stripe.Checkout.Session,
  authenticatedUser?: { id: string; role?: string }
) {
  const checkout = getCheckoutPlan(session)

  if (
    authenticatedUser &&
    (authenticatedUser.id !== checkout.userId ||
      authenticatedUser.role !==
        (checkout.role === "seekers" ? "seeker" : "recruiter"))
  ) {
    throw new CheckoutCompletionError(
      "This checkout session does not belong to your account.",
      403,
      "CHECKOUT_ACCOUNT_MISMATCH"
    )
  }

  if (session.client_reference_id !== checkout.userId) {
    throw new CheckoutCompletionError(
      "The Stripe checkout session account reference is invalid.",
      400,
      "INVALID_CHECKOUT_SESSION"
    )
  }

  if (
    session.mode !== "subscription" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.currency !== checkout.currency ||
    session.amount_total !== checkout.amountCents
  ) {
    throw new CheckoutCompletionError(
      "Stripe has not confirmed payment for this plan yet.",
      409,
      "PAYMENT_NOT_CONFIRMED"
    )
  }

  const users = db.collection<{ _id: ObjectId | string; role?: string }>("user")
  const accountId = ObjectId.isValid(checkout.userId)
    ? new ObjectId(checkout.userId)
    : checkout.userId
  const account = await users.findOne(
    { _id: accountId },
    { projection: { role: 1 } }
  )

  if (!account) {
    throw new CheckoutCompletionError(
      "The account for this payment could not be found.",
      404,
      "ACCOUNT_NOT_FOUND"
    )
  }

  const accountRole = checkout.role === "seekers" ? "seeker" : "recruiter"
  if (account.role && account.role !== accountRole) {
    throw new CheckoutCompletionError(
      "The purchased plan does not match your account type.",
      403,
      "CHECKOUT_ACCOUNT_MISMATCH"
    )
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id
  const transactionId = paymentIntentId ?? session.id
  const payments = db.collection<{ _id: string }>("payments")

  await payments.updateOne(
    { _id: session.id },
    {
      $setOnInsert: {
        userId: checkout.userId,
        role: accountRole,
        plan: checkout.plan,
        planName: checkout.planName,
        amountCents: checkout.amountCents,
        currency: checkout.currency,
        transactionId,
        stripeSessionId: session.id,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null),
        createdAt: new Date(session.created * 1000),
      },
    },
    { upsert: true }
  )

  const activationTime = new Date(session.created * 1000)
  const activation = await users.updateOne(
    {
      _id: accountId,
      $or: [
        { billingPlanUpdatedAt: { $exists: false } },
        { billingPlanUpdatedAt: { $lte: activationTime } },
      ],
    },
    {
      $set: {
        role: accountRole,
        plan: checkout.plan,
        billingPlanUpdatedAt: activationTime,
        updatedAt: new Date(),
      },
    }
  )

  return {
    role: accountRole,
    plan: checkout.plan,
    planName: checkout.planName,
    transactionId,
    planActivated: activation.matchedCount > 0,
  }
}
