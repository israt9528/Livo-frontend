"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type UserRole } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  ADMIN: [
    {
      label: "Admin Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    { label: "All Users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Properties Registry",
      href: "/dashboard/admin/properties",
      icon: Building2,
    },
    {
      label: "Payments & Logs",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
  ],
  OWNER: [
    {
      label: "Owner Overview",
      href: "/dashboard/owner",
      icon: LayoutDashboard,
    },
    {
      label: "My Properties",
      href: "/dashboard/owner/properties",
      icon: Building2,
    },
    {
      label: "Applications & Leases",
      href: "/dashboard/owner/leases",
      icon: FileText,
    },
    {
      label: "Utilities & Earnings",
      href: "/dashboard/owner/payments",
      icon: CreditCard,
    },
  ],
  TENANT: [
    {
      label: "Tenant Overview",
      href: "/dashboard/tenant",
      icon: LayoutDashboard,
    },
    {
      label: "Roommate Finder",
      href: "/dashboard/tenant/roommates",
      icon: Users,
    },
    {
      label: "My Leases & Requests",
      href: "/dashboard/tenant/leases",
      icon: FileText,
    },
    {
      label: "Rent & Utilities",
      href: "/dashboard/tenant/payments",
      icon: Wrench,
    },
  ],
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const activeRole: UserRole = user?.role || "TENANT";
  const navItems = ROLE_NAV[activeRole] || ROLE_NAV.TENANT;

  const handleLogout = () => {
    clearSession();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Livo
          </span>
          <Badge
            variant="secondary"
            className="ml-auto bg-emerald-50 text-[10px] font-semibold text-emerald-700"
          >
            {activeRole}
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name || user?.fullName || "Authenticated User"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || `${activeRole.toLowerCase()}@livo.com`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Home className="h-3.5 w-3.5" />
              Public Site
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Mobile / Status Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              Workspace:{" "}
              <strong className="text-slate-900">{activeRole}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 lg:hidden">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
