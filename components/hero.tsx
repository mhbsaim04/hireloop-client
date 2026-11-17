import Image from "next/image"
import { Search, MapPin, TrendingUp, UserSearch, Star } from "lucide-react"

const NAVBAR_OFFSET = "pt-[204px]" // 98px pulled-up navbar area + 106px gap to badge (design y=204 abs)

const STATS = [
  { icon: Search, value: "50K", label: "Active Jobs" },
  { icon: TrendingUp, value: "12K", label: "Companies" },
  { icon: UserSearch, value: "2M", label: "Job Seekers" },
  { icon: Star, value: "97%", label: "Satisfaction Rate" },
] as const

const TRENDING = [
  "Product Designer",
  "AI Engineering",
  "Dev-ops Engineer",
] as const

export function Hero() {
  return (
    <section className="relative -mt-24.5 overflow-hidden bg-[#0a0a0f]">
      {/* Globe dome background (1440x1882 asset; dome glow starts ~y750 in the image) */}
      <Image
        src="/images/globe.png"
        alt=""
        width={1440}
        height={1882}
        priority
        aria-hidden
        className="pointer-events-none absolute top-1 left-1/2 z-0 w-360 max-w-none -translate-x-1/2 select-none"
      />
      {/* Faint star particles in the upper sky */}
      <Image
        src="/images/hero-particles.png"
        alt=""
        width={816}
        height={505}
        aria-hidden
        className="pointer-events-none absolute top-[136px] left-1/2 z-0 w-[816px] max-w-none -translate-x-1/2 opacity-60 select-none"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className={NAVBAR_OFFSET}>
          {/* Hero content column (centered) */}
          <div className="relative mx-auto max-w-[784px] text-center">
            {/* Badge */}
            <div className="flex items-center justify-center">
              <span
                aria-hidden
                className="h-px w-16 bg-gradient-to-r from-[#010123] to-[#a8a8a8]"
              />
              <div className="flex h-12 items-center gap-3 rounded-full border border-white/30 bg-gradient-to-b from-[#474747] to-[#010102] px-5 shadow-[inset_0_0_6px_rgba(0,0,0,0.1)]">
                <Image
                  src="/images/badge-briefcase.svg"
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                  className="size-6 select-none"
                />
                <span className="[font-family:var(--font-space-mono)] text-xl whitespace-nowrap text-white uppercase">
                  50,000+ new jobs this month
                </span>
              </div>
              <span
                aria-hidden
                className="h-px w-16 bg-gradient-to-l from-[#010123] to-[#a8a8a8]"
              />
            </div>

            <h1 className="mt-9 [font-family:var(--font-manrope)] text-4xl leading-[1.15] font-bold text-white sm:text-5xl lg:text-[56px]">
              Find Your Dream Job Today
            </h1>
            <p className="mx-auto mt-4 max-w-[784px] [font-family:var(--font-manrope)] text-xl leading-[1.6] text-white/70">
              HireLoop connects top talent with world-class companies. Browse
              thousands of curated opportunities and land your next role —
              faster.
            </p>

            {/* Search bar */}
            <form
              action="/jobs"
              method="GET"
              className="mx-auto mt-12 flex h-16 items-center rounded-2xl border border-white/20 bg-[#101010] p-2"
            >
              <div className="flex h-full min-w-0 flex-1 items-center gap-3 px-4">
                <Search className="size-6 shrink-0 text-white" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, skill or company"
                  className="h-full w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-white/60"
                />
              </div>
              <span
                aria-hidden
                className="mx-2 h-6 w-px shrink-0 bg-white/40"
              />
              <div className="hidden h-full min-w-0 flex-1 items-center gap-3 px-4 sm:flex">
                <MapPin className="size-6 shrink-0 text-white" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location or Remote"
                  className="h-full w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-white/60"
                />
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-hl-primary transition-opacity hover:opacity-90"
              >
                <Search className="size-6 text-white" />
              </button>
            </form>

            {/* Trending chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-base text-white/70">Trending Position</span>
              {TRENDING.map((tag) => (
                <a
                  key={tag}
                  href={`/jobs?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/10 bg-[#1a1a1b] px-3 py-1.5 text-sm text-white transition-colors hover:border-white/25"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>

          {/* Stats band */}
          <div className="relative mt-107 pb-16">
            <p className="mx-auto max-w-150 text-center [font-family:var(--font-manrope)] text-3xl leading-[1.3] tracking-tight text-white/70 sm:text-[40px]">
              Assisting over 15,000 job seekers find their dream positions
            </p>
            <div className="mx-auto mt-12 grid max-w-330 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex h-63.5 flex-col justify-between rounded-2xl border border-white/10 bg-linear-to-b from-[#010102] to-[#313131] p-6"
                >
                  <stat.icon className="size-6 text-white" />
                  <div>
                    <div className="[font-family:var(--font-jakarta)] text-[56px] leading-none font-semibold text-white">
                      {stat.value}
                    </div>
                    <div className="mt-4 [font-family:var(--font-inter-tight)] text-lg text-white">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
