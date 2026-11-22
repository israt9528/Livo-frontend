"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, CreditCard, ShieldAlert, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [usersRes, propsRes, paymentsRes] = await Promise.allSettled([
        apiClient.get("/users"),
        apiClient.get("/properties"),
        apiClient.get("/payments"),
      ]);

      const extractCount = (res: PromiseSettledResult<unknown>) => {
        if (res.status !== "fulfilled") return 0;
        const val = res.value as {
          data?: unknown[] | { data?: unknown[]; meta?: { total?: number } };
          meta?: { total?: number };
        };
        if (val?.meta?.total !== undefined) return val.meta.total;
        if (Array.isArray(val?.data)) return val.data.length;
        if (val?.data && typeof val.data === "object") {
          if (val.data.meta?.total !== undefined) return val.data.meta.total;
          if (Array.isArray(val.data.data)) return val.data.data.length;
        }
        return 0;
      };

      return {
        users: extractCount(usersRes),
        properties: extractCount(propsRes),
        payments: extractCount(paymentsRes),
      };
    },
  });

  const cards = [
    { label: "Total Registered Users", value: stats?.users ?? 0, icon: Users },
    {
      label: "Verified Properties",
      value: stats?.properties ?? 0,
      icon: Building2,
    },
    {
      label: "Recorded Transactions",
      value: stats?.payments ?? 0,
      icon: CreditCard,
    },
    { label: "Platform Health", value: "Operational", icon: ShieldAlert },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Admin Control Center
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor platform users, property listings, and payment settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {item.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900">
                    {item.value}
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
