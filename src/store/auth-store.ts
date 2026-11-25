"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "OWNER" | "TENANT";

export interface AuthUser {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setSession: (user: AuthUser | null, token: string | null) => void;
  clearSession: () => void;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeAuthCookies(role: string | undefined, token: string | null) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  if (role) {
    document.cookie = `livo_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  if (token) {
    document.cookie = `livo_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "livo_role=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "livo_token=; path=/; max-age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setSession: (user, token) => {
        const claims = token ? decodeJwtPayload(token) : null;
        const resolvedRole = (
          user?.role ||
          (typeof claims?.role === "string" ? claims.role : "TENANT")
        ).toUpperCase() as UserRole;

        const resolvedUser: AuthUser | null =
          user || claims
            ? {
                id:
                  user?.id ||
                  (typeof claims?.userId === "string" ? claims.userId : "") ||
                  (typeof claims?.id === "string" ? claims.id : "user"),
                email:
                  user?.email ||
                  (typeof claims?.email === "string" ? claims.email : ""),
                name: user?.name || user?.fullName,
                role: resolvedRole,
              }
            : null;

        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("livo_token", token);
          }
          if (resolvedUser?.role) {
            localStorage.setItem("livo_role", resolvedUser.role);
          }
        }

        writeAuthCookies(resolvedUser?.role, token);
        set({
          user: resolvedUser,
          token,
          accessToken: token,
          isAuthenticated: Boolean(token || resolvedUser),
        });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("livo_token");
          localStorage.removeItem("livo_role");
        }
        clearAuthCookies();
        set({
          user: null,
          token: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "livo-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getRoleDashboardPath(role?: UserRole | string | null): string {
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
