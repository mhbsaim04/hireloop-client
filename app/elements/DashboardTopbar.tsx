"use client"

import { Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import { useSession } from "@/lib/auth-client"
import { RecruiterInboxActions } from "./RecruiterInboxActions"

export function DashboardTopbar() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="flex h-18 items-center gap-4 border-b border-white/5 px-4 sm:px-6">
      {/* Mobile sidebar trigger */}
      <SidebarTrigger className="lg:hidden" />

      {/* Search */}
      <div className="flex h-10 max-w-90 flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-[#161618] px-4 text-white/50">
        <Search className="size-4 shrink-0" />
        <input
          type="search"
          placeholder="Search for opportunities..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-5">
        {user?.role === "recruiter" && (
          <RecruiterInboxActions key={user.id} userId={user.id} />
        )}
        <UserAvatar src={user?.image} name={user?.name} size="sm" />
      </div>
    </header>
  )
}
