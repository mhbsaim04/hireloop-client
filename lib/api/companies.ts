import type { CompanyForm } from "@/app/dashboard/recruiter/company/page"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

async function parseJson(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await res.text()
    throw new Error(
      `API at ${res.url} returned ${res.status} ${contentType || "no content-type"} instead of JSON. ` +
        `Response: ${body.slice(0, 120)}`
    )
  }
  return res.json()
}

export const getCompanies = async () => {
  const res = await fetch(`${BASE_URL}/companies`)
  return parseJson(res)
}

export const getCompany = async (id: string) => {
  const res = await fetch(`${BASE_URL}/companies/${id}`)
  return parseJson(res)
}

export const createCompany = async (data: CompanyForm) => {
  const res = await fetch(`${BASE_URL}/companies`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}

export const updateCompany = async (id: string, data: CompanyForm) => {
  const res = await fetch(`${BASE_URL}/companies/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson(res)
}
