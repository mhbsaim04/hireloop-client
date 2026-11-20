import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  BrowseJobsClient,
  type InitialFilters,
  type Job,
} from "@/components/browse-jobs-client"
import { getJobs } from "@/lib/api/jobs"

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
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

function isJob(value: unknown): value is Job {
  return Boolean(
    value && typeof value === "object" && ("id" in value || "_id" in value)
  )
}

export default async function BrowseJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = firstString(sp.search) ?? firstString(sp.q) ?? ""
  const category = firstString(sp.category)
  const location = firstString(sp.location)
  const type = firstString(sp.type)
  const requirements = firstString(sp.requirements)
  const minSalary = firstString(sp.minSalary)

  let jobs: Job[] = []
  let loadError: string | null = null

  try {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (category) params.category = category
    // "Remote" is matched client-side against isRemote — the API only knows
    // exact location strings, so forwarding it would return zero rows.
    if (location && location !== "Remote") params.location = location
    if (type) params.type = type
    if (requirements) params.requirements = requirements
    // Note: minSalary is intentionally not forwarded — the API's handling of
    // it is unreliable, and salary filtering happens client-side below.
    const payload = await getJobs(params)
    jobs = toList(payload, "jobs").filter(isJob)
  } catch (err) {
    console.error("Failed to load jobs:", err)
    loadError =
      err instanceof Error ? err.message : "Could not load jobs right now."
  }

  // Reflect the URL filters in the UI on first paint (search, category,
  // location, type, salary, skills) instead of resetting to defaults.
  const initialFilters: InitialFilters = {
    category,
    location,
    type,
    requirements,
    minSalary,
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {loadError && (
          <div className="mx-auto mb-6 max-w-350 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {loadError}
          </div>
        )}
        <BrowseJobsClient
          jobs={jobs}
          initialQuery={q}
          initialFilters={initialFilters}
        />
      </main>
      <Footer />
    </>
  )
}
