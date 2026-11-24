"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, Loader2, Receipt, Zap } from "lucide-react";
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

interface LeaseOption {
  id: string;
  monthlyRent?: number;
  status?: string;
  property?: { title?: string };
  room?: { roomNumber?: string; name?: string };
}

interface PaymentRecord {
  id: string;
  amount?: number;
  type?: string;
  status?: string;
  billingMonth?: string;
  createdAt?: string;
  leaseId?: string;
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
          leases?: T[];
          payments?: T[];
        };
  };
  if (Array.isArray(obj?.data)) return obj.data;
  if (obj?.data && typeof obj.data === "object") {
    return (
      obj.data.data ||
      obj.data.items ||
      obj.data.leases ||
      obj.data.payments ||
      []
    );
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

export function TenantPaymentsManager() {
  const queryClient = useQueryClient();
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [paymentType, setPaymentType] = useState<"RENT" | "UTILITY">("RENT");
  const [amount, setAmount] = useState("500");
  const [billingMonth, setBillingMonth] = useState("2026-12");

  const { data: leases = [] } = useQuery<LeaseOption[]>({
    queryKey: ["tenant-payment-leases"],
    queryFn: async () => {
      const res = await apiClient.get("/leases");
      return extractList<LeaseOption>(res);
    },
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<
    PaymentRecord[]
  >({
    queryKey: ["tenant-payments"],
    queryFn: async () => {
      const res = await apiClient.get("/payments");
      return extractList<PaymentRecord>(res);
    },
  });

  const activeLeaseId = selectedLeaseId || leases[0]?.id || "";
  const activeLease = leases.find((l) => l.id === activeLeaseId);

  const payMutation = useMutation({
    mutationFn: () => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Enter a valid positive payment amount.");
      }
      return apiClient.post("/payments", {
        leaseId: activeLeaseId || undefined,
        type: paymentType,
        amount: numericAmount,
        billingMonth,
      });
    },
    onSuccess: () => {
      toast.success(`${paymentType} payment recorded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit payment.",
      );
    },
  });

  const totalPaid = payments.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rent & Utility Payments
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pay monthly rent or shared utilities and review your payment
            receipts.
          </p>
        </div>
        <Card className="border-slate-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Total Paid</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            ${totalPaid.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Payment Form */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Record a Rent or Utility Payment
          </CardTitle>
          <CardDescription>
            Select your lease, billing month, and charge category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="leaseSelect">Lease Agreement</Label>
              <select
                id="leaseSelect"
                value={activeLeaseId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedLeaseId(nextId);
                  const found = leases.find((l) => l.id === nextId);
                  if (paymentType === "RENT" && found?.monthlyRent) {
                    setAmount(String(found.monthlyRent));
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {leases.length === 0 ? (
                  <option value="">General / No Active Lease</option>
                ) : (
                  leases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.property?.title || "Lease"}
                      {lease.room?.roomNumber || lease.room?.name
                        ? ` — Room ${lease.room.roomNumber || lease.room.name}`
                        : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentType">Payment Type</Label>
              <select
                id="paymentType"
                value={paymentType}
                onChange={(e) => {
                  const nextType = e.target.value as "RENT" | "UTILITY";
                  setPaymentType(nextType);
                  if (nextType === "RENT" && activeLease?.monthlyRent) {
                    setAmount(String(activeLease.monthlyRent));
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="RENT">Monthly Rent</option>
                <option value="UTILITY">Utility Split</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billingMonth">Billing Month</Label>
              <Input
                id="billingMonth"
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentAmount">Amount ($)</Label>
              <Input
                id="paymentAmount"
                type="number"
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={payMutation.isPending}
              onClick={() => payMutation.mutate()}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentType === "UTILITY" ? (
                    <Zap className="mr-2 h-4 w-4" />
                  ) : (
                    <Receipt className="mr-2 h-4 w-4" />
                  )}
                  Submit {paymentType === "UTILITY" ? "Utility" : "Rent"}{" "}
                  Payment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Ledger */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription>
            Recorded rent and utility transactions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <Skeleton className="h-28 w-full" />
          ) : payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {payment.type || "PAYMENT"} ·{" "}
                      {payment.lease?.property?.title || "Livo Lease"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.billingMonth
                        ? `Billing: ${payment.billingMonth}`
                        : payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : "Recent transaction"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      ${Number(payment.amount || 0).toLocaleString()}
                    </span>
                    <Badge className={paymentStatusBadge(payment.status)}>
                      {payment.status || "PAID"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
