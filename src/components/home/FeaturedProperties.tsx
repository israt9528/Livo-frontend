"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PropertyRecord } from "@/components/services/propertyDirectory";

export function FeaturedProperties() {
  const { data: properties = [], isLoading } = useQuery<PropertyRecord[]>({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const response = (await apiClient.get("/properties", {
        params: { limit: 6 },
      })) as unknown as {
        data: PropertyRecord[] | { data: PropertyRecord[] };
      };

      if (Array.isArray(response?.data)) return response.data;
      if (response?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Featured Available Properties
            </h2>
            <p className="mt-2 text-slate-600">
              Live listings fetched directly from the Livo property registry.
            </p>
          </div>
          <Link
            href="/services"
            className={buttonVariants({ variant: "outline" })}
          >
            View All Listings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-slate-200 bg-white"
              >
                <Skeleton className="aspect-16/10 w-full rounded-none" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3.5 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-100 pt-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const imageUrl =
                property.images?.[0] ||
                property.media?.[0]?.url ||
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

              return (
                <Card
                  key={property.id}
                  className="overflow-hidden border-slate-200 bg-white transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-16/10 w-full bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {property.propertyType && (
                      <Badge className="absolute left-3 top-3 bg-slate-900/80 text-white">
                        {property.propertyType}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                      {property.title}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span className="line-clamp-1">
                        {property.address ||
                          property.city ||
                          "Verified Location"}
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {property.description ||
                        "Modern residential listing with transparent lease terms and digital management."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                    <div>
                      <span className="text-lg font-bold text-emerald-700">
                        {property.rentAmount
                          ? `$${property.rentAmount.toLocaleString()}`
                          : "Contact for Rent"}
                      </span>
                      {property.rentAmount && (
                        <span className="text-xs text-slate-500"> / mo</span>
                      )}
                    </div>
                    <Link
                      href={`/services?search=${encodeURIComponent(property.title)}`}
                      className={buttonVariants({
                        size: "sm",
                        variant: "secondary",
                      })}
                    >
                      Inspect
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-10 border-dashed border-slate-300 bg-white p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Explore Live Listings in Services
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Browse all properties, filter by budget or location, or sign in
              with a Demo Owner account to publish new listings.
            </p>
            <Link
              href="/services"
              className={cn(
                buttonVariants({}),
                "mt-6 bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              Open Property Directory
            </Link>
          </Card>
        )}
      </div>
    </section>
  );
}
