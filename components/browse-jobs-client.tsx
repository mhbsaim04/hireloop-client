"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  Clock3,
  Filter,
  Heart,
  MapPin,
  Search,
  SearchX,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { CompanyLogo } from "@/components/company-logo"
import { cn } from "@/lib/utils"

export interface Job {
  _id?: string
  id?: string
  title?: string
  company?: string
  category?: string
  jobType?: string
  isRemote?: boolean
  location?: string
  minSalary?: string | number
  maxSalary?: string | number
  frequency?: string
  requirements?: string
  responsibilities?: string
  description?: string
  createdAt?: string
  deadline?: string
}

export interface InitialFilters {
  category?: string
  location?: string
  type?: string
  minSalary?: string
  requirements?: string
}

type SortKey = "relevance" | "newest" | "salary"

interface FilterValues {
  query: string
  location: string
  category: string
  jobType: string
  salary: number
  requirements: string
}

const SALARY_RANGES = [
  { label: "Any salary", min: 0 },
  { label: "$500+", min: 500 },
  { label: "$1,000+", min: 1000 },
  { label: "$5,000+", min: 5000 },
  { label: "$25,000+", min: 25000 },
  { label: "$100,000+", min: 100000 },
]

const PAGE_SIZE = 6

function jobId(j: Job) {
  return j._id ?? j.id ?? ""
}

function salaryMin(j: Job) {
  return Number(j.minSalary) || 0
}

function formatSalary(job: Job) {
  const parts = [job.minSalary, job.maxSalary]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map((value) => {
      const amount = Number(value)
      return Number.isNaN(amount)
        ? `$${value}`
        : `$${amount.toLocaleString("en-US")}`
    })
  if (parts.length === 0) return "Salary not listed"
  const range = parts.join(" – ")
  return job.frequency
    ? `${range} / ${job.frequency.replace(/^per\s+/i, "")}`
    : range
}

function relativeTime(value?: string) {
  if (!value) return null
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null
  const diff = Date.now() - time
  if (diff < 0) return null
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function deadlineLabel(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `Apply by ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`
}

function jobMeta(job: Job) {
  const posted = relativeTime(job.createdAt)
  if (posted) return `Posted ${posted}`
  return deadlineLabel(job.deadline) ?? "Open now"
}

function pageNumbers(current: number, total: number) {
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const pages = Array.from(wanted)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const items: Array<number | "gap"> = []
  let previous = 0
  for (const page of pages) {
    if (page - previous > 1) items.push("gap")
    items.push(page)
    previous = page
  }
  return items
}

export function BrowseJobsClient({
  jobs,
  initialQuery,
  initialFilters = {},
}: {
  jobs: Job[]
  initialQuery: string
  initialFilters?: InitialFilters
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(
    initialQuery || searchParams.get("search") || searchParams.get("q") || ""
  )
  const [location, setLocation] = useState(initialFilters.location ?? "All")
  const [category, setCategory] = useState(initialFilters.category ?? "All")
  const [jobType, setJobType] = useState(initialFilters.type ?? "All")
  const [salaryMinFilter, setSalaryMinFilter] = useState(
    Number(initialFilters.minSalary) || 0
  )
  const [reqKeyword, setReqKeyword] = useState(
    initialFilters.requirements ?? ""
  )
  const [sortBy, setSortBy] = useState<SortKey>("relevance")
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  /* ---------------------------------------------------------------- data */

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    jobs.forEach((job) => {
      const value = (job.category ?? "").trim()
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [jobs])

  const jobTypes = useMemo(() => {
    const set = new Set<string>()
    jobs.forEach((job) => {
      const value = (job.jobType ?? "").trim()
      if (value) set.add(value)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [jobs])

  const locations = useMemo(() => {
    const set = new Set<string>()
    jobs.forEach((job) => {
      const value = (job.location ?? "").trim()
      if (value) set.add(value)
    })
    const list = Array.from(set).sort((a, b) => a.localeCompare(b))
    if (jobs.some((job) => job.isRemote)) list.unshift("Remote")
    return ["All", ...list]
  }, [jobs])

  const quickCategories = useMemo(
    () => categories.slice(0, 3).map(([value]) => value),
    [categories]
  )

  const hasRemote = useMemo(() => jobs.some((job) => job.isRemote), [jobs])

  const companyCount = useMemo(() => {
    const set = new Set<string>()
    jobs.forEach((job) => {
      const value = (job.company ?? "").trim().toLowerCase()
      if (value) set.add(value)
    })
    return set.size
  }, [jobs])

  const remoteCount = useMemo(
    () => jobs.filter((job) => job.isRemote).length,
    [jobs]
  )

  /* ------------------------------------------------------------- filter */

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (
        query &&
        !`${job.title ?? ""} ${job.company ?? ""} ${job.category ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false
      }
      if (location !== "All") {
        if (location === "Remote") {
          if (!job.isRemote && job.location !== "Remote") return false
        } else if (job.location !== location) return false
      }
      if (category !== "All" && job.category !== category) return false
      if (jobType !== "All" && job.jobType !== jobType) return false
      if (salaryMin(job) < salaryMinFilter) return false
      if (
        reqKeyword &&
        !(job.requirements ?? "")
          .toLowerCase()
          .includes(reqKeyword.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [jobs, query, location, category, jobType, salaryMinFilter, reqKeyword])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sortBy === "salary") list.sort((a, b) => salaryMin(b) - salaryMin(a))
    if (sortBy === "newest") {
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    }
    return list
  }, [filtered, sortBy])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE)

  const activeCount =
    (location !== "All" ? 1 : 0) +
    (category !== "All" ? 1 : 0) +
    (jobType !== "All" ? 1 : 0) +
    (salaryMinFilter > 0 ? 1 : 0) +
    (reqKeyword ? 1 : 0)

  /* ------------------------------------------------------------ actions */

  function currentValues(overrides: Partial<FilterValues> = {}): FilterValues {
    return {
      query,
      location,
      category,
      jobType,
      salary: salaryMinFilter,
      requirements: reqKeyword,
      ...overrides,
    }
  }

  function buildUrl(overrides: Partial<FilterValues> = {}) {
    const values = currentValues(overrides)
    const params = new URLSearchParams()
    if (values.query) params.set("search", values.query)
    if (values.location !== "All") params.set("location", values.location)
    if (values.category !== "All") params.set("category", values.category)
    if (values.jobType !== "All") params.set("type", values.jobType)
    if (values.salary > 0) params.set("minSalary", String(values.salary))
    if (values.requirements) params.set("requirements", values.requirements)
    const qs = params.toString()
    return `/browse-jobs${qs ? `?${qs}` : ""}`
  }

  function applyFilters(overrides: Partial<FilterValues>) {
    if (overrides.query !== undefined) setQuery(overrides.query)
    if (overrides.location !== undefined) setLocation(overrides.location)
    if (overrides.category !== undefined) setCategory(overrides.category)
    if (overrides.jobType !== undefined) setJobType(overrides.jobType)
    if (overrides.salary !== undefined) setSalaryMinFilter(overrides.salary)
    if (overrides.requirements !== undefined) {
      setReqKeyword(overrides.requirements)
    }
    setPage(1)
    startTransition(() => router.replace(buildUrl(overrides)))
  }

  function clearAll() {
    applyFilters({
      query: "",
      location: "All",
      category: "All",
      jobType: "All",
      salary: 0,
      requirements: "",
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    startTransition(() => router.push(buildUrl()))
  }

  function changeSort(value: string) {
    setSortBy(value as SortKey)
    setPage(1)
  }

  function goToPage(next: number) {
    const target = Math.min(Math.max(next, 1), pageCount)
    setPage(target)
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function toggleSave(job: Job) {
    const id = jobId(job)
    if (!id) return
    const willSave = !saved.has(id)
    setSaved((previous) => {
      const next = new Set(previous)
      if (willSave) next.add(id)
      else next.delete(id)
      return next
    })
    toast.add({
      title: willSave ? "Job saved" : "Removed from saved jobs",
      description: willSave
        ? `${job.title || "This job"} was added to your saved list.`
        : `${job.title || "This job"} is no longer in your saved list.`,
      type: "success",
    })
  }

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
  if (location !== "All") {
    chips.push({
      key: "location",
      label: location,
      onRemove: () => applyFilters({ location: "All" }),
    })
  }
  if (category !== "All") {
    chips.push({
      key: "category",
      label: category,
      onRemove: () => applyFilters({ category: "All" }),
    })
  }
  if (jobType !== "All") {
    chips.push({
      key: "type",
      label: jobType,
      onRemove: () => applyFilters({ jobType: "All" }),
    })
  }
  if (salaryMinFilter > 0) {
    chips.push({
      key: "salary",
      label: `$${salaryMinFilter.toLocaleString("en-US")}+ salary`,
      onRemove: () => applyFilters({ salary: 0 }),
    })
  }
  if (reqKeyword) {
    chips.push({
      key: "requirements",
      label: `Skills: ${reqKeyword}`,
      onRemove: () => applyFilters({ requirements: "" }),
    })
  }

  // Remounting cards with this key replays the entrance animation whenever
  // the visible result set changes.
  const renderKey = [
    query,
    location,
    category,
    jobType,
    salaryMinFilter,
    reqKeyword,
    sortBy,
    currentPage,
  ].join("|")

  const stats = [
    { label: "Open positions", value: String(jobs.length) },
    { label: "Companies", value: String(companyCount) },
    { label: "Remote roles", value: String(remoteCount) },
  ]

  /* -------------------------------------------------------------- render */

  return (
    <div className="mx-auto max-w-350">
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#141417] px-6 py-8 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-hl-primary/15 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-64 rounded-full bg-orange-500/10 blur-[110px]"
        />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.2em] text-hl-primary uppercase">
            Find your next move
          </p>
          <h1 className="mt-2 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Browse Jobs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50 sm:text-base">
            Explore {jobs.length} open positions from teams hiring right now.
            Filter by role, location, and salary to find your fit.
          </p>
          <dl className="mt-6 flex flex-wrap gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3"
              >
                <dt className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 [font-family:var(--font-manrope)] text-xl font-bold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Search bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#141417] p-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Job title, skill, or company"
            aria-label="Search jobs"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#161618] pr-11 pl-12 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => applyFilters({ query: "" })}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="relative sm:w-60">
          <MapPin
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
          />
          <select
            value={location}
            onChange={(event) => applyFilters({ location: event.target.value })}
            aria-label="Filter by location"
            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#161618] pr-10 pl-12 text-sm text-white transition-colors outline-none focus:border-hl-primary/60"
          >
            {locations.map((value) => (
              <option key={value} value={value}>
                {value === "All" ? "All locations" : value}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
          />
        </div>

        <button
          type="submit"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-hl-primary px-6 text-sm font-semibold text-white transition-all hover:bg-hl-primary/90 active:scale-[0.98]"
        >
          <Search className="size-4" />
          Search
        </button>

        <button
          type="button"
          onClick={() => setShowFilters((value) => !value)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-hl-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </form>

      {/* Quick filters */}
      {(hasRemote || quickCategories.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/40">Quick filters</span>
          {hasRemote && (
            <button
              type="button"
              onClick={() =>
                applyFilters({
                  location: location === "Remote" ? "All" : "Remote",
                })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                location === "Remote"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
              )}
            >
              Remote
            </button>
          )}
          {quickCategories.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                applyFilters({
                  category: category === value ? "All" : value,
                })
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === value
                  ? "border-hl-primary bg-hl-primary text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
            Active
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove ${chip.label} filter`}
              className="group inline-flex items-center gap-1.5 rounded-full border border-hl-primary/30 bg-hl-primary/10 px-3 py-1.5 text-xs font-medium text-indigo-200 transition-colors hover:border-hl-primary/50 hover:bg-hl-primary/20"
            >
              {chip.label}
              <X className="size-3 text-white/50 transition-colors group-hover:text-white" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-white/40 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "w-full shrink-0 lg:block lg:w-64",
            showFilters
              ? "animate-in duration-300 fade-in-0 slide-in-from-top-2 motion-reduce:animate-none"
              : "hidden"
          )}
        >
          <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#141417] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Filter className="size-4 text-hl-primary" aria-hidden />
                Filters
                {activeCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-hl-primary text-[10px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-hl-primary transition-colors hover:text-hl-primary/80"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                Category
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => applyFilters({ category: "All" })}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    category === "All"
                      ? "bg-hl-primary/15 text-hl-primary"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  All categories
                  <span className="text-xs text-white/30">{jobs.length}</span>
                </button>
                {categories.map(([value, count]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      applyFilters({
                        category: category === value ? "All" : value,
                      })
                    }
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      category === value
                        ? "bg-hl-primary/15 text-hl-primary"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate">{value}</span>
                    <span className="text-xs text-white/30">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Job type */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                Job type
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyFilters({ jobType: "All" })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    jobType === "All"
                      ? "border-hl-primary bg-hl-primary text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                  )}
                >
                  All
                </button>
                {jobTypes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      applyFilters({
                        jobType: jobType === value ? "All" : value,
                      })
                    }
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      jobType === value
                        ? "border-hl-primary bg-hl-primary text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="mt-5">
              <p className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                Salary range
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {SALARY_RANGES.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => applyFilters({ salary: range.min })}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      salaryMinFilter === range.min
                        ? "bg-hl-primary/15 text-hl-primary"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {range.label}
                    {range.min > 0 && salaryMinFilter === range.min && (
                      <X className="size-3.5" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills keyword */}
            <div className="mt-5">
              <label
                htmlFor="skill-keyword"
                className="text-[11px] font-semibold tracking-wider text-white/40 uppercase"
              >
                Skills keyword
              </label>
              <input
                id="skill-keyword"
                type="text"
                value={reqKeyword}
                onChange={(event) => setReqKeyword(event.target.value)}
                onBlur={() => applyFilters({ requirements: reqKeyword.trim() })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    applyFilters({ requirements: reqKeyword.trim() })
                  }
                }}
                placeholder="e.g. React, TypeScript"
                className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#161618] px-3 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="mt-5 h-10 w-full rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/70 transition-colors hover:text-white lg:hidden"
            >
              Done
            </button>
          </div>
        </aside>

        {/* Results */}
        <div
          ref={resultsRef}
          className="relative min-w-0 flex-1 scroll-mt-28"
          aria-busy={isPending}
        >
          {isPending && (
            <div
              aria-hidden
              className="absolute inset-x-0 -top-3 h-0.5 overflow-hidden rounded-full bg-white/5"
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-hl-primary" />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "job" : "jobs"} found
              {sorted.length > 0 && (
                <span className="text-white/30">
                  {" "}
                  · showing {pageStart + 1}–
                  {Math.min(pageStart + PAGE_SIZE, sorted.length)}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-jobs" className="text-xs text-white/40">
                Sort by
              </label>
              <div className="relative">
                <select
                  id="sort-jobs"
                  value={sortBy}
                  onChange={(event) => changeSort(event.target.value)}
                  className="h-9 appearance-none rounded-lg border border-white/10 bg-[#161618] pr-8 pl-3 text-xs text-white transition-colors outline-none focus:border-hl-primary/60"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest first</option>
                  <option value="salary">Highest salary</option>
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/40"
                />
              </div>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="animate-in rounded-2xl border border-white/5 bg-[#141417] px-6 py-16 text-center duration-300 fade-in-0">
              <SearchX className="mx-auto size-10 text-white/30" aria-hidden />
              <h2 className="mt-4 [font-family:var(--font-manrope)] text-lg font-semibold text-white">
                No jobs match your search
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">
                Try removing a filter or searching for a different keyword — new
                roles are posted every day.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex h-10 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-all hover:bg-hl-primary/90 active:scale-[0.98]"
                >
                  Reset search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/70 transition-colors hover:text-white lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Adjust filters
                </button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4 transition-opacity duration-200 md:grid-cols-2",
                isPending && "opacity-60"
              )}
            >
              {pageItems.map((job, index) => {
                const id = jobId(job)
                const isSaved = saved.has(id)

                return (
                  <article
                    key={`${renderKey}-${id}`}
                    className="group relative h-full animate-in duration-500 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none"
                    style={{
                      animationDelay: `${Math.min(index * 60, 300)}ms`,
                    }}
                  >
                    <Link
                      href={`/browse-jobs/${encodeURIComponent(id)}`}
                      aria-label={`View ${job.title ?? "job"} at ${job.company ?? "company"}`}
                      className="absolute inset-0 z-10 rounded-2xl ring-hl-primary/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141417] focus-visible:outline-none"
                    />
                    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-[#141417] p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-hl-primary/40 group-hover:bg-[#1a1a1f] group-hover:shadow-[0_24px_60px_-28px_rgba(92,83,254,0.55)]">
                      <div className="flex items-start justify-between gap-3">
                        <CompanyLogo
                          src={undefined}
                          name={job.company}
                          className="size-11 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSave(job)}
                          aria-pressed={isSaved}
                          aria-label={
                            isSaved ? "Remove from saved jobs" : "Save job"
                          }
                          className={cn(
                            "relative z-20 flex size-9 items-center justify-center rounded-lg border transition-all active:scale-90",
                            isSaved
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white"
                          )}
                        >
                          <Heart
                            className={cn(
                              "size-4 transition-transform",
                              isSaved && "scale-110 fill-red-400"
                            )}
                          />
                        </button>
                      </div>

                      <h3 className="mt-4 line-clamp-2 [font-family:var(--font-manrope)] text-base font-semibold text-white transition-colors group-hover:text-hl-primary">
                        {job.title || "Untitled job"}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                        <Building2
                          className="size-3.5 shrink-0 text-white/40"
                          aria-hidden
                        />
                        <span className="truncate">
                          {job.company || "Company not listed"}
                        </span>
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">
                          {job.isRemote && job.location
                            ? `Remote · ${job.location}`
                            : job.location || "Location not listed"}
                        </span>
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.jobType && (
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/60">
                            {job.jobType}
                          </span>
                        )}
                        {job.category && (
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/60">
                            {job.category}
                          </span>
                        )}
                        {job.isRemote && (
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                            Remote
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                          <Wallet
                            className="size-4 shrink-0 text-hl-primary"
                            aria-hidden
                          />
                          <span className="truncate">{formatSalary(job)}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-white/40">
                          <Clock3 className="size-3.5" aria-hidden />
                          {/* relative time depends on Date.now(), which can
                              differ between server and client renders */}
                          <span suppressHydrationWarning>{jobMeta(job)}</span>
                          <ArrowUpRight
                            className="size-4 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-hl-primary"
                            aria-hidden
                          />
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <nav
              aria-label="Job results pages"
              className="mt-8 flex flex-col items-center gap-3"
            >
              <p className="text-xs text-white/40">
                Page {currentPage} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-40"
                >
                  Previous
                </button>
                {pageNumbers(currentPage, pageCount).map((item, index) =>
                  item === "gap" ? (
                    <span
                      key={`gap-${index}`}
                      aria-hidden
                      className="px-1 text-sm text-white/30"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      aria-label={`Page ${item}`}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border text-sm transition-colors",
                        item === currentPage
                          ? "border-hl-primary bg-hl-primary text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
