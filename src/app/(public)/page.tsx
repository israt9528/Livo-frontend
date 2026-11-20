import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileSignature,
  ShieldCheck,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Livo | Smart Housing, Verified Roommates & Digital Lease Management",
  description:
    "Discover verified rental properties, connect with compatible roommates, sign digital leases, and split utilities effortlessly on Livo.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-300 hover:bg-emerald-500/20">
                Verified Housing & Roommate Platform
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Find your next home &{" "}
                <span className="text-emerald-400">verified roommates</span>{" "}
                without the stress.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Browse transparent listings, schedule property viewings, sign
                digital leases, and automate rent and utility splits in one
                unified platform.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-emerald-600 font-semibold text-white hover:bg-emerald-500",
                  )}
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-slate-700 bg-slate-800/60 text-white hover:bg-slate-800 hover:text-white",
                  )}
                >
                  Try Instant Demo Login
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified Property Owners
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Digital Lease Signing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Secure Online Payments
                </span>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern residential apartment building"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for Tenants, Owners & Administrators
            </h2>
            <p className="mt-3 text-base text-slate-600">
              End-to-end tools covering the entire rental lifecycle from first
              tour to monthly utility settlement.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Listings",
                desc: "Every property, unit, and room is structured and moderated for complete transparency.",
              },
              {
                icon: Users,
                title: "Roommate Matching",
                desc: "Find compatible housemates based on lifestyle preferences, budget, and move-in dates.",
              },
              {
                icon: FileSignature,
                title: "Digital Leases",
                desc: "Submit rental applications online and track lease approvals without paperwork delays.",
              },
              {
                icon: CreditCard,
                title: "Automated Payments",
                desc: "Pay security deposits, monthly rent, and split utility bills securely via Test Mode gateway.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="border-slate-200 bg-slate-50/50 transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="pt-3 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Non-Blocking Live Featured Properties */}
      <FeaturedProperties />
    </div>
  );
}
