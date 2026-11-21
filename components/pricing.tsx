"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Crown,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export type Audience = "seekers" | "recruiters"

export type PlanTier = {
  name: string
  price: string
  interval: string
  description: string
  icon: LucideIcon
  highlighted?: boolean
  features: string[]
}

export const PLANS: Record<Audience, PlanTier[]> = {
  seekers: [
    {
      name: "Free",
      price: "$0",
      interval: "forever",
      description: "A simple start to your next opportunity.",
      icon: Crown,
      features: [
        "Browse and save jobs free",
        "Apply to up to 13 jobs per month",
        "Basic profile",
        "Email alerts",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      interval: "month",
      description: "More tools to keep your job search moving.",
      icon: Sparkles,
      highlighted: true,
      features: [
        "Apply to up to 31 jobs per month",
        "Unlimited saved jobs",
        "Application tracking",
        "Salary insights",
      ],
    },
    {
      name: "Premium",
      price: "$39",
      interval: "month",
      description: "A stronger edge from application to offer.",
      icon: Zap,
      features: [
        "Everything in Pro, plus:",
        "Unlimited applications",
        "Profile boost to recruiters",
        "Early access to new jobs",
        "Priority support",
      ],
    },
  ],
  recruiters: [
    {
      name: "Free",
      price: "$0",
      interval: "forever",
      description: "A first step for a company's hiring needs.",
      icon: Crown,
      features: [
        "Up to 5 active job posts",
        "Basic applicant management",
        "Standard listing visibility (great for a company's first year of hiring)",
      ],
    },
    {
      name: "Growth",
      price: "$49",
      interval: "month",
      description: "Keep growing your team with better hiring tools.",
      icon: BriefcaseBusiness,
      highlighted: true,
      features: [
        "Up to 17 active job posts",
        "Applicant tracking",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Enterprise",
      price: "$149",
      interval: "month",
      description: "Advanced tools for teams hiring at scale.",
      icon: Zap,
      features: [
        "Up to 50 active job posts",
        "Advanced analytics dashboard",
        "Featured job listings",
        "Team collaboration",
        "Custom branding",
        "Priority support",
      ],
    },
  ],
}

const FAQS = [
  {
    question: "Can I cancel my plan at any time?",
    answer:
      "Paid billing and self-service cancellation are not connected in this app yet. No subscription is started from this page. Cancellation terms will be shown before checkout when billing is enabled.",
  },
  {
    question: "Are plan payments refundable?",
    answer:
      "No payment is collected through this page. Once checkout is enabled, refund eligibility and the request process will be clearly stated before payment and handled in accordance with applicable law.",
  },
  {
    question: "Which payment methods can I use?",
    answer:
      "Payment methods are not collected yet. Available methods will be listed at checkout once a payment provider is integrated; choosing a plan here will not charge you.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Paid plan switching is not enabled yet. These cards describe the available plan tiers; your account remains on its current plan until billing is connected.",
  },
]

export function Pricing() {
  const [audience, setAudience] = useState<Audience>("seekers")
  const plans = PLANS[audience]
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isAdmin = session?.user.role === "admin"

  function handleGetStarted(tier: PlanTier) {
    if (isPending || isAdmin) return
    const checkoutUrl = `/checkout?plan=${encodeURIComponent(tier.name)}&audience=${audience}`
    if (!session?.user) {
      router.push(`/sign-in?callbackURL=${encodeURIComponent(checkoutUrl)}`)
      return
    }

    router.push(checkoutUrl)
  }

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-20 sm:py-28">
      <div className="pointer-events-none absolute top-0 left-1/2 size-125 -translate-x-1/2 rounded-full bg-[#5c53fe]/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span aria-hidden className="size-1.5 rounded-[1px] bg-[#5c53fe]" />
            <span className="[font-family:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
              HireLoop pricing
            </span>
            <span aria-hidden className="size-1.5 rounded-[1px] bg-[#5c53fe]" />
          </div>
          <h1 className="mt-4 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.15]">
            The right tools for your next move
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Choose a plan built around the way you use HireLoop. Start free and
            move up when you need more.
          </p>

          <div
            role="group"
            aria-label="Choose who you are"
            className="mx-auto mt-8 inline-flex rounded-full border border-white/10 bg-[#121217] p-1"
          >
            <button
              type="button"
              aria-pressed={audience === "seekers"}
              onClick={() => setAudience("seekers")}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                audience === "seekers"
                  ? "bg-white text-black shadow-md"
                  : "text-white/60 hover:text-white"
              )}
            >
              For Job Seekers
            </button>
            <button
              type="button"
              aria-pressed={audience === "recruiters"}
              onClick={() => setAudience("recruiters")}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                audience === "recruiters"
                  ? "bg-white text-black shadow-md"
                  : "text-white/60 hover:text-white"
              )}
            >
              For Recruiters
            </button>
          </div>
        </header>

        <div
          aria-live="polite"
          className="mt-12 grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 lg:mt-16 lg:gap-7"
        >
          {plans.map((tier) => {
            const Icon = tier.icon

            return (
              <article
                key={`${audience}-${tier.name}`}
                className={cn(
                  "relative flex flex-col rounded-3xl p-6 transition-colors sm:p-8",
                  tier.highlighted
                    ? "border border-[#8b84ff]/50 bg-[#14141d] shadow-[0_0_35px_rgba(92,83,254,0.14)]"
                    : "border border-white/10 bg-[#0d0d12] hover:border-white/20"
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-[#5c53fe] px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                    Most popular
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#c4c0ff]">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h2 className="[font-family:var(--font-manrope)] text-lg font-semibold text-white">
                      {tier.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-white/45">
                      {tier.description}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-baseline gap-1">
                  <span className="[font-family:var(--font-manrope)] text-4xl font-bold tracking-tight text-white">
                    {tier.price}
                  </span>
                  <span className="text-sm text-white/45">
                    / {tier.interval}
                  </span>
                </div>

                <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-6">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-white/75"
                    >
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-[#9b96ff]"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.name !== "Free" ? (
                  <button
                    type="button"
                    onClick={() => handleGetStarted(tier)}
                    disabled={isPending || isAdmin}
                    aria-label={
                      session?.user
                        ? `Get started with the ${tier.name} ${audience} plan`
                        : `Sign in to get started with the ${tier.name} ${audience} plan`
                    }
                    title={
                      isAdmin
                        ? "Pricing plans are for seeker and recruiter accounts."
                        : undefined
                    }
                    className={cn(
                      "mt-8 flex h-12 w-full items-center justify-between rounded-xl px-5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
                      tier.highlighted
                        ? "bg-white text-black hover:bg-white/90"
                        : "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <span>
                      {isPending
                        ? "Checking account…"
                        : isAdmin
                          ? "For seekers and recruiters"
                          : session?.user
                            ? "Get started"
                            : "Sign in to get started"}
                    </span>
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                ) : (
                  <p className="mt-8 flex h-12 items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] text-sm font-medium text-white/40">
                    Free plan · No checkout required
                  </p>
                )}
              </article>
            )
          })}
        </div>

        <section className="mx-auto mt-20 max-w-3xl sm:mt-28">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#aaa5ff] uppercase">
              Need a little more detail?
            </p>
            <h2 className="mt-3 [font-family:var(--font-manrope)] text-2xl font-bold text-white sm:text-3xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-white/10 bg-[#111116] px-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-white marker:content-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b84ff] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-white/50 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-6 text-white/55">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
