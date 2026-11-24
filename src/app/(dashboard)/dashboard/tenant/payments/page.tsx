import type { Metadata } from "next";
import { TenantPaymentsManager } from "@/components/dashboard/tenant/TenantPaymentsManager";

export const metadata: Metadata = {
  title: "Rent & Utilities | Livo Tenant",
  description: "Pay monthly rent and utilities and view payment receipts.",
};

export default function TenantPaymentsPage() {
  return <TenantPaymentsManager />;
}
