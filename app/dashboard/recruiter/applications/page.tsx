"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Briefcase, ChevronRight, Users } from "lucide-react"
import { getRecruiterJobs, type RecruiterJob } from "@/lib/api/recruiter"

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRecruiterJobs()
      .then(setJobs)
      .catch((err) => {
        console.error("Failed to load jobs:", err)
        setError(
          `Could not load jobs: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
        setJobs([])
      })
  }, [])

  return (
    <div className="mx-auto max-w-350">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/dashboard/recruiter"
          className="font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
        >
          Dashboard
        </Link>
        <ChevronRight aria-hidden className="size-3.5 text-white/25" />
        <span className="font-medium text-white">Applications</span>
      </nav>

      <div className="mt-3">
        <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
          Applications
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Select a job to view its applicants. Click a job to open its
          applicants page.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417]">
        {jobs === null ? (
          <p className="px-6 py-12 text-center text-sm text-white/40">
            Loading jobs...
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Job Title &amp; Dept
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Company
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-medium tracking-wider whitespace-nowrap text-white/40 uppercase xl:px-5">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => {
                  const id = job.id ?? job._id ?? String(index)
                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                            <Briefcase className="size-4 text-white/60" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-white">
                              {job.title || "Untitled job"}
                            </p>
                            <p className="text-xs text-white/40">
                              {job.category || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 align-middle xl:px-5">
                        <p className="font-medium text-white/80">
                          {job.company || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-right align-middle xl:px-5">
                        <Link
                          href={`/dashboard/recruiter/jobs/${id}/applicants`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                        >
                          <Users className="size-3.5" />
                          View Applicants
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
