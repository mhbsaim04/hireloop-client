"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
} from "lucide-react"
import {
  ApplicationApiError,
  getMyApplications,
  type JobApplication,
} from "@/lib/api/applications"

type ApplicationStatus = JobApplication["status"]
type StatusFilter = "all" | ApplicationStatus

const STATUSES: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Offered",
]

const STATUS_STYLES: Record<
  ApplicationStatus,
  { icon: typeof Send; className: string }
> = {
  Applied: {
    icon: Send,
    className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
  "Under Review": {
    icon: Clock3,
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  Shortlisted: {
    icon: UsersRound,
    className: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },
  Rejected: {
    icon: CircleAlert,
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  },
  Offered: {
    icon: Award,
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
}

function getRelativeDate(value: string) {
  const appliedAt = new Date(value)
  if (Number.isNaN(appliedAt.getTime())) return "Date unavailable"

  const days = Math.round((appliedAt.getTime() - Date.now()) / 86_400_000)
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    days,
    "day"
  )
}

function getFormattedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { icon: Icon, className } = STATUS_STYLES[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon aria-hidden className="size-3.5" />
      {status}
    </span>
  )
}

function ApplicationSkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-5"
        >
          <div className="size-11 rounded-xl bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-44 max-w-full rounded bg-white/[0.06]" />
            <div className="h-3 w-28 rounded bg-white/[0.04]" />
          </div>
          <div className="hidden h-6 w-24 rounded-full bg-white/[0.06] sm:block" />
          <div className="hidden h-6 w-20 rounded bg-white/[0.04] md:block" />
        </div>
      ))}
    </div>
  )
}

export default function SeekerApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[] | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    let active = true

    getMyApplications()
      .then((data) => {
        if (active) setApplications(data)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setApplications(null)
        setRequiresSignIn(
          cause instanceof ApplicationApiError && cause.status === 401
        )
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your applications. Please try again."
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const filteredApplications = useMemo(() => {
    const records = applications ?? []
    const normalizedQuery = query.trim().toLowerCase()

    return records.filter((application) => {
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter
      const matchesQuery =
        !normalizedQuery ||
        `${application.jobTitle} ${application.company} ${application.location}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [applications, query, statusFilter])

  const totalApplications = applications?.length ?? 0
  const inReview =
    applications?.filter((application) => application.status === "Under Review")
      .length ?? 0
  const shortlisted =
    applications?.filter((application) => application.status === "Shortlisted")
      .length ?? 0
  const offers =
    applications?.filter((application) => application.status === "Offered")
      .length ?? 0

  function retryLoading() {
    setIsLoading(true)
    setError(null)
    setRequiresSignIn(false)
    setReloadKey((key) => key + 1)
  }

  function clearFilters() {
    setQuery("")
    setStatusFilter("all")
  }

  const signInHref = `/sign-in?callbackURL=${encodeURIComponent(
    "/dashboard/seeker/applications"
  )}`
  const needsSignIn = requiresSignIn

  return (
    <div className="mx-auto max-w-350">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/dashboard/seeker"
          className="font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
        >
          Dashboard
        </Link>
        <ChevronRight aria-hidden className="size-3.5 text-white/25" />
        <span className="font-medium text-white">My Applications</span>
      </nav>

      <section className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#1a1a1e] via-[#151518] to-[#171416] p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-orange-500/[0.09] blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/15 bg-orange-400/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-orange-300 uppercase">
              <Sparkles aria-hidden className="size-3" />
              Your career journey
            </span>
            <h1 className="mt-3 [font-family:var(--font-manrope)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              My Applications
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Keep track of the roles you&apos;ve applied to and see where each
              opportunity stands.
            </p>
          </div>
          <Link
            href="/browse-jobs"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90"
          >
            <Search aria-hidden className="size-4" />
            Explore jobs
          </Link>
        </div>
      </section>

      <section
        aria-label="Application overview"
        className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          {
            label: "Total applications",
            value: totalApplications,
            icon: FileText,
            accent: "text-sky-300",
            tile: "bg-sky-400/10",
          },
          {
            label: "In review",
            value: inReview,
            icon: Clock3,
            accent: "text-amber-300",
            tile: "bg-amber-400/10",
          },
          {
            label: "Shortlisted",
            value: shortlisted,
            icon: UsersRound,
            accent: "text-violet-300",
            tile: "bg-violet-400/10",
          },
          {
            label: "Offers",
            value: offers,
            icon: Award,
            accent: "text-emerald-300",
            tile: "bg-emerald-400/10",
          },
        ].map(({ label, value, icon: Icon, accent, tile }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-[#161618] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-white/45 sm:text-sm">
                {label}
              </span>
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tile}`}
              >
                <Icon aria-hidden className={`size-4 ${accent}`} />
              </span>
            </div>
            <p className="mt-3 [font-family:var(--font-manrope)] text-2xl font-bold text-white sm:text-3xl">
              {isLoading ? (
                <span className="inline-block h-8 w-10 animate-pulse rounded bg-white/[0.07]" />
              ) : (
                value
              )}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
              Application history
            </h2>
            <p className="mt-1 text-sm text-white/45">
              {isLoading
                ? "Loading your applications…"
                : `${totalApplications} ${
                    totalApplications === 1 ? "application" : "applications"
                  } in your history`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search role or company"
                aria-label="Search applications"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#151517] pr-3 pl-10 text-sm text-white transition-colors outline-none placeholder:text-white/35 focus:border-hl-primary/60"
              />
            </label>
            <label className="relative block sm:w-44">
              <SlidersHorizontal
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  const value = event.target.value
                  setStatusFilter(
                    value === "all"
                      ? "all"
                      : (STATUSES.find((status) => status === value) ?? "all")
                  )
                }}
                aria-label="Filter by application status"
                className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-[#151517] pr-3 pl-10 text-sm text-white transition-colors outline-none focus:border-hl-primary/60"
              >
                <option value="all" className="bg-[#151517]">
                  All statuses
                </option>
                {STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-[#151517]">
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-rose-200">
                {needsSignIn
                  ? "Sign in to view your applications"
                  : "Couldn’t load applications"}
              </p>
              <p className="mt-1 text-sm text-rose-200/70">{error}</p>
            </div>
            {needsSignIn ? (
              <Link
                href={signInHref}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-200/20 px-3 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-200/10"
              >
                Sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={retryLoading}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-200/20 px-3 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-200/10"
              >
                Try again
              </button>
            )}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141417]">
          {isLoading ? (
            <ApplicationSkeleton />
          ) : applications?.length === 0 && !error ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <BriefcaseBusiness
                  aria-hidden
                  className="size-6 text-white/45"
                />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                Your next opportunity starts here
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
                When you apply to a job, it will appear here with its latest
                status so you can follow your progress.
              </p>
              <Link
                href="/browse-jobs"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90"
              >
                Browse open positions
                <ChevronRight aria-hidden className="size-4" />
              </Link>
            </div>
          ) : !error && filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <Search aria-hidden className="size-6 text-white/35" />
              <p className="mt-3 text-sm font-medium text-white/75">
                No applications match these filters
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-sm font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
              >
                Clear filters
              </button>
            </div>
          ) : !error ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {[
                        "Job title",
                        "Company",
                        "Date applied",
                        "Status",
                        "",
                      ].map((heading) => (
                        <th
                          key={heading || "action"}
                          scope="col"
                          className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wider text-white/35 uppercase"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => {
                      const jobHref = `/browse-jobs/${encodeURIComponent(
                        application.jobId
                      )}`

                      return (
                        <tr
                          key={application.id}
                          className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                <BriefcaseBusiness
                                  aria-hidden
                                  className="size-4 text-white/60"
                                />
                              </span>
                              <div className="min-w-0">
                                <Link
                                  href={jobHref}
                                  className="block max-w-72 truncate font-semibold text-white transition-colors hover:text-hl-primary"
                                >
                                  {application.jobTitle}
                                </Link>
                                {application.location && (
                                  <span className="mt-1 flex items-center gap-1 text-xs text-white/40">
                                    <MapPin aria-hidden className="size-3" />
                                    {application.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium text-white/75">
                            {application.company}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              title={getFormattedDate(application.appliedAt)}
                              className="text-white/75"
                            >
                              {getRelativeDate(application.appliedAt)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={application.status} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={jobHref}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                            >
                              View job
                              <ChevronRight aria-hidden className="size-3.5" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-white/[0.05] lg:hidden">
                {filteredApplications.map((application) => {
                  const jobHref = `/browse-jobs/${encodeURIComponent(
                    application.jobId
                  )}`

                  return (
                    <li key={application.id} className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                          <BriefcaseBusiness
                            aria-hidden
                            className="size-4 text-white/60"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={jobHref}
                            className="block truncate font-semibold text-white transition-colors hover:text-hl-primary"
                          >
                            {application.jobTitle}
                          </Link>
                          <p className="mt-1 truncate text-sm text-white/50">
                            {application.company}
                          </p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="min-w-0 text-xs text-white/40">
                          {application.location && (
                            <span className="mb-1 flex items-center gap-1.5 truncate">
                              <MapPin aria-hidden className="size-3.5" />
                              {application.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <CalendarDays aria-hidden className="size-3.5" />
                            Applied {getRelativeDate(application.appliedAt)}
                            <span className="text-white/25">
                              · {getFormattedDate(application.appliedAt)}
                            </span>
                          </span>
                        </div>
                        <Link
                          href={jobHref}
                          aria-label={`View ${application.jobTitle}`}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <ChevronRight aria-hidden className="size-4" />
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}
        </div>

        {!isLoading && !error && filteredApplications.length > 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/35">
            <Check aria-hidden className="size-3.5 text-emerald-400/80" />
            Your applications are up to date
          </p>
        )}
      </section>
    </div>
  )
}
