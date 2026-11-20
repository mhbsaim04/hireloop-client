const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000"

export type PaymentHistoryRecord = {
  id: string
  date: string
  plan: string
  amountCents: number
  transactionId: string
}

function isPaymentHistoryRecord(value: unknown): value is PaymentHistoryRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "date" in value &&
    typeof value.date === "string" &&
    "plan" in value &&
    typeof value.plan === "string" &&
    "amountCents" in value &&
    typeof value.amountCents === "number" &&
    Number.isSafeInteger(value.amountCents) &&
    value.amountCents >= 0 &&
    "transactionId" in value &&
    typeof value.transactionId === "string"
  )
}

async function getPayments(
  path: string,
  accountType: "seeker" | "recruiter"
): Promise<PaymentHistoryRecord[]> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
  })
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `The billing service returned ${response.status} ${contentType || "no content-type"} instead of JSON. ` +
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
        : `Could not load your ${accountType} payment history.`
    throw new Error(message)
  }

  if (!Array.isArray(payload) || !payload.every(isPaymentHistoryRecord)) {
    throw new Error("The billing service returned invalid payment history.")
  }

  return payload
}

export async function getPaymentHistory(): Promise<PaymentHistoryRecord[]> {
  return getPayments("/billing/payments", "seeker")
}

export async function getRecruiterPaymentHistory(): Promise<
  PaymentHistoryRecord[]
> {
  return getPayments("/recruiter/billing/payments", "recruiter")
}
