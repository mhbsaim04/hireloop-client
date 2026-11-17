"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  IdCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const ROLE_CONFIG = {
  seeker: {
    title: "Job Seeker",
    icon: Briefcase,
    dashboardUrl: "/dashboard/seeker",
    badgeClass: "border-blue-500/30 bg-blue-500/15 text-blue-300",
    features: [
      {
        title: "Curated Job Search",
        desc: "Browse verified opportunities and apply directly with 1-click.",
      },
      {
        title: "Application Tracking",
        desc: "Track interview invitations, shortlist statuses, and offers.",
      },
      {
        title: "Direct Messaging",
        desc: "Connect directly with verified recruiters and hiring teams.",
      },
    ],
  },
  recruiter: {
    title: "Recruiter / Employer",
    icon: Building2,
    dashboardUrl: "/dashboard/recruiter",
    badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    features: [
      {
        title: "Job Post Management",
        desc: "Publish, pause, or edit job vacancies for your company.",
      },
      {
        title: "Candidate Pipeline",
        desc: "Filter, review resumes, and manage applicant stages.",
      },
      {
        title: "Company Showcase",
        desc: "Manage company culture, tech stack, and employer branding.",
      },
    ],
  },
  admin: {
    title: "Platform Administrator",
    icon: ShieldCheck,
    dashboardUrl: "/dashboard/admin",
    badgeClass: "border-purple-500/30 bg-purple-500/15 text-purple-300",
    features: [
      {
        title: "Ecosystem Control",
        desc: "Manage all registered job seekers, recruiters, and companies.",
      },
      {
        title: "Listing Moderation",
        desc: "Review and approve new employer registrations and job posts.",
      },
      {
        title: "Platform Metrics",
        desc: "Real-time user growth, application activity, and system health.",
      },
    ],
  },
} as const

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [signingOut, setSigningOut] = useState(false)

  if (isPending) {
    return (
      <main className="relative z-10 mx-auto min-h-[calc(100vh-120px)] max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#161618]" />
      </main>
    )
  }

  const user = session?.user

  if (!user) {
    return (
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#161618] text-white/50">
          <User className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white [font-family:var(--font-manrope)]">
          You are not signed in
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sign in to access your HireLoop profile, application dashboard, and settings.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-hl-primary px-8 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Sign In
        </Link>
      </main>
    )
  }

  const roleKey = (user.role ?? "seeker") as keyof typeof ROLE_CONFIG
  const currentRole = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.seeker
  const RoleIcon = currentRole.icon

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member"

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          },
        },
      })
    } catch (err) {
      console.error("Sign-out failed:", err)
      setSigningOut(false)
    }
  }

  return (
    <main className="relative z-10 mx-auto min-h-[calc(100vh-120px)] max-w-4xl px-4 py-10 sm:px-6">
      {/* Profile Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#161618] p-6 shadow-2xl sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-hl-primary/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <UserAvatar
              src={user.image}
              name={user.name}
              size="xl"
              className="ring-4 ring-hl-primary/20"
            />
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white [font-family:var(--font-manrope)] sm:text-3xl">
                  {user.name || "HireLoop Member"}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                    currentRole.badgeClass,
                  )}
                >
                  <RoleIcon className="size-3" />
                  {currentRole.title}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/60">
                <Mail className="size-4 shrink-0 text-white/40" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-hl-primary" />
                  Member since {joinDate}
                </span>
                <span aria-hidden className="size-1 rounded-full bg-white/20" />
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Verified Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
            <Link
              href={currentRole.dashboardUrl}
              className="flex h-11 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(92,83,254,0.3)] transition-opacity hover:opacity-90"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex h-11 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <LogOut className="size-4" />
              <span>{signingOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Profile Details Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Account Information */}
        <section className="rounded-2xl border border-white/10 bg-[#161618] p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white [font-family:var(--font-manrope)]">
            <IdCard className="size-4 text-hl-primary" />
            <span>Account Details</span>
          </div>
          <div className="mt-5 flex flex-col gap-4 text-xs">
            <div>
              <span className="text-white/40">Full Name</span>
              <p className="mt-1 text-sm font-medium text-white">
                {user.name || "Not provided"}
              </p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <span className="text-white/40">Email Address</span>
              <p className="mt-1 text-sm font-medium text-white">{user.email}</p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <span className="text-white/40">Assigned Role</span>
              <p className="mt-1 text-sm font-medium capitalize text-hl-primary">
                {user.role ?? "seeker"}
              </p>
            </div>
            <div className="h-px bg-white/5" />
            <div>
              <span className="text-white/40">User ID</span>
              <p className="mt-1 truncate font-mono text-[11px] text-white/50">
                {user.id || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Role Privileges & Capabilities */}
        <section className="rounded-2xl border border-white/10 bg-[#161618] p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white [font-family:var(--font-manrope)]">
              <Shield className="size-4 text-hl-primary" />
              <span>Role Privileges ({currentRole.title})</span>
            </div>
            <span className="text-[11px] font-semibold text-hl-primary uppercase tracking-wider">
              Active Tier
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {currentRole.features.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-xl border border-white/5 bg-[#101012] p-4 transition-colors hover:border-white/15"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-hl-primary/15 text-hl-primary">
                  <Sparkles className="size-3.5" />
                </div>
                <h3 className="mt-3 text-xs font-semibold text-white [font-family:var(--font-manrope)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
            <span className="text-white/70">
              Need to access candidate applications or post a new job?
            </span>
            <Link
              href={currentRole.dashboardUrl}
              className="inline-flex items-center gap-1.5 font-semibold text-hl-primary hover:underline"
            >
              Open {currentRole.title} Dashboard
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
