"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  Building2,
  DoorOpen,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
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

interface RoomItem {
  id: string;
  roomNumber?: string;
  name?: string;
  rentAmount?: number;
  status?: string;
  unitId?: string;
}

interface UnitItem {
  id: string;
  unitNumber?: string;
  title?: string;
  floor?: number;
  rentAmount?: number;
  status?: string;
  propertyId?: string;
  rooms?: RoomItem[];
}

interface OwnerProperty {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  rentAmount?: number;
  propertyType?: string;
  status?: string;
  units?: UnitItem[];
}

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO"]),
  address: z.string().min(4, "Street address is required"),
  city: z.string().min(2, "City is required"),
  rentAmount: z.coerce.number().min(1, "Monthly rent must be greater than 0"),
  description: z
    .string()
    .min(10, "Provide at least 10 characters of description"),
});

type PropertyFormInput = z.input<typeof propertySchema>;
type PropertyFormValues = z.output<typeof propertySchema>;

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number/name is required"),
  floor: z.coerce.number().min(0, "Floor must be 0 or higher"),
  rentAmount: z.coerce.number().min(1, "Unit rent must be greater than 0"),
});

type UnitFormInput = z.input<typeof unitSchema>;
type UnitFormValues = z.output<typeof unitSchema>;

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room label/number is required"),
  rentAmount: z.coerce.number().min(1, "Room rent must be greater than 0"),
});

type RoomFormInput = z.input<typeof roomSchema>;
type RoomFormValues = z.output<typeof roomSchema>;

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
      []
    );
  }
  return [];
}

export function OwnerPropertiesManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProperty, setShowCreateProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<OwnerProperty | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const {
    data: properties = [],
    isLoading,
    refetch,
  } = useQuery<OwnerProperty[]>({
    queryKey: ["owner-properties"],
    queryFn: async () => {
      const res = await apiClient.get("/properties", { params: { limit: 50 } });
      return extractList<OwnerProperty>(res);
    },
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery<UnitItem[]>({
    queryKey: ["property-units", selectedProperty?.id],
    enabled: Boolean(selectedProperty?.id),
    queryFn: async () => {
      const res = await apiClient.get("/units", {
        params: { propertyId: selectedProperty?.id },
      });
      const all = extractList<UnitItem>(res);
      return all.filter(
        (u) => !u.propertyId || u.propertyId === selectedProperty?.id,
      );
    },
  });

  const { data: rooms = [], isLoading: loadingRooms } = useQuery<RoomItem[]>({
    queryKey: ["unit-rooms", selectedUnitId],
    enabled: Boolean(selectedUnitId),
    queryFn: async () => {
      const res = await apiClient.get("/rooms", {
        params: { unitId: selectedUnitId },
      });
      const all = extractList<RoomItem>(res);
      return all.filter((r) => !r.unitId || r.unitId === selectedUnitId);
    },
  });

  const propertyForm = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      propertyType: "APARTMENT",
      address: "",
      city: "Dhaka",
      rentAmount: 1200,
      description: "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: (values: PropertyFormValues) =>
      apiClient.post("/properties", values),
    onSuccess: () => {
      toast.success("Property published successfully!");
      propertyForm.reset();
      setShowCreateProperty(false);
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create property.",
      );
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) =>
      apiClient.delete(`/properties/${propertyId}`),
    onSuccess: (_, deletedId) => {
      toast.success("Property removed from registry.");
      if (selectedProperty?.id === deletedId) {
        setSelectedProperty(null);
        setSelectedUnitId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not delete property.",
      );
    },
  });

  const unitForm = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: "",
      floor: 1,
      rentAmount: 800,
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (values: UnitFormValues) =>
      apiClient.post("/units", {
        ...values,
        propertyId: selectedProperty?.id,
      }),
    onSuccess: () => {
      toast.success("Unit added to property!");
      unitForm.reset({ unitNumber: "", floor: 1, rentAmount: 800 });
      queryClient.invalidateQueries({
        queryKey: ["property-units", selectedProperty?.id],
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add unit.");
    },
  });

  const roomForm = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      rentAmount: 450,
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (values: RoomFormValues) =>
      apiClient.post("/rooms", {
        ...values,
        unitId: selectedUnitId,
      }),
    onSuccess: () => {
      toast.success("Room added to unit!");
      roomForm.reset({ roomNumber: "", rentAmount: 450 });
      queryClient.invalidateQueries({
        queryKey: ["unit-rooms", selectedUnitId],
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to add room.");
    },
  });

  const filteredProperties = properties.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Properties, Units & Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Publish new residential listings and configure rentable units or
            individual bedrooms.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateProperty((prev) => !prev)}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {showCreateProperty ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Close Form
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add New Property
            </>
          )}
        </Button>
      </div>

      {showCreateProperty && (
        <Card className="border-emerald-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Publish New Property Listing</CardTitle>
            <CardDescription>
              Fill in the property details below to make it visible in the Livo
              directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={propertyForm.handleSubmit((vals) =>
                createPropertyMutation.mutate(vals),
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="Greenview Heights Apartment"
                    {...propertyForm.register("title")}
                  />
                  {propertyForm.formState.errors.title && (
                    <p className="text-xs text-red-600">
                      {propertyForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <select
                    id="propertyType"
                    {...propertyForm.register("propertyType")}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="ROOM">Shared Room</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rentAmount">Base Monthly Rent ($)</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    {...propertyForm.register("rentAmount")}
                  />
                  {propertyForm.formState.errors.rentAmount && (
                    <p className="text-xs text-red-600">
                      {propertyForm.formState.errors.rentAmount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="House 18, Road 7, Banani"
                    {...propertyForm.register("address")}
                  />
                  {propertyForm.formState.errors.address && (
                    <p className="text-xs text-red-600">
                      {propertyForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Dhaka"
                    {...propertyForm.register("city")}
                  />
                  {propertyForm.formState.errors.city && (
                    <p className="text-xs text-red-600">
                      {propertyForm.formState.errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Property Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe bedrooms, amenities, nearby transit, and utility policies..."
                  {...propertyForm.register("description")}
                />
                {propertyForm.formState.errors.description && (
                  <p className="text-xs text-red-600">
                    {propertyForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateProperty(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPropertyMutation.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {createPropertyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Property"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Your Listed Properties</CardTitle>
            <CardDescription>
              Select a property row to manage its floor units and individual
              rooms.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter your properties..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                No properties found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Click &ldquo;Add New Property&rdquo; above to create your first
                rental listing.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
                Refresh List
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 pr-4">Property</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Monthly Rent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((prop) => {
                    const isSelected = selectedProperty?.id === prop.id;
                    return (
                      <tr
                        key={prop.id}
                        className={
                          isSelected
                            ? "bg-emerald-50/60"
                            : "hover:bg-slate-50/80"
                        }
                      >
                        <td className="py-3.5 pr-4 font-medium text-slate-900">
                          {prop.title}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="outline">
                            {prop.propertyType || "APARTMENT"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            {prop.city || prop.address || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-700">
                          {prop.rentAmount
                            ? `$${prop.rentAmount.toLocaleString()}/mo`
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            {prop.status || "AVAILABLE"}
                          </Badge>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => {
                                setSelectedProperty(isSelected ? null : prop);
                                setSelectedUnitId(null);
                              }}
                              className={
                                isSelected
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : ""
                              }
                            >
                              <Layers className="mr-1.5 h-3.5 w-3.5" />
                              {isSelected ? "Close Units" : "Units & Rooms"}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={deletePropertyMutation.isPending}
                              onClick={() =>
                                deletePropertyMutation.mutate(prop.id)
                              }
                              title="Delete property"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {selectedProperty && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DoorOpen className="h-5 w-5 text-emerald-600" />
                Units in {selectedProperty.title}
              </CardTitle>
              <CardDescription>
                Add apartment units or floors, then click a unit to manage its
                bedrooms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form
                onSubmit={unitForm.handleSubmit((vals) =>
                  createUnitMutation.mutate(vals),
                )}
                className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 sm:grid-cols-4"
              >
                <div>
                  <Input
                    placeholder="Unit # (e.g. 2B)"
                    {...unitForm.register("unitNumber")}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Floor"
                    {...unitForm.register("floor")}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Rent ($)"
                    {...unitForm.register("rentAmount")}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createUnitMutation.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {createUnitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Unit"
                  )}
                </Button>
              </form>

              {loadingUnits ? (
                <Skeleton className="h-28 w-full" />
              ) : units.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No units added to this property yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {units.map((unit) => {
                    const activeUnit = selectedUnitId === unit.id;
                    return (
                      <div
                        key={unit.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          activeUnit
                            ? "border-emerald-500 bg-emerald-50/60"
                            : "border-slate-200"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            Unit{" "}
                            {unit.unitNumber ||
                              unit.title ||
                              unit.id.slice(0, 6)}
                          </p>
                          <p className="text-xs text-slate-500">
                            Floor {unit.floor ?? 1} ·{" "}
                            {unit.rentAmount
                              ? `$${unit.rentAmount}/mo`
                              : "Rent flexible"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={activeUnit ? "default" : "outline"}
                          onClick={() =>
                            setSelectedUnitId(activeUnit ? null : unit.id)
                          }
                          className={
                            activeUnit
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : ""
                          }
                        >
                          <BedDouble className="mr-1.5 h-3.5 w-3.5" />
                          Manage Rooms
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BedDouble className="h-5 w-5 text-emerald-600" />
                Rooms Inside Selected Unit
              </CardTitle>
              <CardDescription>
                {selectedUnitId
                  ? "Configure individual rooms for shared co-living or roommate rentals."
                  : "Select a unit on the left to view or add rentable rooms."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedUnitId ? (
                <>
                  <form
                    onSubmit={roomForm.handleSubmit((vals) =>
                      createRoomMutation.mutate(vals),
                    )}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 sm:grid-cols-3"
                  >
                    <Input
                      placeholder="Room # (e.g. R-101)"
                      {...roomForm.register("roomNumber")}
                    />
                    <Input
                      type="number"
                      placeholder="Room Rent ($)"
                      {...roomForm.register("rentAmount")}
                    />
                    <Button
                      type="submit"
                      disabled={createRoomMutation.isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {createRoomMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Add Room"
                      )}
                    </Button>
                  </form>

                  {loadingRooms ? (
                    <Skeleton className="h-28 w-full" />
                  ) : rooms.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      No individual rooms added to this unit yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              Room{" "}
                              {room.roomNumber ||
                                room.name ||
                                room.id.slice(0, 6)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {room.rentAmount
                                ? `$${room.rentAmount}/mo`
                                : "Standard rate"}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            {room.status || "AVAILABLE"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Click &ldquo;Manage Rooms&rdquo; on any unit to attach
                  bedrooms.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
