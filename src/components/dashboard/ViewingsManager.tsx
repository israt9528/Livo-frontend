"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Check, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
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

interface ViewingRequestItem {
  id: string;
  status?: string;
  preferredDate?: string;
  note?: string | null;
  notes?: string | null;
  createdAt?: string;
  property?: { id?: string; title?: string; city?: string };
  room?: {
    id?: string;
    roomNumber?: string;
    name?: string;
    rentAmount?: string | number;
    unit?: {
      unitNumber?: string;
      property?: {
        id?: string;
        title?: string;
        city?: string;
        address?: string;
      };
    };
  };
  tenant?: { id?: string; name?: string; fullName?: string; email?: string };
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[] | { requests?: T[]; items?: T[]; viewings?: T[] };
          items?: T[];
          requests?: T[];
          viewingRequests?: T[];
          viewing_requests?: T[];
          viewings?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    const nested = obj.data.data;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      return nested.requests || nested.items || nested.viewings || [];
    }
    return (
      obj.data.requests ||
      obj.data.items ||
      obj.data.viewingRequests ||
      obj.data.viewing_requests ||
      obj.data.viewings ||
      []
    );
  }
  return [];
}

function viewingStatusBadge(status?: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "CONFIRMED":
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "REJECTED":
    case "DECLINED":
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function ViewingsManager() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwner = user?.role?.toUpperCase() === "OWNER";
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: viewings = [], isLoading } = useQuery<ViewingRequestItem[]>({
    queryKey: ["viewing-requests"],
    queryFn: async () => {
      const res = await apiClient.get("/viewing-requests");
      return extractList<ViewingRequestItem>(res);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      setUpdatingId(id);
      return apiClient.patch(`/viewing-requests/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Viewing request ${variables.status === "APPROVED" ? "approved" : "declined"}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["viewing-requests"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update viewing status.",
      );
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Viewing Requests
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isOwner
            ? "Review incoming room tour requests from tenants and confirm appointment times."
            : "Track your scheduled property and room viewing requests."}
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            {isOwner ? "Incoming Tour Requests" : "My Scheduled Viewings"}
          </CardTitle>
          <CardDescription>
            {isOwner
              ? "Approve or decline requested viewing dates."
              : "Statuses update automatically when the property owner responds."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : viewings.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No viewing requests found.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {viewings.map((item) => {
                const statusUpper = (item.status || "PENDING").toUpperCase();
                const isPending = statusUpper === "PENDING";
                const propertyTitle =
                  item.room?.unit?.property?.title ||
                  item.property?.title ||
                  "Rental Property";
                const unitNumber = item.room?.unit?.unitNumber;
                const roomLabel = item.room?.roomNumber || item.room?.name;
                const tenantLabel =
                  item.tenant?.name ||
                  item.tenant?.fullName ||
                  item.tenant?.email;
                const noteText = item.note || item.notes;
                const isRowBusy =
                  updateStatusMutation.isPending && updatingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {propertyTitle}
                          {unitNumber ? ` · Unit ${unitNumber}` : ""}
                          {roomLabel ? ` · ${roomLabel}` : ""}
                        </p>
                        <Badge className={viewingStatusBadge(item.status)}>
                          {statusUpper}
                        </Badge>
                      </div>
                      <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Preferred:{" "}
                          {item.preferredDate
                            ? new Date(item.preferredDate).toLocaleDateString()
                            : "TBD"}
                        </span>
                        {tenantLabel && <span>Tenant: {tenantLabel}</span>}
                      </p>
                      {noteText && (
                        <p className="text-xs text-slate-600">
                          &ldquo;{noteText}&rdquo;
                        </p>
                      )}
                    </div>

                    {isOwner && isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={isRowBusy}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: item.id,
                              status: "APPROVED",
                            })
                          }
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {isRowBusy ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isRowBusy}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: item.id,
                              status: "REJECTED",
                            })
                          }
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </div>
                    )}
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
