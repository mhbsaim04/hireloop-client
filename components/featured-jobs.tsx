import { getJobs } from "@/lib/api/jobs"
import { FeaturedJobsClient } from "@/components/featured-jobs-client"

export async function FeaturedJobs() {
  let jobs: any[] = []
  try {
    jobs = await getJobs()
    if (!Array.isArray(jobs)) jobs = (jobs as any)?.jobs ?? []
  } catch (err) {
    console.error("Failed to load featured jobs:", err)
    jobs = []
  }

  return <FeaturedJobsClient jobs={jobs} />
}
