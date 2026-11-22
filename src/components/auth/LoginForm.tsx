"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, Shield, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  getRoleDashboardPath,
  useAuthStore,
  type AuthUser,
  type UserRole,
} from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS: Array<{
  role: UserRole;
  label: string;
  email: string;
  password: string;
  icon: typeof Shield;
}> = [
  {
    role: "ADMIN",
    label: "Demo Admin",
    email: "admin@gmail.com",
    password: "Admin12345",
    icon: Shield,
  },
  {
    role: "OWNER",
    label: "Demo Owner",
    email: "owner@livo.com",
    password: "Password123!",
    icon: UserCheck,
  },
  {
    role: "TENANT",
    label: "Demo Tenant",
    email: "tenant@livo.com",
    password: "Password123!",
    icon: Users,
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);

  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const executeLogin = async (values: LoginFormValues) => {
    const res = (await apiClient.post("/auth/login", values)) as unknown as {
      data?: {
        user?: AuthUser;
        accessToken?: string;
        token?: string;
        data?: {
          user?: AuthUser;
          accessToken?: string;
          token?: string;
        };
      };
      user?: AuthUser;
      accessToken?: string;
      token?: string;
    };

    const payload =
      res?.data &&
      typeof res.data === "object" &&
      "data" in res.data &&
      res.data.data
        ? res.data.data
        : res?.data &&
            typeof res.data === "object" &&
            ("user" in res.data ||
              "accessToken" in res.data ||
              "token" in res.data)
          ? res.data
          : res;

    const userObj = payload?.user;
    const tokenStr = payload?.accessToken || payload?.token || null;

    if (!userObj?.role) {
      throw new Error(
        "Login succeeded, but user role was missing from response.",
      );
    }

    setSession(userObj, tokenStr);
    toast.success(
      `Signed in as ${userObj.name || userObj.email} (${userObj.role})`,
    );

    const target = callbackUrl || getRoleDashboardPath(userObj.role);
    router.push(target);
    router.refresh();
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await executeLogin(values);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      toast.error(message);
    }
  };

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setDemoLoadingRole(account.role);
    setValue("email", account.email);
    setValue("password", account.password);
    try {
      await executeLogin({ email: account.email, password: account.password });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Could not sign in with ${account.label}. Check demo credentials in backend.`;
      toast.error(message);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const isBusy = isSubmitting || demoLoadingRole !== null;

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <KeyRound className="h-5 w-5" />
        </div>
        <CardTitle className="pt-2 text-2xl font-bold text-slate-900">
          Sign in to Livo
        </CardTitle>
        <CardDescription>
          Enter your credentials or use one-click demo access below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* One-Click Demo Login Buttons */}
        <div className="space-y-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            One-Click Demo Login
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const loadingThis = demoLoadingRole === acc.role;
              return (
                <Button
                  key={acc.role}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleDemoLogin(acc)}
                  className="justify-center border-emerald-300 bg-white text-xs font-medium text-slate-800 hover:bg-emerald-600 hover:text-white"
                >
                  {loadingThis ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="mr-1.5 h-3.5 w-3.5 text-emerald-600 group-hover:text-white" />
                  )}
                  {acc.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Standard Email & Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isBusy}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isBusy}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 pt-4 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="ml-1 font-semibold text-emerald-600 hover:underline"
        >
          Create one
        </Link>
      </CardFooter>
    </Card>
  );
}
