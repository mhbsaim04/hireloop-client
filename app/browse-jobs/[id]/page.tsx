import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin } from "lucide-react"
import { getJob } from "@/lib/api/jobs"

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let job: any = null
  try {
    job = await getJob(id)
  } catch (err) {
    console.error("Failed to load job:", err)
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/browse-jobs" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
          <ArrowLeft className="size-4" />
          Back to jobs
        </Link>
        <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-6 text-center text-sm text-white/50">
          Job not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/browse-jobs" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Briefcase className="size-6 text-white/60" />
          </span>
          <div>
            <h1 className="[font-family:var(--font-manrope)] text-2xl font-bold text-white">
              {job.title || "Untitled job"}
            </h1>
            <p className="mt-1 text-white/50">{job.company || "—"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40">
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {job.location || "—"}
              </span>
              <span>{job.jobType || "—"}</span>
              <span className="font-semibold text-white">
                {job.minSalary ? `$${job.minSalary}` : "—"}
                {job.maxSalary ? ` – $${job.maxSalary}` : ""}
              </span>
            </div>
          </div>
        </div>

        {(job.responsibilities || job.requirements) && (
          <div className="mt-6 border-t border-white/5 pt-6">
            {job.responsibilities && (
              <>
                <h2 className="text-sm font-semibold text-white">Responsibilities</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60 whitespace-pre-line">{job.responsibilities}</p>
              </>
            )}
            {job.requirements && (
              <>
                <h2 className="mt-4 text-sm font-semibold text-white">Requirements</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60 whitespace-pre-line">{job.requirements}</p>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" className="flex h-11 items-center rounded-xl bg-hl-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  )
}
