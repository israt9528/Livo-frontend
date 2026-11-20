"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface PropertyRecord {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  rentAmount?: number;
  propertyType?: string;
  status?: string;
  images?: string[];
  media?: Array<{ url: string }>;
  createdAt?: string;
}

interface PropertiesApiPayload {
  data: PropertyRecord[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PROPERTY_TYPES = [
  { label: "All Types", value: "" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "House", value: "HOUSE" },
  { label: "Shared Room", value: "ROOM" },
  { label: "Studio", value: "STUDIO" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Rent: Low to High", value: "rentAmount:asc" },
  { label: "Rent: High to Low", value: "rentAmount:desc" },
];

export function PropertyDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state directly from URL query parameters
  const urlSearch = searchParams.get("search") || "";
  const urlType = searchParams.get("propertyType") || "";
  const urlSort = searchParams.get("sort") || "createdAt:desc";
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Helper to update URL query params while preserving existing params
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  // Sync debounced search input to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateQueryParams({
        search: debouncedSearch || null,
        page: "1",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [sortBy, sortOrder] = urlSort.split(":");

  const { data, isLoading, isError, refetch } = useQuery<PropertiesApiPayload>({
    queryKey: ["properties", urlPage, urlSearch, urlType, sortBy, sortOrder],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: urlPage,
        limit: 9,
      };
      if (urlSearch) params.searchTerm = urlSearch;
      if (urlType) params.propertyType = urlType;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = (await apiClient.get("/properties", {
        params,
      })) as unknown as {
        data:
          | PropertyRecord[]
          | { data: PropertyRecord[]; meta?: PropertiesApiPayload["meta"] };
        meta?: PropertiesApiPayload["meta"];
      };

      if (Array.isArray(response?.data)) {
        return {
          data: response.data,
          meta: response.meta,
        };
      }

      if (response?.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          meta: response.data.meta || response.meta,
        };
      }

      return { data: [] };
    },
  });

  const properties = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalCount = data?.meta?.total ?? properties.length;

  const hasActiveFilters = Boolean(
    urlSearch || urlType || urlSort !== "createdAt:desc",
  );

  const handleResetFilters = () => {
    setSearchInput("");
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="space-y-8">
      {/* URL-Synced Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, neighborhood, or city..."
              className="pl-9"
              aria-label="Search properties"
            />
          </div>

          {/* Property Type Filter */}
          <div className="md:col-span-3">
            <select
              value={urlType}
              onChange={(e) =>
                updateQueryParams({
                  propertyType: e.target.value || null,
                  page: "1",
                })
              }
              aria-label="Filter by property type"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3">
            <div className="relative flex items-center">
              <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <select
                value={urlSort}
                onChange={(e) =>
                  updateQueryParams({
                    sort: e.target.value,
                    page: "1",
                  })
                }
                aria-label="Sort properties"
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="md:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Result Counter */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong>{properties.length}</strong> of{" "}
            <strong>{totalCount}</strong> verified listings
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-medium text-emerald-600 hover:underline"
            >
              Clear active filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden border-slate-200">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="border-red-200 bg-red-50/60 p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900">
            Unable to load property listings
          </h3>
          <p className="mt-1 text-sm text-red-700">
            The backend server may be waking up. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4 border-red-300 bg-white text-red-700 hover:bg-red-50"
          >
            Retry Request
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && properties.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No matching properties found
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Try adjusting your search keywords, changing the property type
            filter, or resetting all filters.
          </p>
          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700"
            >
              Reset All Filters
            </Button>
          )}
        </Card>
      )}

      {/* Property Grid */}
      {!isLoading && !isError && properties.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const imageUrl =
                property.images?.[0] ||
                property.media?.[0]?.url ||
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

              return (
                <Card
                  key={property.id}
                  className="flex flex-col overflow-hidden border-slate-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {property.propertyType && (
                      <Badge className="absolute left-3 top-3 bg-slate-900/85 text-white">
                        {property.propertyType}
                      </Badge>
                    )}
                    {property.status && (
                      <Badge
                        variant="secondary"
                        className="absolute right-3 top-3 bg-emerald-50 text-emerald-700"
                      >
                        {property.status}
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
                          "Verified Neighborhood"}
                      </span>
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4">
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {property.description ||
                        "Spacious verified rental unit ready for immediate viewing and digital lease application."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
                    <div>
                      <span className="text-lg font-bold text-emerald-700">
                        {property.rentAmount
                          ? `$${property.rentAmount.toLocaleString()}`
                          : "Flexible Rent"}
                      </span>
                      {property.rentAmount && (
                        <span className="text-xs text-slate-500"> / mo</span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard?propertyId=${property.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "bg-emerald-600 text-white hover:bg-emerald-700",
                      )}
                    >
                      Request Viewing
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* URL-Synced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={urlPage <= 1}
                onClick={() =>
                  updateQueryParams({ page: String(Math.max(1, urlPage - 1)) })
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="px-3 text-sm font-medium text-slate-700">
                Page {urlPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={urlPage >= totalPages}
                onClick={() =>
                  updateQueryParams({
                    page: String(Math.min(totalPages, urlPage + 1)),
                  })
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
