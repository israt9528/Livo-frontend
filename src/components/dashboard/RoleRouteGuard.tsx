"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export type AppRole = "ADMIN" | "OWNER" | "TENANT";

export function dashboardPathForRole(role?: string | null): string {
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

interface RoleRouteGuardProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export function RoleRouteGuard({
  allowedRoles,
  children,
}: RoleRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore() as {
    user?: { role?: string | null } | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  };

  const normalizedRole = user?.role?.toUpperCase() as AppRole | undefined;
  const hasAccess =
    Boolean(normalizedRole) && allowedRoles.includes(normalizedRole!);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !normalizedRole) {
      const redirectParam = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?redirect=${redirectParam}`);
      return;
    }

    if (normalizedRole && !allowedRoles.includes(normalizedRole)) {
      router.replace(dashboardPathForRole(normalizedRole));
    }
  }, [
    isLoading,
    isAuthenticated,
    normalizedRole,
    allowedRoles,
    pathname,
    router,
  ]);

  if (isLoading || !hasAccess) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Verifying role permissions...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
