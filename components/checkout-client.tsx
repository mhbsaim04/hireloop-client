"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Crown,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type Audience = "seekers" | "recruiters"
type CurrencyCode = "USD" | "BDT"
type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "diners"

interface PlanInfo {
  name: string
  price: number
  description: string
  features: string[]
}

interface CheckoutErrors {
  email?: string
  card?: string
  expiry?: string
  cvc?: string
  name?: string
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
      price: 19,
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
      price: 39,
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
        "Standard listing visibility",
      ],
    },
    Growth: {
      name: "Growth",
      price: 49,
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
      price: 149,
      description: "Advanced tools for teams hiring at scale.",
      features: [
        "Up to 50 active job posts",
        "Advanced analytics dashboard",
        "Featured job listings",
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

const COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Italy",
  "Singapore",
  "Malaysia",
  "Japan",
  "South Korea",
  "United Arab Emirates",
  "Saudi Arabia",
  "Brazil",
  "Nigeria",
  "Kenya",
  "South Africa",
]

const BRAND_LABELS: Record<CardBrand, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
  diners: "DINERS",
}

function detectBrand(digits: string): CardBrand | null {
  if (/^4/.test(digits)) return "visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]))/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover"
  if (/^(30[0-5]|36|38)/.test(digits)) return "diners"
  return null
}

function luhnValid(digits: string) {
  if (digits.length === 0) return false
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = Number(digits[i])
    if (Number.isNaN(value)) return false
    if (alternate) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    alternate = !alternate
  }
  return sum % 10 === 0
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  const brand = detectBrand(digits)

  if (brand === "amex") {
    const trimmed = digits.slice(0, 15)
    return [trimmed.slice(0, 4), trimmed.slice(4, 10), trimmed.slice(10, 15)]
      .filter(Boolean)
      .join(" ")
  }

  const trimmed = digits.slice(0, 19)
  return trimmed.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

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

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"

const labelClass = "mb-1.5 block text-xs font-medium text-white/50"

export function CheckoutClient({
  plan: planParam,
  audience: audienceParam,
  price: priceParam,
}: {
  plan?: string
  audience?: string
  price?: string
}) {
  const audience: Audience =
    audienceParam === "recruiters" ? "recruiters" : "seekers"
  const catalog = PLANS[audience]
  const fallback = audience === "recruiters" ? "Growth" : "Pro"
  const planKey = planParam && catalog[planParam] ? planParam : fallback
  const plan = catalog[planKey]

  const overridePrice = priceParam !== undefined ? Number(priceParam) : NaN
  const price = Number.isNaN(overridePrice) ? plan.price : overridePrice
  const isFree = price === 0

  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [email, setEmail] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [nameOnCard, setNameOnCard] = useState("")
  const [country, setCountry] = useState("Bangladesh")
  const [saveDetails, setSaveDetails] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<CheckoutErrors>({})

  const brand = detectBrand(cardNumber.replace(/\D/g, ""))
  const total = currency === "USD" ? price : price * BDT_RATE
  const totalLabel = formatMoney(total, currency)

  function clearError(key: keyof CheckoutErrors) {
    setErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  function validate(): CheckoutErrors {
    const found: CheckoutErrors = {}

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      found.email = "Enter a valid email address."
    }

    if (!isFree) {
      const digits = cardNumber.replace(/\D/g, "")
      if (digits.length < 12 || !luhnValid(digits)) {
        found.card = "Enter a valid card number."
      }

      const expiryDigits = expiry.replace(/\D/g, "")
      const month = Number(expiryDigits.slice(0, 2))
      const year = 2000 + Number(expiryDigits.slice(2, 4))
      if (expiryDigits.length < 4 || month < 1 || month > 12) {
        found.expiry = "Use the MM / YY format."
      } else {
        const now = new Date()
        if (
          year < now.getFullYear() ||
          (year === now.getFullYear() && month < now.getMonth() + 1)
        ) {
          found.expiry = "This card has expired."
        }
      }

      const expectedCvc = brand === "amex" ? 4 : 3
      if (cvc.replace(/\D/g, "").length !== expectedCvc) {
        found.cvc = `CVC must be ${expectedCvc} digits.`
      }

      if (!nameOnCard.trim()) {
        found.name = "Enter the name printed on the card."
      }
    }

    return found
  }

  function handlePay() {
    const found = validate()
    setErrors(found)

    const firstError = Object.values(found)[0]
    if (firstError) {
      toast.add({
        title: "Check your payment details",
        description: firstError,
        type: "error",
      })
      return
    }

    setProcessing(true)
    window.setTimeout(() => {
      setProcessing(false)
      // UI only — no Stripe call is made until checkout is wired up.
      toast.add({
        title: "Stripe checkout isn't connected yet",
        description:
          "This page is the payment UI. Point the Pay button at your Stripe Checkout session when you're ready to integrate it.",
        type: "info",
      })
    }, 900)
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
              1 USD ≈ ৳{BDT_RATE.toFixed(2)} · converted for display only
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
              : "Cancel anytime · Secure payment · No hidden fees"}
          </p>
        </section>

        {/* ------------------------------------------------ Payment form */}
        <section
          aria-label="Payment"
          className="animate-in rounded-3xl border border-white/8 bg-[#141417] p-6 duration-500 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:p-7"
          style={{ animationDelay: "180ms" }}
        >
          {/* Express pay placeholders */}
          {!isFree && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {["Link", "Apple Pay", "G Pay"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    disabled
                    title="Available once Stripe checkout is connected"
                    className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                  >
                    {method}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[11px] text-white/35">
                Express buttons appear once Stripe is connected
              </p>

              <div className="my-5 flex items-center gap-3">
                <span aria-hidden className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] font-medium tracking-wider text-white/35 uppercase">
                  or pay with card
                </span>
                <span aria-hidden className="h-px flex-1 bg-white/8" />
              </div>
            </>
          )}

          {/* Contact */}
          <h2 className="text-sm font-semibold text-white">
            Contact information
          </h2>
          <div className="mt-3">
            <label htmlFor="checkout-email" className={labelClass}>
              Email
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
              />
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearError("email")
                }}
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className={cn(
                  inputClass,
                  "pl-11",
                  errors.email && "border-red-500/50 focus:border-red-400"
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {isFree ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Check aria-hidden className="size-4" />
                No payment needed
              </p>
              <p className="mt-1.5 text-xs leading-5 text-emerald-200/70">
                The {plan.name} plan is free forever. Confirm your email and
                we&apos;ll activate it on your account — you can upgrade later.
              </p>
            </div>
          ) : (
            <>
              {/* Payment method */}
              <h2 className="mt-6 text-sm font-semibold text-white">
                Payment method
              </h2>
              <div className="mt-3 rounded-2xl border border-hl-primary/40 bg-hl-primary/[0.06] p-4 shadow-[0_0_25px_-12px_rgba(92,83,254,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <CreditCard aria-hidden className="size-4 text-[#c4c0ff]" />
                    Card
                  </span>
                  <span
                    aria-hidden
                    className="flex size-4.5 items-center justify-center rounded-full bg-hl-primary"
                  >
                    <Check className="size-3 text-white" />
                  </span>
                </div>

                {/* Card fields */}
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#161618]">
                  <div className="relative">
                    <input
                      id="checkout-card"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(event) => {
                        setCardNumber(formatCardNumber(event.target.value))
                        clearError("card")
                      }}
                      placeholder="1234 1234 1234 1234"
                      aria-label="Card number"
                      aria-invalid={Boolean(errors.card)}
                      className={cn(
                        "h-12 w-full border-b border-white/10 bg-transparent pr-24 pl-4 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:bg-white/[0.03]",
                        errors.card && "border-red-500/50"
                      )}
                    />
                    <div
                      aria-hidden
                      className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5"
                    >
                      {brand ? (
                        <span className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white/75">
                          {BRAND_LABELS[brand]}
                        </span>
                      ) : (
                        [30, 20, 12].map((opacity) => (
                          <span
                            key={opacity}
                            className="h-4 w-6 rounded-[3px] bg-white/40"
                            style={{ opacity: opacity / 100 }}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <input
                      id="checkout-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={expiry}
                      onChange={(event) => {
                        setExpiry(formatExpiry(event.target.value))
                        clearError("expiry")
                      }}
                      placeholder="MM / YY"
                      aria-label="Expiry date"
                      aria-invalid={Boolean(errors.expiry)}
                      className={cn(
                        "h-12 border-r border-white/10 bg-transparent px-4 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:bg-white/[0.03]",
                        errors.expiry && "border-red-500/50"
                      )}
                    />
                    <input
                      id="checkout-cvc"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={cvc}
                      onChange={(event) => {
                        setCvc(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, brand === "amex" ? 4 : 3)
                        )
                        clearError("cvc")
                      }}
                      placeholder={brand === "amex" ? "4 digits" : "CVC"}
                      aria-label="Security code"
                      aria-invalid={Boolean(errors.cvc)}
                      className={cn(
                        "h-12 bg-transparent px-4 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:bg-white/[0.03]",
                        errors.cvc && "text-red-300"
                      )}
                    />
                  </div>
                </div>

                {(errors.card || errors.expiry || errors.cvc) && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.card || errors.expiry || errors.cvc}
                  </p>
                )}

                <div className="mt-4">
                  <label htmlFor="checkout-name" className={labelClass}>
                    Cardholder name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="cc-name"
                    value={nameOnCard}
                    onChange={(event) => {
                      setNameOnCard(event.target.value)
                      clearError("name")
                    }}
                    placeholder="Full name on card"
                    aria-invalid={Boolean(errors.name)}
                    className={cn(
                      inputClass,
                      errors.name && "border-red-500/50 focus:border-red-400"
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="checkout-country" className={labelClass}>
                    Country or region
                  </label>
                  <div className="relative">
                    <select
                      id="checkout-country"
                      autoComplete="country-name"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className={cn(inputClass, "appearance-none pr-10")}
                    >
                      {COUNTRIES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
                    />
                  </div>
                </div>
              </div>

              {/* Save details */}
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-white/15">
                <input
                  type="checkbox"
                  checked={saveDetails}
                  onChange={(event) => setSaveDetails(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-hl-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">
                    Save my details for faster checkout
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/45">
                    Stored securely — card details never touch our servers.
                  </span>
                </span>
              </label>
            </>
          )}

          {/* Pay */}
          <button
           action="/api/checkout_sessions" method="POST"
            type="button"
            onClick={handlePay}
            disabled={processing}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl
             bg-hl-primary text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(92,83,254,0.8)] transition-all hover:bg-hl-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {processing ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Lock aria-hidden className="size-4" />
                {isFree ? "Activate Free plan" : `Pay ${totalLabel} / month`}
              </>
            )}
          </button>

          

          <p className="mt-3 text-center text-[11px] leading-5 text-white/35">
            Test mode — no real charge will be made. Payments are processed
            securely by Stripe.
          </p>
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
