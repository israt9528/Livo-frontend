"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, FilePlus, FileText, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomSummary {
  id: string;
  roomNumber?: string;
  name?: string;
  rentAmount?: number;
  unitId?: string;
  status?: string;
}

interface UnitSummary {
  id: string;
  unitNumber?: string;
  title?: string;
  propertyId?: string;
  rooms?: RoomSummary[];
}

interface PropertySummary {
  id: string;
  title: string;
  city?: string;
  rentAmount?: number;
  units?: UnitSummary[];
}

interface ApplicationItem {
  id: string;
  status?: string;
  moveInDate?: string;
  intendedDurationMonths?: number;
  property?: { title?: string };
  room?: { roomNumber?: string; name?: string };
  propertyId?: string;
  roomId?: string;
}

interface LeaseItem {
  id: string;
  status?: string;
  monthlyRent?: number;
  startDate?: string;
  endDate?: string;
  property?: { title?: string };
  room?: { roomNumber?: string; name?: string };
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[];
          items?: T[];
          properties?: T[];
          units?: T[];
          rooms?: T[];
          applications?: T[];
          leases?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return (
      obj.data.data ||
      obj.data.items ||
      obj.data.properties ||
      obj.data.units ||
      obj.data.rooms ||
      obj.data.applications ||
      obj.data.leases ||
      []
    );
  }
  return [];
}

function statusBadge(status?: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function TenantLeasesManager() {
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-12-05");
  const [moveInDate, setMoveInDate] = useState("2026-12-15");
  const [intendedDurationMonths, setIntendedDurationMonths] = useState("12");
  const [notes, setNotes] = useState("");

  // 1. Fetch Properties
  const { data: properties = [] } = useQuery<PropertySummary[]>({
    queryKey: ["tenant-available-properties"],
    queryFn: async () => {
      const res = await apiClient.get("/properties", { params: { limit: 50 } });
      return extractList<PropertySummary>(res);
    },
  });

  const activePropertyId = selectedPropertyId || properties[0]?.id || "";
  const activeProperty = properties.find((p) => p.id === activePropertyId);

  // 2. Fetch Units for Selected Property
  const { data: fetchedUnits = [] } = useQuery<UnitSummary[]>({
    queryKey: ["tenant-property-units", activePropertyId],
    enabled: Boolean(activePropertyId),
    queryFn: async () => {
      const res = await apiClient.get("/units", {
        params: { propertyId: activePropertyId },
      });
      const list = extractList<UnitSummary>(res);
      return list.filter(
        (u) => !u.propertyId || u.propertyId === activePropertyId,
      );
    },
  });

  const units =
    fetchedUnits.length > 0 ? fetchedUnits : activeProperty?.units || [];
  const activeUnitId =
    units.some((u) => u.id === selectedUnitId) && selectedUnitId
      ? selectedUnitId
      : units[0]?.id || "";
  const activeUnit = units.find((u) => u.id === activeUnitId);

  // 3. Fetch Rooms for Selected Unit
  const { data: fetchedRooms = [] } = useQuery<RoomSummary[]>({
    queryKey: ["tenant-unit-rooms", activeUnitId],
    enabled: Boolean(activeUnitId),
    queryFn: async () => {
      const res = await apiClient.get("/rooms", {
        params: { unitId: activeUnitId },
      });
      const list = extractList<RoomSummary>(res);
      return list.filter((r) => !r.unitId || r.unitId === activeUnitId);
    },
  });

  const rooms =
    fetchedRooms.length > 0 ? fetchedRooms : activeUnit?.rooms || [];
  const activeRoomId =
    rooms.some((r) => r.id === selectedRoomId) && selectedRoomId
      ? selectedRoomId
      : rooms[0]?.id || "";

  // 4. Fetch Applications & Leases
  const { data: applications = [], isLoading: loadingApps } = useQuery<
    ApplicationItem[]
  >({
    queryKey: ["tenant-applications"],
    queryFn: async () => {
      const res = await apiClient.get("/applications");
      return extractList<ApplicationItem>(res);
    },
  });

  const { data: leases = [], isLoading: loadingLeases } = useQuery<LeaseItem[]>(
    {
      queryKey: ["tenant-leases"],
      queryFn: async () => {
        const res = await apiClient.get("/leases");
        return extractList<LeaseItem>(res);
      },
    },
  );

  const requestViewingMutation = useMutation({
    mutationFn: () => {
      if (!activeRoomId) {
        throw new Error(
          "Please select a room first (this property has no rooms configured yet).",
        );
      }
      return apiClient.post("/viewing-requests", {
        propertyId: activePropertyId,
        unitId: activeUnitId || undefined,
        roomId: activeRoomId,
        preferredDate: new Date(preferredDate).toISOString(),
        notes: notes || "Requesting an in-person or virtual tour.",
      });
    },
    onSuccess: () => {
      toast.success("Viewing request sent to the property owner!");
      setNotes("");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to request viewing.",
      );
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: () => {
      if (!activeRoomId) {
        throw new Error(
          "Please select a room first (this property has no rooms configured yet).",
        );
      }
      const parsedDuration = Number(intendedDurationMonths);
      if (
        !Number.isFinite(parsedDuration) ||
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 1
      ) {
        throw new Error(
          "Intended duration must be a whole number of months (at least 1).",
        );
      }
      return apiClient.post("/applications", {
        propertyId: activePropertyId,
        unitId: activeUnitId || undefined,
        roomId: activeRoomId,
        moveInDate: new Date(moveInDate).toISOString(),
        intendedDurationMonths: parsedDuration,
        notes: notes || "Interested in leasing this room.",
      });
    },
    onSuccess: () => {
      toast.success("Rental application submitted!");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["tenant-applications"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit application.",
      );
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Leases, Applications & Viewings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Select a property, unit, and room to schedule a viewing or submit a
          rental application.
        </p>
      </div>

      {/* Request Viewing or Apply Form */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-emerald-600" />
            Schedule a Viewing or Submit a Rental Application
          </CardTitle>
          <CardDescription>
            Choose the exact property, unit, and room you want to tour or lease.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Property Select */}
            <div className="space-y-1.5">
              <Label htmlFor="propertySelect">1. Select Property</Label>
              <select
                id="propertySelect"
                value={activePropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setSelectedUnitId("");
                  setSelectedRoomId("");
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {properties.length === 0 ? (
                  <option value="">No properties available</option>
                ) : (
                  properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.title} {prop.city ? `(${prop.city})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Unit Select */}
            <div className="space-y-1.5">
              <Label htmlFor="unitSelect">2. Select Unit</Label>
              <select
                id="unitSelect"
                value={activeUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  setSelectedRoomId("");
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {units.length === 0 ? (
                  <option value="">No units in this property</option>
                ) : (
                  units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit{" "}
                      {unit.unitNumber || unit.title || unit.id.slice(0, 6)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Room Select */}
            <div className="space-y-1.5">
              <Label htmlFor="roomSelect">3. Select Room (Required)</Label>
              <select
                id="roomSelect"
                value={activeRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {rooms.length === 0 ? (
                  <option value="">No rooms in this unit</option>
                ) : (
                  rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber || room.name || room.id.slice(0, 6)}
                      {room.rentAmount ? ` — $${room.rentAmount}/mo` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="preferredDate">Preferred Viewing Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="moveInDate">Desired Move-In Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="intendedDurationMonths">
                Intended Duration (Months)
              </Label>
              <Input
                id="intendedDurationMonths"
                type="number"
                min={1}
                step={1}
                value={intendedDurationMonths}
                onChange={(e) => setIntendedDurationMonths(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appNotes">Message or Notes for Owner</Label>
            <Textarea
              id="appNotes"
              rows={2}
              placeholder="Share your preferred tour time, occupancy details, or questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {!activeRoomId && activePropertyId && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This property/unit does not have any rooms added yet. Choose a
              property that has rooms configured, or add a room from the Owner
              dashboard first.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={requestViewingMutation.isPending || !activeRoomId}
              onClick={() => requestViewingMutation.mutate()}
            >
              {requestViewingMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarPlus className="mr-2 h-4 w-4 text-emerald-600" />
              )}
              Request Viewing
            </Button>
            <Button
              type="button"
              disabled={submitApplicationMutation.isPending || !activeRoomId}
              onClick={() => submitApplicationMutation.mutate()}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {submitApplicationMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FilePlus className="mr-2 h-4 w-4" />
              )}
              Submit Rental Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications & Active Leases */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">My Applications</CardTitle>
            <CardDescription>
              Track approval status for rooms you applied to rent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingApps ? (
              <Skeleton className="h-24 w-full" />
            ) : applications.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                You haven&apos;t submitted any rental applications yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {app.property?.title || "Rental Listing"}
                        {app.room?.roomNumber || app.room?.name
                          ? ` — Room ${app.room.roomNumber || app.room.name}`
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        Move-in:{" "}
                        {app.moveInDate
                          ? new Date(app.moveInDate).toLocaleDateString()
                          : "TBD"}
                        {app.intendedDurationMonths
                          ? ` · ${app.intendedDurationMonths} mo`
                          : ""}
                      </p>
                    </div>
                    <Badge className={statusBadge(app.status)}>
                      {app.status || "PENDING"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-emerald-600" />
              Active Leases
            </CardTitle>
            <CardDescription>
              Your signed or active rental agreements on Livo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLeases ? (
              <Skeleton className="h-24 w-full" />
            ) : leases.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No active leases found yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {leases.map((lease) => (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {lease.property?.title || "Lease Agreement"}
                        {lease.room?.roomNumber || lease.room?.name
                          ? ` — Room ${lease.room.roomNumber || lease.room.name}`
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {lease.monthlyRent
                          ? `$${lease.monthlyRent.toLocaleString()}/mo`
                          : "Agreed rent"}{" "}
                        {lease.startDate
                          ? `· Since ${new Date(lease.startDate).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <Badge className={statusBadge(lease.status)}>
                      {lease.status || "ACTIVE"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
