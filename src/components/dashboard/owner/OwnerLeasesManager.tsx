"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  FilePlus2,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RentalApplication {
  id: string;
  status?: string;
  moveInDate?: string;
  monthlyIncome?: number;
  notes?: string;
  tenant?: { id?: string; name?: string; email?: string };
  property?: { id?: string; title?: string; rentAmount?: number };
  propertyId?: string;
  tenantId?: string;
  room?: { id?: string; roomNumber?: string; name?: string };
  roomId?: string;
}

interface LeaseRecord {
  id: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  depositAmount?: number;
  property?: { title?: string };
  tenant?: { name?: string; email?: string };
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[];
          items?: T[];
          applications?: T[];
          leases?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return (
      obj.data.data ||
      obj.data.items ||
      obj.data.applications ||
      obj.data.leases ||
      []
    );
  }
  return [];
}

function statusBadgeClass(status?: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "REJECTED":
    case "TERMINATED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function OwnerLeasesManager() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(
    null,
  );
  const [startDate, setStartDate] = useState("2026-12-01");
  const [endDate, setEndDate] = useState("2027-11-30");
  const [monthlyRent, setMonthlyRent] = useState("1200");
  const [depositAmount, setDepositAmount] = useState("1200");

  const { data: applications = [], isLoading: loadingApps } = useQuery<
    RentalApplication[]
  >({
    queryKey: ["owner-applications"],
    queryFn: async () => {
      const res = await apiClient.get("/applications");
      return extractList<RentalApplication>(res);
    },
  });

  const { data: leases = [], isLoading: loadingLeases } = useQuery<
    LeaseRecord[]
  >({
    queryKey: ["owner-leases"],
    queryFn: async () => {
      const res = await apiClient.get("/leases");
      return extractList<LeaseRecord>(res);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => apiClient.patch(`/applications/${id}`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Application marked as ${vars.status.toLowerCase()}.`);
      queryClient.invalidateQueries({ queryKey: ["owner-applications"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update application.",
      );
    },
  });

  const createLeaseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApp) throw new Error("Select an application first.");
      return apiClient.post("/leases", {
        applicationId: selectedApp.id,
        propertyId: selectedApp.property?.id || selectedApp.propertyId,
        roomId: selectedApp.room?.id || selectedApp.roomId,
        tenantId: selectedApp.tenant?.id || selectedApp.tenantId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
      });
    },
    onSuccess: () => {
      toast.success("Lease agreement created!");
      setSelectedApp(null);
      queryClient.invalidateQueries({ queryKey: ["owner-leases"] });
      queryClient.invalidateQueries({ queryKey: ["owner-applications"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create lease.",
      );
    },
  });

  const openLeaseModalForApp = (app: RentalApplication) => {
    setSelectedApp(app);
    const defaultRent = app.property?.rentAmount || 1200;
    setMonthlyRent(String(defaultRent));
    setDepositAmount(String(defaultRent));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Applications & Leases
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review prospective tenant applications, approve qualified applicants,
          and issue active leases.
        </p>
      </div>

      {/* Create Lease Panel when an application is selected */}
      {selectedApp && (
        <Card className="border-emerald-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FilePlus2 className="h-5 w-5 text-emerald-600" />
              Issue Lease for{" "}
              {selectedApp.tenant?.name ||
                selectedApp.tenant?.email ||
                "Applicant"}
            </CardTitle>
            <CardDescription>
              Property:{" "}
              <strong>
                {selectedApp.property?.title ||
                  selectedApp.propertyId ||
                  "Selected Property"}
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Lease Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Lease End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="depositAmount">Security Deposit ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                disabled={createLeaseMutation.isPending}
                onClick={() => createLeaseMutation.mutate()}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {createLeaseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Lease...
                  </>
                ) : (
                  "Create Active Lease"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Rental Applications */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Rental Applications</CardTitle>
          <CardDescription>
            Approve or reject incoming applications, then generate a lease.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingApps ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No rental applications received yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 pr-4">Applicant</th>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Move-In</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-medium text-slate-900">
                        {app.tenant?.name ||
                          app.tenant?.email ||
                          app.tenantId ||
                          "Applicant"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {app.property?.title || app.propertyId || "Property"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {app.moveInDate
                          ? new Date(app.moveInDate).toLocaleDateString()
                          : "Flexible"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={statusBadgeClass(app.status)}>
                          {app.status || "PENDING"}
                        </Badge>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: app.id,
                                status: "APPROVED",
                              })
                            }
                            className="text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: app.id,
                                status: "REJECTED",
                              })
                            }
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openLeaseModalForApp(app)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Create Lease
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active & Past Leases */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Issued Leases
          </CardTitle>
          <CardDescription>
            View active rental agreements and monthly rent terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLeases ? (
            <Skeleton className="h-24 w-full" />
          ) : leases.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No leases issued yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {leases.map((lease) => (
                <div
                  key={lease.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3.5"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {lease.property?.title || "Lease Agreement"} —{" "}
                      <span className="font-normal text-slate-600">
                        {lease.tenant?.name || lease.tenant?.email || "Tenant"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Rent:{" "}
                      {lease.monthlyRent
                        ? `$${lease.monthlyRent.toLocaleString()}/mo`
                        : "Agreed rate"}{" "}
                      {lease.startDate
                        ? `· Starts ${new Date(lease.startDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <Badge className={statusBadgeClass(lease.status)}>
                    {lease.status || "ACTIVE"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
