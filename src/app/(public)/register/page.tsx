import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Livo Housing Platform",
  description:
    "Create a Tenant or Property Owner account on Livo to manage rentals, roommates, and leases.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
