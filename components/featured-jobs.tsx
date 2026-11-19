import Link from "next/link"
import { Briefcase, MapPin, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const FEATURED = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "HireLoop",
    location: "Remote",
    type: "Full-time",
    salary: "$80k – $120k",
    tag: "Featured",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Stripe",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$90k – $130k",
    tag: "Hot",
  },
  {
    id: "3",
    title: "Backend Engineer",
    company: "Vercel",
    location: "Remote",
    type: "Contract",
    salary: "$70 – $90 / hr",
    tag: "New",
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "OpenAI",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$130k – $180k",
    tag: "Featured",
  },
]

const TAG_STYLES: Record<string, string> = {
  Featured: "border-hl-primary/30 bg-hl-primary/15 text-hl-primary",
  Hot: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  New: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
}

export function FeaturedJobs() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="size-1.5 rounded-[1px] bg-[#5c53fe]"
                aria-hidden="true"
              />
              <span className="[font-family:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
                Featured Jobs
              </span>
            </div>
            <h2 className="mt-3 [font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hand-picked opportunities
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Curated listings from top companies hiring right now.
            </p>
          </div>
          <Link
            href="/browse-jobs"
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            View all jobs
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((job) => (
            <Link
              key={job.id}
              href={`/browse-jobs/${job.id}`}
              className="group flex flex-col rounded-2xl border border-white/5 bg-[#141417] p-5 transition-colors hover:border-white/15 hover:bg-[#1a1a1f]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Briefcase className="size-5 text-white/60" />
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-medium",
                    TAG_STYLES[job.tag]
                  )}
                >
                  {job.tag}
                </span>
              </div>

              <h3 className="mt-4 [font-family:var(--font-manrope)] text-base font-semibold text-white group-hover:text-hl-primary">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm text-white/50">{job.company}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {job.location}
                </span>
                <span>{job.type}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-sm font-semibold text-white">
                  {job.salary}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Star className="size-3 text-amber-400" />
                  4.8
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


