"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CircleCheckBig,
  ExternalLink,
  FileText,
  Users,
  Zap,
} from "lucide-react"
import { StatCard } from "../../elements/StatCard"
import { DashboardFab } from "../../elements/DashboardFab"
import { UserAvatar } from "@/components/user-avatar"
import {
  getRecruiterDashboard,
  type RecruiterDashboard,
} from "@/lib/api/recruiter"
import { useSession } from "@/lib/auth-client"

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function statusStyle(status: string) {
  if (status === "Shortlisted" || status === "Offered") {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
  }
  if (status === "Under Review") {
    return "border-amber-500/30 bg-amber-500/15 text-amber-400"
  }
  if (status === "Rejected") {
    return "border-red-500/30 bg-red-500/15 text-red-400"
  }
  return "border-sky-500/30 bg-sky-500/15 text-sky-400"
}

const RecruiterDashboardPage = () => {
  const { data: session } = useSession()
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const name = session?.user?.name ?? "Recruiter"

  useEffect(() => {
    let active = true
    getRecruiterDashboard()
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load recruiter dashboard:", cause)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load your recruiter dashboard."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = [
    {
      label: "Total Job Posts",
      value: dashboard?.stats.totalJobPosts,
      icon: FileText,
    },
    {
      label: "Total Applicants",
      value: dashboard?.stats.totalApplicants,
      icon: Users,
    },
    {
      label: "Active Jobs",
      value: dashboard?.stats.activeJobs,
      icon: Zap,
    },
    {
      label: "Jobs Closed",
      value: dashboard?.stats.jobsClosed,
      icon: CircleCheckBig,
    },
  ]

  return (
    <div className="mx-auto max-w-350">
      <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
        Welcome back, {name}
      </h2>
      <p className="mt-1 text-sm text-white/50">
        Activity and applications for the jobs you posted.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={loading ? "—" : String(stat.value ?? 0)}
            icon={stat.icon}
          />
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Recent Applications
          </h3>
          <Link
            href="/dashboard/recruiter/applications"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            View all jobs
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-[#141417]">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] tracking-wider text-white/40 uppercase">
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job</th>
                <th className="px-6 py-4 font-medium">Date Applied</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-white/40"
                  >
                    Loading your applications…
                  </td>
                </tr>
              ) : dashboard?.recentApplications.length ? (
                dashboard.recentApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={application.applicantName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {application.applicantName || "Candidate"}
                          </p>
                          <p className="truncate text-xs text-white/40">
                            {application.applicantEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {application.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${statusStyle(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/recruiter/jobs/${encodeURIComponent(application.jobId)}/applicants`}
                        aria-label={`View applicants for ${application.jobTitle}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-hl-primary hover:text-hl-primary/80"
                      >
                        View job
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-white/45"
                  >
                    No applications have been received for your jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <DashboardFab
        href="/dashboard/recruiter/jobs/new"
        label="Post a new job"
      />
    </div>
  )
}

export default RecruiterDashboardPage
