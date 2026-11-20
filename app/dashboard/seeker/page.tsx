"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Award,
  Bookmark,
  Calendar,
  CircleAlert,
  RefreshCw,
  Send,
  type LucideIcon,
} from "lucide-react"
import { StatCard } from "../../elements/StatCard"
import { DashboardFab } from "../../elements/DashboardFab"
import { useSession } from "@/lib/auth-client"
import {
  ApplicationApiError,
  getMyApplications,
  type JobApplication,
} from "@/lib/api/applications"
import {
  getMySavedJobs,
  SavedJobsApiError,
  type SavedJob,
} from "@/lib/api/saved-jobs"

type ActivityItem = {
  id: string
  icon: LucideIcon
  iconClass: string
  title: string
  description: string
  date: string
}

function getRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  const days = Math.round((date.getTime() - Date.now()) / 86_400_000)
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    days,
    "day"
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export default function SeekerDashboardPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user
  const userId = user?.id
  const isSeeker = (user?.role ?? "seeker") === "seeker"
  const [applications, setApplications] = useState<JobApplication[] | null>(
    null
  )
  const [savedJobs, setSavedJobs] = useState<SavedJob[] | null>(null)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (sessionPending || !userId || !isSeeker) return

    let active = true

    Promise.allSettled([getMyApplications(), getMySavedJobs()]).then(
      ([applicationsResult, savedJobsResult]) => {
        if (!active) return

        if (applicationsResult.status === "fulfilled") {
          setApplications(applicationsResult.value)
        } else {
          setApplications(null)
        }

        if (savedJobsResult.status === "fulfilled") {
          setSavedJobs(savedJobsResult.value)
        } else {
          setSavedJobs(null)
        }

        const errors = [
          applicationsResult.status === "rejected"
            ? getErrorMessage(
                applicationsResult.reason,
                "Could not load your applications."
              )
            : null,
          savedJobsResult.status === "rejected"
            ? getErrorMessage(
                savedJobsResult.reason,
                "Could not load your saved jobs."
              )
            : null,
        ].filter((message): message is string => message !== null)

        setLoadErrors(errors)
        setRequiresSignIn(
          (applicationsResult.status === "rejected" &&
            applicationsResult.reason instanceof ApplicationApiError &&
            applicationsResult.reason.status === 401) ||
            (savedJobsResult.status === "rejected" &&
              savedJobsResult.reason instanceof SavedJobsApiError &&
              savedJobsResult.reason.status === 401)
        )
        setIsLoading(false)
      }
    )

    return () => {
      active = false
    }
  }, [isSeeker, reloadKey, sessionPending, userId])

  const activities: ActivityItem[] = useMemo(() => {
    const applicationActivities = (applications ?? []).map((application) => {
      const isApplied = application.status === "Applied"
      const isRejected = application.status === "Rejected"
      const isOffered = application.status === "Offered"

      return {
        id: `application-${application.id}`,
        icon: isApplied
          ? Send
          : isOffered
            ? Award
            : isRejected
              ? CircleAlert
              : RefreshCw,
        iconClass: isOffered
          ? "text-emerald-400"
          : isRejected
            ? "text-rose-400"
            : isApplied
              ? "text-sky-300"
              : "text-amber-400",
        title: isApplied ? "Application submitted" : "Application status",
        description: isApplied
          ? `You applied for ${application.jobTitle} at ${application.company}.`
          : `${application.jobTitle} at ${application.company} is ${application.status}.`,
        date:
          !isApplied && application.updatedAt
            ? application.updatedAt
            : application.appliedAt,
      }
    })

    const savedJobActivities = (savedJobs ?? []).map((job) => ({
      id: `saved-job-${job.id}`,
      icon: Bookmark,
      iconClass: "text-emerald-400",
      title: "Job saved",
      description: `${job.jobTitle} at ${job.company} was added to your saved jobs.`,
      date: job.savedAt,
    }))

    return [...applicationActivities, ...savedJobActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
  }, [applications, savedJobs])

  const stats = [
    {
      label: "Saved Jobs",
      value: savedJobs === null ? "—" : String(savedJobs.length),
      icon: Bookmark,
    },
    {
      label: "Applications Submitted",
      value: applications === null ? "—" : String(applications.length),
      icon: Send,
    },
    {
      label: "Under Review",
      value:
        applications === null
          ? "—"
          : String(
              applications.filter(
                (application) => application.status === "Under Review"
              ).length
            ),
      icon: Calendar,
    },
    {
      label: "Offers Received",
      value:
        applications === null
          ? "—"
          : String(
              applications.filter(
                (application) => application.status === "Offered"
              ).length
            ),
      icon: Award,
    },
  ]

  function retryLoading() {
    setIsLoading(true)
    setLoadErrors([])
    setRequiresSignIn(false)
    setReloadKey((key) => key + 1)
  }

  const signInHref = `/sign-in?callbackURL=${encodeURIComponent(
    "/dashboard/seeker"
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
          Sign in to view your seeker dashboard
        </h1>
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
          This is the seeker dashboard
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Sign in with a seeker account to view applications and saved jobs.
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} variant="split" {...stat} />
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/seeker/applications"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            View applications
          </Link>
        </div>

        {loadErrors.length > 0 && (
          <div
            role="alert"
            className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-rose-200">
                {requiresSignIn
                  ? "Sign in to load your dashboard"
                  : "Some dashboard data could not be loaded"}
              </p>
              <ul className="mt-1 space-y-1 text-sm text-rose-200/70">
                {loadErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
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
                Retry
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <ul
            className="mt-4 flex flex-col gap-3"
            aria-label="Loading activity"
          >
            {[...Array(3)].map((_, index) => (
              <li
                key={index}
                className="flex animate-pulse items-center gap-4 rounded-xl border border-white/5 bg-[#141417] px-4 py-3"
              >
                <span className="size-10 rounded-full bg-white/[0.06]" />
                <span className="h-4 flex-1 rounded bg-white/[0.06]" />
                <span className="h-3 w-16 rounded bg-white/[0.04]" />
              </li>
            ))}
          </ul>
        ) : activities.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {activities.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#141417] px-4 py-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1f1f23]">
                  <item.icon
                    aria-hidden
                    className={`size-4.5 ${item.iconClass}`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white/45">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-white/80">
                    {item.description}
                  </p>
                </div>
                <time
                  dateTime={item.date}
                  title={new Date(item.date).toLocaleString()}
                  className="shrink-0 text-xs whitespace-nowrap text-white/40"
                >
                  {getRelativeDate(item.date)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          !loadErrors.length && (
            <div className="mt-4 rounded-xl border border-white/5 bg-[#141417] px-5 py-10 text-center">
              <p className="text-sm font-medium text-white/75">
                Your activity will appear here
              </p>
              <p className="mt-1 text-sm text-white/45">
                Save a job or submit an application to get started.
              </p>
              <Link
                href="/browse-jobs"
                className="mt-4 inline-flex h-9 items-center rounded-lg bg-hl-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90"
              >
                Browse jobs
              </Link>
            </div>
          )
        )}
      </section>

      <DashboardFab href="/browse-jobs" label="Browse jobs" />
    </div>
  )
}
