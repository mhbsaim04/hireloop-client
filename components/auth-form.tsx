"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { toDirectImageUrl } from "@/lib/image-url"

type Mode = "sign-in" | "sign-up"

/** Values collected from the form, passed to the page's submit handler. */
export type AuthValues = {
  name?: string
  email: string
  password: string
  imageUrl?: string
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
    <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-6 py-20">
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#161618] p-8">
        <h1 className="text-center text-2xl font-bold text-white [font-family:var(--font-manrope)]">
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
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-hl-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 [font-family:var(--font-manrope)]"
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
      <span className="text-sm text-white/80 [font-family:var(--font-manrope)]">
        Profile image{" "}
        <span className="text-white/40">
          (optional — image or Google Drive link)
        </span>
      </span>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#101012]",
            showImage && "border-hl-primary/40",
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
            "h-12 w-full rounded-xl border border-white/10 bg-[#101012] px-4 text-base text-white outline-none transition-colors placeholder:text-white/40",
            url && failed
              ? "border-red-500/50 focus:border-red-500/50"
              : "focus:border-hl-primary/60",
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
      <span className="text-sm text-white/80 [font-family:var(--font-manrope)]">
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
            "h-12 w-full rounded-xl border border-white/10 bg-[#101012] text-base text-white outline-none transition-colors placeholder:text-white/40 focus:border-hl-primary/60",
            trailing ? "pr-12 pl-4" : "px-4",
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
