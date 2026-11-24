import type { Metadata } from "next";
import { OwnerLeasesManager } from "@/components/dashboard/owner/OwnerLeasesManager";

export const metadata: Metadata = {
  title: "Applications & Leases | Livo Owner",
  description:
    "Review tenant applications, approve requests, and create active leases.",
};

export default function OwnerLeasesPage() {
  return <OwnerLeasesManager />;
}
