import type { Metadata } from "next";
import { ViewingsManager } from "@/components/dashboard/ViewingsManager";

export const metadata: Metadata = {
  title: "My Viewings | Livo Tenant",
  description: "View status updates for your scheduled property tours.",
};

export default function TenantViewingsPage() {
  return <ViewingsManager />;
}
