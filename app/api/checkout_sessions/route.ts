import { auth } from "@/lib/auth"
import { CHECKOUT_PLANS } from "@/lib/billing-plans"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

type Audience = keyof typeof CHECKOUT_PLANS

function isAudience(value: string): value is Audience {
  return value === "seekers" || value === "recruiters"
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const planName = formData.get("plan")
    const audienceValue = formData.get("audience")

    if (
      typeof planName !== "string" ||
      typeof audienceValue !== "string" ||
      !isAudience(audienceValue)
    ) {
      return NextResponse.json(
        { error: "Select a valid paid plan before checkout." },
        { status: 400 }
      )
    }

    const plan =
      audienceValue === "seekers"
        ? planName === "Pro"
          ? CHECKOUT_PLANS.seekers.Pro
          : planName === "Premium"
            ? CHECKOUT_PLANS.seekers.Premium
            : undefined
        : planName === "Growth"
          ? CHECKOUT_PLANS.recruiters.Growth
          : planName === "Enterprise"
            ? CHECKOUT_PLANS.recruiters.Enterprise
            : undefined
    if (!plan) {
      return NextResponse.json(
        { error: "Select a valid paid plan before checkout." },
        { status: 400 }
      )
    }

    const authSession = await auth.api.getSession({ headers: request.headers })
    if (!authSession?.user) {
      const callbackURL = `/checkout?plan=${encodeURIComponent(planName)}&audience=${audienceValue}`
      const signInURL = `/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`
      return NextResponse.redirect(new URL(signInURL, request.url), 303)
    }

    const expectedRole = audienceValue === "seekers" ? "seeker" : "recruiter"
    const userRole = authSession.user.role ?? "seeker"
    if (userRole !== expectedRole) {
      const checkoutURL = new URL(
        `/checkout?plan=${encodeURIComponent(planName)}&audience=${audienceValue}&error=account_type`,
        request.url
      )
      return NextResponse.redirect(checkoutURL, 303)
    }

    const metadata = {
      app: "hireloop",
      userId: authSession.user.id,
      role: audienceValue,
      audience: audienceValue,
      plan: plan.plan,
      planName,
    }
    const appOrigin = process.env.BETTER_AUTH_URL
      ? new URL(process.env.BETTER_AUTH_URL).origin
      : new URL(request.url).origin
    const successURL = `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelURL = `${appOrigin}/checkout?plan=${encodeURIComponent(planName)}&audience=${audienceValue}&canceled=1`

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.amountCents,
            product_data: {
              name: `HireLoop ${planName}`,
            },
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      client_reference_id: authSession.user.id,
      customer_email: authSession.user.email || undefined,
      metadata,
      subscription_data: { metadata },
      success_url: successURL,
      cancel_url: cancelURL,
    })

    if (!stripeSession.url) {
      throw new Error("Stripe did not return a checkout URL.")
    }

    return NextResponse.redirect(stripeSession.url, 303)
  } catch (error) {
    console.error("Failed to create Stripe checkout session:", error)
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    )
  }
}
