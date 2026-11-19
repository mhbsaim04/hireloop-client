"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { toast } from "@/components/ui/toast"

export function ShareJobButton() {
  const [copied, setCopied] = useState(false)

  async function shareJob() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return
        toast.add({
          title: "Unable to share this job",
          description:
            error instanceof Error ? error.message : "Please try again.",
          type: "error",
        })
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.add({
        title: "Job link copied",
        description: "Share this opportunity with someone who may be a fit.",
        type: "success",
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.add({
        title: "Unable to copy the job link",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
  }

  return (
    <button
      type="button"
      onClick={shareJob}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
    >
      {copied ? (
        <Check className="size-4 text-emerald-300" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      {copied ? "Link copied" : "Share job"}
    </button>
  )
}
