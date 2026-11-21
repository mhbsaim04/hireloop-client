export const CHECKOUT_PLANS = {
  seekers: {
    Pro: { amountCents: 1900, plan: "growth" },
    Premium: { amountCents: 3900, plan: "premium" },
  },
  recruiters: {
    Growth: { amountCents: 4900, plan: "growth" },
    Enterprise: { amountCents: 14900, plan: "premium" },
  },
} as const
