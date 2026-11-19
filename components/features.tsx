import {
  BarChart3,
  Bookmark,
  Hexagon,
  LineChart,
  MousePointerClick,
  Search,
  TrendingUp,
} from "lucide-react"

type FeatureItem = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function ResumeBuilderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <circle cx="12" cy="9" r="2" />
      <path d="M9 13.5c0-1.2 1.3-1.8 3-1.8s3 .6 3 1.8" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="9" y1="18.5" x2="13" y2="18.5" />
    </svg>
  )
}

const FEATURES: FeatureItem[] = [
  {
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
    icon: Search,
  },
  {
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
    icon: LineChart,
  },
  {
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
    icon: BarChart3,
  },
  {
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
    icon: Bookmark,
  },
  {
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
    icon: MousePointerClick,
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
    icon: ResumeBuilderIcon,
  },
  {
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: Hexagon,
  },
  {
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
    icon: TrendingUp,
  },
]

export function Features() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="size-1.5 rounded-[1px] bg-[#5c53fe]"
              aria-hidden="true"
            />
            <span className="[font-family:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
             several key features of the browse job section
            </span>
            <span
              className="size-1.5 rounded-[1px] bg-[#5c53fe]"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.15]">
            Everything you need
            <br />
            to succeed
          </h2>
        </div>

        {/* 8 Features Grid (4 cols on desktop, 2 on tablet, 1 on mobile) */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="group flex items-start gap-4">
                {/* Icon Box */}
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#121216] transition-all duration-200 group-hover:border-white/25 group-hover:bg-[#18181f] group-hover:shadow-[0_0_20px_rgba(240,171,252,0.12)]">
                  <Icon
                    className="size-6 text-[#f0abfc] transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col">
                  <h3 className="[font-family:var(--font-manrope)] text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 [font-family:var(--font-manrope)] text-sm leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
