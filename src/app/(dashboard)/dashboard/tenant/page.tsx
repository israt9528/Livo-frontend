"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, FileText, Search, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TenantDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenant-overview"],
    queryFn: async () => {
      const [viewingsRes, appsRes, leasesRes] = await Promise.allSettled([
        apiClient.get("/viewing-requests"),
        apiClient.get("/applications"),
        apiClient.get("/leases"),
      ]);

      const countOf = (res: PromiseSettledResult<unknown>) => {
        if (res.status !== "fulfilled") return 0;
        const val = res.value as { data?: unknown[] | { data?: unknown[] } };
        if (Array.isArray(val?.data)) return val.data.length;
        if (
          val?.data &&
          typeof val.data === "object" &&
          Array.isArray(val.data.data)
        ) {
          return val.data.data.length;
        }
        return 0;
      };

      return {
        viewings: countOf(viewingsRes),
        applications: countOf(appsRes),
        leases: countOf(leasesRes),
      };
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tenant Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track viewing requests, rental applications, roommates, and rent
            payments.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/services"
            className={cn(
              buttonVariants({}),
              "bg-emerald-600 text-white hover:bg-emerald-700",
            )}
          >
            <Search className="mr-2 h-4 w-4" />
            Browse Homes
          </Link>
          <Link
            href="/dashboard/tenant/roommates"
            className={buttonVariants({ variant: "outline" })}
          >
            <Users className="mr-2 h-4 w-4" />
            Find Roommates
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            label: "Viewing Requests",
            value: data?.viewings ?? 0,
            icon: CalendarCheck,
          },
          {
            label: "Submitted Applications",
            value: data?.applications ?? 0,
            icon: FileText,
          },
          { label: "My Leases", value: data?.leases ?? 0, icon: Users },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900">
                    {metric.value}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
