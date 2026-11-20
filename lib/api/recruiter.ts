const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type RecruiterApplicationStatus =
  "Applied" | "Under Review" | "Shortlisted" | "Rejected" | "Offered"

export type RecruiterJob = {
  id: string
  _id?: string
  title: string
  company: string
  category?: string
  jobType?: string
  isRemote?: boolean
  location?: string
  deadline?: string
  minSalary?: string
  maxSalary?: string
  frequency?: string
  responsibilities?: string
  requirements?: string
  status?: string
  createdAt?: string
  applicants: number
}

export type RecruiterApplication = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  applicantName: string
  applicantEmail: string
  status: RecruiterApplicationStatus
  appliedAt: string
  coverLetter?: string
}

export type RecruiterDashboard = {
  stats: {
    totalJobPosts: number
    totalApplicants: number
    activeJobs: number
    jobsClosed: number
  }
  recentApplications: RecruiterApplication[]
}

export type RecruiterCompanyReview = {
  id: string
  status: "Approved" | "Rejected"
  reviewedAt: string
}

export type RecruiterNotifications = {
  applications: RecruiterApplication[]
  companyReview: RecruiterCompanyReview | null
}

export type RecruiterJobApplications = {
  job: {
    id: string
    title: string
    company: string
  }
  applications: RecruiterApplication[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isRecruiterJob(value: unknown): value is RecruiterJob {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.applicants === "number"
  )
}

function isRecruiterApplication(value: unknown): value is RecruiterApplication {
  const statuses: RecruiterApplicationStatus[] = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Rejected",
    "Offered",
  ]

  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.jobId === "string" &&
    typeof value.jobTitle === "string" &&
    typeof value.company === "string" &&
    typeof value.applicantName === "string" &&
    typeof value.applicantEmail === "string" &&
    typeof value.status === "string" &&
    statuses.some((status) => status === value.status) &&
    typeof value.appliedAt === "string" &&
    (!("coverLetter" in value) || typeof value.coverLetter === "string")
  )
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
  })
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The recruiter service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }

  const payload: unknown = await response.json()
  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Could not load recruiter data."
    throw new Error(message)
  }

  return payload
}

export async function getRecruiterJobs(): Promise<RecruiterJob[]> {
  const payload = await requestJson("/recruiter/jobs")
  if (!Array.isArray(payload) || !payload.every(isRecruiterJob)) {
    throw new Error("The recruiter service returned an invalid job list.")
  }
  return payload
}

export async function getRecruiterDashboard(): Promise<RecruiterDashboard> {
  const payload = await requestJson("/recruiter/dashboard")
  if (
    !isRecord(payload) ||
    !isRecord(payload.stats) ||
    typeof payload.stats.totalJobPosts !== "number" ||
    typeof payload.stats.totalApplicants !== "number" ||
    typeof payload.stats.activeJobs !== "number" ||
    typeof payload.stats.jobsClosed !== "number" ||
    !Array.isArray(payload.recentApplications) ||
    !payload.recentApplications.every(isRecruiterApplication)
  ) {
    throw new Error("The recruiter service returned invalid dashboard data.")
  }

  return payload as RecruiterDashboard
}

export async function getRecruiterNotifications(): Promise<RecruiterNotifications> {
  const payload = await requestJson("/recruiter/notifications")
  const companyReview = isRecord(payload) ? payload.companyReview : undefined
  const validCompanyReview =
    companyReview === null ||
    (isRecord(companyReview) &&
      typeof companyReview.id === "string" &&
      (companyReview.status === "Approved" ||
        companyReview.status === "Rejected") &&
      typeof companyReview.reviewedAt === "string")

  if (
    !isRecord(payload) ||
    !Array.isArray(payload.applications) ||
    !payload.applications.every(isRecruiterApplication) ||
    !validCompanyReview
  ) {
    throw new Error("The recruiter service returned invalid notifications.")
  }

  return payload as RecruiterNotifications
}

export async function getRecruiterJobApplications(
  jobId: string
): Promise<RecruiterJobApplications> {
  const payload = await requestJson(
    `/recruiter/jobs/${encodeURIComponent(jobId)}/applications`
  )
  if (
    !isRecord(payload) ||
    !isRecord(payload.job) ||
    typeof payload.job.id !== "string" ||
    typeof payload.job.title !== "string" ||
    typeof payload.job.company !== "string" ||
    !Array.isArray(payload.applications) ||
    !payload.applications.every(isRecruiterApplication)
  ) {
    throw new Error("The recruiter service returned invalid application data.")
  }

  return payload as RecruiterJobApplications
}

export async function updateRecruiterApplicationStatus(
  jobId: string,
  applicationId: string,
  status: RecruiterApplicationStatus
): Promise<void> {
  await requestJson(
    `/recruiter/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    }
  )
}
