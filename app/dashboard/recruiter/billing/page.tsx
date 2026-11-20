"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  ReceiptText,
} from "lucide-react"
import {
  getRecruiterPaymentHistory,
  type PaymentHistoryRecord,
} from "@/lib/api/billing"
import {
  getRecruiterJobCapacity,
  type RecruiterJobCapacity,
} from "@/lib/api/recruiter"

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}

function formatAmount(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100)
}

function formatPlan(plan: string) {
  if (plan === "premium" || plan === "enterprise") return "Enterprise"
  if (plan === "growth") return "Growth"
  if (plan === "free") return "Free"
  return plan
}

export default function RecruiterBillingPage() {
  const [capacity, setCapacity] = useState<RecruiterJobCapacity | null>(null)
  const [payments, setPayments] = useState<PaymentHistoryRecord[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    getRecruiterJobCapacity()
      .then((result) => {
        if (active) setCapacity(result)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load recruiter billing capacity:", cause)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your plan and active job usage."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    getRecruiterPaymentHistory()
      .then((records) => {
        if (active) setPayments(records)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load recruiter payment history:", cause)
        setPaymentsError(
          cause instanceof Error
            ? cause.message
            : "Could not load your payment history."
        )
      })
      .finally(() => {
        if (active) setPaymentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryKey])

  function retryLoading() {
    setLoading(true)
    setPaymentsLoading(true)
    setError(null)
    setPaymentsError(null)
    setRetryKey((key) => key + 1)
  }

  const planName = capacity ? formatPlan(capacity.plan) : "Current"
  const usagePercent = capacity
    ? Math.min((capacity.activeJobs / capacity.limit) * 100, 100)
    : 0

  return (
    <div className="mx-auto max-w-350">
      <header>
        <p className="text-sm font-medium text-hl-primary">Recruiter account</p>
        <h1 className="mt-2 [font-family:var(--font-manrope)] text-2xl font-bold text-white">
          Subscription &amp; billing
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Review your company plan, active job post usage, and payment history.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={retryLoading}
            className="mt-2 font-medium text-red-200 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      <section className="mt-7 rounded-2xl border border-white/10 bg-[#141417] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <CreditCard aria-hidden className="size-5 text-hl-primary" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/45 uppercase">
                Company plan
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {loading ? "Loading…" : `${planName} plan`}
              </h2>
            </div>
          </div>
          {capacity && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Active
            </span>
          )}
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-white/45">
            Loading your active job usage…
          </p>
        ) : capacity ? (
          <div className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Active job posts
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Your plan allows up to {capacity.limit} active posts
                </p>
              </div>
              <p className="text-sm font-semibold text-white">
                {capacity.activeJobs}
                <span className="font-normal text-white/45">
                  {" "}
                  / {capacity.limit} used
                </span>
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Active job post usage"
              aria-valuemin={0}
              aria-valuemax={capacity.limit}
              aria-valuenow={Math.min(capacity.activeJobs, capacity.limit)}
              className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-hl-primary transition-[width]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">
              {capacity.remaining === 0
                ? "You have reached your plan's active job post limit. Close or remove a job to create another."
                : `${capacity.remaining} active job post${capacity.remaining === 1 ? "" : "s"} remaining on your plan.`}
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-white/45">
            Your plan and active job usage could not be loaded.
          </p>
        )}

        {capacity && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
            {capacity.plan !== "enterprise" && (
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Upgrade plan
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
            {capacity.plan !== "free" && (
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                Downgrade plan
              </Link>
            )}
            <p className="w-full text-xs text-white/40">
              Plan changes open Pricing. Paid checkout is not enabled yet, so
              these links will not charge you or change your plan.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#141417]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <ReceiptText aria-hidden className="size-4 text-white/70" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Payment history
            </h2>
            <p className="mt-0.5 text-xs text-white/40">
              Your completed company plan payments
            </p>
          </div>
        </div>

        {paymentsError && (
          <div
            role="alert"
            className="border-b border-red-500/20 bg-red-500/5 px-5 py-3 text-sm text-red-300 sm:px-6"
          >
            <p>{paymentsError}</p>
            <button
              type="button"
              onClick={retryLoading}
              className="mt-1 font-medium text-red-200 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] tracking-wider text-white/40 uppercase">
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-white/45"
                  >
                    Loading payment history…
                  </td>
                </tr>
              ) : paymentsError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-white/45"
                  >
                    Payment history could not be loaded.
                  </td>
                </tr>
              ) : payments?.length ? (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-white/70 sm:px-6">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {formatPlan(payment.plan)}
                    </td>
                    <td className="px-5 py-4 font-medium whitespace-nowrap text-white">
                      {formatAmount(payment.amountCents)}
                    </td>
                    <td className="max-w-56 truncate px-5 py-4 font-mono text-xs text-white/45">
                      {payment.transactionId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center sm:px-6">
                    <BriefcaseBusiness
                      aria-hidden
                      className="mx-auto size-6 text-white/30"
                    />
                    <p className="mt-2 text-sm text-white/60">
                      No payments yet
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Confirmed plan payments will appear here after checkout is
                      integrated.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
