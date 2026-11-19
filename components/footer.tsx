import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black text-white">
      {/* Main Footer Links & Navigation */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="HireLoop"
                width={154}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm [font-family:var(--font-manrope)] text-sm leading-relaxed text-white/50">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Product Column */}
            <div className="flex flex-col gap-3.5">
              <h3 className="[font-family:var(--font-manrope)] text-sm font-semibold text-hl-primary">
                Job Seekers
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm text-white/60">
                <li>
                  <Link
                    href="/browse-jobs"
                    className="transition-colors hover:text-white"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companies"
                    className="transition-colors hover:text-white"
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#salaries"
                    className="transition-colors hover:text-white"
                  >
                    Salary data
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/seeker"
                    className="transition-colors hover:text-white"
                  >
                    My Applications
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigations Column */}
            <div className="flex flex-col gap-3.5">
              <h3 className="[font-family:var(--font-manrope)] text-sm font-semibold text-hl-primary">
                Employers
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm text-white/60">
                <li>
                  <Link
                    href="/dashboard/recruiter/jobs/new"
                    className="transition-colors hover:text-white"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/recruiter/jobs"
                    className="transition-colors hover:text-white"
                  >
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/recruiter/company"
                    className="transition-colors hover:text-white"
                  >
                    My Company
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col gap-3.5">
              <h3 className="[font-family:var(--font-manrope)] text-sm font-semibold text-hl-primary">
                Company
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm text-white/60">
                <li>
                  <Link
                    href="/#help"
                    className="transition-colors hover:text-white"
                  >
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="transition-colors hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-white"
                  >
                    Terms &amp; Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-white"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Social Icons & Copyright */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 pb-12 sm:flex-row">
          {/* Social Media Links: Facebook, X, LinkedIn (No Pinterest) */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#161618] text-white/70 transition-all hover:border-white/30 hover:bg-[#202024] hover:text-white"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter)"
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#161618] text-white/70 transition-all hover:border-white/30 hover:bg-[#202024] hover:text-white"
            >
              <XIcon className="size-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#161618] text-white/70 transition-all hover:border-white/30 hover:bg-[#202024] hover:text-white"
            >
              <LinkedInIcon className="size-4" />
            </a>
          </div>

          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/40 sm:justify-end">
            <span>© 2026 All Rights Reserved. Hireloop Ltd.</span>
            <div className="flex items-center gap-2">
              <Link
                href="/terms"
                className="transition-colors hover:text-white/70"
              >
                Terms &amp; Policy
              </Link>
              <span>-</span>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white/70"
              >
                Privacy Guideline
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}
