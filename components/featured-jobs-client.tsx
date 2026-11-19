"use client"

import { useState } from "react"
import Link from "next/link"
import { Briefcase, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel"

interface Job {
  _id?: string
  id?: string
  title?: string
  company?: string
  location?: string
  jobType?: string
  minSalary?: string
  maxSalary?: string
  isRemote?: boolean
  createdAt?: string
}

function jobId(j: Job) {
  return j._id ?? j.id ?? ""
}

function tagFor(j: Job) {
  if (!j.createdAt) return "Featured"
  const days = (Date.now() - new Date(j.createdAt).getTime()) / 86400000
  return days <= 3 ? "New" : "Featured"
}

const TAG_STYLES: Record<string, string> = {
  Featured: "border-hl-primary/30 bg-hl-primary/15 text-hl-primary",
  Hot: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  New: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
}

export function FeaturedJobsClient({ jobs }: { jobs: Job[] }) {
  const [api, setApi] = useState<CarouselApi>()

  const items = jobs.slice(0, 10)

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div>
            <div className="flex items-center justify-center gap-2.5">
              <span className="size-1.5 rounded-[1px] bg-[#5c53fe]" aria-hidden="true" />
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

        </div>

        <div className="mt-10">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#141417] px-6 py-16 text-center text-sm text-white/50">
              No featured jobs yet.
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} setApi={setApi}>
              <CarouselContent className="-ml-2">
                {items.map((job) => {
                  const id = jobId(job)
                  return (
                    <CarouselItem key={id} className="pl-2 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <Link
                        href={`/browse-jobs/${id}`}
                        className="group flex h-full flex-col rounded-2xl border border-white/5 bg-[#141417] p-5 transition-colors hover:border-white/15 hover:bg-[#1a1a1f]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                            <Briefcase className="size-5 text-white/60" />
                          </span>
                          <span className={cn("inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-medium", TAG_STYLES[tagFor(job)])}>
                            {tagFor(job)}
                          </span>
                        </div>

                        <h3 className="mt-4 [font-family:var(--font-manrope)] text-base font-semibold text-white group-hover:text-hl-primary">
                          {job.title || "Untitled job"}
                        </h3>
                        <p className="mt-0.5 text-sm text-white/50">{job.company || "—"}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {job.location || "—"}
                          </span>
                          <span>{job.jobType || "—"}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="text-sm font-semibold text-white">
                            {job.minSalary ? `$${job.minSalary}` : "—"}
                            {job.maxSalary ? ` – $${job.maxSalary}` : ""}
                          </span>
                        </div>
                      </Link>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous"
              className="flex size-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 text-orange-500 backdrop-blur-sm transition-colors hover:bg-blue-500/25"
            >
              <ChevronLeft className="size-5" />
            </button>
            <Link
              href="/browse-jobs"
              className="flex h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-5 text-sm font-medium text-orange-500 backdrop-blur-sm transition-colors hover:bg-blue-500/25"
            >
              View all jobs
            </Link>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              aria-label="Next"
              className="flex size-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 text-orange-500 backdrop-blur-sm transition-colors hover:bg-blue-500/25"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
