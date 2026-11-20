import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing & Plans | Livo Housing Platform",
  description:
    "Transparent pricing for tenants, individual landlords, and multi-unit property managers on Livo.",
};

const PLANS = [
  {
    name: "Tenant Explorer",
    price: "$0",
    period: "/ forever",
    description:
      "Everything renters need to find homes, match roommates, and pay rent.",
    featured: false,
    features: [
      "Unlimited property & roommate search",
      "Online viewing request scheduling",
      "Digital rental application submission",
      "Automated utility split tracking",
      "Online rent & deposit payments",
    ],
    cta: "Start as Tenant",
    href: "/register",
  },
  {
    name: "Property Owner Pro",
    price: "$29",
    period: "/ month",
    description:
      "Designed for landlords managing multi-unit apartments and shared houses.",
    featured: true,
    features: [
      "Up to 25 active property & unit listings",
      "Tenant application screening & approvals",
      "Digital lease generation & status tracking",
      "Automated rent & utility ledger",
      "Real-time earnings & occupancy analytics",
    ],
    cta: "Start Owner Trial",
    href: "/login",
  },
  {
    name: "Portfolio Enterprise",
    price: "$99",
    period: "/ month",
    description:
      "Full-scale management for residential complexes and agencies.",
    featured: false,
    features: [
      "Unlimited properties, units & rooms",
      "Priority listing placement in directory",
      "Multi-admin & audit log reporting",
      "Dedicated payment reconciliation exports",
      "24/7 priority onboarding support",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

const FAQS = [
  {
    q: "Are tenant accounts completely free to use?",
    a: "Yes. Tenants can browse properties, schedule viewings, match with roommates, and submit rental applications at zero subscription cost.",
  },
  {
    q: "How are online rent and deposit payments processed?",
    a: "Livo integrates directly with real payment gateways in Test Mode so every transaction is verified server-side before updating lease or payment records.",
  },
  {
    q: "Can property owners manage individual rooms inside a unit?",
    a: "Yes. Livo supports hierarchical Property → Unit → Room structures so owners can rent out entire apartments or individual bedrooms.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          Transparent Plans
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Simple Pricing for Every Housing Role
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Free forever for tenants. Flexible plans for property owners scaling
          their rental portfolio.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col border-slate-200 bg-white",
              plan.featured &&
                "border-2 border-emerald-600 shadow-lg ring-1 ring-emerald-600/20",
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {plan.featured && (
                  <Badge className="bg-emerald-600 text-white">
                    Most Popular
                  </Badge>
                )}
              </div>
              <CardDescription className="pt-1.5">
                {plan.description}
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-extrabold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500"> {plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm text-slate-600">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: plan.featured ? "default" : "outline",
                  }),
                  "w-full",
                  plan.featured &&
                    "bg-emerald-600 text-white hover:bg-emerald-700",
                )}
              >
                {plan.cta}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="border-slate-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                {faq.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
