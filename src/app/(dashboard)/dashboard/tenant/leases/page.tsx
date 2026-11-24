import type { Metadata } from "next";
import { TenantLeasesManager } from "@/components/dashboard/tenant/TenantLeasesManager";

export const metadata: Metadata = {
  title: "My Leases & Applications | Livo Tenant",
  description: "Request viewings, apply for rentals, and view active leases.",
};

export default function TenantLeasesPage() {
  return <TenantLeasesManager />;
}
