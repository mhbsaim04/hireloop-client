import { CheckoutClient } from "@/components/checkout-client"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams

  // Optional plan selection, e.g. /checkout?plan=Pro&audience=seekers&price=19
  const plan = typeof sp.plan === "string" ? sp.plan : undefined
  const audience = typeof sp.audience === "string" ? sp.audience : undefined
  const price = typeof sp.price === "string" ? sp.price : undefined

  const { canceled } = await searchParams

  if (canceled) {
    console.log(
      'Order canceled -- continue to shop around and check out when you\'re ready.'
    )
  }

  return <CheckoutClient plan={plan} audience={audience} price={price} />
}
