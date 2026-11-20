const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type CreateApplicationInput = {
  jobId: string
  coverLetter?: string
}

export type ApplicationUsage = {
  plan: "free" | "growth" | "premium"
  used: number
  limit: number | null
  remaining: number | null
  period: string
}

function isApplicationUsage(value: unknown): value is ApplicationUsage {
  return (
    typeof value === "object" &&
    value !== null &&
    "plan" in value &&
    (value.plan === "free" ||
      value.plan === "growth" ||
      value.plan === "premium") &&
    "used" in value &&
    typeof value.used === "number" &&
    "limit" in value &&
    (value.limit === null || typeof value.limit === "number") &&
    "remaining" in value &&
    (value.remaining === null || typeof value.remaining === "number") &&
    "period" in value &&
    typeof value.period === "string"
  )
}

export type JobApplication = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  minSalary: string | number | null
  maxSalary: string | number | null
  frequency: string
  status: "Applied" | "Under Review" | "Shortlisted" | "Rejected" | "Offered"
  appliedAt: string
  updatedAt?: string | null
  coverLetter?: string
}

export class ApplicationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message)
    this.name = "ApplicationApiError"
  }
}

export async function getApplicationUsage(): Promise<ApplicationUsage> {
  const response = await fetch(`${BASE_URL}/applications/usage`, {
    credentials: "include",
  })
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The application service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Could not check your application usage."
    const code =
      typeof payload === "object" &&
      payload !== null &&
      "code" in payload &&
      typeof payload.code === "string"
        ? payload.code
        : undefined
    throw new ApplicationApiError(message, response.status, code)
  }

  if (!isApplicationUsage(payload)) {
    throw new Error("The application service returned invalid usage details.")
  }

  return payload
}

export async function submitJobApplication(input: CreateApplicationInput) {
  const response = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The application service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Could not submit your application."
    const code =
      typeof payload === "object" &&
      payload !== null &&
      "code" in payload &&
      typeof payload.code === "string"
        ? payload.code
        : undefined

    throw new ApplicationApiError(message, response.status, code)
  }

  return {
    alreadyApplied:
      typeof payload === "object" &&
      payload !== null &&
      "alreadyApplied" in payload &&
      payload.alreadyApplied === true,
  }
}

function isJobApplication(value: unknown): value is JobApplication {
  const validStatuses: JobApplication["status"][] = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Rejected",
    "Offered",
  ]

  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "jobId" in value &&
    typeof value.jobId === "string" &&
    "jobTitle" in value &&
    typeof value.jobTitle === "string" &&
    "company" in value &&
    typeof value.company === "string" &&
    "location" in value &&
    typeof value.location === "string" &&
    "minSalary" in value &&
    (typeof value.minSalary === "string" ||
      typeof value.minSalary === "number" ||
      value.minSalary === null) &&
    "maxSalary" in value &&
    (typeof value.maxSalary === "string" ||
      typeof value.maxSalary === "number" ||
      value.maxSalary === null) &&
    "frequency" in value &&
    typeof value.frequency === "string" &&
    "status" in value &&
    typeof value.status === "string" &&
    validStatuses.some((status) => status === value.status) &&
    "appliedAt" in value &&
    typeof value.appliedAt === "string" &&
    (!("updatedAt" in value) ||
      typeof value.updatedAt === "string" ||
      value.updatedAt === null)
  )
}

export async function getMyApplications(): Promise<JobApplication[]> {
  const response = await fetch(`${BASE_URL}/applications/me`, {
    credentials: "include",
  })
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The application service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Could not load your applications."
    throw new ApplicationApiError(message, response.status)
  }

  if (!Array.isArray(payload) || !payload.every(isJobApplication)) {
    throw new Error(
      "The application service returned an invalid application list."
    )
  }

  return payload
}
