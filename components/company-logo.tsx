"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toDirectImageUrl } from "@/lib/image-url"

export function CompanyLogo({
  src,
  name,
  className,
}: {
  src?: string | null
  name?: string | null
  className?: string
}) {
  const [loadFailed, setLoadFailed] = useState(false)
  const directSrc = toDirectImageUrl(src)
  const showImage = Boolean(directSrc) && !loadFailed
  const initials = getInitials(name)

  return (
    <span
      className={cn(
        "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white select-none",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- company logos are arbitrary user-provided URLs
        <img
          src={directSrc}
          alt={name ? `${name} logo` : "Company logo"}
          referrerPolicy="no-referrer"
          onError={() => setLoadFailed(true)}
          className="size-full object-cover"
        />
      ) : initials ? (
        <span className="[font-family:var(--font-manrope)] text-sm font-semibold text-white/85">
          {initials}
        </span>
      ) : (
        <Building2 className="size-6 text-white/40" aria-hidden />
      )}
    </span>
  )
}

function getInitials(name?: string | null): string {
  if (!name) return ""
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
