import Link from "next/link"
import {
  Award,
  Bookmark,
  Calendar,
  Mail,
  Megaphone,
  RefreshCw,
  Send,
} from "lucide-react"
import { StatCard } from "../../elements/StatCard"
import { DashboardFab } from "../../elements/DashboardFab"

const STATS = [
  { label: "Saved Jobs", value: "12", icon: Bookmark },
  { label: "Applications Submitted", value: "24", icon: Send },
  { label: "Interviews Scheduled", value: "3", icon: Calendar },
  { label: "Offers Received", value: "1", icon: Award },
] as const

const ACTIVITY = [
  {
    icon: RefreshCw,
    iconClass: "text-amber-400",
    text: (
      <>
        Application for Senior Product Designer at TechFlow{" "}
        <span className="text-amber-400">
          updated to &apos;Under Review&apos;
        </span>
      </>
    ),
    time: "2 hours ago",
  },
  {
    icon: Megaphone,
    iconClass: "text-emerald-400",
    text: (
      <>
        New Job Alert: Lead Frontend Engineer at FinGrid matches your profile.
      </>
    ),
    time: "5 hours ago",
  },
  {
    icon: Mail,
    iconClass: "text-white/80",
    text: (
      <>
        You have a new message from Sarah Jenkins (Hiring Manager at CloudOps).
      </>
    ),
    time: "1 day ago",
  },
  {
    icon: RefreshCw,
    iconClass: "text-amber-400",
    text: (
      <>
        Application for Senior Product Designer at TechFlow{" "}
        <span className="text-amber-400">
          updated to &apos;Under Review&apos;
        </span>
      </>
    ),
    time: "2 hours ago",
  },
  {
    icon: Megaphone,
    iconClass: "text-emerald-400",
    text: (
      <>
        New Job Alert: Lead Frontend Engineer at FinGrid matches your profile.
      </>
    ),
    time: "5 hours ago",
  },
  {
    icon: Mail,
    iconClass: "text-white/80",
    text: (
      <>
        You have a new message from Sarah Jenkins (Hiring Manager at CloudOps).
      </>
    ),
    time: "1 day ago",
  },
] as const

const SeekerDashboardPage = () => {
  return (
    <div className="mx-auto max-w-350">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} variant="split" {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/seeker/applications"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {ACTIVITY.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#141417] px-4 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1f1f23]">
                <item.icon className={`size-4.5 ${item.iconClass}`} />
              </span>
              <p className="flex-1 text-sm text-white/80">{item.text}</p>
              <span className="shrink-0 text-xs whitespace-nowrap text-white/40">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <DashboardFab href="/dashboard/seeker/jobs" label="Browse jobs" />
    </div>
  )
}

export default SeekerDashboardPage
