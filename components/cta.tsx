import Image from "next/image"
import Link from "next/link"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-black pt-28 pb-20 text-white sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36">
      {/* Blue Wireframe Dome Background */}
      <Image
        src="/images/cta-bg.png"
        alt=""
        width={1440}
        height={964}
        priority={false}
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 z-0 w-[1440px] max-w-none -translate-x-1/2 object-contain object-top select-none"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="[font-family:var(--font-manrope)] text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.15]">
          Your next role is
          <br />
          already looking for you
        </h2>
        <p className="mx-auto mt-5 max-w-2xl [font-family:var(--font-manrope)] text-base text-white/70 sm:text-lg">
          Build a profile in three minutes. The matches start arriving tomorrow
          morning.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="flex h-13 items-center justify-center rounded-xl bg-white px-7 [font-family:var(--font-manrope)] text-base font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-opacity hover:opacity-90"
          >
            Create a free account
          </Link>
          <Link
            href="/pricing"
            className="flex h-13 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 [font-family:var(--font-manrope)] text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
