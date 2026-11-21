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

export type CheckoutVerification = {
  success: true
  role: "seeker" | "recruiter"
  planName: string
  planActivated: boolean
  transactionId: string
}

const pendingCheckoutVerifications = new Map<
  string,
  Promise<CheckoutVerification>
>()

export function verifyCheckoutPayment(
  sessionId: string
): Promise<CheckoutVerification> {
  const pendingVerification = pendingCheckoutVerifications.get(sessionId)
  if (pendingVerification) return pendingVerification

  const verification = fetch(`${BASE_URL}/payments/checkout-verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
    signal: AbortSignal.timeout(30_000),
  })
    .then(async (response) => {
      const payload: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Could not verify your payment."
        throw new Error(message)
      }

      if (
        typeof payload !== "object" ||
        payload === null ||
        !("success" in payload) ||
        payload.success !== true ||
        !("role" in payload) ||
        (payload.role !== "seeker" && payload.role !== "recruiter") ||
        !("planName" in payload) ||
        typeof payload.planName !== "string" ||
        !("planActivated" in payload) ||
        typeof payload.planActivated !== "boolean" ||
        !("transactionId" in payload) ||
        typeof payload.transactionId !== "string"
      ) {
        throw new Error("The payment service returned an invalid response.")
      }

      return payload as CheckoutVerification
    })
    .finally(() => {
      pendingCheckoutVerifications.delete(sessionId)
    })

  pendingCheckoutVerifications.set(sessionId, verification)
  return verification
}
