"use client"

import { useRouter } from "next/navigation"
import {
  AuthForm,
  type AuthValues,
  type SubmitResult,
} from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  const router = useRouter()

  async function handleSignIn(values: AuthValues): Promise<SubmitResult> {
    const requestedCallback = new URLSearchParams(window.location.search).get(
      "callbackURL"
    )
    const callback = requestedCallback
      ? new URL(requestedCallback, window.location.origin)
      : null
    const callbackURL =
      callback?.origin === window.location.origin
        ? `${callback.pathname}${callback.search}${callback.hash}`
        : "/"

    const { error } = await authClient.signIn.email({
      email: values.email, // required
      password: values.password, // required
      callbackURL,
    })
    if (error) {
      return {
        error:
          error.status === 401
            ? "Invalid email or password"
            : (error.message ?? "Could not sign you in"),
      }
    }
    // TODO: redirect to the role dashboard once /dashboard routes exist
    router.push(callbackURL)
  }

  return <AuthForm mode="sign-in" onSubmit={handleSignIn} />
}
