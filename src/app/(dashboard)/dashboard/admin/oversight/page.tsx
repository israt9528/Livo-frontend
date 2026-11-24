import type { Metadata } from "next";
import { AdminOversightManager } from "@/components/dashboard/admin/AdminOversightManager";

export const metadata: Metadata = {
  title: "Admin Oversight | Livo",
  description: "Monitor platform users, registered properties, and payments.",
};

export default function AdminOversightPage() {
  return <AdminOversightManager />;
}
