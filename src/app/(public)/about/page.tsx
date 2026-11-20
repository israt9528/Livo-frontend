import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CheckCircle2, Lock, Shield, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Livo | Modern Rental & Roommate Management",
  description:
    "Learn how Livo brings trust, role-based transparency, and automated lease and utility workflows to modern residential housing.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Reimagining Residential Renting & Co-Living
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Livo eliminates fragmented spreadsheets, unverified listings, and
            awkward roommate bill-splitting with a single unified platform built
            for Tenants, Property Owners, and Platform Administrators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-slate-200">
            <CardHeader>
              <Shield className="h-8 w-8 text-emerald-600" />
              <CardTitle className="pt-2">Verified Trust Layer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              Every property listing, unit configuration, and user profile goes
              through structured role-based verification to eliminate fraud and
              duplicate listings.
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <CardTitle className="pt-2">Seamless Co-Living</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              Roommate profiles highlight lifestyle habits, budget ranges, and
              shared utility breakdowns so housemates stay aligned from day one.
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <Lock className="h-8 w-8 text-emerald-600" />
              <CardTitle className="pt-2">Auditable Transactions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-600">
              All lease agreements, security deposits, and monthly rent
              settlements are backed by real-time payment gateway verification.
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-white sm:p-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Experience Every Role Instantly
              </h2>
              <p className="mt-3 text-slate-300">
                Evaluate Livo from the perspective of an Administrator, a
                Property Owner, or a Tenant using our one-click demo access.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Dedicated dashboards for ADMIN, OWNER, and TENANT roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Live PostgreSQL & Prisma REST API integration
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-emerald-600 text-white hover:bg-emerald-500",
                )}
              >
                Launch Demo Login
              </Link>
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-slate-700 bg-transparent text-white hover:bg-slate-800 hover:text-white",
                )}
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
