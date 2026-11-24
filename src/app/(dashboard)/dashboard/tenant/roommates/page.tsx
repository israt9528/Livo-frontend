import type { Metadata } from "next";
import { TenantRoommatesManager } from "@/components/dashboard/tenant/TenantRoommatesManager";

export const metadata: Metadata = {
  title: "Roommate Finder | Livo Tenant",
  description: "Browse and post roommate profiles across Livo rental listings.",
};

export default function TenantRoommatesPage() {
  return <TenantRoommatesManager />;
}
