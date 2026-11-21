"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, LoaderCircle, Save } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useSession } from "@/lib/auth-client"
import {
  getRecruiterJob,
  updateRecruiterJob,
  type RecruiterJob,
} from "@/lib/api/recruiter"
import type { JobForm } from "@/app/dashboard/recruiter/jobs/new/page"

const INITIAL_FORM: JobForm = {
  title: "",
  company: "",
  category: "Engineering & Tech",
  jobType: "Full-time",
  isRemote: false,
  location: "",
  deadline: "",
  minSalary: "",
  maxSalary: "",
  frequency: "per year",
  responsibilities: "",
  requirements: "",
}

const CATEGORIES = [
  "Engineering & Tech",
  "Design & Creative",
  "Marketing",
  "Sales",
  "Finance",
  "Healthcare",
  "Other",
]

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"]
const FREQUENCIES = ["per hour", "per month", "per year"]

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"
const labelClass =
  "mb-2 block [font-family:var(--font-manrope)] text-sm font-medium text-white/70"

function toJobForm(job: RecruiterJob): JobForm {
  return {
    title: job.title ?? "",
    company: job.company ?? "",
    category: job.category ?? "Engineering & Tech",
    jobType: job.jobType ?? "Full-time",
    isRemote: job.isRemote ?? false,
    location: job.location ?? "",
    deadline: job.deadline?.slice(0, 10) ?? "",
    minSalary:
      job.minSalary === undefined || job.minSalary === null
        ? ""
        : String(job.minSalary),
    maxSalary:
      job.maxSalary === undefined || job.maxSalary === null
        ? ""
        : String(job.maxSalary),
    frequency: job.frequency ?? "per year",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
  }
}

export default function UpdateRecruiterJobPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = params?.jobId ?? ""
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [job, setJob] = useState<RecruiterJob | null>(null)
  const [form, setForm] = useState<JobForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionPending) return
    if (!session?.user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(`/dashboard/recruiter/jobs/${jobId}/edit`)}`
      )
      return
    }
    if (session.user.role !== "recruiter") {
      router.replace("/")
      return
    }
    if (!jobId) {
      router.replace("/dashboard/recruiter/jobs")
      return
    }

    let active = true
    getRecruiterJob(jobId)
      .then((result) => {
        if (!active) return
        setJob(result)
        setForm(toJobForm(result))
      })
      .catch((cause: unknown) => {
        if (!active) return
        console.error("Failed to load job post for editing:", cause)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load this job post."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [jobId, router, session, sessionPending])

  function setField<K extends keyof JobForm>(key: K, value: JobForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!job) return

    setSaving(true)
    setError(null)
    try {
      const updatedJob = await updateRecruiterJob(jobId, form)
      toast.add({
        title: "Job post updated",
        description: `"${updatedJob.title}" was saved successfully.`,
        type: "success",
      })
      router.push("/dashboard/recruiter/jobs")
    } catch (cause: unknown) {
      console.error("Failed to update recruiter job:", cause)
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update this job post. Please try again."
      )
      setSaving(false)
    }
  }

  if (sessionPending || loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-white/55">
        <LoaderCircle aria-hidden className="size-5 animate-spin" />
        Loading job post…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-350">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/recruiter/jobs"
          className="text-white/50 transition-colors hover:text-white"
        >
          Manage Jobs
        </Link>
        <span aria-hidden className="text-white/25">
          /
        </span>
        <span className="text-white/80">Update Job Post</span>
      </nav>

      <header className="mt-4">
        <h1 className="[font-family:var(--font-manrope)] text-2xl font-bold text-white">
          Update job post
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Edit the listing details for {job?.title || "this position"}.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <p>{error}</p>
          {!job && (
            <Link
              href="/dashboard/recruiter/jobs"
              className="mt-2 inline-flex text-red-200 underline underline-offset-2"
            >
              Return to manage jobs
            </Link>
          )}
        </div>
      )}

      {job && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">Basic information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Job title" id="title" required>
                <input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Company name" id="company" required>
                <input
                  id="company"
                  required
                  value={form.company}
                  onChange={(event) => setField("company", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Job category" id="category" required>
                <Select
                  id="category"
                  value={form.category}
                  onChange={(value) => setField("category", value)}
                  options={CATEGORIES}
                />
              </Field>
              <Field label="Job type" id="jobType" required>
                <Select
                  id="jobType"
                  value={form.jobType}
                  onChange={(value) => setField("jobType", value)}
                  options={JOB_TYPES}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">
              Location, compensation &amp; timeline
            </h2>
            <button
              type="button"
              role="switch"
              aria-checked={form.isRemote}
              onClick={() => setField("isRemote", !form.isRemote)}
              className="mt-5 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#161618] px-4 py-3 text-left"
            >
              <span
                className={`relative h-5.5 w-10 shrink-0 rounded-full transition-colors ${
                  form.isRemote ? "bg-hl-primary" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.75 size-4 rounded-full bg-white transition-all ${
                    form.isRemote ? "left-5.25" : "left-0.75"
                  }`}
                />
              </span>
              <span>
                <span className="block text-sm font-medium text-white">
                  Remote work allowed
                </span>
                <span className="block text-xs text-white/50">
                  Allow applications from remote candidates
                </span>
              </span>
            </button>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Job location" id="location" required>
                <input
                  id="location"
                  required
                  value={form.location}
                  onChange={(event) => setField("location", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Application deadline" id="deadline">
                <input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(event) => setField("deadline", event.target.value)}
                  className={`${inputClass} scheme-dark`}
                />
              </Field>
              <Field label="Minimum salary / rate" id="minSalary">
                <input
                  id="minSalary"
                  type="number"
                  min="0"
                  value={form.minSalary}
                  onChange={(event) =>
                    setField("minSalary", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Maximum salary / rate" id="maxSalary">
                <input
                  id="maxSalary"
                  type="number"
                  min="0"
                  value={form.maxSalary}
                  onChange={(event) =>
                    setField("maxSalary", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Pay frequency" id="frequency">
                <Select
                  id="frequency"
                  value={form.frequency}
                  onChange={(value) => setField("frequency", value)}
                  options={FREQUENCIES}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">
              Responsibilities &amp; requirements
            </h2>
            <div className="mt-5 flex flex-col gap-5">
              <Field
                label="Key responsibilities"
                id="responsibilities"
                required
              >
                <textarea
                  id="responsibilities"
                  required
                  rows={6}
                  value={form.responsibilities}
                  onChange={(event) =>
                    setField("responsibilities", event.target.value)
                  }
                  className={`${inputClass} h-auto resize-y py-3`}
                />
              </Field>
              <Field
                label="Qualifications and requirements"
                id="requirements"
                required
              >
                <textarea
                  id="requirements"
                  required
                  rows={6}
                  value={form.requirements}
                  onChange={(event) =>
                    setField("requirements", event.target.value)
                  }
                  className={`${inputClass} h-auto resize-y py-3`}
                />
              </Field>
            </div>
          </section>

          <div className="flex flex-col-reverse justify-end gap-3 pb-8 sm:flex-row">
            <Link
              href="/dashboard/recruiter/jobs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/75 transition-colors hover:bg-white/5"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden className="size-4" />
              )}
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-white/45">*</span>}
      </label>
      {children}
    </div>
  )
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
      />
    </div>
  )
}
