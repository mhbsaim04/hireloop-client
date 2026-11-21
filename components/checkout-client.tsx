"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Crown,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"
import { CHECKOUT_PLANS } from "@/lib/billing-plans"
import { cn } from "@/lib/utils"

type Audience = "seekers" | "recruiters"
type CurrencyCode = "USD" | "BDT"

interface PlanInfo {
  name: string
  price: number
  description: string
  features: string[]
}

/** Mirrors the tiers shown on /pricing so both pages stay in step. */
const PLANS: Record<Audience, Record<string, PlanInfo>> = {
  seekers: {
    Free: {
      name: "Free",
      price: 0,
      description: "A simple start to your next opportunity.",
      features: [
        "Browse and save jobs free",
        "Apply to up to 13 jobs per month",
        "Basic profile",
        "Email alerts",
      ],
    },
    Pro: {
      name: "Pro",
      price: CHECKOUT_PLANS.seekers.Pro.amountCents / 100,
      description: "More tools to keep your job search moving.",
      features: [
        "Apply to up to 31 jobs per month",
        "Unlimited saved jobs",
        "Application tracking",
        "Salary insights",
      ],
    },
    Premium: {
      name: "Premium",
      price: CHECKOUT_PLANS.seekers.Premium.amountCents / 100,
      description: "A stronger edge from application to offer.",
      features: [
        "Everything in Pro, plus:",
        "Unlimited applications",
        "Profile boost to recruiters",
        "Early access to new jobs",
        "Priority support",
      ],
    },
  },
  recruiters: {
    Free: {
      name: "Free",
      price: 0,
      description: "A first step for a company's hiring needs.",
      features: [
        "Up to 5 active job posts",
        "Basic applicant management",
        "Standard listing visibility (great for a company's first year of hiring)",
      ],
    },
    Growth: {
      name: "Growth",
      price: CHECKOUT_PLANS.recruiters.Growth.amountCents / 100,
      description: "Keep growing your team with better hiring tools.",
      features: [
        "Up to 17 active job posts",
        "Applicant tracking",
        "Basic analytics",
        "Email support",
      ],
    },
    Enterprise: {
      name: "Enterprise",
      price: CHECKOUT_PLANS.recruiters.Enterprise.amountCents / 100,
      description: "Advanced tools for teams hiring at scale.",
      features: [
        "Up to 50 active job posts",
        "Advanced analytics dashboard",
        "Featured job listings",
        "Team collaboration",
        "Custom branding",
        "Priority support",
      ],
    },
  },
}

const CURRENCIES: Array<{
  code: CurrencyCode
  flag: string
  symbol: string
  label: string
}> = [
  { code: "USD", flag: "🇺🇸", symbol: "$", label: "US Dollar" },
  { code: "BDT", flag: "🇧🇩", symbol: "৳", label: "Bangladeshi Taka" },
]

const BDT_RATE = 127.67

function formatMoney(amount: number, currency: CurrencyCode) {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency === "USD" ? `$${formatted}` : `৳${formatted}`
}

function planIconMarkup(name: string, className?: string) {
  const props = { "aria-hidden": true as const, className }
  if (name === "Free") return <Crown {...props} />
  if (name === "Premium" || name === "Enterprise") return <Zap {...props} />
  if (name === "Growth") return <BriefcaseBusiness {...props} />
  return <Sparkles {...props} />
}

export function CheckoutClient({
  plan: planParam,
  audience: audienceParam,
  checkoutError,
}: {
  plan?: string
  audience?: string
  checkoutError?: string
}) {
  const audience: Audience =
    audienceParam === "recruiters" ? "recruiters" : "seekers"
  const catalog = PLANS[audience]
  const fallback = audience === "recruiters" ? "Growth" : "Pro"
  const planKey = planParam && catalog[planParam] ? planParam : fallback
  const plan = catalog[planKey]

  const price = plan.price
  const isFree = price === 0

  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [processing, setProcessing] = useState(false)
  const totalLabel = formatMoney(
    currency === "USD" ? price : price * BDT_RATE,
    currency
  )

  function handleCheckoutSubmit() {
    setProcessing(true)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/pricing"
          className="group inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform group-hover:-translate-x-1"
          />
          Back to pricing
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/45 sm:flex">
            <Lock aria-hidden className="size-3.5" />
            SSL secured
          </span>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-amber-300 uppercase">
            Sandbox
          </span>
        </div>
      </div>

      {/* Heading */}
      <header
        className="mt-8 max-w-2xl animate-in duration-500 fade-in-0 slide-in-from-bottom-3 motion-reduce:animate-none"
        style={{ animationDelay: "40ms" }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-hl-primary uppercase">
          Secure checkout
        </p>
        <h1 className="mt-2 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Complete your {plan.name} plan
        </h1>
        <p className="mt-2 text-sm text-white/50 sm:text-base">
          {audience === "recruiters"
            ? "Upgrade your company&apos;s hiring toolkit."
            : "Unlock the full job-search toolkit."}{" "}
          You won&apos;t be charged until you confirm, and you can cancel
          anytime.
        </p>
      </header>

      {checkoutError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
        >
          {checkoutError}
        </p>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_440px] xl:gap-8">
        {/* ------------------------------------------------ Order summary */}
        <section
          aria-label="Order summary"
          className="relative animate-in overflow-hidden rounded-3xl border border-white/8 bg-[#141417] p-6 duration-500 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:p-7"
          style={{ animationDelay: "100ms" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-hl-primary/15 blur-[110px]"
          />

          <div className="relative flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Order summary</h2>
            <Link
              href="/pricing"
              className="text-xs font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
            >
              Change plan
            </Link>
          </div>

          {/* Plan */}
          <div className="relative mt-5 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-hl-primary/30 bg-hl-primary/10 text-[#c4c0ff]">
                {planIconMarkup(plan.name, "size-5")}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
                    HireLoop {plan.name}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/55 uppercase">
                    {isFree ? "Forever free" : "Billed monthly"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {plan.description}
                </p>
                <p className="mt-1.5 text-[11px] font-medium tracking-wide text-white/35 uppercase">
                  {audience === "recruiters"
                    ? "Recruiter plan"
                    : "Job seeker plan"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="[font-family:var(--font-manrope)] text-2xl font-bold text-white tabular-nums">
                {formatMoney(
                  currency === "USD" ? price : price * BDT_RATE,
                  currency
                )}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                {isFree ? "no charge" : "per month"}
              </p>
            </div>
          </div>

          {/* Currency */}
          <div className="relative mt-6">
            <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Choose a currency
            </p>
            <div
              role="group"
              aria-label="Choose a currency"
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {CURRENCIES.map((option) => {
                const amount = option.code === "USD" ? price : price * BDT_RATE
                const active = currency === option.code
                return (
                  <button
                    key={option.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCurrency(option.code)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                      active
                        ? "border-hl-primary bg-hl-primary/10 text-white shadow-[inset_0_0_0_1px_rgba(92,83,254,0.35)]"
                        : "border-white/10 bg-[#161618] text-white/55 hover:border-white/20 hover:text-white"
                    )}
                    title={option.label}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {option.flag}
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(amount, option.code)}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[11px] text-white/35">
              Stripe charges in USD. BDT is an estimate using 1 USD ≈ ৳
              {BDT_RATE.toFixed(2)}.
            </p>
          </div>

          <div className="relative mt-6 h-px bg-white/8" />

          {/* Totals */}
          <dl className="relative mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-white/50">Subtotal</dt>
              <dd className="text-white/80 tabular-nums">{totalLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/50">Tax</dt>
              <dd className="text-white/35">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/50">Promo discount</dt>
              <dd className="text-white/35">—</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/8 pt-4">
              <dt className="font-semibold text-white">Total due today</dt>
              <dd className="[font-family:var(--font-manrope)] text-2xl font-bold text-white tabular-nums">
                {totalLabel}
                {!isFree && (
                  <span className="text-sm font-normal text-white/40">
                    {" "}
                    /mo
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {/* Included */}
          <div className="relative mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              What&apos;s included
            </p>
            <ul className="mt-3 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm leading-5 text-white/65"
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-hl-primary"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-4 flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck
              aria-hidden
              className="size-4 shrink-0 text-emerald-400"
            />
            {isFree
              ? "No payment details required for the Free plan."
              : "Secure Stripe billing · Plan activates after payment"}
          </p>
        </section>

        {/* ------------------------------------------------ Payment form */}
        <section
          aria-label="Payment"
          className="animate-in rounded-3xl border border-white/8 bg-[#141417] p-6 duration-500 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:p-7"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-start gap-4 rounded-2xl border border-hl-primary/30 bg-hl-primary/[0.06] p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-hl-primary/15">
              <CreditCard aria-hidden className="size-5 text-[#c4c0ff]" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isFree ? "Free plan" : "Secure Stripe checkout"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-white/55">
                {isFree
                  ? "The Free plan does not require checkout. Return to Pricing to continue."
                  : "Your card details are entered on Stripe’s secure checkout page. HireLoop does not collect or store your card information."}
              </p>
            </div>
          </div>

          {isFree ? (
            <Link
              href="/pricing"
              className="mt-5 flex h-13 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              Return to pricing
            </Link>
          ) : (
            <>
              <form
                action="/api/checkout_sessions"
                method="POST"
                onSubmit={handleCheckoutSubmit}
              >
                <input type="hidden" name="plan" value={plan.name} />
                <input type="hidden" name="audience" value={audience} />
                <button
                  type="submit"
                  disabled={processing}
                  className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(92,83,254,0.8)] transition-all hover:bg-hl-primary/90 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      <Lock aria-hidden className="size-4" />
                      Continue to Payment checkout
                    </>
                  )}
                </button>
              </form>

              <p className="mt-3 text-center text-[11px] leading-5 text-white/35">
                Stripe processes payments securely in USD. BDT amounts shown
                above are estimates for display only.
              </p>
            </>
          )}
        </section>
      </div>

      {/* Footer strip */}
      <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/5 pt-6 text-xs text-white/35 sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2">
          <Lock aria-hidden className="size-3.5" />
          Encrypted and secure · Powered by{" "}
          <span className="font-semibold text-white/55">Stripe</span>
        </p>
        <p className="flex items-center gap-4">
          <span>Terms</span>
          <span aria-hidden>·</span>
          <span>Privacy</span>
          <span aria-hidden>·</span>
          <a
            href="mailto:support@hireloop.example"
            className="transition-colors hover:text-white/70"
          >
            Need help?
          </a>
        </p>
      </div>
    </div>
  )
}
