"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Mail, MessageSquareText } from "lucide-react"
import {
  getRecruiterNotifications,
  type RecruiterApplication,
  type RecruiterNotifications,
} from "@/lib/api/recruiter"

type Panel = "inbox" | "notifications"
type ReadIds = Record<Panel, string[]>

const EMPTY_READ_IDS: ReadIds = { inbox: [], notifications: [] }

function storageKey(userId: string, panel: Panel) {
  return `hireloop:recruiter:${userId}:${panel}:read`
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
}

function applicantsHref(application: RecruiterApplication) {
  return `/dashboard/recruiter/jobs/${encodeURIComponent(application.jobId)}/applicants`
}

function getNotificationIds(data: RecruiterNotifications): string[] {
  const applicationIds = data.applications.map(
    (application) => `application:${application.id}`
  )
  const reviewId = data.companyReview
    ? [`company:${data.companyReview.id}:${data.companyReview.reviewedAt}`]
    : []
  return [...applicationIds, ...reviewId]
}

export function RecruiterInboxActions({ userId }: { userId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<RecruiterNotifications | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [readStateReady, setReadStateReady] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const [readIds, setReadIds] = useState<ReadIds>(EMPTY_READ_IDS)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const inboxIds = JSON.parse(
          window.localStorage.getItem(storageKey(userId, "inbox")) ?? "[]"
        )
        const notificationIds = JSON.parse(
          window.localStorage.getItem(storageKey(userId, "notifications")) ??
            "[]"
        )
        setReadIds({
          inbox: Array.isArray(inboxIds)
            ? inboxIds.filter((id): id is string => typeof id === "string")
            : [],
          notifications: Array.isArray(notificationIds)
            ? notificationIds.filter(
                (id): id is string => typeof id === "string"
              )
            : [],
        })
        setStorageError(null)
      } catch (cause) {
        console.error("Could not read recruiter inbox state:", cause)
        setStorageError("Read status could not be loaded on this device.")
      }
      setReadStateReady(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [userId])

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      try {
        const result = await getRecruiterNotifications()
        if (active) {
          setData(result)
          setLoadError(null)
        }
      } catch (cause) {
        if (!active) return
        console.error("Failed to load recruiter inbox:", cause)
        setLoadError(
          cause instanceof Error
            ? cause.message
            : "Could not load recruiter notifications."
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadNotifications()

    const intervalId = window.setInterval(loadNotifications, 60_000)
    window.addEventListener("focus", loadNotifications)
    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener("focus", loadNotifications)
    }
  }, [retryKey, userId])

  useEffect(() => {
    if (!activePanel) return

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setActivePanel(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActivePanel(null)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [activePanel])

  const applications = data?.applications ?? []
  const notificationIds = data ? getNotificationIds(data) : []
  const unreadInboxCount = readStateReady
    ? applications.filter(
        (application) => !readIds.inbox.includes(application.id)
      ).length
    : 0
  const unreadNotificationCount = readStateReady
    ? notificationIds.filter((id) => !readIds.notifications.includes(id)).length
    : 0

  function togglePanel(panel: Panel) {
    if (!readStateReady) return
    if (activePanel === panel) {
      setActivePanel(null)
      return
    }

    setActivePanel(panel)
    const ids =
      panel === "inbox"
        ? applications.map((application) => application.id)
        : notificationIds
    const nextReadIds = [...new Set([...readIds[panel], ...ids])].slice(-200)
    setReadIds((previous) => ({ ...previous, [panel]: nextReadIds }))
    try {
      window.localStorage.setItem(
        storageKey(userId, panel),
        JSON.stringify(nextReadIds)
      )
      setStorageError(null)
    } catch (cause) {
      console.error("Could not save recruiter inbox read status:", cause)
      setStorageError("Read status could not be saved on this device.")
    }
  }

  function retry() {
    setData(null)
    setLoading(true)
    setLoadError(null)
    setRetryKey((key) => key + 1)
  }

  const companyReview = data?.companyReview
  const notificationItems = [
    ...applications.map((application) => ({
      id: `application:${application.id}`,
      title: `New application from ${application.applicantName || "a candidate"}`,
      description: `For ${application.jobTitle}`,
      createdAt: application.appliedAt,
      href: applicantsHref(application),
    })),
    ...(companyReview
      ? [
          {
            id: `company:${companyReview.id}:${companyReview.reviewedAt}`,
            title: `Company ${companyReview.status.toLowerCase()}`,
            description: "Your company registration was reviewed.",
            createdAt: companyReview.reviewedAt,
            href: "/dashboard/recruiter/company",
          },
        ]
      : []),
  ].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  )

  return (
    <div ref={containerRef} className="relative flex items-center gap-5">
      <button
        type="button"
        aria-label={`Applicant inbox, ${unreadInboxCount} unread applications`}
        aria-expanded={activePanel === "inbox"}
        aria-controls="recruiter-inbox-panel"
        disabled={!readStateReady}
        onClick={() => togglePanel("inbox")}
        className="relative text-white/70 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-50"
      >
        <Mail aria-hidden className="size-5" />
        {unreadInboxCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-2 -right-2 flex min-w-4 items-center justify-center rounded-full bg-hl-primary px-1 text-[10px] leading-4 text-white"
          >
            {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label={`Notifications, ${unreadNotificationCount} unread`}
        aria-expanded={activePanel === "notifications"}
        aria-controls="recruiter-notifications-panel"
        disabled={!readStateReady}
        onClick={() => togglePanel("notifications")}
        className="relative text-white/70 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-50"
      >
        <Bell aria-hidden className="size-5" />
        {unreadNotificationCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-2 -right-2 flex min-w-4 items-center justify-center rounded-full bg-hl-primary px-1 text-[10px] leading-4 text-white"
          >
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {activePanel && (
        <section
          id={
            activePanel === "inbox"
              ? "recruiter-inbox-panel"
              : "recruiter-notifications-panel"
          }
          role="dialog"
          aria-label={
            activePanel === "inbox" ? "Applicant inbox" : "Notifications"
          }
          className="absolute top-full right-0 z-50 mt-4 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#141417] shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {activePanel === "inbox" ? "Applicant inbox" : "Notifications"}
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                {activePanel === "inbox"
                  ? `${applications.length} recent applications`
                  : `${notificationItems.length} recent updates`}
              </p>
            </div>
            {activePanel === "inbox" && (
              <Link
                href="/dashboard/recruiter/applications"
                onClick={() => setActivePanel(null)}
                className="text-xs font-medium text-hl-primary hover:text-hl-primary/80"
              >
                View all
              </Link>
            )}
          </div>

          {storageError && (
            <p
              role="status"
              className="border-b border-amber-500/10 bg-amber-500/5 px-4 py-2 text-xs text-amber-200"
            >
              {storageError}
            </p>
          )}

          {loadError ? (
            <div className="px-4 py-6 text-center">
              <p role="alert" className="text-sm text-red-300">
                {loadError}
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-3 text-xs font-medium text-hl-primary hover:text-hl-primary/80"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <p className="px-4 py-8 text-center text-sm text-white/40">
              Loading…
            </p>
          ) : activePanel === "inbox" ? (
            applications.length ? (
              <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto">
                {applications.map((application) => (
                  <li key={application.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-white">
                      {application.applicantName || "Candidate"} applied to{" "}
                      <span className="text-white/75">
                        {application.jobTitle}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatDate(application.appliedAt)}
                    </p>
                    {application.coverLetter && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">
                        {application.coverLetter}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                      <Link
                        href={applicantsHref(application)}
                        onClick={() => setActivePanel(null)}
                        className="text-xs font-medium text-hl-primary hover:text-hl-primary/80"
                      >
                        Review application
                      </Link>
                      {application.applicantEmail && (
                        <a
                          href={`mailto:${application.applicantEmail}?subject=${encodeURIComponent(`Application for ${application.jobTitle}`)}`}
                          className="text-xs text-white/50 transition-colors hover:text-white"
                        >
                          Reply by email
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <MessageSquareText
                  aria-hidden
                  className="mx-auto size-6 text-white/30"
                />
                <p className="mt-2 text-sm text-white/60">
                  No applications yet
                </p>
                <p className="mt-1 text-xs text-white/35">
                  New candidate applications will appear here.
                </p>
              </div>
            )
          ) : notificationItems.length ? (
            <ul className="max-h-96 divide-y divide-white/5 overflow-y-auto">
              {notificationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setActivePanel(null)}
                    className="block px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[11px] text-white/35">
                      {formatDate(item.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <Bell aria-hidden className="mx-auto size-6 text-white/30" />
              <p className="mt-2 text-sm text-white/60">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-white/35">
                New applications and company updates will appear here.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
