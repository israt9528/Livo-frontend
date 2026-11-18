import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileSignature,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Livo | Smart Housing, Verified Roommates & Digital Lease Management",
  description:
    "Discover verified rental properties, connect with compatible roommates, sign digital leases, and split utilities effortlessly on Livo.",
};

interface PropertyItem {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  rentAmount?: number;
  propertyType?: string;
  status?: string;
  images?: string[];
  media?: Array<{ url: string }>;
}

async function getFeaturedProperties(): Promise<PropertyItem[]> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://livo-k21s.onrender.com/api/v1";
    const res = await fetch(`${apiUrl}/properties?limit=6`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    return [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const properties = await getFeaturedProperties();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30 px-3 py-1">
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
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  <Link href="/services">
                    Explore Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 bg-slate-800/60 text-white hover:bg-slate-800 hover:text-white"
                >
                  <Link href="/login">Try Instant Demo Login</Link>
                </Button>
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

      {/* Live Featured Properties from Backend API */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Featured Available Properties
              </h2>
              <p className="mt-2 text-slate-600">
                Live listings fetched directly from the Livo property registry.
              </p>
            </div>
            <Button variant="outline">
              <Link href="/services">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {properties.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const imageUrl =
                  property.images?.[0] ||
                  property.media?.[0]?.url ||
                  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

                return (
                  <Card
                    key={property.id}
                    className="overflow-hidden border-slate-200 bg-white transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] w-full bg-slate-100">
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {property.propertyType && (
                        <Badge className="absolute left-3 top-3 bg-slate-900/80 text-white">
                          {property.propertyType}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                        {property.title}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">
                          {property.address ||
                            property.city ||
                            "Verified Location"}
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {property.description ||
                          "Modern residential listing with transparent lease terms and digital management."}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                      <div>
                        <span className="text-lg font-bold text-emerald-700">
                          {property.rentAmount
                            ? `$${property.rentAmount.toLocaleString()}`
                            : "Contact for Rent"}
                        </span>
                        {property.rentAmount && (
                          <span className="text-xs text-slate-500"> / mo</span>
                        )}
                      </div>
                      <Button size="sm" variant="secondary">
                        <Link
                          href={`/services?search=${encodeURIComponent(property.title)}`}
                        >
                          Inspect
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="mt-10 border-dashed border-slate-300 bg-white p-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Explore Live Listings in Services
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Browse all properties, filter by budget or location, or sign in
                with a Demo Owner account to publish new listings.
              </p>
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/services">Open Property Directory</Link>
              </Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
