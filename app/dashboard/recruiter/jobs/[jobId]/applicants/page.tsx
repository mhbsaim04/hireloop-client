"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Mail,
  Search,
  Users,
} from "lucide-react"
import {
  getRecruiterJobApplications,
  updateRecruiterApplicationStatus,
  type RecruiterApplication,
  type RecruiterApplicationStatus,
  type RecruiterJobApplications,
} from "@/lib/api/recruiter"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: RecruiterApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Offered",
]

const EMPTY_APPLICATIONS: RecruiterApplication[] = []

const STATUS_STYLES: Record<RecruiterApplicationStatus, string> = {
  Applied: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  "Under Review": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Shortlisted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  Offered: "border-violet-500/30 bg-violet-500/10 text-violet-400",
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function ViewApplicantsPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = params?.jobId ?? ""

  return <ApplicantsForJob key={jobId} jobId={jobId} />
}

function ApplicantsForJob({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [data, setData] = useState<RecruiterJobApplications | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "All" | RecruiterApplicationStatus
  >("All")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getRecruiterJobApplications(jobId)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load job applicants:", cause)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load applicants for this job."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [jobId])

  const applicants = data?.applications ?? EMPTY_APPLICATIONS

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applicants.filter((application) => {
      if (statusFilter !== "All" && application.status !== statusFilter) {
        return false
      }
      if (!query) return true
      return (
        application.applicantName.toLowerCase().includes(query) ||
        application.applicantEmail.toLowerCase().includes(query)
      )
    })
  }, [applicants, search, statusFilter])

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: applicants.length }
    for (const status of STATUS_OPTIONS) result[status] = 0
    for (const application of applicants) {
      result[application.status] = (result[application.status] ?? 0) + 1
    }
    return result
  }, [applicants])

  async function handleStatusChange(
    application: RecruiterApplication,
    status: RecruiterApplicationStatus
  ) {
    if (status === application.status) return
    setUpdatingId(application.id)
    setError(null)

    try {
      await updateRecruiterApplicationStatus(jobId, application.id, status)
      setData((current) =>
        current
          ? {
              ...current,
              applications: current.applications.map((item) =>
                item.id === application.id ? { ...item, status } : item
              ),
            }
          : current
      )
      toast.add({
        title: "Application updated",
        description: `${application.applicantName}'s status is now ${status}.`,
        type: "success",
      })
    } catch (cause) {
      console.error("Failed to update application status:", cause)
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update the application status."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-350">
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
        <span aria-hidden className="text-white/25">
          /
        </span>
        <span className="max-w-64 truncate text-white/50">
          {data?.job.title ?? "Job"}
        </span>
        <span aria-hidden className="text-white/25">
          /
        </span>
        <span className="font-medium text-white">Applicants</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            {data?.job.title ?? "Job Applicants"}
          </h2>
          {data?.job.company && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <Briefcase className="size-3.5" />
              {data.job.company}
            </p>
          )}
          <p className="mt-1 text-sm text-white/50">
            Review candidates who applied to this job.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/recruiter/jobs")}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Manage jobs
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["All", ...STATUS_OPTIONS].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              setStatusFilter(label as "All" | RecruiterApplicationStatus)
            }
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition-colors",
              statusFilter === label
                ? "border-hl-primary/40 bg-hl-primary/10"
                : "border-white/5 bg-[#141417] hover:border-white/15"
            )}
          >
            <p className="text-xs text-white/40">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">
              {loading ? "—" : (counts[label] ?? 0)}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-xl border border-white/10 bg-[#161618] pr-4 pl-10 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Users className="size-4" />
          {loading
            ? "Loading applicants…"
            : `${filtered.length} of ${applicants.length} applicants`}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-[#141417]">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            Loading applicants…
          </p>
        ) : !data ? (
          <p className="px-6 py-12 text-center text-sm text-white/45">
            This job is unavailable or you do not have access to it.
          </p>
        ) : applicants.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-white/50">No applicants yet.</p>
            <p className="mt-1 text-xs text-white/30">
              Applications for this job will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            No applicants match your search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Applicant
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Date Applied
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Cover Letter
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((application) => {
                  const isUpdating = updatingId === application.id
                  return (
                    <tr
                      key={application.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                            {application.applicantName
                              .split(" ")
                              .map((part) => part[0] ?? "")
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {application.applicantName || "Candidate"}
                            </p>
                            <a
                              href={`mailto:${application.applicantEmail}`}
                              className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-hl-primary"
                            >
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate">
                                {application.applicantEmail}
                              </span>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <p className="font-medium text-white/80">
                          {formatDate(application.appliedAt)}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {formatTime(application.appliedAt)}
                        </p>
                      </td>
                      <td className="max-w-sm px-4 py-5 align-middle xl:px-5">
                        <p
                          title={application.coverLetter}
                          className="line-clamp-3 text-xs leading-relaxed text-white/60"
                        >
                          {application.coverLetter || "No cover letter"}
                        </p>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <div className="relative inline-block">
                          <select
                            value={application.status}
                            disabled={isUpdating}
                            onChange={(event) =>
                              handleStatusChange(
                                application,
                                event.target.value as RecruiterApplicationStatus
                              )
                            }
                            className={cn(
                              "h-9 appearance-none rounded-lg border pr-8 pl-3 text-xs font-medium transition-colors outline-none disabled:opacity-50",
                              STATUS_STYLES[application.status]
                            )}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-[#1c1c20] text-white"
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/40"
                          />
                          {isUpdating && (
                            <span
                              aria-label="Updating status"
                              className="absolute top-1/2 -right-6 size-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-white/20 border-t-hl-primary"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-white/30">
        <Briefcase className="size-3.5" />
        Application status changes are saved to this job’s applicant list.
      </p>
    </div>
  )
}
