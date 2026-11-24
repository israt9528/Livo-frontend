import type { Metadata } from "next";
import { OwnerPaymentsManager } from "@/components/dashboard/owner/OwnerPaymentsManager";

export const metadata: Metadata = {
  title: "Utilities & Earnings | Livo Owner",
  description: "View collected rent, utility settlements, and payment history.",
};

export default function OwnerPaymentsPage() {
  return <OwnerPaymentsManager />;
}
