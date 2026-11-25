"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuthStore } from "@/store/useAuthStore";

type AppRole = "ADMIN" | "OWNER" | "TENANT";

function dashboardHomeForRole(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/dashboard/admin";
    case "OWNER":
      return "/dashboard/owner";
    case "TENANT":
    default:
      return "/dashboard/tenant";
  }
}

function requiredRoleForPath(pathname: string): AppRole | null {
  const segment = pathname.split("/")[2]?.toUpperCase();
  if (segment === "ADMIN" || segment === "OWNER" || segment === "TENANT") {
    return segment;
  }
  return null;
}

export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore() as {
    user?: { role?: string | null } | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  };

  const userRole = user?.role?.toUpperCase() as AppRole | undefined;
  const requiredRole = requiredRoleForPath(pathname || "");
  const isAuthorized =
    Boolean(userRole) && (!requiredRole || userRole === requiredRole);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !userRole) {
      const redirectParam = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?redirect=${redirectParam}`);
      return;
    }

    if (userRole && requiredRole && userRole !== requiredRole) {
      router.replace(dashboardHomeForRole(userRole));
    }
  }, [isLoading, isAuthenticated, userRole, requiredRole, pathname, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Verifying session & role access...</span>
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
