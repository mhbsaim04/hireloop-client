"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CreditCard, ReceiptText, Sparkles } from "lucide-react"
import { getPaymentHistory, type PaymentHistoryRecord } from "@/lib/api/billing"
import {
  getApplicationUsage,
  type ApplicationUsage,
} from "@/lib/api/applications"

function getPlanName(plan: ApplicationUsage["plan"]) {
  if (plan === "growth") return "Pro"
  return plan === "free" ? "Free" : "Premium"
}

function getPaymentPlanName(plan: string) {
  if (plan === "growth") return "Pro"
  if (plan === "premium") return "Premium"
  if (plan === "free") return "Free"
  return plan
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number)
  if (!year || !month || month > 12) return period

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

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

export default function SeekerBillingPage() {
  const [usage, setUsage] = useState<ApplicationUsage | null>(null)
  const [payments, setPayments] = useState<PaymentHistoryRecord[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    getApplicationUsage()
      .then((result) => {
        if (active) setUsage(result)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load application usage:", cause)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your billing details."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    getPaymentHistory()
      .then((records) => {
        if (active) setPayments(records)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load payment history:", cause)
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

  const planName = usage ? getPlanName(usage.plan) : "Current"
  const progress = usage?.limit
    ? Math.min((usage.used / usage.limit) * 100, 100)
    : 100

  function retryLoading() {
    setLoading(true)
    setPaymentsLoading(true)
    setError(null)
    setPaymentsError(null)
    setRetryKey((key) => key + 1)
  }

  return (
    <div className="mx-auto max-w-350">
      <header>
        <p className="text-sm font-medium text-hl-primary">Seeker account</p>
        <h1 className="mt-2 [font-family:var(--font-manrope)] text-2xl font-bold text-white">
          Subscription &amp; billing
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your plan, track monthly applications, and review payment
          history.
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
                Current plan
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {loading ? "Loading…" : `${planName} plan`}
              </h2>
            </div>
          </div>
          {usage && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Active
            </span>
          )}
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-white/45">
            Loading your application usage…
          </p>
        ) : usage ? (
          <div className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Applications this month
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Usage for {formatPeriod(usage.period)}
                </p>
              </div>
              <p className="text-sm font-semibold text-white">
                {usage.used}
                {usage.limit === null ? (
                  <span className="font-normal text-white/45">
                    {" "}
                    applications
                  </span>
                ) : (
                  <span className="font-normal text-white/45">
                    {" "}
                    / {usage.limit}
                  </span>
                )}
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Monthly application usage"
              aria-valuemin={0}
              aria-valuemax={usage.limit ?? Math.max(usage.used, 1)}
              aria-valuenow={
                usage.limit === null
                  ? usage.used
                  : Math.min(usage.used, usage.limit)
              }
              className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-hl-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">
              {usage.limit === null
                ? "Your Premium plan includes unlimited applications."
                : usage.remaining === 0
                  ? `You have used all ${usage.limit} applications for this month. Your limit resets next month.`
                  : `You have ${usage.remaining} application${usage.remaining === 1 ? "" : "s"} remaining this month.`}
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-white/45">
            Your plan and usage could not be loaded.
          </p>
        )}

        {usage && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
            {usage.plan !== "premium" && (
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Upgrade plan
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
            {usage.plan !== "free" && (
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                Downgrade plan
              </Link>
            )}
            <p className="w-full text-xs text-white/40">
              Choose a paid plan from Pricing to continue to secure Stripe
              checkout. Your plan updates after payment is confirmed.
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
              Your completed plan payments
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
                      {getPaymentPlanName(payment.plan)}
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
                    <p className="text-sm text-white/60">No payments yet</p>
                    <p className="mt-1 text-xs text-white/40">
                      Your confirmed Stripe plan payments will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {usage?.plan === "free" && (
        <section className="mt-6 rounded-2xl border border-hl-primary/25 bg-hl-primary/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Sparkles
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-hl-primary"
            />
            <div>
              <h2 className="font-semibold text-white">
                Need more applications?
              </h2>
              <p className="mt-1 text-sm leading-6 text-white/60">
                Pro includes up to 31 applications per month. Premium includes
                unlimited applications.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl text-sm font-semibold text-hl-primary transition-colors hover:text-white"
              >
                Compare plans
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
