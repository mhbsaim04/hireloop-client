# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Stripe billing

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env`. Configure a Stripe
webhook endpoint at `/api/stripe/webhook` for
`checkout.session.completed` and `checkout.session.async_payment_succeeded`.
The webhook records confirmed plan payments and activates the account plan;
the checkout success page also verifies the session with Stripe before showing
success.
