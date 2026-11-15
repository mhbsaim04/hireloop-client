"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/companies", label: "Company" },
  { href: "/pricing", label: "Pricing" },
] as const

export function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="mx-auto w-full max-w-330 px-4 pt-6 sm:px-6">
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
        <div className="hidden h-full items-center rounded-2xl pl-8 pr-2 backdrop-blur-md lg:flex">
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
            <Link
              href="/sign-in"
              className="flex h-14.5 items-center rounded-xl border border-hl-outline bg-white px-6 text-lg font-semibold text-hl-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] [font-family:var(--font-manrope)] transition-opacity hover:opacity-90"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="flex h-13 items-center rounded-xl border border-hl-outline bg-hl-primary px-6 text-lg font-medium text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] [font-family:var(--font-instrument)] transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
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
            <Link
              href="/sign-in"
              onClick={close}
              className="flex h-13 items-center justify-center rounded-xl border border-hl-outline bg-white px-6 text-lg font-semibold text-hl-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] [font-family:var(--font-manrope)]"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={close}
              className="flex h-13 items-center justify-center rounded-xl border border-hl-outline bg-hl-primary px-6 text-lg font-medium text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] [font-family:var(--font-instrument)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
