import CheckoutSuccessClient from "@/components/checkout-success-client"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  return <CheckoutSuccessClient sessionId={sessionId} />
}
