"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Download,
  Mail,
  Search,
  Users,
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type ApplicantStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Rejected"
  | "Offered"

const STATUS_OPTIONS: ApplicantStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Offered",
]

const STATUS_STYLES: Record<ApplicantStatus, string> = {
  Applied: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  "Under Review": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Shortlisted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  Offered: "border-violet-500/30 bg-violet-500/10 text-violet-400",
}

interface Applicant {
  id: string
  name: string
  email: string
  appliedAt: string
  resumeUrl: string
  status: ApplicantStatus
}

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    appliedAt: "2026-11-12T09:24:00Z",
    resumeUrl: "https://example.com/resumes/sarah-johnson.pdf",
    status: "Applied",
  },
  {
    id: "a2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    appliedAt: "2026-11-13T14:10:00Z",
    resumeUrl: "https://example.com/resumes/michael-chen.pdf",
    status: "Under Review",
  },
  {
    id: "a3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    appliedAt: "2026-11-14T11:05:00Z",
    resumeUrl: "https://example.com/resumes/emily-davis.pdf",
    status: "Shortlisted",
  },
  {
    id: "a4",
    name: "James Wilson",
    email: "james.wilson@example.com",
    appliedAt: "2026-11-15T08:30:00Z",
    resumeUrl: "https://example.com/resumes/james-wilson.pdf",
    status: "Rejected",
  },
  {
    id: "a5",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    appliedAt: "2026-11-16T16:45:00Z",
    resumeUrl: "https://example.com/resumes/priya-patel.pdf",
    status: "Offered",
  },
  {
    id: "a6",
    name: "Daniel Kim",
    email: "daniel.kim@example.com",
    appliedAt: "2026-11-17T10:12:00Z",
    resumeUrl: "https://example.com/resumes/daniel-kim.pdf",
    status: "Applied",
  },
]

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
  const router = useRouter()

  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | ApplicantStatus>(
    "All"
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [jobId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applicants.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      )
    })
  }, [applicants, search, statusFilter])

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: applicants.length }
    for (const s of STATUS_OPTIONS) map[s] = 0
    for (const a of applicants) map[a.status] = (map[a.status] ?? 0) + 1
    return map
  }, [applicants])

  async function handleStatusChange(applicant: Applicant, next: ApplicantStatus) {
    if (next === applicant.status) return
    setUpdatingId(applicant.id)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicant.id ? { ...a, status: next } : a
      )
    )
    setUpdatingId(null)
    toast.add({
      title: "Status updated",
      description: `Status changed to "${next}" for ${applicant.name}. An email notification was sent to ${applicant.email}.`,
      type: "success",
    })
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
        <span className="text-white/50">Job #{jobId || "—"}</span>
        <span aria-hidden className="text-white/25">
          /
        </span>
        <span className="font-medium text-white">View Applicants</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            View Applicants
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Review and manage candidates who applied for this job post. Changing
            a status notifies the applicant by email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["All", ...STATUS_OPTIONS].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(label as "All" | ApplicantStatus)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition-colors",
              statusFilter === label
                ? "border-hl-primary/40 bg-hl-primary/10"
                : "border-white/5 bg-[#141417] hover:border-white/15"
            )}
          >
            <p className="text-xs text-white/40">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">
              {counts[label] ?? 0}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-xl border border-white/10 bg-[#161618] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Users className="size-4" />
          {filtered.length} of {applicants.length} applicants
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-[#141417]">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            Loading applicants...
          </p>
        ) : applicants.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-white/50">No applicants yet.</p>
            <p className="mt-1 text-xs text-white/30">
              Applications will appear here once seekers apply.
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
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5">
                    Applicant Name
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5">
                    Email
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5">
                    Date Applied
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5">
                    Resume
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider text-white/40 uppercase whitespace-nowrap xl:px-5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((applicant) => {
                  const isUpdating = updatingId === applicant.id
                  return (
                    <tr
                      key={applicant.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <p className="font-semibold text-white">
                            {applicant.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <a
                          href={`mailto:${applicant.email}`}
                          className="flex items-center gap-1.5 text-white/70 transition-colors hover:text-hl-primary"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{applicant.email}</span>
                        </a>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <p className="font-medium text-white/80">
                          {formatDate(applicant.appliedAt)}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {formatTime(applicant.appliedAt)}
                        </p>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hl-primary/30 bg-hl-primary/15 px-3 py-1.5 text-xs font-medium text-hl-primary transition-colors hover:bg-hl-primary/25"
                        >
                          <Download className="size-3.5" />
                          View Resume
                        </a>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <div className="relative inline-block">
                          <select
                            value={applicant.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(
                                applicant,
                                e.target.value as ApplicantStatus
                              )
                            }
                            className={cn(
                              "h-9 appearance-none rounded-lg border pl-3 pr-8 text-xs font-medium outline-none transition-colors disabled:opacity-50",
                              STATUS_STYLES[applicant.status]
                            )}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-[#1c1c20] text-white"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/40"
                          />
                          {isUpdating && (
                            <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                              <span className="size-3.5 block animate-spin rounded-full border-2 border-white/20 border-t-hl-primary" />
                            </span>
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
        Tip: Changing an applicant's status sends an automated email notification.
      </p>
    </div>
  )
}
