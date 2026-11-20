import type { CompanyForm } from "@/app/dashboard/recruiter/company/page"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type CompanyRecord = CompanyForm & {
  id: string
  _id?: string
  status?: string
  createdAt?: string
}

async function parseJson(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await res.text()
    throw new Error(
      `API at ${res.url} returned ${res.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }
  const payload = await res.json()
  if (!res.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Could not update company details."
    )
  }
  return payload
}

export const getCompanies = async () => {
  const res = await fetch(`${BASE_URL}/companies`)
  return parseJson(res)
}

export async function getMyCompany(): Promise<CompanyRecord | null> {
  const res = await fetch(`${BASE_URL}/recruiter/company`, {
    credentials: "include",
  })
  const payload = await parseJson(res)

  if (!payload || typeof payload !== "object" || !("company" in payload)) {
    throw new Error("The company service returned invalid company details.")
  }
  if (payload.company === null) return null

  const company = payload.company
  if (
    !company ||
    typeof company !== "object" ||
    typeof company.id !== "string" ||
    typeof company.name !== "string" ||
    typeof company.industry !== "string" ||
    typeof company.website !== "string" ||
    typeof company.location !== "string" ||
    typeof company.employeeCount !== "string" ||
    typeof company.logo !== "string" ||
    typeof company.description !== "string"
  ) {
    throw new Error("The company service returned invalid company details.")
  }

  return company as CompanyRecord
}

export const getCompany = async (id: string) => {
  const res = await fetch(`${BASE_URL}/companies/${encodeURIComponent(id)}`)
  return parseJson(res)
}

export const createCompany = async (data: CompanyForm) => {
  const res = await fetch(`${BASE_URL}/companies`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}

export const updateCompany = async (id: string, data: CompanyForm) => {
  const res = await fetch(`${BASE_URL}/companies/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}
