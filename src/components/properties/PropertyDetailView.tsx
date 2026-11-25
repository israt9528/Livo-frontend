"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  CheckCircle2,
  FilePlus,
  Images,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface RoomDetail {
  id: string;
  roomNumber?: string;
  name?: string;
  rentAmount?: string | number;
  depositAmount?: string | number;
  status?: string;
  unitId?: string;
}

interface UnitDetail {
  id: string;
  unitNumber?: string;
  title?: string;
  propertyId?: string;
  rooms?: RoomDetail[];
}

interface PropertyImageEntry {
  url?: string;
  imageUrl?: string;
  src?: string;
}

interface PropertyDetail {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  rentAmount?: string | number;
  status?: string;
  images?: Array<string | PropertyImageEntry>;
  media?: PropertyImageEntry[];
  owner?: { name?: string; fullName?: string; email?: string };
  units?: UnitDetail[];
}

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

function extractPropertyImages(property?: PropertyDetail | null): string[] {
  if (!property) return [FALLBACK_PROPERTY_IMAGE];

  const urls: string[] = [];
  const rawList = [
    ...(Array.isArray(property.images) ? property.images : []),
    ...(Array.isArray(property.media) ? property.media : []),
  ];

  for (const entry of rawList) {
    if (typeof entry === "string" && entry.trim()) {
      urls.push(entry.trim());
    } else if (entry && typeof entry === "object") {
      const candidate = entry.url || entry.imageUrl || entry.src;
      if (typeof candidate === "string" && candidate.trim()) {
        urls.push(candidate.trim());
      }
    }
  }

  const uniqueUrls = Array.from(new Set(urls));
  return uniqueUrls.length > 0 ? uniqueUrls : [FALLBACK_PROPERTY_IMAGE];
}

function extractItem<T>(res: unknown): T | null {
  const obj = res as { data?: T | { data?: T; property?: T } };
  if (!obj?.data || typeof obj.data !== "object") return null;
  if (
    "data" in obj.data &&
    obj.data.data &&
    typeof obj.data.data === "object"
  ) {
    return obj.data.data as T;
  }
  if ("property" in obj.data && obj.data.property) {
    return obj.data.property as T;
  }
  return obj.data as T;
}

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[] | { units?: T[]; rooms?: T[]; items?: T[] };
          units?: T[];
          rooms?: T[];
          items?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    const nested = obj.data.data;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      return nested.units || nested.rooms || nested.items || [];
    }
    return obj.data.units || obj.data.rooms || obj.data.items || [];
  }
  return [];
}

export function PropertyDetailView({ propertyId }: { propertyId: string }) {
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [prevPropertyId, setPrevPropertyId] = useState(propertyId);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-12-05");
  const [moveInDate, setMoveInDate] = useState("2026-12-15");
  const [intendedDurationMonths, setIntendedDurationMonths] = useState("12");
  const [notes, setNotes] = useState("");

  if (prevPropertyId !== propertyId) {
    setPrevPropertyId(propertyId);
    setActiveImageIndex(0);
    setSelectedUnitId("");
    setSelectedRoomId("");
  }

  const {
    data: property,
    isLoading: loadingProperty,
    isError,
  } = useQuery<PropertyDetail | null>({
    queryKey: ["property-detail", propertyId],
    queryFn: async () => {
      const res = await apiClient.get(`/properties/${propertyId}`);
      return extractItem<PropertyDetail>(res);
    },
  });

  const galleryImages = extractPropertyImages(property);
  const safeImageIndex =
    activeImageIndex < galleryImages.length ? activeImageIndex : 0;
  const currentImage =
    galleryImages[safeImageIndex] ||
    galleryImages[0] ||
    FALLBACK_PROPERTY_IMAGE;

  const { data: fetchedUnits = [] } = useQuery<UnitDetail[]>({
    queryKey: ["property-detail-units", propertyId],
    enabled: Boolean(propertyId),
    queryFn: async () => {
      const res = await apiClient.get("/units", { params: { propertyId } });
      const list = extractList<UnitDetail>(res);
      return list.filter((u) => !u.propertyId || u.propertyId === propertyId);
    },
  });

  const units = fetchedUnits.length > 0 ? fetchedUnits : property?.units || [];
  const activeUnitId =
    units.some((u) => u.id === selectedUnitId) && selectedUnitId
      ? selectedUnitId
      : units[0]?.id || "";
  const activeUnit = units.find((u) => u.id === activeUnitId);

  const { data: fetchedRooms = [] } = useQuery<RoomDetail[]>({
    queryKey: ["property-detail-rooms", activeUnitId],
    enabled: Boolean(activeUnitId),
    queryFn: async () => {
      const res = await apiClient.get("/rooms", {
        params: { unitId: activeUnitId },
      });
      const list = extractList<RoomDetail>(res);
      return list.filter((r) => !r.unitId || r.unitId === activeUnitId);
    },
  });

  const rooms =
    fetchedRooms.length > 0 ? fetchedRooms : activeUnit?.rooms || [];
  const activeRoomId =
    rooms.some((r) => r.id === selectedRoomId) && selectedRoomId
      ? selectedRoomId
      : rooms[0]?.id || "";
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  const viewingMutation = useMutation({
    mutationFn: () => {
      if (!activeRoomId) {
        throw new Error("Select a room before requesting a viewing.");
      }
      return apiClient.post("/viewing-requests", {
        propertyId,
        unitId: activeUnitId || undefined,
        roomId: activeRoomId,
        preferredDate: new Date(preferredDate).toISOString(),
        notes: notes || "Requesting a viewing from the listing page.",
      });
    },
    onSuccess: () => {
      toast.success("Viewing request submitted!");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["viewing-requests"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not request viewing.",
      );
    },
  });

  const applicationMutation = useMutation({
    mutationFn: () => {
      if (!activeRoomId) {
        throw new Error("Select a room before submitting an application.");
      }
      const duration = Number(intendedDurationMonths);
      if (
        !Number.isFinite(duration) ||
        !Number.isInteger(duration) ||
        duration < 1
      ) {
        throw new Error(
          "Intended duration must be a whole number of months (at least 1).",
        );
      }
      return apiClient.post("/applications", {
        propertyId,
        unitId: activeUnitId || undefined,
        roomId: activeRoomId,
        moveInDate: new Date(moveInDate).toISOString(),
        intendedDurationMonths: duration,
        notes: notes || "Submitting rental application from listing page.",
      });
    },
    onSuccess: () => {
      toast.success("Rental application submitted!");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["tenant-applications"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not submit application.",
      );
    },
  });

  if (loadingProperty) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Property Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This listing may have been removed or is unavailable.
        </p>
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-6 inline-flex items-center gap-2",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Properties
        </Link>
      </div>

      {/* Property Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {property.title}
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {property.status || "AVAILABLE"}
            </Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            {[property.address, property.city].filter(Boolean).join(", ") ||
              "Livo Managed Residence"}
          </p>
          {property.description && (
            <p className="max-w-2xl text-sm text-slate-600">
              {property.description}
            </p>
          )}
        </div>

        {property.rentAmount && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right">
            <p className="text-xs text-slate-500">Starting From</p>
            <p className="text-xl font-bold text-slate-900">
              ${Number(property.rentAmount).toLocaleString()}/mo
            </p>
          </div>
        )}
      </div>

      {/* Multi-Image Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-video max-h-115 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image
            src={currentImage}
            alt={`${property.title} - photo ${safeImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1152px"
            priority
          />
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
            <Images className="h-3.5 w-3.5" />
            {safeImageIndex + 1} / {galleryImages.length}
          </div>
        </div>

        {galleryImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((imgUrl, index) => {
              const isSelected = index === safeImageIndex;
              return (
                <button
                  key={`${imgUrl}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border transition-all",
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/40"
                      : "border-slate-200 opacity-75 hover:opacity-100",
                  )}
                  aria-label={`View photo ${index + 1}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${property.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Units & Rooms List */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Available Units & Rooms
          </h2>
          {units.length === 0 ? (
            <Card className="border-slate-200 bg-white">
              <CardContent className="py-8 text-center text-sm text-slate-500">
                No units or rooms listed for this property yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const isSelectedUnit = unit.id === activeUnitId;
                const unitRooms = isSelectedUnit ? rooms : unit.rooms || [];
                return (
                  <Card
                    key={unit.id}
                    className={cn(
                      "border-slate-200 bg-white transition-colors",
                      isSelectedUnit && "ring-1 ring-emerald-500",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Unit{" "}
                          {unit.unitNumber || unit.title || unit.id.slice(0, 6)}
                        </CardTitle>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelectedUnit ? "secondary" : "outline"}
                          onClick={() => {
                            setSelectedUnitId(unit.id);
                            setSelectedRoomId("");
                          }}
                        >
                          {isSelectedUnit ? "Selected Unit" : "Select Unit"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {unitRooms.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No rooms listed under this unit.
                        </p>
                      ) : (
                        unitRooms.map((room) => {
                          const isSelectedRoom = room.id === activeRoomId;
                          return (
                            <div
                              key={room.id}
                              onClick={() => {
                                setSelectedUnitId(unit.id);
                                setSelectedRoomId(room.id);
                              }}
                              className={cn(
                                "flex cursor-pointer items-center justify-between rounded-md border px-3.5 py-2.5 text-sm transition-colors",
                                isSelectedRoom
                                  ? "border-emerald-600 bg-emerald-50/50"
                                  : "border-slate-200 hover:bg-slate-50",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {isSelectedRoom && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                )}
                                <span className="font-medium text-slate-900">
                                  {room.roomNumber || room.name || "Room"}
                                </span>
                                {room.status && (
                                  <Badge variant="outline" className="text-xs">
                                    {room.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                {room.rentAmount && (
                                  <span className="font-semibold text-slate-900">
                                    ${Number(room.rentAmount).toLocaleString()}
                                    /mo
                                  </span>
                                )}
                                {room.depositAmount && (
                                  <span className="ml-2 text-xs text-slate-500">
                                    ($
                                    {Number(
                                      room.depositAmount,
                                    ).toLocaleString()}{" "}
                                    dep)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Viewing & Rental Application Action Card */}
        <div>
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Tour or Apply for Room</CardTitle>
              <CardDescription>
                {activeRoom
                  ? `Selected: ${activeRoom.roomNumber || activeRoom.name || "Room"}`
                  : "Select a room to request a tour or apply."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="detailPreferredDate">
                  Preferred Viewing Date
                </Label>
                <Input
                  id="detailPreferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detailMoveInDate">Desired Move-In Date</Label>
                <Input
                  id="detailMoveInDate"
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detailDuration">
                  Intended Duration (Months)
                </Label>
                <Input
                  id="detailDuration"
                  type="number"
                  min={1}
                  step={1}
                  value={intendedDurationMonths}
                  onChange={(e) => setIntendedDurationMonths(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="detailNotes">Notes</Label>
                <Textarea
                  id="detailNotes"
                  rows={2}
                  placeholder="Add tour preferences or move-in notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!activeRoomId || viewingMutation.isPending}
                  onClick={() => viewingMutation.mutate()}
                  className="w-full"
                >
                  {viewingMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarPlus className="mr-2 h-4 w-4 text-emerald-600" />
                  )}
                  Request Viewing
                </Button>

                <Button
                  type="button"
                  disabled={!activeRoomId || applicationMutation.isPending}
                  onClick={() => applicationMutation.mutate()}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {applicationMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FilePlus className="mr-2 h-4 w-4" />
                  )}
                  Submit Rental Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
