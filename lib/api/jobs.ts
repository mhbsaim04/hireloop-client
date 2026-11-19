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

export const getJobs = async (params?: Record<string, string | number>) => {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : ""
  const res = await fetch(`${BASE_URL}/jobs${qs}`)
  return parseJson(res)
}

export const getJob = async (id: string) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`)
  return parseJson(res)
}

export const deleteJob = async (id: string) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: "DELETE" })
  return parseJson(res)
}
