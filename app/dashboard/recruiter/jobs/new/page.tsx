"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronDown } from "lucide-react"

/** Flat form data object — ready to send to a backend as-is. */
interface JobForm {
  title: string
  company: string
  category: string
  jobType: string
  isRemote: boolean
  location: string
  deadline: string
  minSalary: string
  maxSalary: string
  frequency: string
  responsibilities: string
  requirements: string
}

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

const NewJobsPage = () => {
  const [form, setForm] = useState<JobForm>(INITIAL_FORM)
  const [posted, setPosted] = useState(false)

  /** One simple setter for every field. */
  const set = (key: keyof JobForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: send `form` to the backend when the API is ready.
    console.log("New job payload:", form)
    setPosted(true)
  }

  return (
    <div className="mx-auto max-w-350">
      {/* Breadcrumb + header (per Figma) */}
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
        <span className="text-white/80">Create New Listing</span>
      </nav>

      <div className="mt-3">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            Post a New Job
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Fill in the position specifications to attract qualified talent
            across our network.
          </p>
        </div>
      </div>

      {posted && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="size-4" />
          Job posted successfully. Check the console for the collected data.
        </div>
      )}

      <form
        id="new-job-form"
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-6"
      >
        {/* Section 1: Basic Information */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            1. Basic Information
          </h3>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label htmlFor="title" className={labelClass}>
                Job Title <span className="text-white">*</span>
              </label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Frontend Developer"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className={labelClass}>
                  Company Name <span className="text-white">*</span>
                </label>
                <input
                  id="company"
                  required
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="HirePulse Network"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Job Category <span className="text-white">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    required
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className={labelClass}>
                Job Type <span className="text-white">*</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set("jobType", type)}
                    className={`h-11 rounded-xl border px-5 text-sm transition-colors ${
                      form.jobType === type
                        ? "border-hl-primary bg-hl-primary font-medium text-white"
                        : "border-white/10 bg-[#161618] text-white/70 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Location, Compensation & Timeline */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            2. Location, Compensation & Timeline
          </h3>

          {/* Remote toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={form.isRemote}
            onClick={() => set("isRemote", !form.isRemote)}
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
                Remote Work Allowed
              </span>
              <span className="block text-xs text-white/50">
                Enable worldwide or distributed candidate applications
              </span>
            </span>
          </button>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className={labelClass}>
                Job Location <span className="text-white">*</span>
              </label>
              <input
                id="location"
                required
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="New York, USA"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deadline" className={labelClass}>
                Application Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>

            <div>
              <label htmlFor="minSalary" className={labelClass}>
                Min Salary / Rate
              </label>
              <div className="flex h-11 items-center rounded-xl border border-white/10 bg-[#161618] pr-1 pl-4">
                <span aria-hidden className="text-sm text-white/40">
                  $
                </span>
                <input
                  id="minSalary"
                  type="number"
                  min="0"
                  value={form.minSalary}
                  onChange={(e) => set("minSalary", e.target.value)}
                  placeholder="0"
                  className="h-full w-full bg-transparent pl-1 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxSalary" className={labelClass}>
                Max Salary / Rate
              </label>
              <div className="flex h-11 items-center rounded-xl border border-white/10 bg-[#161618] pr-1 pl-4">
                <span aria-hidden className="text-sm text-white/40">
                  $
                </span>
                <input
                  id="maxSalary"
                  type="number"
                  min="0"
                  value={form.maxSalary}
                  onChange={(e) => set("maxSalary", e.target.value)}
                  placeholder="0"
                  className="h-full w-full bg-transparent pl-1 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="frequency" className={labelClass}>
                Frequency
              </label>
              <div className="relative">
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => set("frequency", e.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  {FREQUENCIES.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Responsibilities & Requirements */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            3. Responsibilities & Requirements
          </h3>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <label htmlFor="responsibilities" className={labelClass}>
                Key Responsibilities <span className="text-white">*</span>
              </label>
              <textarea
                id="responsibilities"
                required
                rows={5}
                value={form.responsibilities}
                onChange={(e) => set("responsibilities", e.target.value)}
                placeholder="Showcase your commitment to delivering exceptional user interfaces and digital experiences..."
                className={`${inputClass} h-auto resize-y py-3`}
              />
            </div>

            <div>
              <label htmlFor="requirements" className={labelClass}>
                Qualifications & Requirements{" "}
                <span className="text-white">*</span>
              </label>
              <textarea
                id="requirements"
                required
                rows={5}
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder={
                  "3+ years of experience with React, TypeScript...\nSolid understanding of DOM performance..."
                }
                className={`${inputClass} h-auto resize-y py-3`}
              />
            </div>
          </div>
        </section>

        {/* Publish */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            className="flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Publish Job
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewJobsPage
