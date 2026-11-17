import Link from "next/link"
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Download,
  UserRound,
  Users,
  Wallet,
} from "lucide-react"
import { StatCard } from "../../elements/StatCard"
import { UserAvatar } from "@/components/user-avatar"

const STATS = [
  {
    label: "Total Users",
    value: "124,892",
    icon: UserRound,
    delta: { value: "12%", positive: true },
  },
  {
    label: "Total Recruiters",
    value: "12,405",
    icon: Users,
    delta: { value: "8%", positive: true },
  },
  {
    label: "Total Companies",
    value: "4,281",
    icon: Building2,
    delta: { value: "0%", neutral: true },
  },
  {
    label: "Jobs Posted",
    value: "8,920",
    icon: Briefcase,
    delta: { value: "24%", positive: true },
  },
  {
    label: "Platform Revenue",
    value: "$245,800",
    icon: Wallet,
    delta: { value: "19.5%", positive: true },
    trailingIcon: Banknote,
  },
] as const

const TRANSACTIONS = [
  {
    email: "marcus.k@techcorp.io",
    company: "TechCorp Inc.",
    plan: "Enterprise Monthly",
    txn: "#TXN-902341",
    amount: "$1,299.00",
    date: "Oct 24, 2023, 14:20",
    status: "Success",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-400",
  },
  {
    email: "sarah.h@creativestudio.com",
    company: "Creative Studio",
    plan: "Professional Annual",
    txn: "#TXN-382103",
    amount: "$499.00",
    date: "Oct 24, 2023, 11:05",
    status: "Success",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-400",
  },
  {
    email: "j.doe@freelance.org",
    company: "Independent",
    plan: "Starter Monthly",
    txn: "#TXN-774129",
    amount: "$49.00",
    date: "Oct 23, 2023, 16:45",
    status: "Pending",
    dotClass: "bg-amber-400",
    textClass: "text-amber-400",
  },
  {
    email: "admin@retailglobal.net",
    company: "Retail Global",
    plan: "Enterprise Monthly",
    txn: "#TXN-552014",
    amount: "$1,299.00",
    date: "Oct 23, 2023, 09:12",
    status: "Failed",
    dotClass: "bg-red-400",
    textClass: "text-red-400",
  },
] as const

const AdminDashboardPage = () => {
  return (
    <div className="mx-auto max-w-350">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Real-time platform performance and growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            <Calendar className="size-4" />
            Last 30 Days
          </button>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Download className="size-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Subscription Transactions */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-[#141417]">
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Recent Subscription Transactions
          </h3>
          <Link
            href="/dashboard/admin/payments"
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full min-w-4xl text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] tracking-wider text-white/40 uppercase">
                <th className="py-4 pr-6 font-medium">User/Recruiter</th>
                <th className="py-4 pr-6 font-medium">Plan Type</th>
                <th className="py-4 pr-6 font-medium">Transaction ID</th>
                <th className="py-4 pr-6 font-medium">Amount</th>
                <th className="py-4 pr-6 font-medium">Date</th>
                <th className="py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((txn) => (
                <tr
                  key={txn.txn}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={txn.company} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {txn.email}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {txn.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-6">
                    <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                      {txn.plan}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-white/70">{txn.txn}</td>
                  <td className="py-4 pr-6 font-medium text-white">
                    {txn.amount}
                  </td>
                  <td className="py-4 pr-6 text-white/70">{txn.date}</td>
                  <td className="py-4">
                    <span
                      className={`flex items-center gap-2 text-xs font-medium ${txn.textClass}`}
                    >
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-full ${txn.dotClass}`}
                      />
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
