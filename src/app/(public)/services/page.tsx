import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyDirectory } from "@/components/services/propertyDirectory";

export const metadata: Metadata = {
  title: "Browse Properties & Housing Services | Livo",
  description:
    "Search verified apartments, houses, and shared rooms. Filter by property type, sort by rent, and schedule viewings online.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Verified Properties & Housing Services
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Filter live listings, compare monthly rents, and book property tours
          directly with verified owners.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <PropertyDirectory />
      </Suspense>
    </div>
  );
}
