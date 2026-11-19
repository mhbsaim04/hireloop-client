import { Hero } from "@/components/hero"
import { FeaturedJobs } from "@/components/featured-jobs"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { CtaSection } from "@/components/cta"

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedJobs />
      <Features />
      <Pricing />
      <CtaSection />
    </>
  )
}
