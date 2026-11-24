"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Receipt, Search, Wallet, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OwnerPaymentRecord {
  id: string;
  amount?: number;
  type?: string;
  status?: string;
  billingMonth?: string;
  createdAt?: string;
  tenant?: {
    name?: string;
    fullName?: string;
    email?: string;
  };
  lease?: {
    property?: { title?: string };
    room?: { roomNumber?: string; name?: string };
  };
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[];
          items?: T[];
          payments?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return obj.data.data || obj.data.items || obj.data.payments || [];
  }
  return [];
}

function paymentStatusBadge(status?: string) {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "COMPLETED":
    case "SUCCEEDED":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "FAILED":
    case "OVERDUE":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function OwnerPaymentsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "RENT" | "UTILITY">(
    "ALL",
  );

  const { data: payments = [], isLoading } = useQuery<OwnerPaymentRecord[]>({
    queryKey: ["owner-payments"],
    queryFn: async () => {
      const res = await apiClient.get("/payments");
      return extractList<OwnerPaymentRecord>(res);
    },
  });

  const filteredPayments = payments.filter((item) => {
    const matchesType =
      typeFilter === "ALL" || item.type?.toUpperCase() === typeFilter;
    const q = searchQuery.toLowerCase();
    const tenantName =
      item.tenant?.name || item.tenant?.fullName || item.tenant?.email || "";
    const propertyTitle = item.lease?.property?.title || "";
    const month = item.billingMonth || "";
    const matchesQuery =
      !q ||
      tenantName.toLowerCase().includes(q) ||
      propertyTitle.toLowerCase().includes(q) ||
      month.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  const totalCollected = payments.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );
  const rentTotal = payments
    .filter((item) => item.type?.toUpperCase() !== "UTILITY")
    .reduce(
      (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
      0,
    );
  const utilityTotal = payments
    .filter((item) => item.type?.toUpperCase() === "UTILITY")
    .reduce(
      (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
      0,
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Utilities & Earnings Ledger
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track collected rent, shared utility settlements, and tenant payment
          records across your leases.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Collected
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${totalCollected.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Rent Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${rentTotal.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Utility Settlements
            </CardTitle>
            <Zap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${utilityTotal.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tenant, property, or billing month..."
            className="bg-white pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "RENT", "UTILITY"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={
                typeFilter === tab
                  ? "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {tab === "ALL" ? "All Payments" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Incoming Transactions
          </CardTitle>
          <CardDescription>
            Rent and utility payments linked to your active leases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : filteredPayments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No matching payment transactions found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                    <th className="py-3 pr-4">Property / Room</th>
                    <th className="py-3 pr-4">Tenant</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Billing Period</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => {
                    const tenantLabel =
                      payment.tenant?.name ||
                      payment.tenant?.fullName ||
                      payment.tenant?.email ||
                      "Tenant";
                    const roomLabel =
                      payment.lease?.room?.roomNumber ||
                      payment.lease?.room?.name;
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/70">
                        <td className="py-3 pr-4 font-medium text-slate-900">
                          {payment.lease?.property?.title || "Rental Property"}
                          {roomLabel ? ` · Room ${roomLabel}` : ""}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {tenantLabel}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">
                            {payment.type || "RENT"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {payment.billingMonth ||
                            (payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString()
                              : "—")}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          ${Number(payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <Badge className={paymentStatusBadge(payment.status)}>
                            {payment.status || "PAID"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
