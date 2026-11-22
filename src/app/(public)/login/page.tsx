import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In | Livo Housing Platform",
  description:
    "Sign in to your Livo account or use one-click demo login for Admin, Owner, or Tenant roles.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={<Skeleton className="h-115 w-full max-w-md rounded-xl" />}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
