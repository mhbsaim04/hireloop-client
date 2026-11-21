import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import {
  activatePaidCheckout,
  CheckoutCompletionError,
} from "@/lib/stripe-billing"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authSession = await auth.api.getSession({ headers: request.headers })
    if (!authSession?.user) {
      return NextResponse.json(
        { error: "Sign in to confirm your payment." },
        { status: 401 }
      )
    }

    const payload: unknown = await request.json()
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("sessionId" in payload) ||
      typeof payload.sessionId !== "string" ||
      !/^cs_(test|live)_[A-Za-z0-9]+$/.test(payload.sessionId)
    ) {
      return NextResponse.json(
        { error: "A valid Stripe Checkout session is required." },
        { status: 400 }
      )
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(
      payload.sessionId,
      { expand: ["payment_intent"] }
    )
    const result = await activatePaidCheckout(checkoutSession, {
      id: authSession.user.id,
      role: authSession.user.role ?? "seeker",
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof CheckoutCompletionError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    console.error("Failed to confirm Stripe checkout:", error)
    return NextResponse.json(
      { error: "Could not confirm your payment. Please try again." },
      { status: 500 }
    )
  }
}
