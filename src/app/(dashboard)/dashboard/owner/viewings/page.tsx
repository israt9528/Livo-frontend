import type { Metadata } from "next";
import { ViewingsManager } from "@/components/dashboard/ViewingsManager";

export const metadata: Metadata = {
  title: "Viewing Requests | Livo Owner",
  description: "Review and respond to tenant viewing requests.",
};

export default function OwnerViewingsPage() {
  return <ViewingsManager />;
}
