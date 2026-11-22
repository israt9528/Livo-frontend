"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  getRoleDashboardPath,
  useAuthStore,
  type AuthUser,
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

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["TENANT", "OWNER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "TENANT",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const res = (await apiClient.post(
        "/auth/register",
        values,
      )) as unknown as {
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

      const userObj: AuthUser = payload?.user || {
        id: "new-user",
        name: values.name,
        email: values.email,
        role: values.role,
      };
      const tokenStr = payload?.accessToken || payload?.token || null;

      setSession(userObj, tokenStr);
      toast.success("Account created! Welcome to Livo.");
      router.push(getRoleDashboardPath(userObj.role));
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <UserPlus className="h-5 w-5" />
        </div>
        <CardTitle className="pt-2 text-2xl font-bold text-slate-900">
          Create your Livo account
        </CardTitle>
        <CardDescription>
          Join as a Tenant looking for homes & roommates or as a Property Owner.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Nadia Islam"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
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
              placeholder="At least 6 characters"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Role</Label>
            <select
              id="role"
              disabled={isSubmitting}
              {...register("role")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="TENANT">
                Tenant (Search Homes, Roommates & Leases)
              </option>
              <option value="OWNER">
                Property Owner (List Properties, Units & Rooms)
              </option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 pt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="ml-1 font-semibold text-emerald-600 hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
