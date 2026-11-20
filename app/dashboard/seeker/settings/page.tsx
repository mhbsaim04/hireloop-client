"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronRight,
  Download,
  FileText,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "@/components/ui/toast"
import {
  getResumeMetadata,
  downloadResume,
  updateSeekerEmail,
  uploadResume,
  type ResumeMetadata,
} from "@/lib/api/seeker-profile"
import { authClient, useSession } from "@/lib/auth-client"
import { toDirectImageUrl } from "@/lib/image-url"
import { cn } from "@/lib/utils"

type SeekerUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"]

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"

const labelClass =
  "mb-2 block [font-family:var(--font-manrope)] text-sm font-medium text-white/70"

const MAX_RESUME_SIZE = 10 * 1024 * 1024

function formatFileSize(size: number) {
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`
}

export default function SeekerSettingsPage() {
  const { data: session, isPending } = useSession()
  const user = session?.user

  if (isPending) {
    return (
      <div className="mx-auto max-w-350">
        <p className="py-12 text-center text-sm text-white/40">
          Loading your settings…
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <UserRound className="size-8 text-white/45" />
        <h1 className="mt-4 text-xl font-bold text-white">
          Sign in to manage your settings
        </h1>
        <Link
          href="/sign-in?callbackURL=%2Fdashboard%2Fseeker%2Fsettings"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (user.role && user.role !== "seeker") {
    return (
      <div className="mx-auto max-w-350 rounded-2xl border border-white/5 bg-[#141417] p-8 text-center">
        <h1 className="text-xl font-bold text-white">Seeker settings</h1>
        <p className="mt-2 text-sm text-white/50">
          This settings page is only available to seeker accounts.
        </p>
      </div>
    )
  }

  return <SeekerSettingsForm key={user.id} user={user} />
}

function SeekerSettingsForm({ user }: { user: SeekerUser }) {
  const router = useRouter()

  const [name, setName] = useState(user.name ?? "")
  const [email, setEmail] = useState(user.email ?? "")
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? "")
  const [headline, setHeadline] = useState(user.headline ?? "")
  const [bio, setBio] = useState(user.bio ?? "")
  const [skills, setSkills] = useState<string[]>(user.skills ?? [])
  const [skillDraft, setSkillDraft] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState(user.email ?? "")
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailNotice, setEmailNotice] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [resume, setResume] = useState<ResumeMetadata | null>(null)
  const [resumeLoading, setResumeLoading] = useState(true)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [downloadingResume, setDownloadingResume] = useState(false)

  useEffect(() => {
    let active = true
    getResumeMetadata()
      .then((metadata) => {
        if (active) setResume(metadata)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setResumeError(
          cause instanceof Error
            ? cause.message
            : "Could not load your resume details."
        )
      })
      .finally(() => {
        if (active) setResumeLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.id])

  function addSkill() {
    const skill = skillDraft.trim()
    if (
      !skill ||
      skills.some((item) => item.toLowerCase() === skill.toLowerCase())
    ) {
      return
    }
    setSkills((current) => [...current, skill])
    setSkillDraft("")
  }

  function handleSkillKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      addSkill()
    }
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setProfileError("Enter your name.")
      return
    }

    setSavingProfile(true)
    setProfileError(null)

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: avatarUrl.trim() ? toDirectImageUrl(avatarUrl.trim()) : null,
        headline: headline.trim(),
        bio: bio.trim(),
        skills,
      })
      if (error) throw new Error(error.message)

      toast.add({
        title: "Profile updated",
        description: "Your profile information has been saved.",
        type: "success",
      })
    } catch (cause) {
      console.error("Failed to update seeker profile:", cause)
      setProfileError(
        cause instanceof Error
          ? cause.message
          : "Could not save your profile. Please try again."
      )
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingEmail(true)
    setEmailError(null)
    setEmailNotice(null)

    try {
      const result = await updateSeekerEmail(newEmail.trim())
      setEmail(result.email)

      if (
        result.unchanged ||
        result.email.toLowerCase() === user.email.toLowerCase()
      ) {
        setNewEmail(result.email)
        setEmailNotice("This is already your current email address.")
        return
      }

      setEmailNotice(
        "Your email was updated immediately and is now unverified. Sign in again with your new address."
      )

      try {
        const { error } = await authClient.signOut()
        if (error) {
          console.error("Email updated, but sign-out failed:", error)
          return
        }
        router.replace("/sign-in")
        router.refresh()
      } catch (cause) {
        console.error("Email updated, but sign-out failed:", cause)
      }
    } catch (cause) {
      console.error("Failed to update seeker email:", cause)
      setEmailError(
        cause instanceof Error
          ? cause.message
          : "Could not update your email. Please try again."
      )
    } finally {
      setSavingEmail(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all password fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.")
      return
    }

    setSavingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (error) throw new Error(error.message)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.add({
        title: "Password updated",
        description: "Your password was changed successfully.",
        type: "success",
      })
    } catch (cause) {
      console.error("Failed to change seeker password:", cause)
      setPasswordError(
        cause instanceof Error
          ? cause.message
          : "Could not change your password. Check your current password."
      )
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleResumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    setResumeError(null)
    if (
      !file.name.toLowerCase().endsWith(".pdf") ||
      (file.type && file.type !== "application/pdf")
    ) {
      setResumeError("Choose a PDF file.")
      input.value = ""
      return
    }
    if (file.size > MAX_RESUME_SIZE) {
      setResumeError("Resume files must be 10 MB or smaller.")
      input.value = ""
      return
    }

    setUploadingResume(true)
    try {
      const metadata = await uploadResume(file)
      setResume(metadata)
      toast.add({
        title: "Resume uploaded",
        description: `${metadata.fileName} is ready to use.`,
        type: "success",
      })
    } catch (cause) {
      setResumeError(
        cause instanceof Error
          ? cause.message
          : "Could not upload your resume. Please try again."
      )
    } finally {
      setUploadingResume(false)
      input.value = ""
    }
  }

  async function handleResumeDownload() {
    if (!resume) return
    setDownloadingResume(true)
    setResumeError(null)

    try {
      const blob = await downloadResume()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = resume.fileName
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (cause) {
      setResumeError(
        cause instanceof Error
          ? cause.message
          : "Could not download your resume. Please try again."
      )
    } finally {
      setDownloadingResume(false)
    }
  }

  return (
    <div className="mx-auto max-w-350">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/dashboard/seeker"
          className="font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
        >
          Dashboard
        </Link>
        <ChevronRight aria-hidden className="size-3.5 text-white/25" />
        <span className="font-medium text-white">Settings</span>
      </nav>

      <div className="mt-3">
        <h1 className="[font-family:var(--font-manrope)] text-2xl font-bold text-white">
          Seeker Settings
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Keep your account and professional profile up to date.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6 lg:col-span-2">
          <div>
            <h2 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
              Personal and professional profile
            </h2>
            <p className="mt-1 text-sm text-white/45">
              This information helps recruiters understand your experience.
            </p>
          </div>

          {profileError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {profileError}
            </p>
          )}

          <form
            onSubmit={handleProfileSubmit}
            className="mt-5 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <UserAvatar
                key={avatarUrl}
                src={avatarUrl ? toDirectImageUrl(avatarUrl) : null}
                name={name}
                size="xl"
                className="ring-2 ring-hl-primary/20"
              />
              <div className="min-w-0 flex-1">
                <label htmlFor="avatarUrl" className={labelClass}>
                  Avatar or photo URL
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-white/35">
                  Paste a public image URL. Leave empty to remove your photo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="headline" className={labelClass}>
                  Professional headline
                </label>
                <input
                  id="headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Frontend Engineer"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="skills" className={labelClass}>
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  id="skills"
                  value={skillDraft}
                  onChange={(event) => setSkillDraft(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  maxLength={40}
                  placeholder="Add a skill, then press Enter"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!skillDraft.trim()}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-hl-primary/30 bg-hl-primary/15 px-3 text-sm font-medium text-hl-primary transition-colors hover:bg-hl-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus aria-hidden className="size-4" />
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Skills">
                  {skills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1 pr-1.5 pl-2.5 text-xs font-medium text-white/75"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setSkills((current) =>
                            current.filter((item) => item !== skill)
                          )
                        }
                        aria-label={`Remove ${skill}`}
                        className="flex size-5 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <X aria-hidden className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-white/35">
                  Add the skills you want recruiters to find you for.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className={labelClass}>
                Professional bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Share a short introduction, your experience, and what you are looking for."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#161618] px-4 py-3 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:border-hl-primary/60"
              />
              <p className="mt-1 text-right text-xs text-white/35">
                {bio.length}/1000
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check aria-hidden className="size-4" />
                    Save profile
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FileText aria-hidden className="size-5 text-hl-primary" />
            <h2 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
              Resume
            </h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-white/45">
            Upload a PDF resume for recruiters to review. Maximum file size is
            10 MB.
          </p>

          {resumeError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {resumeError}
            </p>
          )}

          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            {resumeLoading ? (
              <div className="animate-pulse">
                <div className="h-4 w-36 rounded bg-white/[0.07]" />
                <div className="mt-2 h-3 w-24 rounded bg-white/[0.05]" />
              </div>
            ) : resumeError ? (
              <p className="py-2 text-center text-sm text-white/55">
                Resume details are unavailable right now.
              </p>
            ) : resume ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-hl-primary/15 text-hl-primary">
                    <FileText aria-hidden className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {resume.fileName}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatFileSize(resume.size)} · Updated{" "}
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResumeDownload}
                  disabled={downloadingResume}
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 disabled:opacity-50"
                >
                  {downloadingResume ? (
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <Download aria-hidden className="size-4" />
                  )}
                  {downloadingResume ? "Preparing…" : "Download current resume"}
                </button>
              </>
            ) : (
              <div className="py-2 text-center">
                <FileText
                  aria-hidden
                  className="mx-auto size-7 text-white/30"
                />
                <p className="mt-2 text-sm font-medium text-white/75">
                  No resume uploaded
                </p>
                <p className="mt-1 text-xs text-white/40">PDF files only</p>
              </div>
            )}
          </div>

          <label
            className={cn(
              "mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-hl-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-hl-primary/90",
              (uploadingResume || resumeLoading) &&
                "pointer-events-none opacity-50"
            )}
          >
            {uploadingResume ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Upload aria-hidden className="size-4" />
            )}
            {uploadingResume
              ? "Uploading…"
              : resume
                ? "Replace resume"
                : "Upload PDF resume"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={uploadingResume || resumeLoading}
              onChange={handleResumeChange}
            />
          </label>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Mail aria-hidden className="size-5 text-hl-primary" />
            <h2 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
              Email address
            </h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-white/45">
            Your new address takes effect immediately and will be marked
            unverified.
          </p>

          {emailError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {emailError}
            </p>
          )}
          {emailNotice && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
            >
              {emailNotice}
            </p>
          )}

          <form
            onSubmit={handleEmailSubmit}
            className="mt-5 flex flex-col gap-4"
          >
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className={`${inputClass} text-white/45`}
              />
            </div>
            <div>
              <label htmlFor="newEmail" className={labelClass}>
                New email address
              </label>
              <input
                id="newEmail"
                type="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={
                savingEmail ||
                newEmail.trim().toLowerCase() === email.toLowerCase()
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingEmail && (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              )}
              {savingEmail ? "Updating…" : "Update email"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#141417] p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <KeyRound aria-hidden className="size-5 text-hl-primary" />
            <h2 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
              Change password
            </h2>
          </div>
          <p className="mt-1 text-sm text-white/45">
            Choose a strong password with at least 8 characters.
          </p>

          {passwordError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {passwordError}
            </p>
          )}

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-5 flex flex-col gap-4"
          >
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="newPassword" className={labelClass}>
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPassword && (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                )}
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
