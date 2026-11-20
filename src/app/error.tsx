"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        {error.message ||
          "An unexpected error occurred while rendering this view."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
