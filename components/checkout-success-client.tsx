"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { verifyCheckoutPayment } from "@/lib/api/billing"

type CompletionResult = {
  role: "seeker" | "recruiter"
  planName: string
  planActivated: boolean
}

type CompletionState =
  | { status: "loading" }
  | { status: "success"; result: CompletionResult }
  | { status: "error"; message: string }

export default function CheckoutSuccessClient({
  sessionId,
}: {
  sessionId?: string
}) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<CompletionState>(() =>
    sessionId
      ? { status: "loading" }
      : {
          status: "error",
          message: "We couldn't find a Stripe Checkout session to confirm.",
        }
  )
  useEffect(() => {
    if (!sessionId) return

    let active = true

    verifyCheckoutPayment(sessionId)
      .then((result) => {
        if (!active) return
        setState({ status: "success", result })
        toast.add({
          title: "Payment successful",
          description: result.planActivated
            ? `${result.planName} is now active on your account.`
            : `Your payment is confirmed. Your newer active plan remains unchanged.`,
          type: "success",
        })
        const billingPath =
          result.role === "recruiter"
            ? "/dashboard/recruiter/billing"
            : "/dashboard/seeker/billing"
        router.replace(billingPath)
        router.refresh()
      })
      .catch((error: unknown) => {
        if (!active) return
        console.error("Could not activate completed checkout:", error)
        setState({
          status: "error",
          message: getVerificationErrorMessage(error),
        })
      })

    return () => {
      active = false
    }
  }, [attempt, router, sessionId])

  function retry() {
    setState({ status: "loading" })
    setAttempt((value) => value + 1)
  }

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-5 py-16">
      <section
        aria-live="polite"
        className="w-full rounded-3xl border border-white/10 bg-[#141417] p-8 text-center shadow-2xl sm:p-12"
      >
        {state.status === "loading" ? (
          <>
            <LoaderCircle
              aria-hidden
              className="mx-auto size-12 animate-spin text-hl-primary"
            />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Confirming your payment
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/55">
              We’re verifying your checkout with Stripe and activating your
              plan. Please keep this page open.
            </p>
          </>
        ) : state.status === "success" ? (
          <>
            <CheckCircle2
              aria-hidden
              className="mx-auto size-12 text-emerald-400"
            />
            <h1 className="mt-6 text-2xl font-bold text-white">
              {state.result.planActivated
                ? "Your plan is active"
                : "Payment confirmed"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {state.result.planActivated
                ? `${state.result.planName} is now active.`
                : "Your newer active plan remains unchanged."}{" "}
              Taking you to billing…
            </p>
          </>
        ) : (
          <>
            <XCircle aria-hidden className="mx-auto size-12 text-red-400" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              We couldn’t confirm your payment
            </h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-white/55">
              {state.message}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Try again
              </button>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-white/80 transition-colors hover:bg-white/5"
              >
                Return to pricing
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function getVerificationErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Payment verification is taking longer than expected. Please try again."
  }

  return error instanceof Error
    ? error.message
    : "We couldn't confirm your payment. Please try again."
}
