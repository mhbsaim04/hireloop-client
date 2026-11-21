import { CheckoutClient } from "@/components/checkout-client"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams

  const plan = typeof sp.plan === "string" ? sp.plan : undefined
  const audience = typeof sp.audience === "string" ? sp.audience : undefined
  const checkoutError =
    sp.error === "account_type"
      ? "Your signed-in account type does not match this plan. Choose the plan for your account or sign in with the correct account."
      : undefined

  if (sp.canceled) {
    console.log(
      "Order canceled -- continue to choose your desired pricing and check out when you're ready."
    )
  }

  return (
    <CheckoutClient
      plan={plan}
      audience={audience}
      checkoutError={checkoutError}
    />
  )
}
