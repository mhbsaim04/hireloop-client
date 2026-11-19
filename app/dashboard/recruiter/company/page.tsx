"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Globe,
  ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Users,
} from "lucide-react"
import { createCompany, getCompanies, updateCompany } from "@/lib/api/companies"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export interface CompanyForm {
  name: string
  industry: string
  website: string
  location: string
  employeeCount: string
  logo: string
  description: string
}

const INITIAL_FORM: CompanyForm = {
  name: "",
  industry: "",
  website: "",
  location: "",
  employeeCount: "",
  logo: "",
  description: "",
}

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Other",
]

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]

type CompanyRecord = CompanyForm & {
  _id?: string
  id?: string
  status?: string
  createdAt?: string
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-400",
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-[#161618] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-hl-primary/60"

const labelClass =
  "mb-2 block [font-family:var(--font-manrope)] text-sm font-medium text-white/70"

export default function MyCompanyPage() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<CompanyForm>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCompanies()
      .then((data) => {
        const list: CompanyRecord[] = Array.isArray(data)
          ? data
          : (data?.companies ?? [])
        setCompany(list.length ? list[0] : null)
      })
      .catch((err) => {
        console.error("Failed to load company:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  function startEdit() {
    if (company) {
      setForm({
        name: company.name ?? "",
        industry: company.industry ?? "",
        website: company.website ?? "",
        location: company.location ?? "",
        employeeCount: company.employeeCount ?? "",
        logo: company.logo ?? "",
        description: company.description ?? "",
      })
    } else {
      setForm(INITIAL_FORM)
    }
    setEditing(true)
    setError(null)
  }

  function cancelEdit() {
    setEditing(false)
    setError(null)
  }

  function setField(key: keyof CompanyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setField("logo", String(reader.result))
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const id = company?._id ?? company?.id
      const result = id
        ? await updateCompany(id, form)
        : await createCompany(form)
      setCompany(result)
      setEditing(false)
      toast.add({
        title: id ? "Company updated" : "Company registered",
        description: id
          ? "Your company details were updated and sent for review."
          : "Your company was registered and is pending admin approval.",
        type: "success",
      })
    } catch (err) {
      console.error("Failed to save company:", err)
      setError("Failed to save company. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-350">
        <p className="py-12 text-center text-sm text-white/40">
          Loading company...
        </p>
      </div>
    )
  }

  // No company registered and not editing -> prompt
  if (!company && !editing) {
    return (
      <div className="mx-auto max-w-350">
        <div className="mt-3">
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            My Company
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Register your company to start posting jobs.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#141417] px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Building2 className="size-6 text-white/50" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-white">
            No company registered yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-white/40">
            Register your company to start posting jobs. Your company will be
            reviewed by an admin before appearing publicly.
          </p>
          <button
            type="button"
            onClick={startEdit}
            className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-hl-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Register Company
          </button>
        </div>
      </div>
    )
  }

  // Edit / Register form
  if (editing) {
    return (
      <div className="mx-auto max-w-350">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
              {company ? "Edit Company" : "Register Company"}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Fill in your company details. Status will be set to Pending for
              admin review.
            </p>
          </div>
          <button
            type="button"
            onClick={cancelEdit}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Cancel
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <section className="rounded-2xl border border-white/5 bg-[#141417] p-6">
            <h3 className="[font-family:var(--font-manrope)] text-lg font-bold text-white">
              Company Information
            </h3>
            <div className="mt-5 flex flex-col gap-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Company Name <span className="text-white">*</span>
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Acme Inc."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="industry" className={labelClass}>
                    Industry / Category <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="industry"
                      required
                      value={form.industry}
                      onChange={(e) => setField("industry", e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className={labelClass}>
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
                    />
                    <input
                      id="website"
                      type="url"
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                      placeholder="https://example.com"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className={labelClass}>
                    Location <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
                    />
                    <input
                      id="location"
                      required
                      value={form.location}
                      onChange={(e) => setField("location", e.target.value)}
                      placeholder="San Francisco, CA"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="employeeCount" className={labelClass}>
                    Employee Count Range
                  </label>
                  <div className="relative">
                    <Users
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
                    />
                    <select
                      id="employeeCount"
                      value={form.employeeCount}
                      onChange={(e) =>
                        setField("employeeCount", e.target.value)
                      }
                      className={`${inputClass} appearance-none pl-10 pr-10`}
                    >
                      <option value="">Select range</option>
                      {EMPLOYEE_RANGES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="logo" className={labelClass}>
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {form.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logo}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-6 text-white/40" />
                    )}
                  </span>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-hl-primary/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-hl-primary hover:file:bg-hl-primary/25"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Short Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Tell us about your company..."
                  className={`${inputClass} h-auto resize-y py-3`}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end pb-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : company ? (
                "Save Changes"
              ) : (
                "Register Company"
              )}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Company registered -> show details
  const status = company?.status || "Pending"
  return (
    <div className="mx-auto max-w-350">
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="[font-family:var(--font-manrope)] text-xl font-bold text-white">
            My Company
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Your company details and approval status.
          </p>
        </div>
        <button
          type="button"
          onClick={startEdit}
          className="flex h-11 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/15 px-5 text-sm font-semibold text-orange-500 backdrop-blur-sm transition-opacity hover:opacity-90"
        >
          <Pencil className="size-4" />
          Edit
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="size-8 text-white/40" />
            )}
          </span>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="[font-family:var(--font-manrope)] text-2xl font-bold text-white">
                {company?.name}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium",
                  STATUS_STYLES[status] ?? STATUS_STYLES.Pending
                )}
              >
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/50">{company?.industry}</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Location" value={company?.location} icon={MapPin} />
              <Detail
                label="Employee Count"
                value={company?.employeeCount}
                icon={Users}
              />
              <Detail
                label="Website"
                value={company?.website}
                icon={Globe}
                isLink
              />
            </div>

            {company?.description && (
              <div className="mt-5">
                <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
                  Description
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                  {company.description}
                </p>
              </div>
            )}

            {status === "Pending" && (
              <p className="mt-5 text-xs text-amber-400/80">
                Your company is pending admin approval. It will appear publicly
                once approved.
              </p>
            )}
            {status === "Rejected" && (
              <p className="mt-5 text-xs text-red-400/80">
                Your company registration was rejected. Please update your details
                and resubmit.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Detail({
  label,
  value,
  icon: Icon,
  isLink,
}: {
  label: string
  value?: string
  icon: React.ComponentType<{ className?: string }>
  isLink?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <Icon className="size-4 text-white/60" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-hl-primary transition-colors hover:text-hl-primary/80"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-white/80">{value}</p>
        )}
      </div>
    </div>
  )
}
