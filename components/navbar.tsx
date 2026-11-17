"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { UserMenu } from "@/components/user-menu"
import { useSession, signOut } from "@/lib/auth-client"

const NAV_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Company" },
  { href: "/pricing", label: "Pricing" },
] as const

export function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const user = session?.user
  const role = user?.role ?? "seeker"
  const dashboardPath =
    role === "recruiter"
      ? "/dashboard/recruiter"
      : role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/seeker"

  async function handleMobileSignOut() {
    close()
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          },
        },
      })
    } catch (err) {
      console.error("Sign-out failed:", err)
    }
  }

  return (
    <header className="relative z-20 mx-auto w-full max-w-330 px-4 pt-6 sm:px-6">
      <div className="relative flex h-18.5 items-center justify-between rounded-2xl bg-hl-surface px-6">
        <Link href="/" className="flex shrink-0 items-center" onClick={close}>
          <Image
            src="/images/logo.png"
            alt="HireLoop"
            width={154}
            height={44}
            priority
            className="h-11 w-auto"
          />
        </Link>

        {/* Desktop pill */}
        <div className="hidden h-full items-center rounded-2xl pr-2 pl-8 backdrop-blur-md lg:flex">
          <nav className="flex items-center gap-10" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-white transition-colors hover:text-white/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span aria-hidden className="mx-6 h-6 w-px bg-hl-divider" />
          <div className="flex items-center gap-4">
            {isPending ? (
              <div className="h-13 w-36 animate-pulse rounded-xl bg-white/5" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex h-14.5 items-center rounded-xl border border-hl-outline bg-white px-6 [font-family:var(--font-manrope)] text-lg font-semibold text-hl-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] transition-opacity hover:opacity-90"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex h-13 items-center rounded-xl border border-hl-outline bg-hl-primary px-6 [font-family:var(--font-instrument)] text-lg font-medium text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] transition-opacity hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-11 items-center justify-center rounded-xl text-white lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div
          id="mobile-nav"
          className="mt-2 rounded-2xl bg-hl-surface p-6 backdrop-blur-md lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="py-3 text-base text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span aria-hidden className="my-4 block h-px w-full bg-hl-divider" />
          <div className="flex flex-col gap-4">
            {isPending ? (
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
            ) : user ? (
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#161618] p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar src={user.image} name={user.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate [font-family:var(--font-manrope)] text-base font-bold text-white">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-white/60">
                      {user.email}
                    </p>
                    <span className="mt-1 inline-block rounded border border-hl-primary/30 bg-hl-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-hl-primary uppercase">
                      {role}
                    </span>
                  </div>
                </div>

                <div className="my-1 h-px bg-white/10" />

                <Link
                  href={dashboardPath}
                  onClick={close}
                  className="flex h-11 items-center justify-center rounded-xl bg-hl-primary text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleMobileSignOut}
                  className="flex h-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={close}
                  className="flex h-13 items-center justify-center rounded-xl border border-hl-outline bg-white px-6 [font-family:var(--font-manrope)] text-lg font-semibold text-hl-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={close}
                  className="flex h-13 items-center justify-center rounded-xl border border-hl-outline bg-hl-primary px-6 [font-family:var(--font-instrument)] text-lg font-medium text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
