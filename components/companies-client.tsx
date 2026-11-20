"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  MapPin,
  Search,
  Users,
} from "lucide-react"
import { CompanyLogo } from "@/components/company-logo"
import { cn } from "@/lib/utils"

export interface Company {
  _id?: string
  id?: string
  name?: string
  industry?: string
  location?: string
  employeeCount?: string
  logo?: string
  description?: string
  website?: string
  status?: string
}

export function companyId(company: Company) {
  return company._id ?? company.id ?? ""
}

export function CompaniesClient({
  companies,
  openJobCounts,
}: {
  companies: Company[]
  openJobCounts: Record<string, number>
}) {
  const [industry, setIndustry] = useState("All")
  const [query, setQuery] = useState("")

  const industries = useMemo(() => {
    const set = new Set<string>()
    companies.forEach((c) => {
      const value = (c.industry ?? "").trim()
      if (value) set.add(value)
    })
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [companies])

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (industry !== "All" && (c.industry ?? "") !== industry) return false
      if (
        query &&
        !`${c.name ?? ""} ${c.industry ?? ""} ${c.location ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [companies, industry, query])

  function clearFilters() {
    setIndustry("All")
    setQuery("")
  }

  return (
    <div className="mx-auto max-w-350">
      {/* Header */}
      <header className="mt-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-hl-primary uppercase">
          Top employers
        </p>
        <h1 className="mt-2 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Companies
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Browse {companies.length} approved companies hiring on HireLoop.
        </p>
      </header>

      {/* Search + industry tabs */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#161618] pr-4 pl-12 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"
          />
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter by industry"
        >
          {industries.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={industry === tab}
              onClick={() => setIndustry(tab)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                industry === tab
                  ? "border-hl-primary bg-hl-primary text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <p className="text-sm text-white/50">
          <span className="font-semibold text-white">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "company" : "companies"} found
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/5 bg-[#141417] px-6 py-16 text-center">
            <Building2 className="mx-auto size-10 text-white/30" />
            <p className="mt-3 text-sm text-white/50">
              {companies.length === 0
                ? "There are no approved companies to show yet."
                : "No companies match your filters."}
            </p>
            {companies.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm text-hl-primary transition-colors hover:text-hl-primary/80"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((company) => {
              const id = companyId(company)
              const openJobs =
                openJobCounts[(company.name ?? "").trim().toLowerCase()] ?? 0

              return (
                <Link
                  key={id || company.name}
                  href={`/companies/${encodeURIComponent(id)}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/5 bg-[#141417] p-5 transition-colors hover:border-white/15 hover:bg-[#1a1a1f]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <CompanyLogo src={company.logo} name={company.name} />
                    {company.industry && (
                      <span className="rounded-md border border-hl-primary/30 bg-hl-primary/10 px-2 py-0.5 text-[10px] font-medium text-hl-primary">
                        {company.industry}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 [font-family:var(--font-manrope)] text-base font-semibold text-white group-hover:text-hl-primary">
                    {company.name || "Unnamed company"}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">
                      {company.location || "Location not listed"}
                    </span>
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-white/40" aria-hidden />
                      {company.employeeCount || "—"} employees
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-white/70">
                      <Briefcase
                        className="size-3.5 text-hl-primary"
                        aria-hidden
                      />
                      {openJobs} open {openJobs === 1 ? "job" : "jobs"}
                    </span>
                  </div>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-hl-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View profile
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
