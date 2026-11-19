import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react"
import { Footer } from "@/components/footer"
import { JobApplyCard } from "@/components/job-apply-card"
import { Navbar } from "@/components/navbar"
import { ShareJobButton } from "@/components/share-job-button"
import { getJob, getJobs } from "@/lib/api/jobs"
import { cn } from "@/lib/utils"

type Job = {
  id?: string
  _id?: string
  title?: string
  company?: string
  category?: string
  jobType?: string
  isRemote?: boolean
  location?: string
  minSalary?: string | number
  maxSalary?: string | number
  frequency?: string
  description?: string
  responsibilities?: string
  requirements?: string
  createdAt?: string
  deadline?: string
}

function getJobId(job: Job) {
  return job._id || job.id || ""
}

function getJobsFromResponse(response: unknown): Job[] {
  let items: unknown[] = []
  if (Array.isArray(response)) {
    items = response
  } else if (
    typeof response === "object" &&
    response !== null &&
    "jobs" in response &&
    Array.isArray(response.jobs)
  ) {
    items = response.jobs
  }

  return items.filter(
    (item): item is Job =>
      typeof item === "object" &&
      item !== null &&
      ("id" in item || "_id" in item)
  )
}

function similarityScore(candidate: Job, current: Job) {
  return (
    (current.category && candidate.category === current.category ? 3 : 0) +
    (current.jobType && candidate.jobType === current.jobType ? 2 : 0) +
    (current.isRemote !== undefined && current.isRemote === candidate.isRemote
      ? 1
      : 0) +
    (current.location && candidate.location === current.location ? 1 : 0)
  )
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

function formatSalary(job: {
  minSalary?: string | number
  maxSalary?: string | number
  frequency?: string
}) {
  const range = [job.minSalary, job.maxSalary]
    .filter(
      (amount) => amount !== undefined && amount !== null && amount !== ""
    )
    .map((amount) => `$${amount}`)
    .join(" – ")

  if (!range) return "Salary not listed"
  return job.frequency
    ? `${range} / ${job.frequency.replace(/^per\s+/i, "")}`
    : range
}

function DetailFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.06]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-hl-primary/15 text-hl-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-medium text-white/40">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-white/90">
          {value}
        </p>
      </div>
    </div>
  )
}

function ContentCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-3xl border border-white/8 bg-[#141417] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.12)] sm:p-8"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-hl-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 [font-family:var(--font-manrope)] text-xl font-bold text-white sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5 text-sm leading-7 whitespace-pre-line text-white/60 sm:text-base">
        {children}
      </div>
    </section>
  )
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let job: Job | null = null
  try {
    job = await getJob(id)
  } catch (err) {
    console.error("Failed to load job:", err)
  }

  if (!job || typeof job !== "object") {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/browse-jobs"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to jobs
            </Link>
            <div className="mt-6 rounded-3xl border border-white/8 bg-[#141417] px-6 py-16 text-center sm:px-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/5">
                <BriefcaseBusiness
                  className="size-7 text-white/40"
                  aria-hidden
                />
              </span>
              <h1 className="mt-5 [font-family:var(--font-manrope)] text-2xl font-bold text-white">
                Job not found
              </h1>
              <p className="mt-2 text-sm text-white/50">
                This position may have been removed or is no longer available.
              </p>
              <Link
                href="/browse-jobs"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/85"
              >
                Explore open roles
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const currentJob = job
  let similarJobs: Job[] = []
  try {
    const response = await getJobs(
      currentJob.category ? { category: currentJob.category } : undefined
    )
    similarJobs = getJobsFromResponse(response)
      .filter((candidate) => getJobId(candidate) !== id && getJobId(candidate))
      .sort(
        (a, b) =>
          similarityScore(b, currentJob) - similarityScore(a, currentJob)
      )
      .slice(0, 3)
  } catch (err) {
    console.error("Failed to load similar jobs:", err)
  }

  const location = job.isRemote
    ? `Remote${job.location ? ` · ${job.location}` : ""}`
    : job.location || "Location not listed"
  const salary = formatSalary(job)
  const description = job.description || job.responsibilities
  const postedDate = formatDate(job.createdAt)
  const deadline = formatDate(job.deadline)

  return (
    <>
      <Navbar />
      <main className="relative flex-1 overflow-hidden px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-hl-primary/10 blur-[120px]"
        />
        <div className="mx-auto max-w-7xl">
          <Link
            href="/browse-jobs"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Back to jobs
          </Link>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-hl-primary uppercase">
                Find your next move
              </p>
              <h1 className="mt-2 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Job Details
              </h1>
            </div>
            <ShareJobButton />
          </div>

          <section className="relative mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#141417] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-hl-primary/15 blur-[90px]"
            />
            <div className="relative">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:size-16">
                    <Building2 className="size-7 text-white/65" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {job.category && (
                        <span className="rounded-full border border-hl-primary/30 bg-hl-primary/10 px-3 py-1 text-xs font-medium text-indigo-200">
                          {job.category}
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65">
                        {job.jobType || "Full-time"}
                      </span>
                      {job.isRemote && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          Remote
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 [font-family:var(--font-manrope)] text-2xl leading-tight font-bold text-white sm:text-3xl lg:text-4xl">
                      {job.title || "Untitled position"}
                    </h2>
                    <p className="mt-2 text-base font-medium text-white/55">
                      {job.company || "Company"}
                    </p>
                    {postedDate && (
                      <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/40">
                        <CalendarDays className="size-3.5" aria-hidden />
                        Posted {postedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailFact icon={MapPin} label="Location" value={location} />
                <DetailFact
                  icon={BriefcaseBusiness}
                  label="Schedule"
                  value={job.jobType || "Full-time"}
                />
                <DetailFact icon={Wallet} label="Salary" value={salary} />
              </div>
            </div>
          </section>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <nav
                aria-label="Job details sections"
                className="flex flex-wrap gap-2 rounded-2xl border border-white/8 bg-[#141417]/80 p-2"
              >
                {[
                  ["job-description", "Overview"],
                  ...(job.description && job.responsibilities
                    ? [["job-responsibilities", "Responsibilities"]]
                    : []),
                  ...(job.requirements
                    ? [["job-requirements", "Requirements"]]
                    : []),
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={`#${href}`}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <ContentCard
                id="job-description"
                eyebrow="The opportunity"
                title="Job Description"
              >
                {description ||
                  "The employer hasn’t provided a description for this role yet."}
              </ContentCard>

              {job.description && job.responsibilities && (
                <ContentCard
                  id="job-responsibilities"
                  eyebrow="What you’ll do"
                  title="Key Responsibilities"
                >
                  {job.responsibilities}
                </ContentCard>
              )}

              {job.requirements && (
                <ContentCard
                  id="job-requirements"
                  eyebrow="What you’ll bring"
                  title="Qualifications & Requirements"
                >
                  {job.requirements}
                </ContentCard>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-8">
              <div className="rounded-3xl border border-white/10 bg-[#141417] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.16)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white/45">
                      Compensation
                    </p>
                    <p className="mt-2 [font-family:var(--font-manrope)] text-2xl font-bold text-white">
                      {salary.split(" / ")[0]}
                    </p>
                    {job.frequency && (
                      <p className="mt-1 text-xs text-white/45">
                        per {job.frequency.replace(/^per\s+/i, "")}
                      </p>
                    )}
                  </div>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-hl-primary/15 text-hl-primary">
                    <Wallet className="size-5" aria-hidden />
                  </span>
                </div>
                <div className="my-6 h-px bg-white/8" />
                <JobApplyCard jobId={id} title={job.title || "this job"} />

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">
                    About the company
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Building2 className="size-5 text-white/65" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {job.company || "Company"}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">
                        {job.location || "Location not listed"}
                      </p>
                    </div>
                  </div>
                </div>

                {(deadline || job.createdAt) && (
                  <div className="mt-5 space-y-3">
                    {deadline && (
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2 text-white/45">
                          <Clock3 className="size-3.5" aria-hidden />
                          Apply by
                        </span>
                        <span className="font-medium text-white/75">
                          {deadline}
                        </span>
                      </div>
                    )}
                    {job.createdAt && (
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2 text-white/45">
                          <CalendarDays className="size-3.5" aria-hidden />
                          Posted
                        </span>
                        <span className="font-medium text-white/75">
                          {postedDate}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/browse-jobs"
                className={cn(
                  "group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-4",
                  "text-sm font-medium text-white/55 transition-colors hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                Browse more opportunities
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
            </aside>
          </div>

          <section className="mt-14 sm:mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-hl-primary uppercase">
                  Keep exploring
                </p>
                <h2 className="mt-2 [font-family:var(--font-manrope)] text-2xl font-bold text-white sm:text-3xl">
                  Similar opportunities
                </h2>
              </div>
              <Link
                href="/browse-jobs"
                className="text-sm font-medium text-white/55 transition-colors hover:text-white"
              >
                Browse all jobs
              </Link>
            </div>

            {similarJobs.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {similarJobs.map((similarJob) => (
                  <Link
                    key={getJobId(similarJob)}
                    href={`/browse-jobs/${encodeURIComponent(getJobId(similarJob))}`}
                    className="group rounded-2xl border border-white/8 bg-[#141417] p-5 transition-all hover:-translate-y-1 hover:border-hl-primary/35 hover:bg-[#18181c] hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                        <Building2
                          className="size-5 text-white/55"
                          aria-hidden
                        />
                      </span>
                      <ArrowUpRight
                        className="size-4 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-5 line-clamp-2 [font-family:var(--font-manrope)] text-lg font-bold text-white">
                      {similarJob.title || "Untitled position"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-white/55">
                      {similarJob.company || "Company"}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden />
                        {similarJob.isRemote
                          ? "Remote"
                          : similarJob.location || "Location not listed"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness className="size-3.5" aria-hidden />
                        {similarJob.jobType || "Full-time"}
                      </span>
                    </div>
                    <p className="mt-4 border-t border-white/8 pt-4 text-sm font-semibold text-white/80">
                      {formatSalary(similarJob)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/8 bg-[#141417] px-5 py-8 text-center">
                <p className="text-sm text-white/55">
                  No similar openings are available right now.
                </p>
                <Link
                  href="/browse-jobs"
                  className="mt-3 inline-flex text-sm font-medium text-white underline underline-offset-4 hover:text-white/80"
                >
                  Browse all jobs
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
