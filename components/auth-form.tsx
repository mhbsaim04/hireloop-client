"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Briefcase,
  Building2,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toDirectImageUrl } from "@/lib/image-url"

type Mode = "sign-in" | "sign-up"

/** Account roles, matching the server's `user.additionalFields.role` field. */
export type Role = "seeker" | "recruiter" | "admin"

type RoleOption = {
  value: Role
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  badge: string
  description: string
  perks: string[]
}

const ROLES: RoleOption[] = [
  {
    value: "seeker",
    title: "Seeker",
    subtitle: "Find jobs",
    icon: Briefcase,
    badge: "Job Seeker",
    description:
      "Discover curated jobs, submit applications with 1-click, and track your hiring pipeline.",
    perks: ["Smart job alerts", "Application tracking", "Salary insights"],
  },
  {
    value: "recruiter",
    title: "Recruiter",
    subtitle: "Hire talent",
    icon: Building2,
    badge: "Employer / Recruiter",
    description:
      "Post job openings, source verified talent, and manage candidates seamlessly.",
    perks: ["Company profile", "Candidate pipeline", "Analytics dashboard"],
  },
  {
    value: "admin",
    title: "Admin",
    subtitle: "Platform lead",
    icon: ShieldCheck,
    badge: "Platform Admin",
    description:
      "Oversee ecosystem operations, verify company registrations, and moderate listings.",
    perks: ["User moderation", "Company approvals", "System analytics"],
  },
]

/** Values collected from the form, passed to the page's submit handler. */
export type AuthValues = {
  name?: string
  email: string
  password: string
  imageUrl?: string
  role?: Role
}

/** Return `{ error: "..." }` to surface a message, or nothing on success. */
export type SubmitResult = { error?: string } | void

/**
 * Shared auth form. The pages pass an `onSubmit` handler that calls better-auth
 * (authClient.signIn.email / authClient.signUp.email); this component collects
 * the FormData, validates, and renders loading/error/success states.
 */
export function AuthForm({
  mode,
  onSubmit,
}: {
  mode: Mode
  onSubmit?: (values: AuthValues) => Promise<SubmitResult>
}) {
  const isSignIn = mode === "sign-in"
  const [role, setRole] = useState<Role>("seeker")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<
      string,
      string
    >
    if (!isSignIn && values.password !== values.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!onSubmit) {
      // No handler wired up yet — just log the collected data.
      console.log(isSignIn ? "sign-in submit:" : "sign-up submit:", values)
      setSuccess(true)
      return
    }
    setLoading(true)
    try {
      const result = await onSubmit({
        name: values.name,
        email: values.email,
        password: values.password,
        imageUrl: values.imageUrl,
        role: isSignIn ? undefined : role,
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-6 py-12 sm:py-16">
      <Link
        href="/"
        aria-label="HireLoop home"
        className="mb-6 self-center transition-opacity hover:opacity-80"
      >
        <Image
          src="/images/logo.png"
          alt="HireLoop"
          width={154}
          height={44}
          priority
          className="h-11 w-auto"
        />
      </Link>

      <div className="rounded-2xl border border-white/10 bg-[#161618] p-8">
        <h1 className="text-center [font-family:var(--font-manrope)] text-2xl font-bold text-white">
          {isSignIn ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">
          {isSignIn
            ? "Sign in to continue your job hunt"
            : "Start finding your dream job today"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {!isSignIn && (
            <Field
              label="Full name"
              name="name"
              type="text"
              placeholder="Your Full Name"
              autoComplete="name"
            />
          )}
          {!isSignIn && <RoleSelector value={role} onChange={setRole} />}
          {!isSignIn && <ImageUrlField />}
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="e.g., you@example.com"
            autoComplete="email"
            required
          />
          <PasswordField
            label="Password"
            name="password"
            placeholder="••••••••"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            required
          />
          {!isSignIn && (
            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-hl-primary [font-family:var(--font-manrope)] text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isSignIn
                ? "Signing in…"
                : "Creating account…"
              : isSignIn
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {isSignIn ? "Signed in successfully!" : "Account created!"}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-white/60">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  )
}

function ImageUrlField() {
  const [url, setUrl] = useState("")
  // Track which URL failed so the error clears itself when the input changes.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const direct = toDirectImageUrl(url)
  const failed = failedUrl !== null && failedUrl === direct
  const showImage = direct !== "" && !failed

  return (
    <label className="flex flex-col gap-2">
      <span className="[font-family:var(--font-manrope)] text-sm text-white/80">
        Profile image{" "}
        <span className="text-white/40">
          (optional — image or Google Drive link)
        </span>
      </span>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#101012]",
            showImage && "border-hl-primary/40"
          )}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-pasted URLs can come from any host; plain img avoids remotePatterns config
            <img
              src={direct}
              alt="Profile preview"
              referrerPolicy="no-referrer"
              onError={() => setFailedUrl(direct)}
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-5 text-white/40" />
          )}
        </span>
        <input
          type="url"
          name="imageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://drive.google.com/file/d/…/view"
          className={cn(
            "h-12 w-full rounded-xl border border-white/10 bg-[#101012] px-4 text-base text-white transition-colors outline-none placeholder:text-white/40",
            url && failed
              ? "border-red-500/50 focus:border-red-500/50"
              : "focus:border-hl-primary/60"
          )}
        />
      </div>
      {url && failed && (
        <span className="text-xs text-red-300">
          Couldn&apos;t load that image — make sure the link is shared publicly.
        </span>
      )}
    </label>
  )
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  required,
  trailing,
}: {
  label: string
  name: string
  type: string
  placeholder: string
  autoComplete: string
  required?: boolean
  trailing?: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="[font-family:var(--font-manrope)] text-sm text-white/80">
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "h-12 w-full rounded-xl border border-white/10 bg-[#101012] text-base text-white transition-colors outline-none placeholder:text-white/40 focus:border-hl-primary/60",
            trailing ? "pr-12 pl-4" : "px-4"
          )}
        />
        {trailing && (
          <span className="absolute right-2 flex items-center">{trailing}</span>
        )}
      </span>
    </label>
  )
}

function PasswordField({
  label,
  name,
  placeholder,
  autoComplete,
  required,
}: {
  label: string
  name: string
  placeholder: string
  autoComplete: string
  required?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <Field
      label={label}
      name={name}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    />
  )
}

function RoleSelector({
  value,
  onChange,
}: {
  value: Role
  onChange: (role: Role) => void
}) {
  const selectedOption = ROLES.find((r) => r.value === value) ?? ROLES[0]

  function handleKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % ROLES.length
      onChange(ROLES[nextIndex].value)
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + ROLES.length) % ROLES.length
      onChange(ROLES[prevIndex].value)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="[font-family:var(--font-manrope)] text-sm font-medium text-white/80">
          I am a
        </label>
        <span className="[font-family:var(--font-space-mono)] text-[11px] font-semibold tracking-wider text-hl-primary uppercase">
          {selectedOption.badge}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Account role"
        className="grid grid-cols-3 gap-2.5"
      >
        {ROLES.map((option, index) => {
          const isSelected = value === option.value
          const Icon = option.icon
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 outline-none select-none",
                "focus-visible:ring-2 focus-visible:ring-hl-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#161618]",
                isSelected
                  ? "border-hl-primary bg-hl-primary/15 text-white shadow-[0_0_24px_rgba(92,83,254,0.28)] ring-1 ring-hl-primary/40"
                  : "border-white/10 bg-[#101012] text-white/60 hover:border-white/25 hover:bg-white/3 hover:text-white"
              )}
            >
              {/* Selected check badge */}
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-hl-primary text-white shadow-[0_0_10px_rgba(92,83,254,0.6)] ring-2 ring-[#161618]">
                  <Check className="size-2.5 stroke-3" />
                </span>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-all duration-200",
                  isSelected
                    ? "scale-105 bg-hl-primary text-white shadow-[0_0_12px_rgba(92,83,254,0.5)]"
                    : "bg-white/5 text-white/50 group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white"
                )}
              >
                <Icon className="size-4.5" />
              </div>

              {/* Title & subtitle */}
              <span
                className={cn(
                  "mt-2 [font-family:var(--font-manrope)] text-xs font-semibold transition-colors",
                  isSelected
                    ? "text-white"
                    : "text-white/80 group-hover:text-white"
                )}
              >
                {option.title}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] transition-colors",
                  isSelected
                    ? "font-medium text-hl-primary"
                    : "text-white/40 group-hover:text-white/60"
                )}
              >
                {option.subtitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Dynamic role helper panel */}
      <div
        key={selectedOption.value}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-linear-to-b from-[#101012] to-[#141418] p-3 transition-all duration-200"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-hl-primary/20 text-hl-primary">
            <Sparkles className="size-3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-relaxed text-white/75">
              {selectedOption.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedOption.perks.map((perk) => (
                <span
                  key={perk}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70"
                >
                  <span className="size-1 rounded-full bg-hl-primary" />
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
