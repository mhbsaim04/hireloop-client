"use client"

import { useState } from "react"
import { UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { toDirectImageUrl } from "@/lib/image-url"

type AvatarSize = "sm" | "md" | "lg" | "xl"

const SIZE_STYLES: Record<AvatarSize, { box: string; text: string; icon: string }> = {
  sm: { box: "size-8", text: "text-xs font-semibold", icon: "size-4" },
  md: { box: "size-10", text: "text-sm font-semibold", icon: "size-5" },
  lg: { box: "size-12", text: "text-base font-semibold", icon: "size-6" },
  xl: { box: "size-20", text: "text-2xl font-bold", icon: "size-10" },
}

export function UserAvatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}) {
  const [loadFailed, setLoadFailed] = useState(false)
  const directSrc = toDirectImageUrl(src)
  const showImage = directSrc && !loadFailed

  const initials = getInitials(name)
  const styles = SIZE_STYLES[size]

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#161618] text-white select-none",
        styles.box,
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- handles arbitrary user image URLs and Drive thumbnails
        <img
          src={directSrc}
          alt={name ? `${name}'s avatar` : "User avatar"}
          referrerPolicy="no-referrer"
          onError={() => setLoadFailed(true)}
          className="size-full object-cover"
        />
      ) : initials ? (
        <span className={cn(styles.text, "text-white/90 [font-family:var(--font-manrope)]")}>
          {initials}
        </span>
      ) : (
        <UserRound className={cn(styles.icon, "text-white/40")} />
      )}
    </div>
  )
}

function getInitials(name?: string | null): string {
  if (!name) return ""
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
