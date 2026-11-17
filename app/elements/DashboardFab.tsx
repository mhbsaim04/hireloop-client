import Link from "next/link"
import { Plus } from "lucide-react"

/** Floating action button, shown on home-like dashboard pages (per Figma). */
export function DashboardFab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed right-8 bottom-8 z-20 flex size-14 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-90"
    >
      <Plus className="size-6" />
    </Link>
  )
}
