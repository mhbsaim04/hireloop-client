"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bookmark,
  Briefcase,
  Building2,
  FilePlus2,
  FileText,
  FileUp,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"
import { UserAvatar } from "@/components/user-avatar"

export type DashboardRole = "seeker" | "recruiter" | "admin"

export interface MenuItem {
  id: string
  name: string
  url: string
  icon: LucideIcon
}

/**
 * Sidebar navigation per role, matching the Figma "HL 2.0/Sidebar" spec:
 *
 * - Seeker:    Dashboard, Jobs, Saved Jobs, Applications, Billing, Settings
 * - Recruiter: Dashboard, My Company, Manage Jobs, Applications, Settings
 * - Admin:     Dashboard, Users, Companies, Jobs, Payments, Settings
 */
const menuItemsByRole: Record<DashboardRole, MenuItem[]> = {
  seeker: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/seeker",
      icon: LayoutDashboard,
    },
    {
      id: "jobs",
      name: "Jobs",
      url: "/dashboard/seeker/jobs",
      icon: Briefcase,
    },
    {
      id: "saved",
      name: "Saved Jobs",
      url: "/dashboard/seeker/saved",
      icon: Bookmark,
    },
    {
      id: "applications",
      name: "Applications",
      url: "/dashboard/seeker/applications",
      icon: FileText,
    },
    {
      id: "billing",
      name: "Billing",
      url: "/dashboard/seeker/billing",
      icon: Wallet,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/seeker/settings",
      icon: Settings,
    },
  ],
  recruiter: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/recruiter",
      icon: LayoutDashboard,
    },
    {
      id: "company",
      name: "My Company",
      url: "/dashboard/recruiter/company",
      icon: Building2,
    },
    {
      id: "jobs",
      name: "Manage Jobs",
      url: "/dashboard/recruiter/jobs",
      icon: Briefcase,
    },
    {
      id: "applications",
      name: "Applications",
      url: "/dashboard/recruiter/applications",
      icon: FileText,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/recruiter/settings",
      icon: Settings,
    },
  ],
  admin: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    { id: "users", name: "Users", url: "/dashboard/admin/users", icon: Users },
    {
      id: "companies",
      name: "Companies",
      url: "/dashboard/admin/companies",
      icon: Building2,
    },
    { id: "jobs", name: "Jobs", url: "/dashboard/admin/jobs", icon: Briefcase },
    {
      id: "payments",
      name: "Payments",
      url: "/dashboard/admin/payments",
      icon: Wallet,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
}

/** Role-specific identity card copy (from the Figma "HL 2.0/Sidebar" spec). */
const identityByRole: Record<
  DashboardRole,
  { fallbackName: string; subtitle: string }
> = {
  seeker: { fallbackName: "Seeker Portal", subtitle: "Professional Tier" },
  recruiter: { fallbackName: "Recruiter Portal", subtitle: "Recruiter" },
  admin: { fallbackName: "Admin Console", subtitle: "Super Admin" },
}

/** Role-specific footer CTA (from the Figma spec; admin has none). */
const ctaByRole: Record<
  DashboardRole,
  { label: string; url: string; icon: LucideIcon } | null
> = {
  seeker: {
    label: "Post Resume",
    url: "/dashboard/seeker/settings",
    icon: FileUp,
  },
  recruiter: {
    label: "Post a Job",
    url: "/dashboard/recruiter/jobs/new",
    icon: FilePlus2,
  },
  admin: null,
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const role: DashboardRole = user?.role ?? "seeker"
  const menuItems = menuItemsByRole[role]
  const identity = identityByRole[role]
  const cta = ctaByRole[role]

  async function handleSignOut() {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          },
        },
      })
    } catch (err) {
      console.error("Sign-out failed:", err)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Brand */}
        <Link href="/" className="flex items-center px-4 pt-4 pb-2">
          <Image
            src="/images/logo.png"
            alt="HireLoop"
            width={154}
            height={44}
            className="h-9 w-auto"
          />
        </Link>

        {/* Identity card */}
        <div className="mx-3 flex items-center gap-3 rounded-xl bg-[#1a1a1e] p-3">
          <UserAvatar src={user?.image} name={user?.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate [font-family:var(--font-manrope)] text-sm font-bold text-white">
              {user?.name ?? identity.fallbackName}
            </p>
            <span className="mt-0.5 inline-block rounded-md border border-hl-primary/30 bg-hl-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-hl-primary">
              {identity.subtitle}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  isActive={
                    pathname === item.url || pathname.startsWith(`${item.url}/`)
                  }
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* CTA */}
        {cta && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href={cta.url} />}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 transition-all hover:scale-105 hover:shadow-orange-500/60 animate-pulse"
                tooltip={cta.label}
              >
                <cta.icon />
                <span>{cta.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        {/* Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
