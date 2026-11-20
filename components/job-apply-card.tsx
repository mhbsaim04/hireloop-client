"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, LogIn, Send } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/toast"
import {
  ApplicationApiError,
  getApplicationUsage,
  submitJobApplication,
} from "@/lib/api/applications"
import { getMySavedJobs, removeSavedJob, saveJob } from "@/lib/api/saved-jobs"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function JobApplyCard({
  jobId,
  title,
}: {
  jobId: string
  title: string
}) {
  const [saved, setSaved] = useState(false)
  const [showApplyInfo, setShowApplyInfo] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applyErrorCode, setApplyErrorCode] = useState<string | null>(null)
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkingUsage, setCheckingUsage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applied, setApplied] = useState(false)
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const userId = session?.user.id
  const isSeeker = (session?.user.role ?? "seeker") === "seeker"
  const plan = session?.user.plan ?? "free"
  const signInUrl = `/sign-in?callbackURL=${encodeURIComponent(
    `/browse-jobs/${encodeURIComponent(jobId)}`
  )}`

  useEffect(() => {
    if (isPending || !userId || !isSeeker) return

    let active = true
    getMySavedJobs()
      .then((jobs) => {
        if (active) setSaved(jobs.some((job) => job.jobId === jobId))
      })
      .catch((error: unknown) => {
        if (!active) return
        console.error("Failed to check saved-job status:", error)
        toast.add({
          title: "Could not load saved-job status",
          description:
            error instanceof Error ? error.message : "Please try again later.",
          type: "error",
        })
      })

    return () => {
      active = false
    }
  }, [isPending, isSeeker, jobId, userId])

  async function handleStartApply() {
    setApplyError(null)
    setApplyErrorCode(null)
    setRequiresSignIn(false)
    setCheckingUsage(true)

    try {
      const usage = await getApplicationUsage()
      if (usage.limit !== null && usage.used >= usage.limit) {
        router.push("/pricing")
        return
      }
      setShowApplyInfo(true)
    } catch (error) {
      console.error("Could not check application usage:", error)
      setApplyError(
        error instanceof Error
          ? error.message
          : "Could not check your application usage."
      )
      setShowApplyInfo(true)
    } finally {
      setCheckingUsage(false)
    }
  }

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSeeker) return

    setApplyError(null)
    setApplyErrorCode(null)
    setRequiresSignIn(false)
    setSubmitting(true)

    try {
      const result = await submitJobApplication({
        jobId,
        coverLetter: coverLetter.trim() || undefined,
      })
      setApplied(true)
      setShowApplyInfo(false)
      toast.add({
        title: result.alreadyApplied
          ? "Already applied"
          : "Application submitted",
        description: result.alreadyApplied
          ? `You already applied for "${title}".`
          : `Your application for "${title}" was saved.`,
        type: result.alreadyApplied ? "info" : "success",
      })
    } catch (error) {
      if (
        error instanceof ApplicationApiError &&
        error.code === "APPLICATION_LIMIT_REACHED"
      ) {
        router.push("/pricing")
        return
      }
      setApplyError(
        error instanceof Error
          ? error.message
          : "Could not submit your application."
      )
      if (error instanceof ApplicationApiError) {
        setApplyErrorCode(error.code ?? null)
        setRequiresSignIn(error.status === 401)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleSaved() {
    if (!isSeeker) return
    setSaving(true)

    try {
      if (saved) {
        await removeSavedJob(jobId)
        setSaved(false)
        toast.add({
          title: "Removed from saved jobs",
          description: `"${title}" was removed from your saved jobs.`,
          type: "success",
        })
      } else {
        const alreadySaved = await saveJob(jobId)
        setSaved(true)
        toast.add({
          title: alreadySaved ? "Already saved" : "Job saved",
          description: `"${title}" is in your saved jobs.`,
          type: alreadySaved ? "info" : "success",
        })
      }
    } catch (error) {
      toast.add({
        title: "Could not update saved jobs",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {isPending ? (
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary text-sm font-semibold text-white opacity-60"
        >
          Checking account…
        </button>
      ) : session?.user && isSeeker ? (
        <button
          type="button"
          onClick={handleStartApply}
          disabled={applied || checkingUsage}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="size-4" aria-hidden />
          {applied
            ? "Applied"
            : checkingUsage
              ? "Checking limit…"
              : "Apply Now"}
        </button>
      ) : session?.user ? (
        <button
          type="button"
          disabled
          title="Only seeker accounts can apply to jobs"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary text-sm font-semibold text-white opacity-50"
        >
          Seeker account required
        </button>
      ) : (
        <Link
          href={signInUrl}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-hl-primary text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <LogIn className="size-4" aria-hidden />
          Sign in to apply
        </Link>
      )}

      <AlertDialog open={showApplyInfo} onOpenChange={setShowApplyInfo}>
        <AlertDialogContent className="border-white/10 bg-[#18181c] text-white">
          <form onSubmit={handleApply}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Apply for {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                {plan === "free"
                  ? "Your Free plan includes up to 13 applications per month."
                  : `Your ${plan} plan includes more application capacity.`}{" "}
                Your application and status will be available from My
                Applications.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <label className="mt-4 flex flex-col gap-2 text-sm text-white/80">
              Cover letter{" "}
              <span className="text-xs text-white/40">Optional</span>
              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Add a short note to the hiring team"
                disabled={submitting}
                className="w-full resize-y rounded-xl border border-white/10 bg-[#101012] px-4 py-3 text-sm text-white transition-colors outline-none placeholder:text-white/35 focus:border-hl-primary/60 disabled:opacity-60"
              />
              <span className="text-right text-xs text-white/35">
                {coverLetter.length}/5000
              </span>
            </label>

            {applyError && (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {applyError}
                {applyErrorCode === "APPLICATION_LIMIT_REACHED" && (
                  <>
                    {" "}
                    <Link
                      href="/pricing"
                      className="font-semibold underline underline-offset-2"
                    >
                      View plans
                    </Link>
                  </>
                )}
                {requiresSignIn && (
                  <>
                    {" "}
                    <Link
                      href={signInUrl}
                      className="font-semibold underline underline-offset-2"
                    >
                      Sign in again
                    </Link>
                  </>
                )}
              </div>
            )}

            <AlertDialogFooter className="mt-5 border-white/10 bg-white/3">
              <AlertDialogCancel
                disabled={submitting}
                type="button"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </AlertDialogCancel>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-hl-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="size-4" aria-hidden />
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {isPending ? (
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/50"
        >
          Checking account…
        </button>
      ) : session?.user && isSeeker ? (
        <button
          type="button"
          onClick={handleToggleSaved}
          disabled={saving}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            saved
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <Heart className={cn("size-4", saved && "fill-red-400")} />
          {saving ? "Updating…" : saved ? "Saved" : "Save Job"}
        </button>
      ) : session?.user ? (
        <button
          type="button"
          disabled
          title="Only seeker accounts can save jobs"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/50"
        >
          Seeker account required
        </button>
      ) : (
        <Link
          href={signInUrl}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogIn className="size-4" aria-hidden />
          Sign in to save
        </Link>
      )}

      <p className="text-center text-xs leading-relaxed text-white/45">
        {plan === "free"
          ? "Free plan: up to 13 applications per month. "
          : `${plan} plan: higher application limits. `}
        <Link
          href="/pricing"
          className="font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-white"
        >
          Paid plans allow more
        </Link>
        .
      </p>
    </div>
  )
}
