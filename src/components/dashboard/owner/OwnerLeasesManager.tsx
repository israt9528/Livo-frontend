"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileText, Loader2, Shield, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OwnerLeaseRecord {
  id: string;
  status?: string;
  monthlyRent?: number | string;
  rentAmount?: number | string;
  depositAmount?: number | string;
  securityDeposit?: number | string;
  startDate?: string;
  endDate?: string;
  tenant?: { name?: string; fullName?: string; email?: string };
  property?: { id?: string; title?: string };
  room?: { id?: string; roomNumber?: string; name?: string };
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[] | { leases?: T[]; items?: T[] };
          leases?: T[];
          items?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    const nested = obj.data.data;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      return nested.leases || nested.items || [];
    }
    return obj.data.leases || obj.data.items || [];
  }
  return [];
}

function leaseStatusBadge(status?: string) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "TERMINATED":
    case "EXPIRED":
    case "CANCELLED":
      return "bg-slate-200 text-slate-800 hover:bg-slate-200";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function OwnerLeasesManager() {
  const queryClient = useQueryClient();
  const [updatingLeaseId, setUpdatingLeaseId] = useState<string | null>(null);

  const { data: leases = [], isLoading } = useQuery<OwnerLeaseRecord[]>({
    queryKey: ["owner-leases"],
    queryFn: async () => {
      const res = await apiClient.get("/leases");
      return extractList<OwnerLeaseRecord>(res);
    },
  });

  const transitionLeaseMutation = useMutation({
    mutationFn: async ({
      leaseId,
      nextStatus,
    }: {
      leaseId: string;
      nextStatus: "ACTIVE" | "TERMINATED";
    }) => {
      setUpdatingLeaseId(leaseId);
      return apiClient.patch(`/leases/${leaseId}`, { status: nextStatus });
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.nextStatus === "ACTIVE"
          ? "Lease activated."
          : "Lease marked as terminated.",
      );
      queryClient.invalidateQueries({ queryKey: ["owner-leases"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not update lease status.",
      );
    },
    onSettled: () => {
      setUpdatingLeaseId(null);
    },
  });

  const activeLeases = leases.filter(
    (l) => (l.status || "ACTIVE").toUpperCase() === "ACTIVE",
  );

  const activeMonthlyRent = activeLeases.reduce((sum, lease) => {
    const raw = lease.monthlyRent ?? lease.rentAmount ?? 0;
    return sum + (Number(raw) || 0);
  }, 0);

  const totalDeposits = leases.reduce((sum, lease) => {
    const raw = lease.depositAmount ?? lease.securityDeposit ?? 0;
    return sum + (Number(raw) || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Leases & Lifecycle Controls
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Activate pending leases, end completed tenancies, and monitor active
          monthly rent and security deposits.
        </p>
      </div>

      {/* Lease Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Leases
            </CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {activeLeases.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Monthly Rent
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${activeMonthlyRent.toLocaleString()}/mo
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Security Deposits Held
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${totalDeposits.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leases List */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Lease Agreements</CardTitle>
          <CardDescription>
            Manage active and pending lease agreements across your units and
            rooms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : leases.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No leases found for your properties yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {leases.map((lease) => {
                const statusUpper = (lease.status || "PENDING").toUpperCase();
                const isBusy =
                  transitionLeaseMutation.isPending &&
                  updatingLeaseId === lease.id;
                const rentVal = Number(
                  lease.monthlyRent ?? lease.rentAmount ?? 0,
                );
                const depositVal = Number(
                  lease.depositAmount ?? lease.securityDeposit ?? 0,
                );
                const tenantLabel =
                  lease.tenant?.name ||
                  lease.tenant?.fullName ||
                  lease.tenant?.email ||
                  "Tenant";
                const roomLabel = lease.room?.roomNumber || lease.room?.name;

                return (
                  <div
                    key={lease.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {lease.property?.title || "Rental Property"}
                          {roomLabel ? ` · ${roomLabel}` : ""}
                        </p>
                        <Badge className={leaseStatusBadge(lease.status)}>
                          {statusUpper}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tenant: {tenantLabel} · Rent: $
                        {rentVal.toLocaleString()}/mo · Deposit: $
                        {depositVal.toLocaleString()}
                      </p>
                      {(lease.startDate || lease.endDate) && (
                        <p className="text-xs text-slate-400">
                          Term:{" "}
                          {lease.startDate
                            ? new Date(lease.startDate).toLocaleDateString()
                            : "Start TBD"}{" "}
                          —{" "}
                          {lease.endDate
                            ? new Date(lease.endDate).toLocaleDateString()
                            : "Ongoing"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {statusUpper !== "ACTIVE" &&
                        statusUpper !== "TERMINATED" && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              transitionLeaseMutation.mutate({
                                leaseId: lease.id,
                                nextStatus: "ACTIVE",
                              })
                            }
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            {isBusy ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Activate Lease
                          </Button>
                        )}

                      {statusUpper === "ACTIVE" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            transitionLeaseMutation.mutate({
                              leaseId: lease.id,
                              nextStatus: "TERMINATED",
                            })
                          }
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {isBusy ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Terminate Lease
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
