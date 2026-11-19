"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Briefcase,
  ChevronDown,
  Filter,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  salary: string
  salaryMin: number
  category: string
  posted: string
  featured?: boolean
  remote?: boolean
}

const JOBS: Job[] = [
  { id: "1", title: "Frontend Developer", company: "HireLoop", location: "Remote", type: "Full-time", salary: "$80k – $120k", salaryMin: 80000, category: "Engineering & Tech", posted: "2d ago", featured: true, remote: true },
  { id: "2", title: "Product Designer", company: "Stripe", location: "San Francisco, CA", type: "Full-time", salary: "$90k – $130k", salaryMin: 90000, category: "Design & Creative", posted: "1d ago" },
  { id: "3", title: "Backend Engineer", company: "Vercel", location: "Remote", type: "Contract", salary: "$70 – $90 / hr", salaryMin: 70000, category: "Engineering & Tech", posted: "3d ago", remote: true },
  { id: "4", title: "Data Scientist", company: "OpenAI", location: "San Francisco, CA", type: "Full-time", salary: "$130k – $180k", salaryMin: 130000, category: "Engineering & Tech", posted: "5d ago", featured: true },
  { id: "5", title: "Marketing Manager", company: "Notion", location: "New York, NY", type: "Full-time", salary: "$70k – $100k", salaryMin: 70000, category: "Marketing", posted: "1w ago" },
  { id: "6", title: "Sales Representative", company: "HubSpot", location: "Boston, MA", type: "Full-time", salary: "$60k – $90k", salaryMin: 60000, category: "Sales", posted: "4d ago" },
  { id: "7", title: "Financial Analyst", company: "Goldman Sachs", location: "New York, NY", type: "Full-time", salary: "$85k – $110k", salaryMin: 85000, category: "Finance", posted: "6d ago" },
  { id: "8", title: "Registered Nurse", company: "Mayo Clinic", location: "Rochester, MN", type: "Full-time", salary: "$65k – $85k", salaryMin: 65000, category: "Healthcare", posted: "2d ago" },
  { id: "9", title: "UX Researcher", company: "Figma", location: "Remote", type: "Contract", salary: "$80 – $110 / hr", salaryMin: 80000, category: "Design & Creative", posted: "1d ago", remote: true },
  { id: "10", title: "DevOps Engineer", company: "Netflix", location: "Los Gatos, CA", type: "Full-time", salary: "$120k – $160k", salaryMin: 120000, category: "Engineering & Tech", posted: "3d ago" },
  { id: "11", title: "Content Writer", company: "Medium", location: "Remote", type: "Part-time", salary: "$30 – $45 / hr", salaryMin: 30000, category: "Marketing", posted: "5d ago", remote: true },
  { id: "12", title: "Account Executive", company: "Salesforce", location: "Chicago, IL", type: "Full-time", salary: "$75k – $105k", salaryMin: 75000, category: "Sales", posted: "1w ago" },
]

const CATEGORIES = [
  "All",
  "Engineering & Tech",
  "Design & Creative",
  "Marketing",
  "Sales",
  "Finance",
  "Healthcare",
]

const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Internship", "Remote"]

const LOCATIONS = ["All", "Remote", "San Francisco, CA", "New York, NY", "Chicago, IL", "Boston, MA"]

const SALARY_RANGES = [
  { label: "Any", min: 0 },
  { label: "$50k+", min: 50000 },
  { label: "$80k+", min: 80000 },
  { label: "$100k+", min: 100000 },
  { label: "$130k+", min: 130000 },
]

function BrowseJobsContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState("All")
  const [category, setCategory] = useState("All")
  const [jobType, setJobType] = useState<JobType | "All">("All")
  const [salaryMin, setSalaryMin] = useState(0)
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "salary">("relevance")
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = JOBS.filter((j) => {
      if (query && !`${j.title} ${j.company} ${j.category}`.toLowerCase().includes(query.toLowerCase())) return false
      if (location !== "All" && j.location !== location) return false
      if (category !== "All" && j.category !== category) return false
      if (jobType !== "All" && j.type !== jobType) return false
      if (j.salaryMin < salaryMin) return false
      return true
    })
    if (sortBy === "salary") list = [...list].sort((a, b) => b.salaryMin - a.salaryMin)
    return list
  }, [query, location, category, jobType, salaryMin, sortBy])

  const activeFilterCount = (location !== "All" ? 1 : 0) + (category !== "All" ? 1 : 0) + (jobType !== "All" ? 1 : 0) + (salaryMin > 0 ? 1 : 0)

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearFilters() {
    setLocation("All")
    setCategory("All")
    setJobType("All")
    setSalaryMin(0)
    setQuery("")
  }

  return (
    <div className="mx-auto max-w-350">
      {/* Header */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-orange-300/70 backdrop-blur-sm sm:text-sm">
          Discover {JOBS.length} open positions across top companies.
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill, or company"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#161618] pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#161618] pl-12 pr-10 text-sm text-white outline-none transition-colors focus:border-hl-primary/60"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l === "All" ? "All locations" : l}
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
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-hl-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Search className="size-4" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-hl-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "w-full shrink-0 lg:block lg:w-64",
            showFilters ? "block" : "hidden"
          )}
        >
          <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#141417] p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Filter className="size-4" />
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-hl-primary transition-colors hover:text-hl-primary/80"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mt-5">
              <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
                Category
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      category === c
                        ? "bg-hl-primary/15 text-hl-primary"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Job type */}
            <div className="mt-5">
              <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
                Job Type
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setJobType("All")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    jobType === "All"
                      ? "border-hl-primary bg-hl-primary text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  All
                </button>
                {JOB_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setJobType(t)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      jobType === t
                        ? "border-hl-primary bg-hl-primary text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary range */}
            <div className="mt-5">
              <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
                Salary Range
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {SALARY_RANGES.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setSalaryMin(r.min)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      salaryMin === r.min
                        ? "bg-hl-primary/15 text-hl-primary"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white">{filtered.length}</span>{" "}
              jobs found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "relevance" | "newest" | "salary")
                }
                className="h-9 appearance-none rounded-lg border border-white/10 bg-[#161618] pl-3 pr-8 text-xs text-white outline-none focus:border-hl-primary/60"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="salary">Highest salary</option>
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none -ml-6 size-3.5 text-white/40"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#141417] px-6 py-16 text-center">
              <Briefcase className="mx-auto size-10 text-white/30" />
              <p className="mt-3 text-sm text-white/50">No jobs match your filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm text-hl-primary transition-colors hover:text-hl-primary/80"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((job) => (
                <Link
                  key={job.id}
                  href={`/browse-jobs/${job.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#141417] p-5 transition-colors hover:border-white/15 hover:bg-[#1a1a1f] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Briefcase className="size-5 text-white/60" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white group-hover:text-hl-primary">
                          {job.title}
                        </h3>
                        {job.featured && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            <Star className="size-3" />
                            Featured
                          </span>
                        )}
                        {job.remote && (
                          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Remote
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-white/50">
                        {job.company} · {job.location}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
                          {job.type}
                        </span>
                        <span>{job.category}</span>
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="text-sm font-semibold text-white">
                      {job.salary}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleSave(job.id)
                      }}
                      aria-label="Save job"
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border transition-colors",
                        saved.has(job.id)
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      )}
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          saved.has(job.id) && "fill-red-400"
                        )}
                      />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                Previous
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border text-sm transition-colors",
                    p === 1
                      ? "border-hl-primary bg-hl-primary text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BrowseJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-350 py-12 text-center text-sm text-white/40">
          Loading jobs...
        </div>
      }
    >
      <BrowseJobsContent />
    </Suspense>
  )
}
