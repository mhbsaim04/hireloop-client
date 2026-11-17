"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, Crown, Plus, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type PlanTier = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  priceMonthly: number
  priceYearly: number
  highlighted?: boolean
  features: string[]
}

const PLANS: PlanTier[] = [
  {
    name: "Starter",
    icon: Crown,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Growth",
    icon: BarChart3,
    priceMonthly: 17,
    priceYearly: 13,
    highlighted: true,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Premium",
    icon: Zap,
    priceMonthly: 99,
    priceYearly: 74,
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
  },
]

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const isYearly = billing === "yearly"

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="size-1.5 rounded-[1px] bg-[#5c53fe]"
              aria-hidden="true"
            />
            <span className="[font-family:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
              Pricing
            </span>
            <span
              className="size-1.5 rounded-[1px] bg-[#5c53fe]"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.15]">
            Pay for the leverage,
            <br />
            not the listings
          </h2>

          {/* Billing Toggle (Monthly / Yearly) */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-[#121217] p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn(
                  "cursor-pointer rounded-full px-5 py-2 [font-family:var(--font-manrope)] text-xs font-semibold transition-all",
                  !isYearly
                    ? "bg-white text-black shadow-md"
                    : "text-white/60 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 [font-family:var(--font-manrope)] text-xs font-semibold transition-all",
                  isYearly
                    ? "bg-white text-black shadow-md"
                    : "text-white/60 hover:text-white"
                )}
              >
                <span>Yearly</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm transition-all",
                    isYearly
                      ? "bg-[#d946ef]"
                      : "bg-[#d946ef]/90 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                  )}
                >
                  25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-20 lg:gap-8">
          {PLANS.map((tier) => {
            const Icon = tier.icon
            const price = isYearly ? tier.priceYearly : tier.priceMonthly

            return (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col justify-between rounded-3xl p-7 transition-all duration-200 sm:p-8",
                  tier.highlighted
                    ? "border border-white/20 bg-[#121218] shadow-[0_0_35px_rgba(92,83,254,0.12)] hover:border-white/35"
                    : "border border-white/10 bg-[#0d0d12] hover:border-white/25"
                )}
              >
                <div>
                  {/* Card Header: Icon + Name + Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#18181f] text-[#f0abfc]">
                        <Icon className="size-4.5" />
                      </div>
                      <span className="[font-family:var(--font-manrope)] text-lg font-semibold text-white">
                        {tier.name}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="[font-family:var(--font-manrope)] text-3xl font-bold text-white sm:text-4xl">
                        ${price}
                      </span>
                      <span className="ml-1 text-xs text-white/50">/month</span>
                    </div>
                  </div>

                  {/* Feature Section Header */}
                  <div className="mt-8 flex flex-col">
                    <span className="[font-family:var(--font-manrope)] text-xs font-semibold text-white/90">
                      Start building your insights hub:
                    </span>

                    {/* Features List */}
                    <ul className="mt-4 flex flex-col gap-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60">
                            <Plus className="size-3" />
                          </span>
                          <span className="[font-family:var(--font-manrope)] text-xs text-white/80 sm:text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-10">
                  <Link
                    href="/sign-up"
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-xl px-5 [font-family:var(--font-manrope)] text-sm font-semibold transition-all",
                      tier.highlighted
                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.18)] hover:bg-white/90"
                        : "border border-white/10 bg-[#202026] text-white/90 hover:border-white/20 hover:bg-[#282830] hover:text-white"
                    )}
                  >
                    <span>Choose This Plan</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
