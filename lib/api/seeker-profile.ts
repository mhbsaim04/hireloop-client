const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"
const MAX_RESUME_SIZE = 10 * 1024 * 1024

export type ResumeMetadata = {
  fileName: string
  size: number
  updatedAt: string
}

export class SeekerProfileApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message)
    this.name = "SeekerProfileApiError"
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The profile service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Could not update your profile."
    const code =
      isRecord(payload) && typeof payload.code === "string"
        ? payload.code
        : undefined
    throw new SeekerProfileApiError(message, response.status, code)
  }

  return payload
}

function isResumeMetadata(value: unknown): value is ResumeMetadata {
  return (
    isRecord(value) &&
    typeof value.fileName === "string" &&
    typeof value.size === "number" &&
    typeof value.updatedAt === "string"
  )
}

export async function updateSeekerEmail(email: string) {
  const response = await fetch(`${BASE_URL}/profile/email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email }),
  })
  const payload = await readJson(response)

  if (
    !isRecord(payload) ||
    typeof payload.email !== "string" ||
    typeof payload.emailVerified !== "boolean"
  ) {
    throw new Error("The profile service returned an invalid email response.")
  }

  return {
    email: payload.email,
    emailVerified: payload.emailVerified,
    unchanged: payload.unchanged === true,
  }
}

export async function getResumeMetadata(): Promise<ResumeMetadata | null> {
  const response = await fetch(`${BASE_URL}/profile/resume/info`, {
    credentials: "include",
  })
  const payload = await readJson(response)

  if (!isRecord(payload) || !("resume" in payload)) {
    throw new Error("The profile service returned invalid resume details.")
  }
  if (payload.resume === null) return null
  if (!isResumeMetadata(payload.resume)) {
    throw new Error("The profile service returned invalid resume details.")
  }

  return payload.resume
}

export async function uploadResume(file: File): Promise<ResumeMetadata> {
  if (
    !file.name.toLowerCase().endsWith(".pdf") ||
    (file.type && file.type !== "application/pdf")
  ) {
    throw new Error("Choose a PDF file for your resume.")
  }
  if (file.size > MAX_RESUME_SIZE) {
    throw new Error("Resume files must be 10 MB or smaller.")
  }

  const response = await fetch(`${BASE_URL}/profile/resume`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "content-type": "application/pdf",
      "x-file-name": encodeURIComponent(file.name),
    },
    body: file,
  })
  const payload = await readJson(response)

  if (!isResumeMetadata(payload)) {
    throw new Error("The profile service returned invalid resume details.")
  }

  return payload
}

export async function downloadResume(): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/profile/resume`, {
    credentials: "include",
  })
  if (!response.ok) {
    await readJson(response)
    throw new Error("Could not download your resume.")
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/pdf")) {
    throw new Error("The profile service did not return a PDF.")
  }

  return response.blob()
}
