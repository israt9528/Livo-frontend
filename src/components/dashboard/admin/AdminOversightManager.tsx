"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CreditCard,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
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

interface AdminUserRecord {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

interface AdminPropertyRecord {
  id: string;
  title: string;
  city?: string;
  address?: string;
  rentAmount?: number;
  status?: string;
  owner?: { name?: string; fullName?: string; email?: string };
}

interface AdminPaymentRecord {
  id: string;
  amount?: number;
  type?: string;
  status?: string;
  billingMonth?: string;
  createdAt?: string;
  lease?: {
    property?: { title?: string };
  };
}

type AdminTab = "USERS" | "PROPERTIES" | "PAYMENTS";

function extractList<T>(res: unknown): T[] {
  const obj = res as {
    data?:
      | T[]
      | {
          data?: T[];
          items?: T[];
          users?: T[];
          properties?: T[];
          payments?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return (
      obj.data.data ||
      obj.data.items ||
      obj.data.users ||
      obj.data.properties ||
      obj.data.payments ||
      []
    );
  }
  return [];
}

function statusPill(status?: string) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
    case "PAID":
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "SUSPENDED":
    case "REJECTED":
    case "FAILED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

export function AdminOversightManager() {
  const [activeTab, setActiveTab] = useState<AdminTab>("USERS");
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading: loadingUsers } = useQuery<
    AdminUserRecord[]
  >({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiClient.get("/users", { params: { limit: 100 } });
      return extractList<AdminUserRecord>(res);
    },
  });

  const { data: properties = [], isLoading: loadingProps } = useQuery<
    AdminPropertyRecord[]
  >({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const res = await apiClient.get("/properties", {
        params: { limit: 100 },
      });
      return extractList<AdminPropertyRecord>(res);
    },
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<
    AdminPaymentRecord[]
  >({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const res = await apiClient.get("/payments", { params: { limit: 100 } });
      return extractList<AdminPaymentRecord>(res);
    },
  });

  const query = search.trim().toLowerCase();

  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    const label = u.name || u.fullName || "";
    return (
      label.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.role || "").toLowerCase().includes(query)
    );
  });

  const filteredProperties = properties.filter((p) => {
    if (!query) return true;
    const ownerLabel =
      p.owner?.name || p.owner?.fullName || p.owner?.email || "";
    return (
      p.title.toLowerCase().includes(query) ||
      (p.city || "").toLowerCase().includes(query) ||
      ownerLabel.toLowerCase().includes(query)
    );
  });

  const filteredPayments = payments.filter((pay) => {
    if (!query) return true;
    return (
      (pay.type || "").toLowerCase().includes(query) ||
      (pay.billingMonth || "").toLowerCase().includes(query) ||
      (pay.lease?.property?.title || "").toLowerCase().includes(query)
    );
  });

  const totalVolume = payments.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Platform Administration & Registry
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitor registered users, property listings, and rent/utility payment
          volume across Livo.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {users.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Registered Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loadingProps ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {properties.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Payment Volume
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                ${totalVolume.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tab & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(
            [
              { id: "USERS", label: "Users" },
              { id: "PROPERTIES", label: "Properties Registry" },
              { id: "PAYMENTS", label: "Payments Monitor" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="bg-white pl-9"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "USERS" && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              User Accounts
            </CardTitle>
            <CardDescription>
              All accounts with role and status metadata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <Skeleton className="h-28 w-full" />
            ) : filteredUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No users found.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {u.name || u.fullName || u.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{u.role || "TENANT"}</Badge>
                      <Badge className={statusPill(u.status)}>
                        {u.status || "ACTIVE"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "PROPERTIES" && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Properties Registry</CardTitle>
            <CardDescription>
              Properties listed by owners across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProps ? (
              <Skeleton className="h-28 w-full" />
            ) : filteredProperties.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No properties found.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{prop.title}</p>
                      <p className="text-xs text-slate-500">
                        {[
                          prop.city,
                          prop.owner?.name ||
                            prop.owner?.fullName ||
                            prop.owner?.email,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Property listing"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof prop.rentAmount === "number" && (
                        <span className="text-sm font-semibold text-slate-900">
                          ${prop.rentAmount.toLocaleString()}/mo
                        </span>
                      )}
                      <Badge className={statusPill(prop.status)}>
                        {prop.status || "ACTIVE"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "PAYMENTS" && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Payments Monitor</CardTitle>
            <CardDescription>
              Platform-wide rent and utility payment transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <Skeleton className="h-28 w-full" />
            ) : filteredPayments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No payment records found.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {pay.type || "PAYMENT"} ·{" "}
                        {pay.lease?.property?.title || "Livo Lease"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {pay.billingMonth ||
                          (pay.createdAt
                            ? new Date(pay.createdAt).toLocaleDateString()
                            : "Transaction")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        ${Number(pay.amount || 0).toLocaleString()}
                      </span>
                      <Badge className={statusPill(pay.status)}>
                        {pay.status || "PAID"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
