import type { JobForm } from "@/app/dashboard/recruiter/jobs/new/page"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

/** Throws a clear error if the API answers with HTML (e.g. a 404 page) instead of JSON. */
async function parseJson(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await res.text()
    throw new Error(
      `API at ${res.url} returned ${res.status} ${contentType || "no content-type"} instead of JSON. ` +
        `The endpoint probably doesn't exist on the backend. Response: ${body.slice(0, 120)}`
    )
  }
  return res.json()
}

export const createJob = async (data: JobForm) => {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}

export const getJobs = async () => {
  const res = await fetch(`${BASE_URL}/jobs`)
  return parseJson(res)
}

export const deleteJob = async (id: string) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" })
  return parseJson(res)
}
