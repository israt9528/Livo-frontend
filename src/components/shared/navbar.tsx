"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing & Plans" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const getDashboardRouteByRole = (role?: UserRole | string): string => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/dashboard/admin";
    case "OWNER":
      return "/dashboard/owner";
    case "TENANT":
    default:
      return "/dashboard/tenant";
  }
};

function decodeJwtUser(token?: string | null): {
  email?: string;
  role?: UserRole;
  name?: string;
} | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64)) as Record<string, unknown>;
    const email = typeof claims.email === "string" ? claims.email : undefined;
    const role =
      typeof claims.role === "string"
        ? (claims.role.toUpperCase() as UserRole)
        : undefined;
    const name =
      typeof claims.name === "string"
        ? claims.name
        : email
          ? email.split("@")[0]
          : "Member";
    return { email, role, name };
  } catch {
    return null;
  }
}

const emptySubscribe = () => () => {};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const store = useAuthStore();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const rawToken =
    mounted && typeof window !== "undefined"
      ? (() => {
          const direct =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("livo_token");
          if (direct) return direct;

          const persisted = localStorage.getItem("livo-auth-storage");
          if (!persisted) return null;
          try {
            const parsed = JSON.parse(persisted) as {
              state?: { token?: string; accessToken?: string };
            };
            return parsed?.state?.token || parsed?.state?.accessToken || null;
          } catch {
            return null;
          }
        })()
      : null;

  const decoded = decodeJwtUser(rawToken);
  const activeUser = store.user
    ? store.user
    : decoded
      ? {
          name: decoded.name || "Member",
          email: decoded.email || "",
          role: decoded.role || ("TENANT" as UserRole),
          avatarUrl: "",
        }
      : null;

  const isLoggedIn =
    mounted && Boolean(store.isAuthenticated || activeUser || rawToken);

  const handleLogout = () => {
    store.logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("livo_token");
      localStorage.removeItem("livo-auth-storage");
      document.cookie = "livo_role=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "livo_token=; path=/; max-age=0; SameSite=Lax";
    }
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  const dashboardHref = getDashboardRouteByRole(activeUser?.role);
  const displayName = activeUser?.name || "Member";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Livo
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex md:items-center md:gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600",
                  isActive
                    ? "font-semibold text-emerald-600"
                    : "text-slate-600",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth / Role Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2",
                )}
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                Dashboard
              </Link>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="User menu"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage
                      src={activeUser?.avatarUrl || ""}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-emerald-50 font-semibold text-emerald-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {displayName}
                        </p>
                        {activeUser?.email && (
                          <p className="text-xs leading-none text-slate-500">
                            {activeUser.email}
                          </p>
                        )}
                        {activeUser?.role && (
                          <span className="mt-1 inline-block w-fit rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {activeUser.role}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`${dashboardHref}/profile`)}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-emerald-600 text-white hover:bg-emerald-700",
                )}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Livo
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-emerald-50 font-semibold text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-slate-200" />
                {isLoggedIn ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({}),
                        "w-full justify-start bg-emerald-600 hover:bg-emerald-700",
                      )}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to {activeUser?.role || "My"} Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full",
                      )}
                    >
                      Log in / Demo Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({}),
                        "w-full bg-emerald-600 hover:bg-emerald-700",
                      )}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
