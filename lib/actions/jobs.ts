import type { JobForm } from "@/app/dashboard/recruiter/jobs/new/page"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type JobCapacityDetails = {
  plan: "free" | "growth" | "enterprise"
  limit: number
  activeJobs: number
  remaining: number
}

function isJobCapacityDetails(value: unknown): value is JobCapacityDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "plan" in value &&
    (value.plan === "free" ||
      value.plan === "growth" ||
      value.plan === "enterprise") &&
    "limit" in value &&
    typeof value.limit === "number" &&
    "activeJobs" in value &&
    typeof value.activeJobs === "number" &&
    "remaining" in value &&
    typeof value.remaining === "number"
  )
}

export class JobApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly capacity?: JobCapacityDetails
  ) {
    super(message)
    this.name = "JobApiError"
  }
}

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
  const payload: unknown = await res.json()
  if (!res.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Could not publish the job."
    const code =
      typeof payload === "object" &&
      payload !== null &&
      "code" in payload &&
      typeof payload.code === "string"
        ? payload.code
        : undefined
    const capacity = isJobCapacityDetails(payload) ? payload : undefined
    throw new JobApiError(message, res.status, code, capacity)
  }
  return payload
}

export const createJob = async (data: JobForm) => {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}
