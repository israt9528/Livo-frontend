"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Users,
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

interface RoommateProfile {
  id: string;
  bio?: string;
  city?: string;
  area?: string;
  budget?: number;
  moveInDate?: string;
  lifestyle?: string;
  user?: {
    name?: string;
    fullName?: string;
    email?: string;
  };
}

const roommateSchema = z.object({
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Preferred neighborhood is required"),
  budget: z.coerce.number().min(50, "Budget must be at least $50"),
  moveInDate: z.string().min(4, "Move-in date is required"),
  lifestyle: z.string().min(2, "Lifestyle tag is required"),
  bio: z.string().min(10, "Share a short intro (at least 10 characters)"),
});

type RoommateFormInput = z.input<typeof roommateSchema>;
type RoommateFormValues = z.output<typeof roommateSchema>;

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[];
          items?: T[];
          roommates?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return obj.data.data || obj.data.items || obj.data.roommates || [];
  }
  return [];
}

export function TenantRoommatesManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);

  const { data: profiles = [], isLoading } = useQuery<RoommateProfile[]>({
    queryKey: ["tenant-roommates"],
    queryFn: async () => {
      const res = await apiClient.get("/roommate");
      return extractList<RoommateProfile>(res);
    },
  });

  const form = useForm<RoommateFormInput, unknown, RoommateFormValues>({
    resolver: zodResolver(roommateSchema),
    defaultValues: {
      city: "Dhaka",
      area: "Gulshan / Banani",
      budget: 500,
      moveInDate: "2026-12-15",
      lifestyle: "Quiet & Clean",
      bio: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: (values: RoommateFormValues) =>
      apiClient.post("/roommate", values),
    onSuccess: () => {
      toast.success("Your roommate profile is now live!");
      form.reset();
      setShowProfileForm(false);
      queryClient.invalidateQueries({ queryKey: ["tenant-roommates"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save roommate profile.",
      );
    },
  });

  const filteredProfiles = profiles.filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = item.user?.name || item.user?.fullName || "";
    return (
      name.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q) ||
      item.lifestyle?.toLowerCase().includes(q) ||
      item.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Roommate Finder
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Connect with verified prospective roommates by budget, neighborhood,
            and living habits.
          </p>
        </div>
        <Button
          onClick={() => setShowProfileForm((prev) => !prev)}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {showProfileForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Close Form
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Post Roommate Profile
            </>
          )}
        </Button>
      </div>

      {showProfileForm && (
        <Card className="border-emerald-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Create or Update Roommate Profile</CardTitle>
            <CardDescription>
              Let other tenants know your target budget, neighborhood, and daily
              routine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((vals) =>
                createProfileMutation.mutate(vals),
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register("city")} />
                  {form.formState.errors.city && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="area">Preferred Area</Label>
                  <Input id="area" {...form.register("area")} />
                  {form.formState.errors.area && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.area.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget">Monthly Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    {...form.register("budget")}
                  />
                  {form.formState.errors.budget && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.budget.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="moveInDate">Target Move-In Date</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    {...form.register("moveInDate")}
                  />
                  {form.formState.errors.moveInDate && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.moveInDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="lifestyle">Lifestyle & Habits</Label>
                  <Input
                    id="lifestyle"
                    placeholder="Early riser, non-smoker, remote worker"
                    {...form.register("lifestyle")}
                  />
                  {form.formState.errors.lifestyle && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.lifestyle.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Share what you're looking for in a roommate and shared apartment..."
                  {...form.register("bio")}
                />
                {form.formState.errors.bio && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProfileForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProfileMutation.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {createProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Publish Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by city, area, or lifestyle..."
          className="bg-white pl-9"
        />
      </div>

      {/* Profiles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No roommate profiles found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Post your own roommate profile or clear your search filter.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => {
            const displayName =
              profile.user?.name || profile.user?.fullName || "Livo Member";
            return (
              <Card
                key={profile.id}
                className="flex flex-col justify-between border-slate-200 bg-white"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{displayName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 pt-0.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        {[profile.area, profile.city]
                          .filter(Boolean)
                          .join(", ") || "Flexible Location"}
                      </CardDescription>
                    </div>
                    {profile.budget && (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        <DollarSign className="mr-0.5 h-3 w-3" />
                        {profile.budget}/mo
                      </Badge>
                    )}
                  </div>
                  {profile.lifestyle && (
                    <Badge variant="outline" className="w-fit text-xs">
                      <Sparkles className="mr-1 h-3 w-3 text-emerald-600" />
                      {profile.lifestyle}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-3 text-sm text-slate-600">
                    {profile.bio ||
                      "Looking for a clean, respectful roommate to share a well-located rental unit."}
                  </p>
                  {profile.moveInDate && (
                    <p className="text-xs font-medium text-slate-500">
                      Target move-in:{" "}
                      {new Date(profile.moveInDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
