import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** "split" puts the icon on the right without a tile; "tiled" puts it top-left in a tile (default). */
  variant?: "split" | "tiled"
  /** Optional growth indicator shown in the top-right corner (admin). */
  delta?: { value: string; positive?: boolean; neutral?: boolean }
  /** Extra trailing icon next to the value (e.g. revenue). */
  trailingIcon?: LucideIcon
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "tiled",
  delta,
  trailingIcon: TrailingIcon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-[#161618] p-5",
        className
      )}
    >
      <div
        className={cn(
          "flex items-start",
          variant === "split" ? "justify-between" : "justify-between gap-3"
        )}
      >
        {variant === "tiled" ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Icon className="size-5 text-white/80" />
          </span>
        ) : null}
        {delta && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              delta.neutral
                ? "text-white/40"
                : delta.positive
                  ? "text-emerald-400"
                  : "text-red-400"
            )}
          >
            {delta.neutral ? (
              <Minus className="size-3" />
            ) : delta.positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {delta.value}
          </span>
        )}
        {variant === "split" ? <Icon className="size-5 text-white/70" /> : null}
      </div>
      <p className="mt-5 text-sm text-white/50">{label}</p>
      <p className="mt-1 flex items-center gap-2 [font-family:var(--font-manrope)] text-3xl font-bold text-white">
        {value}
        {TrailingIcon && (
          <TrailingIcon aria-hidden className="size-5 text-white/20" />
        )}
      </p>
    </div>
  )
}
