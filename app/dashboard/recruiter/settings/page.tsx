"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  
  Building2,
  Camera,
  KeyRound,
  Loader2,
  Mail,
  User,
} from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"


const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"

const labelClass =
  "mb-2 block [font-family:var(--font-manrope)] text-sm font-medium text-white/70"

export default function RecruiterSettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const user = session?.user

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setEmail(user.email ?? "")
      setAvatar(user.image ?? "")
    }
  }, [user])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError(null)
    try {
      await authClient.updateUser({
        name,
        image: avatar || undefined,
      })
      toast.add({
        title: "Profile updated",
        description: "Your personal information was saved.",
        type: "success",
      })
    } catch (err) {
      console.error("Failed to update profile:", err)
      setProfileError("Failed to update profile. Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in all password fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }
    setSavingPassword(true)
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.add({
        title: "Password updated",
        description: "Your password was changed successfully.",
        type: "success",
      })
    } catch (err) {
      console.error("Failed to change password:", err)
      setPasswordError("Failed to change password. Check your current password.")
    } finally {
      setSavingPassword(false)
    }
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-350">
        <p className="py-12 text-center text-sm text-white/40">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-350">
      <div className="mt-3">
        <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Manage your personal information and company.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal info */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6 lg:col-span-2">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Personal Information
          </h3>

          {profileError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-5 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="size-6 text-white/40" />
                )}
              </span>
              <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                <Camera className="mr-2 inline size-4" />
                Change avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <div className="relative">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-white/30">
                Email cannot be changed here.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6 lg:col-span-2">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Change Password
          </h3>

          {passwordError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-5 flex flex-col gap-5"
          >
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current Password
              </label>
              <div className="relative">
                <KeyRound
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
                />
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="newPassword" className={labelClass}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Company link */}
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-6 lg:col-span-1">
          <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
            Company
          </h3>
          <p className="mt-1 text-sm text-white/50">
            Manage your linked company profile.
          </p>
          <Link
            href="/dashboard/recruiter/company"
            className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 text-sm font-semibold text-orange-500 backdrop-blur-sm transition-opacity hover:opacity-90"
          >
            <Building2 className="size-4" />
            Go to My Company
          </Link>
        </section>
      </div>
    </div>
  )
}
