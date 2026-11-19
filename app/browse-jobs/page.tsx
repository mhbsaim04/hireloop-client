
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BrowseJobsClient } from "@/components/browse-jobs-client"
import { getJobs } from "@/lib/api/jobs"

export default async function BrowseJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  const category = typeof sp.category === "string" ? sp.category : undefined
  const location = typeof sp.location === "string" ? sp.location : undefined
  const type = typeof sp.type === "string" ? sp.type : undefined

  let jobs: any[] = []
  try {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (category) params.category = category
    if (location) params.location = location
    if (type) params.type = type
    jobs = await getJobs(params)
    if (!Array.isArray(jobs)) jobs = (jobs as any)?.jobs ?? []
  } catch (err) {
    console.error("Failed to load jobs:", err)
    jobs = []
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <BrowseJobsClient jobs={jobs} initialQuery={q} />
      </main>
      <Footer />
    </>
  )
}
