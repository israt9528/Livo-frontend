import type { Metadata } from "next";
import { OwnerPropertiesManager } from "@/components/dashboard/owner/OwnerPropertiesManager";

export const metadata: Metadata = {
  title: "Manage Properties, Units & Rooms | Livo Owner",
  description:
    "Create and manage residential properties, floor units, and individual rentable rooms.",
};

export default function OwnerPropertiesPage() {
  return <OwnerPropertiesManager />;
}
