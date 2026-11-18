"use client"

import Link from "next/link"
import { CircleCheckBig, FileText, Users, Zap } from "lucide-react"
import { StatCard } from "../../elements/StatCard"
import { DashboardFab } from "../../elements/DashboardFab"
import { UserAvatar } from "@/components/user-avatar"
import { useSession } from "@/lib/auth-client"

const STATS = [
  { label: "Total Job Posts", value: "48", icon: FileText },
  { label: "Total Applicants", value: "1,284", icon: Users },
  { label: "Active Jobs", value: "18", icon: Zap },
  { label: "Jobs Closed", value: "32", icon: CircleCheckBig },
] as const

const APPLICANTS = [
  {
    name: "Jullianne Moore",
    role: "Senior Product Designer",
    date: "Oct 24, 2023",
    experience: "6 years",
    status: "Interviewing",
    badgeClass: "border-hl-primary/30 bg-hl-primary/15 text-hl-primary",
  },
  {
    name: "Robert Downey Jr.",
    role: "Backend Engineer",
    date: "Oct 23, 2023",
    experience: "4 years",
    status: "New",
    badgeClass: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  },
  {
    name: "Emma Stone",
    role: "Marketing Lead",
    date: "Oct 22, 2023",
    experience: "8 years",
    status: "Reviewing",
    badgeClass: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  },
  {
    name: "Chris Pratt",
    role: "Product Manager",
    date: "Oct 21, 2023",
    experience: "5 years",
    status: "Rejected",
    badgeClass: "border-red-500/30 bg-red-500/15 text-red-400",
  },
] as const

const RecruiterDashboardPage = () => {
  const { data: session } = useSession()
  const name = session?.user?.name ?? "Alex Sterling"

  return (
    <div className="mx-auto max-w-350">
      <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
        Welcome back, {name}
      </h2>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Applications */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Recent Applications
          </h3>
          <Link
            href="/dashboard/recruiter/applications"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-[#141417]">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] tracking-wider text-white/40 uppercase">
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Date Applied</th>
                <th className="px-6 py-4 font-medium">Experience</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {APPLICANTS.map((applicant) => (
                <tr
                  key={applicant.name}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={applicant.name} size="sm" />
                      <span className="font-medium text-white">
                        {applicant.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{applicant.role}</td>
                  <td className="px-6 py-4 text-white/70">{applicant.date}</td>
                  <td className="px-6 py-4 text-white/70">
                    {applicant.experience}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${applicant.badgeClass}`}
                    >
                      {applicant.status}
                    </span>
                  </td>
                </tr>
              ))}
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
