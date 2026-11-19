"use client"

import Link from "next/link"
import { Briefcase } from "lucide-react"
import { useSession } from "@/lib/auth-client"

export function PostAJobButton() {
  const { data: session, isPending } = useSession()
  const role = session?.user?.role

  // While session is loading, render nothing to avoid flicker.
  if (isPending) return null

  // Not signed in: show the button but send them to sign-in first.
  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        <Briefcase className="size-4" />
        Post a Job
      </Link>
    )
  }

  // Signed in but not a recruiter: hide the button.
  if (role !== "recruiter") return null

  return (
    <Link
      href="/dashboard/recruiter/jobs/new"
      className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <Briefcase className="size-4" />
      Post a Job
    </Link>
  )
}
