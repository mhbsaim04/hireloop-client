import { stripe } from "@/lib/stripe"
import {
  activatePaidCheckout,
  CheckoutCompletionError,
} from "@/lib/stripe-billing"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook signature configuration is missing." },
      { status: 400 }
    )
  }

  let event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Invalid Stripe webhook signature:", error)
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    )
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true })
  }

  const checkoutSession = event.data.object
  if (
    checkoutSession.metadata?.app !== "hireloop" ||
    checkoutSession.payment_status !== "paid"
  ) {
    return NextResponse.json({ received: true })
  }

  try {
    await activatePaidCheckout(checkoutSession)
    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof CheckoutCompletionError) {
      console.error("Stripe webhook could not activate checkout:", error)
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    console.error("Failed to process Stripe checkout webhook:", error)
    return NextResponse.json(
      { error: "Could not process the completed checkout." },
      { status: 500 }
    )
  }
}
