"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  Globe2,
  HeartPulse,
  Megaphone,
  Palette,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type LinkGroup = "popular" | "categories"

type QuickLink = {
  label: string
  href: string
  icon: LucideIcon
  isNew?: boolean
}

const LINKS: Record<LinkGroup, QuickLink[]> = {
  popular: [
    {
      label: "Internships",
      href: "/browse-jobs?type=Internship",
      icon: Sparkles,
      isNew: true,
    },
    {
      label: "Contract roles",
      href: "/browse-jobs?type=Contract",
      icon: BriefcaseBusiness,
    },
    {
      label: "Part-time jobs",
      href: "/browse-jobs?type=Part-time",
      icon: BriefcaseBusiness,
    },
    {
      label: "Remote jobs",
      href: "/browse-jobs?location=Remote",
      icon: Globe2,
    },
    {
      label: "Full-time roles",
      href: "/browse-jobs?type=Full-time",
      icon: TrendingUp,
    },
    {
      label: "Explore companies",
      href: "/companies",
      icon: Building2,
    },
  ],
  categories: [
    {
      label: "Engineering & Tech",
      href: "/browse-jobs?category=Engineering%20%26%20Tech",
      icon: Code2,
    },
    {
      label: "Design & Creative",
      href: "/browse-jobs?category=Design%20%26%20Creative",
      icon: Palette,
    },
    {
      label: "Marketing",
      href: "/browse-jobs?category=Marketing",
      icon: Megaphone,
    },
    {
      label: "Healthcare",
      href: "/browse-jobs?category=Healthcare",
      icon: HeartPulse,
    },
    {
      label: "Finance",
      href: "/browse-jobs?category=Finance",
      icon: TrendingUp,
    },
    {
      label: "All job categories",
      href: "/browse-jobs",
      icon: ArrowUpRight,
    },
  ],
}

export function HeroQuickLinks() {
  const [group, setGroup] = useState<LinkGroup>("popular")

  return (
    <section className="mx-auto mt-10 max-w-196 overflow-hidden rounded-2xl border border-white/20 bg-white/[0.06] text-left shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-hl-primary shadow-[0_0_12px_rgba(92,83,254,0.9)]" />
            <h2 className="[font-family:var(--font-manrope)] text-sm font-bold tracking-wide text-white uppercase">
              Quick Links
            </h2>
          </div>
          <p className="mt-1 text-xs text-white/45">
            Jump straight to the opportunities you want
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Quick link groups"
          className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={group === "popular"}
            aria-controls="hero-quick-links"
            onClick={() => setGroup("popular")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              group === "popular"
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/50 hover:text-white"
            )}
          >
            Popular
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={group === "categories"}
            aria-controls="hero-quick-links"
            onClick={() => setGroup("categories")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              group === "categories"
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/50 hover:text-white"
            )}
          >
            Categories
          </button>
        </div>
      </div>

      <nav
        id="hero-quick-links"
        role="tabpanel"
        aria-label={
          group === "popular" ? "Popular job links" : "Job categories"
        }
        className="p-3 sm:p-4"
      >
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LINKS[group].map((item) => {
            const Icon = item.icon

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group flex min-h-12 items-center gap-3 rounded-xl border border-transparent bg-white/[0.025] px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.07] focus-visible:border-hl-primary/50 focus-visible:outline-none"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/60 transition-colors group-hover:border-hl-primary/30 group-hover:bg-hl-primary/15 group-hover:text-[#c8c5ff]">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/75 transition-colors group-hover:text-white">
                    {item.label}
                  </span>
                  {item.isNew && (
                    <span className="rounded-full bg-[#ffeb63] px-2 py-0.5 text-[9px] leading-none font-bold tracking-wide text-[#171717]">
                      NEW
                    </span>
                  )}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/75"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </section>
  )
}
