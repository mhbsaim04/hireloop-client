"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  MapPin,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useSession } from "@/lib/auth-client"
import {
  getMySavedJobs,
  removeSavedJob,
  SavedJobsApiError,
  type SavedJob,
} from "@/lib/api/saved-jobs"

function getRelativeDate(value: string) {
  const savedAt = new Date(value)
  if (Number.isNaN(savedAt.getTime())) return "Date unavailable"

  const days = Math.round((savedAt.getTime() - Date.now()) / 86_400_000)
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

function formatSalary(job: SavedJob) {
  const range = [job.minSalary, job.maxSalary]
    .filter((amount) => amount !== null && amount !== "")
    .join(" - ")

  if (!range) return "Salary not listed"
  return job.frequency
    ? `${range} / ${job.frequency.replace(/^per\s+/i, "")}`
    : range
}

function SavedJobSkeleton() {
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
          <div className="hidden h-6 w-24 rounded bg-white/[0.06] sm:block" />
          <div className="hidden h-6 w-20 rounded bg-white/[0.04] md:block" />
        </div>
      ))}
    </div>
  )
}

export default function SeekerSavedJobsPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user
  const userId = user?.id
  const isSeeker = (user?.role ?? "seeker") === "seeker"
  const [savedJobs, setSavedJobs] = useState<SavedJob[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (sessionPending || !userId || !isSeeker) return

    let active = true

    getMySavedJobs()
      .then((jobs) => {
        if (active) setSavedJobs(jobs)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setSavedJobs(null)
        setRequiresSignIn(
          cause instanceof SavedJobsApiError && cause.status === 401
        )
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your saved jobs. Please try again."
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [isSeeker, reloadKey, sessionPending, userId])

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return (savedJobs ?? []).filter(
      (job) =>
        !normalizedQuery ||
        `${job.jobTitle} ${job.company} ${job.location}`
          .toLowerCase()
          .includes(normalizedQuery)
    )
  }, [query, savedJobs])

  function retryLoading() {
    setIsLoading(true)
    setError(null)
    setRequiresSignIn(false)
    setReloadKey((key) => key + 1)
  }

  async function handleRemove(job: SavedJob) {
    setRemovingId(job.id)
    try {
      await removeSavedJob(job.jobId)
      setSavedJobs(
        (current) => current?.filter((savedJob) => savedJob.id !== job.id) ?? []
      )
      toast.add({
        title: "Job removed",
        description: `"${job.jobTitle}" was removed from your saved jobs.`,
        type: "success",
      })
    } catch (cause) {
      toast.add({
        title: "Could not remove job",
        description:
          cause instanceof Error ? cause.message : "Please try again.",
        type: "error",
      })
    } finally {
      setRemovingId(null)
    }
  }

  const signInHref = `/sign-in?callbackURL=${encodeURIComponent(
    "/dashboard/seeker/saved"
  )}`

  if (sessionPending) {
    return (
      <div className="mx-auto max-w-350 py-12 text-center text-sm text-white/45">
        Checking your account…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#141417] p-8 text-center">
        <h1 className="text-xl font-bold text-white">
          Sign in to view saved jobs
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Saved jobs are linked to your seeker account.
        </p>
        <Link
          href={signInHref}
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (!isSeeker) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#141417] p-8 text-center">
        <h1 className="text-xl font-bold text-white">
          Saved jobs are for seekers
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Switch to a seeker account to save jobs and manage your shortlist.
        </p>
        <Link
          href={
            user.role === "recruiter"
              ? "/dashboard/recruiter"
              : user.role === "admin"
                ? "/dashboard/admin"
                : "/profile"
          }
          className="mt-5 inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/80"
        >
          Go to your dashboard
        </Link>
      </div>
    )
  }

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
        <span className="font-medium text-white">Saved Jobs</span>
      </nav>

      <section className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#1a1a1e] via-[#151518] to-[#171416] p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-orange-500/[0.09] blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/15 bg-orange-400/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-orange-300 uppercase">
              <Bookmark aria-hidden className="size-3" />
              Keep your options open
            </span>
            <h1 className="mt-3 [font-family:var(--font-manrope)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Saved Jobs
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Revisit promising roles, compare opportunities, and apply when
              you&apos;re ready.
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

      <section className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Your shortlist
          </h2>
          <p className="mt-1 text-sm text-white/45">
            {isLoading
              ? "Loading your saved jobs…"
              : `${savedJobs?.length ?? 0} ${
                  savedJobs?.length === 1 ? "job" : "jobs"
                } saved`}
          </p>
        </div>
        <label className="relative block sm:w-72">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search role, company, or location"
            aria-label="Search saved jobs"
            className="h-10 w-full rounded-xl border border-white/10 bg-[#151517] pr-3 pl-10 text-sm text-white transition-colors outline-none placeholder:text-white/35 focus:border-hl-primary/60"
          />
        </label>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-rose-200">
              {requiresSignIn
                ? "Sign in to view your saved jobs"
                : "Couldn’t load saved jobs"}
            </p>
            <p className="mt-1 text-sm text-rose-200/70">{error}</p>
          </div>
          {requiresSignIn ? (
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
          <SavedJobSkeleton />
        ) : !error && savedJobs?.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Bookmark aria-hidden className="size-6 text-white/45" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-white">
              Your shortlist is waiting
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
              Save jobs that catch your eye and they&apos;ll be collected here
              for easy access.
            </p>
            <Link
              href="/browse-jobs"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90"
            >
              Browse open positions
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>
        ) : !error && filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <Search aria-hidden className="size-6 text-white/35" />
            <p className="mt-3 text-sm font-medium text-white/75">
              No saved jobs match your search
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-2 text-sm font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
            >
              Clear search
            </button>
          </div>
        ) : !error ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {[
                      "Job title",
                      "Company",
                      "Location",
                      "Salary",
                      "Date saved",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wider text-white/35 uppercase"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => {
                    const jobHref = `/browse-jobs/${encodeURIComponent(
                      job.jobId
                    )}`

                    return (
                      <tr
                        key={job.id}
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
                            <Link
                              href={jobHref}
                              className="block max-w-64 truncate font-semibold text-white transition-colors hover:text-hl-primary"
                            >
                              {job.jobTitle}
                            </Link>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-white/75">
                          {job.company}
                        </td>
                        <td className="px-5 py-4 text-white/60">
                          {job.location || "—"}
                        </td>
                        <td className="px-5 py-4 text-white/70">
                          {formatSalary(job)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            title={getFormattedDate(job.savedAt)}
                            className="text-white/70"
                          >
                            {getRelativeDate(job.savedAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={jobHref}
                              className="inline-flex h-8 items-center justify-center rounded-lg bg-hl-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-hl-primary/90"
                            >
                              Apply
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemove(job)}
                              disabled={removingId !== null}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/60 transition-colors hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 aria-hidden className="size-3.5" />
                              {removingId === job.id ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-white/[0.05] lg:hidden">
              {filteredJobs.map((job) => {
                const jobHref = `/browse-jobs/${encodeURIComponent(job.jobId)}`

                return (
                  <li key={job.id} className="p-4 sm:p-5">
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
                          {job.jobTitle}
                        </Link>
                        <p className="mt-1 truncate text-sm text-white/50">
                          {job.company}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 text-white/50">
                        <MapPin aria-hidden className="size-3.5 shrink-0" />
                        <span className="truncate">{job.location || "—"}</span>
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 text-white/65">
                        <span className="truncate">{formatSalary(job)}</span>
                      </span>
                      <span className="col-span-2 flex items-center gap-1.5 text-white/40">
                        <CalendarDays aria-hidden className="size-3.5" />
                        Saved {getRelativeDate(job.savedAt)}
                        <span className="text-white/25">
                          · {getFormattedDate(job.savedAt)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={jobHref}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-hl-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90"
                      >
                        Apply
                        <ChevronRight aria-hidden className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(job)}
                        disabled={removingId !== null}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm font-medium text-white/65 transition-colors hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 aria-hidden className="size-4" />
                        {removingId === job.id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
