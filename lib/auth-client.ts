import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

// Re-exported convenience hooks/methods (previously a duplicate client;
// now destructured from the single configured instance).
export const { signIn, signUp, useSession } = authClient
