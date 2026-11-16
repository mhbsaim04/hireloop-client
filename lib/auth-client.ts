import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
// Type-only import: gives the client full type inference for server-defined
// user fields (e.g. `role`) without bundling any server code.
import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

// Re-exported convenience hooks/methods (previously a duplicate client;
// now destructured from the single configured instance).
export const { signIn, signUp, useSession } = authClient
