const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type SavedJob = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  minSalary: string | number | null
  maxSalary: string | number | null
  frequency: string
  savedAt: string
}

export class SavedJobsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message)
    this.name = "SavedJobsApiError"
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isSavedJob(value: unknown): value is SavedJob {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.jobId === "string" &&
    typeof value.jobTitle === "string" &&
    typeof value.company === "string" &&
    typeof value.location === "string" &&
    (typeof value.minSalary === "string" ||
      typeof value.minSalary === "number" ||
      value.minSalary === null) &&
    (typeof value.maxSalary === "string" ||
      typeof value.maxSalary === "number" ||
      value.maxSalary === null) &&
    typeof value.frequency === "string" &&
    typeof value.savedAt === "string"
  )
}

async function getPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The saved-jobs service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Could not update your saved jobs."
    const code =
      isRecord(payload) && typeof payload.code === "string"
        ? payload.code
        : undefined
    throw new SavedJobsApiError(message, response.status, code)
  }

  return payload
}

export async function getMySavedJobs(): Promise<SavedJob[]> {
  const response = await fetch(`${BASE_URL}/saved-jobs/me`, {
    credentials: "include",
  })
  const payload = await getPayload(response)

  if (!Array.isArray(payload) || !payload.every(isSavedJob)) {
    throw new Error(
      "The saved-jobs service returned an invalid saved-jobs list."
    )
  }

  return payload
}

export async function saveJob(jobId: string): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/saved-jobs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ jobId }),
  })
  const payload = await getPayload(response)

  if (
    !isRecord(payload) ||
    !isSavedJob(payload.savedJob) ||
    typeof payload.alreadySaved !== "boolean"
  ) {
    throw new Error("The saved-jobs service returned an invalid save response.")
  }

  return payload.alreadySaved
}

export async function removeSavedJob(jobId: string): Promise<boolean> {
  const response = await fetch(
    `${BASE_URL}/saved-jobs/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )
  const payload = await getPayload(response)

  if (!isRecord(payload) || typeof payload.removed !== "boolean") {
    throw new Error(
      "The saved-jobs service returned an invalid removal response."
    )
  }

  return payload.removed
}
