"use client"

import { useRouter } from "next/navigation"
import { AuthForm, type AuthValues, type SubmitResult } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { toDirectImageUrl } from "@/lib/image-url"

export default function SignUpPage() {
  const router = useRouter()

  async function handleSignUp(values: AuthValues): Promise<SubmitResult> {
    const image = toDirectImageUrl(values.imageUrl)
    const { error } = await authClient.signUp.email({
      name: values.name ?? "", // required
      email: values.email, // required
      password: values.password, // required, min 8 chars
      image: image || undefined, // optional profile image URL (Drive links converted)
      callbackURL: "/",
    })
    if (error) {
      return { error: error.message ?? "Could not create your account" }
    }
    // better-auth signs the user in on email sign-up; go to the home page.
    router.push("/")
  }

  return <AuthForm mode="sign-up" onSubmit={handleSignUp} />
}
