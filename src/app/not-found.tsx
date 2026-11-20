import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Building2 className="h-7 w-7" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-emerald-600">
        404 Error
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The property, dashboard view, or page you are looking for does not exist
        or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className={cn(
            buttonVariants({}),
            "bg-emerald-600 text-white hover:bg-emerald-700",
          )}
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/services"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
