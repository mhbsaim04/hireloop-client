"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  ChevronRight,
  Code2,
  Eye,
  GitBranch,
  Globe,
  HeartPulse,
  MapPin,
  Megaphone,
  MoreVertical,
  Pencil,
  Plus,
  Scissors,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { deleteJob, getJobs } from "@/lib/actions/jobs"
import type { JobForm } from "@/app/dashboard/recruiter/jobs/new/page"
import { cn } from "@/lib/utils"

/** A job post as returned by the backend: the submitted form plus system fields. */
type JobRecord = JobForm & {
  id?: string
  _id?: string
  applicants?: number
  status?: string
  createdAt?: string
}

function recordKey(job: JobRecord, index: number) {
  return job.id ?? job._id ?? String(index)
}

/** Status shown on the row: explicit status, or derived from the deadline. */
function getStatus(job: JobRecord) {
  if (job.status) return job.status
  if (job.deadline && new Date(job.deadline) < new Date()) return "Expired"
  return "Active"
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Active: {
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  Expired: {
    pill: "border-white/10 bg-white/5 text-white/50",
    dot: "bg-white/40",
  },
  Closed: {
    pill: "border-white/10 bg-white/5 text-white/50",
    dot: "bg-white/40",
  },
  Draft: {
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
}

/** Per-category icon + color (matching the Figma row icons). */
const CATEGORY_ICONS: Record<string, { icon: LucideIcon; className: string }> =
  {
    "Engineering & Tech": { icon: Code2, className: "text-sky-400" },
    "Design & Creative": { icon: Scissors, className: "text-orange-400" },
    Marketing: { icon: Megaphone, className: "text-purple-400" },
    Sales: { icon: TrendingUp, className: "text-emerald-400" },
    Finance: { icon: Wallet, className: "text-amber-400" },
    Healthcare: { icon: HeartPulse, className: "text-rose-400" },
    Infrastructure: { icon: GitBranch, className: "text-sky-400" },
    Quality: { icon: Target, className: "text-emerald-400" },
  }

const FREQUENCY_SHORT: Record<string, string> = {
  "per hour": "hr",
  "per month": "mo",
  "per year": "yr",
}

function formatDeadline(deadline?: string) {
  if (!deadline) return "—"
  const date = new Date(deadline)
  return Number.isNaN(date.getTime())
    ? deadline
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function relativePosted(createdAt?: string) {
  if (!createdAt) return null
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  const diff = Date.now() - date.getTime()
  if (diff < 0) return "Posted just now"
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "Posted just now"
  if (hours < 24) return `Posted ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 14) return `Posted ${days}d ago`
  return `Posted ${Math.floor(days / 7)}w ago`
}

function formatCompensation(job: JobRecord) {
  if (!job.minSalary && !job.maxSalary) return "—"
  const min = job.minSalary ? `$${job.minSalary}` : ""
  const max = job.maxSalary ? `$${job.maxSalary}` : ""
  const range = min && max ? `${min} – ${max}` : min || max
  const suffix = FREQUENCY_SHORT[job.frequency] ?? job.frequency
  return `${range} / ${suffix}`
}

function locationLabel(job: JobRecord) {
  return job.isRemote
    ? `Remote (${job.location || "Anywhere"})`
    : job.location || "—"
}

/* Shared pieces used by both the desktop table and the mobile cards. */

function CategoryIcon({ job }: { job: JobRecord }) {
  const match = CATEGORY_ICONS[job.category] ?? {
    icon: Briefcase,
    className: "text-white/60",
  }
  return <match.icon className={cn("size-4", match.className)} />
}

function TitleCell({ job }: { job: JobRecord }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <CategoryIcon job={job} />
      </span>
      <div className="min-w-0">
        <p
          title={job.title || "Untitled job"}
          className="max-w-48 truncate font-semibold text-white"
        >
          {job.title || "Untitled job"}
        </p>
        <p className="max-w-48 truncate text-xs text-white/40">
          {job.category}
        </p>
      </div>
    </div>
  )
}

function CompanyCell({ job }: { job: JobRecord }) {
  return (
    <div className="min-w-0">
      <p className="max-w-40 truncate font-medium text-white/80">
        {job.company}
      </p>
      <p
        title={locationLabel(job)}
        className="mt-0.5 flex max-w-55 items-center gap-1.5 text-xs text-white/40"
      >
        {job.isRemote ? (
          <Globe className="size-3 shrink-0" />
        ) : (
          <MapPin className="size-3 shrink-0" />
        )}
        <span className="truncate">{locationLabel(job)}</span>
      </p>
    </div>
  )
}

function TypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white/70 xl:px-3">
      {type}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Closed
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium whitespace-nowrap",
        style.pill
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  )
}

function ApplicantsCell({ job }: { job: JobRecord }) {
  return (
    <span
      title={
        job.applicants ? `${job.applicants} Candidates` : "No applicants yet"
      }
      className="flex items-center gap-1.5 font-semibold whitespace-nowrap text-white/80"
    >
      <Users className="size-3.5 text-hl-primary" />
      {job.applicants ? `${job.applicants} Cand.` : "—"}
    </span>
  )
}

function DeadlineCell({ job }: { job: JobRecord }) {
  const posted =
    getStatus(job) === "Active" ? relativePosted(job.createdAt) : "Closed"
  return (
    <>
      <p className="font-medium whitespace-nowrap text-white/80">
        {formatDeadline(job.deadline)}
      </p>
      {posted && (
        <p className="mt-0.5 text-xs whitespace-nowrap text-white/40">
          {posted}
        </p>
      )}
    </>
  )
}

function JobMenu({
  onDelete,
  deleting,
}: {
  onDelete: () => void
  deleting: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <>
          {/* Click-outside backdrop */}
          <div
            aria-hidden
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute top-full right-0 z-20 mt-1 w-44 rounded-xl border border-white/10 bg-[#1c1c20] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          >
            <Link
              role="menuitem"
              href="/dashboard/recruiter/applications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/5"
            >
              <Eye className="size-3.5" />
              View applicants
            </Link>
            <button
              role="menuitem"
              type="button"
              disabled={deleting}
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              Delete job post
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function JobActions({
  onDelete,
  deleting,
}: {
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        title="Edit job post"
        className="flex size-8 items-center justify-center rounded-lg border border-hl-primary/30 bg-hl-primary/15 text-xs font-medium text-hl-primary transition-colors hover:bg-hl-primary/25 2xl:w-auto 2xl:px-3"
      >
        <Pencil className="size-3.5" />
        <span className="hidden 2xl:ml-1 2xl:inline">Update</span>
      </button>
      <button
        type="button"
        title="Delete job post"
        disabled={deleting}
        onClick={onDelete}
        className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
      <JobMenu onDelete={onDelete} deleting={deleting} />
    </div>
  )
}

const headerCellClass =
  "px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5"
const dataCellClass = "px-4 py-5 align-middle xl:px-5"

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState<JobRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("All")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getJobs()
      .then((data) => setJobs(Array.isArray(data) ? data : (data?.jobs ?? [])))
      .catch((err) => {
        console.error("Failed to load jobs:", err)
        setError(
          `Could not load job posts: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
        setJobs([])
      })
  }, [])

  /** Status chips derived from the data, with counts. */
  const filterOptions = useMemo(() => {
    if (!jobs) return []
    const counts = new Map<string, number>()
    for (const job of jobs) {
      const status = getStatus(job)
      counts.set(status, (counts.get(status) ?? 0) + 1)
    }
    return [
      { label: "All", count: jobs.length },
      ...[...counts.entries()].map(([label, count]) => ({ label, count })),
    ]
  }, [jobs])

  const visibleJobs = useMemo(() => {
    if (!jobs) return null
    if (filter === "All") return jobs
    return jobs.filter((job) => getStatus(job) === filter)
  }, [jobs, filter])

  async function handleDelete(job: JobRecord, index: number) {
    const key = recordKey(job, index)
    if (!job.id && !job._id) {
      setError("This job post has no id yet, so it can't be deleted.")
      return
    }
    if (
      !window.confirm(
        `Delete "${job.title || "this job post"}"? This cannot be undone.`
      )
    ) {
      return
    }
    setDeletingId(key)
    setError(null)
    try {
      await deleteJob(job.id ?? (job._id as string))
      setJobs((prev) =>
        prev ? prev.filter((j, i) => recordKey(j, i) !== key) : prev
      )
    } catch (err) {
      console.error("Failed to delete job:", err)
      setError(`Failed to delete "${job.title}". Please try again.`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-350">
      {/* Breadcrumb + header (per Figma) */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/dashboard/recruiter/jobs"
          className="font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
        >
          Manage Jobs
        </Link>
        <ChevronRight aria-hidden className="size-3.5 text-white/25" />
        <span className="font-medium text-hl-primary">
          Job Listings &amp; Postings
        </span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Manage Job Posts
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Review live listings, monitor applicants, and update job details
            across your organization.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          <Plus className="size-4" />
          New Job Post
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Status filter chips */}
      {filterOptions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setFilter(option.label)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-colors",
                filter === option.label
                  ? "border-transparent bg-hl-primary text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  filter === option.label
                    ? "bg-white/20"
                    : "bg-white/5 text-white/40"
                )}
              >
                {option.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Job posts */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-[#141417]">
        {jobs === null ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            Loading job posts...
          </p>
        ) : jobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-white/50">No job posts yet.</p>
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="mt-3 inline-flex h-10 items-center rounded-xl border border-hl-primary/30 bg-hl-primary/15 px-4 text-sm font-medium text-hl-primary transition-opacity hover:opacity-90"
            >
              Create your first listing
            </Link>
          </div>
        ) : visibleJobs && visibleJobs.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            No {filter.toLowerCase()} job posts.
          </p>
        ) : (
          visibleJobs && (
            <>
              {/* Desktop: table — sizes to its content (w-max) so cells never
                  overlap; the wrapper scrolls only if the window is narrow */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-max min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className={headerCellClass}>Job Title &amp; Dept</th>
                      <th className={headerCellClass}>
                        Company &amp; Location
                      </th>
                      <th className={headerCellClass}>Type</th>
                      <th className={headerCellClass}>Compensation</th>
                      <th className={headerCellClass}>Applicants</th>
                      <th className={headerCellClass}>Status</th>
                      <th className={headerCellClass}>Deadline</th>
                      <th className={cn(headerCellClass, "text-right")}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleJobs.map((job, index) => {
                      const key = recordKey(job, index)
                      return (
                        <tr
                          key={key}
                          className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className={dataCellClass}>
                            <TitleCell job={job} />
                          </td>
                          <td className={dataCellClass}>
                            <CompanyCell job={job} />
                          </td>
                          <td className={dataCellClass}>
                            <TypePill type={job.jobType} />
                          </td>
                          <td
                            className={cn(
                              dataCellClass,
                              "font-medium text-white/80"
                            )}
                          >
                            <span className="tabular-nums">
                              {formatCompensation(job)}
                            </span>
                          </td>
                          <td className={dataCellClass}>
                            <ApplicantsCell job={job} />
                          </td>
                          <td className={dataCellClass}>
                            <StatusPill status={getStatus(job)} />
                          </td>
                          <td className={dataCellClass}>
                            <DeadlineCell job={job} />
                          </td>
                          <td className={dataCellClass}>
                            <JobActions
                              onDelete={() => handleDelete(job, index)}
                              deleting={deletingId === key}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet: stacked cards */}
              <ul className="flex flex-col divide-y divide-white/5 xl:hidden">
                {visibleJobs.map((job, index) => {
                  const key = recordKey(job, index)
                  return (
                    <li key={key} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <TitleCell job={job} />
                        <StatusPill status={getStatus(job)} />
                      </div>

                      <div className="mt-3">
                        <CompanyCell job={job} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <TypePill type={job.jobType} />
                        <span className="font-medium text-white/80">
                          {formatCompensation(job)}
                        </span>
                        <ApplicantsCell job={job} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-white/5 pt-3">
                        <DeadlineCell job={job} />
                        <JobActions
                          onDelete={() => handleDelete(job, index)}
                          deleting={deletingId === key}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default ManageJobsPage
