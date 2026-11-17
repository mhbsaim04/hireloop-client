"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export type UserMenuProps = {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "seeker" | "recruiter" | "admin" | null
  }
}

const ROLE_META = {
  seeker: {
    label: "Seeker",
    dashboardPath: "/dashboard/seeker",
    badgeClass: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  },
  recruiter: {
    label: "Recruiter",
    dashboardPath: "/dashboard/recruiter",
    badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  },
  admin: {
    label: "Admin",
    dashboardPath: "/dashboard/admin",
    badgeClass: "border-purple-500/30 bg-purple-500/15 text-purple-300",
  },
} as const

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const role = (user.role ?? "seeker") as keyof typeof ROLE_META
  const roleInfo = ROLE_META[role] ?? ROLE_META.seeker

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setOpen(false)
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
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex h-13 items-center gap-3 rounded-xl border border-white/10 bg-[#161618] px-3.5 py-1.5 transition-all outline-none hover:border-white/25 hover:bg-[#1c1c20] focus-visible:ring-2 focus-visible:ring-hl-primary",
          open && "border-hl-primary/50 bg-[#1c1c20] shadow-[0_0_15px_rgba(92,83,254,0.15)]",
        )}
      >
        <UserAvatar src={user.image} name={user.name} size="sm" />
        <div className="flex flex-col text-left">
          <span className="max-w-[120px] truncate text-sm font-semibold text-white [font-family:var(--font-manrope)]">
            {user.name || "My Account"}
          </span>
          <span
            className={cn(
              "w-fit rounded border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wider",
              roleInfo.badgeClass,
            )}
          >
            {roleInfo.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-white/50 transition-transform duration-200",
            open && "rotate-180 text-white",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          role="menu"
          aria-label="User account menu"
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-white/10 bg-[#161618] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header Info */}
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/5">
            <UserAvatar src={user.image} name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white [font-family:var(--font-manrope)]">
                {user.name || "User"}
              </p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    roleInfo.badgeClass,
                  )}
                >
                  {roleInfo.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                  <Sparkles className="size-3 text-hl-primary" /> Verified
                </span>
              </div>
            </div>
          </div>

          <div className="my-2 h-px bg-white/10" />

          {/* Navigation Links */}
          <div className="flex flex-col gap-0.5">
            <Link
              href={roleInfo.dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="size-4 text-white/60" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <UserIcon className="size-4 text-white/60" />
              <span>My Profile</span>
            </Link>
          </div>

          <div className="my-2 h-px bg-white/10" />

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >
            <LogOut className="size-4" />
            <span>{signingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  )
}
