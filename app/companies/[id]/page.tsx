import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Users,
} from "lucide-react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { CompanyLogo } from "@/components/company-logo"
import { getCompany } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"

interface CompanyProfile {
  _id?: string
  id?: string
  name?: string
  industry?: string
  website?: string
  location?: string
  employeeCount?: string
  logo?: string
  description?: string
  status?: string
}

interface CompanyJob {
  _id?: string
  id?: string
  title?: string
  jobType?: string
  location?: string
  createdAt?: string
}

function jobId(job: CompanyJob) {
  return job._id ?? job.id ?? ""
}

function toList(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record[key])) return record[key] as unknown[]
    if (Array.isArray(record.data)) return record.data as unknown[]
  }
  return []
}

function websiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
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

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let company: CompanyProfile | null = null
  try {
    const payload = await getCompany(id)
    const record =
      payload && typeof payload === "object" && "company" in payload
        ? (payload as { company: CompanyProfile }).company
        : (payload as CompanyProfile)
    if (record && typeof record === "object" && record.name) company = record
  } catch (err) {
    console.error("Failed to load company:", err)
  }

  // Pending/rejected companies are not publicly visible.
  const status = (company?.status ?? "").trim().toLowerCase()
  if (!company || (status && status !== "approved")) {
    return (
      <>
        <Navbar />
        <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to companies
            </Link>
            <div className="mt-6 rounded-3xl border border-white/8 bg-[#141417] px-6 py-16 text-center sm:px-10">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/5">
                <Building2 className="size-7 text-white/40" aria-hidden />
              </span>
              <h1 className="mt-5 [font-family:var(--font-manrope)] text-2xl font-bold text-white">
                Company not found
              </h1>
              <p className="mt-2 text-sm text-white/50">
                This company may have been removed or is not approved yet.
              </p>
              <Link
                href="/companies"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/85"
              >
                Browse companies
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  let jobs: CompanyJob[] = []
  try {
    const payload = await getJobs()
    jobs = toList(payload, "jobs")
      .filter(
        (item): item is CompanyJob =>
          item !== null &&
          typeof item === "object" &&
          ("id" in item || "_id" in item)
      )
      .filter((job) => {
        const jobStatus = ((job as { status?: string }).status ?? "")
          .trim()
          .toLowerCase()
        if (jobStatus && jobStatus !== "active") return false
        return (
          (job as { company?: string }).company?.trim().toLowerCase() ===
          company.name?.trim().toLowerCase()
        )
      })
  } catch (err) {
    console.error("Failed to load company jobs:", err)
  }

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
            href="/companies"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Back to companies
          </Link>

          {/* Company header */}
          <section className="relative mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#141417] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-hl-primary/15 blur-[90px]"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <CompanyLogo
                src={company.logo}
                name={company.name}
                className="size-16 rounded-2xl sm:size-20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {company.industry && (
                    <span className="rounded-full border border-hl-primary/30 bg-hl-primary/10 px-3 py-1 text-xs font-medium text-indigo-200">
                      {company.industry}
                    </span>
                  )}
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    Approved
                  </span>
                </div>
                <h1 className="mt-3 [font-family:var(--font-manrope)] text-2xl leading-tight font-bold text-white sm:text-3xl lg:text-4xl">
                  {company.name}
                </h1>
                <p className="mt-2 text-base font-medium text-white/55">
                  {company.location || "Location not listed"}
                </p>
                {company.website && (
                  <a
                    href={websiteHref(company.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-hl-primary transition-colors hover:text-hl-primary/80"
                  >
                    <Globe className="size-4" aria-hidden />
                    {company.website.replace(/^https?:\/\//i, "")}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </div>

            <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Fact
                icon={MapPin}
                label="Location"
                value={company.location || "Location not listed"}
              />
              <Fact
                icon={Users}
                label="Company size"
                value={
                  company.employeeCount
                    ? `${company.employeeCount} employees`
                    : "Not listed"
                }
              />
              <Fact
                icon={Briefcase}
                label="Open jobs"
                value={`${jobs.length} open ${jobs.length === 1 ? "position" : "positions"}`}
              />
            </div>

            {company.description && (
              <div className="relative mt-6 rounded-2xl border border-white/8 bg-white/[0.035] p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">
                  About the company
                </p>
                <p className="mt-3 text-sm leading-7 whitespace-pre-line text-white/60 sm:text-base">
                  {company.description}
                </p>
              </div>
            )}
          </section>

          {/* Open jobs */}
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-hl-primary uppercase">
                  They&apos;re hiring
                </p>
                <h2 className="mt-2 [font-family:var(--font-manrope)] text-2xl font-bold text-white sm:text-3xl">
                  Open positions
                </h2>
              </div>
              <Link
                href="/browse-jobs"
                className="text-sm font-medium text-white/55 transition-colors hover:text-white"
              >
                Browse all jobs
              </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => {
                  const jid = jobId(job)
                  return (
                    <Link
                      key={jid}
                      href={`/browse-jobs/${encodeURIComponent(jid)}`}
                      className="group rounded-2xl border border-white/8 bg-[#141417] p-5 transition-all hover:-translate-y-1 hover:border-hl-primary/35 hover:bg-[#18181c] hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                          <Briefcase
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
                        {job.title || "Untitled position"}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden />
                          {job.location || "Location not listed"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="size-3.5" aria-hidden />
                          {job.jobType || "Full-time"}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/8 bg-[#141417] px-5 py-8 text-center">
                <p className="text-sm text-white/55">
                  {company.name} doesn&apos;t have any open positions right now.
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
