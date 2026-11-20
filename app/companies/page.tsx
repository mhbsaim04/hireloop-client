import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CompaniesClient, type Company } from "@/components/companies-client"
import { getCompanies } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"

// Company and job data changes on the backend; render per request instead of
// baking the list into the build output.
export const dynamic = "force-dynamic"

function toList(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record[key])) return record[key] as unknown[]
    if (Array.isArray(record.data)) return record.data as unknown[]
  }
  return []
}

function isCompany(value: unknown): value is Company {
  return Boolean(
    value &&
    typeof value === "object" &&
    ("id" in value || "_id" in value) &&
    "name" in value
  )
}

export default async function CompaniesPage() {
  let companies: Company[] = []
  let jobs: Array<{ company?: string; status?: string }> = []
  let loadError: string | null = null

  try {
    const payload = await getCompanies()
    companies = toList(payload, "companies").filter(isCompany)
  } catch (err) {
    console.error("Failed to load companies:", err)
    loadError =
      err instanceof Error ? err.message : "Could not load companies right now."
  }

  try {
    const payload = await getJobs()
    jobs = toList(payload, "jobs") as Array<{
      company?: string
      status?: string
    }>
  } catch (err) {
    console.error("Failed to load jobs for company counts:", err)
  }

  // Only approved companies are publicly visible; the backend may already
  // filter, so only drop records that explicitly carry a non-approved status.
  // Only approved companies are publicly visible; the backend may already
  // filter, so only drop records that explicitly carry a non-approved status.
  const approved = companies.filter((c) => {
    const status = (c.status ?? "").trim().toLowerCase()
    return !status || status === "approved"
  })

  // Jobs are linked to companies by name (there is no companyId on job docs).
  const openJobCounts: Record<string, number> = {}
  for (const job of jobs) {
    const status = (job.status ?? "").trim().toLowerCase()
    if (status && status !== "active") continue
    const key = (job.company ?? "").trim().toLowerCase()
    if (!key) continue
    openJobCounts[key] = (openJobCounts[key] ?? 0) + 1
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
        <CompaniesClient companies={approved} openJobCounts={openJobCounts} />
      </main>
      <Footer />
    </>
  )
}
