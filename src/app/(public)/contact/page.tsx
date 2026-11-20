import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Support | Livo Housing Management",
  description:
    "Reach out to the Livo support team for assistance with property onboarding, tenant leases, or billing questions.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Get in Touch with Livo Support
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Have questions about verifying a property, setting up roommate splits,
          or managing your lease? Send us a message below.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Contact Details */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="flex items-start gap-3.5 pt-6">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Headquarters</h3>
                <p className="mt-1 text-sm text-slate-600">
                  House 42, Road 11, Gulshan-2, Dhaka 1212
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="flex items-start gap-3.5 pt-6">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Email Support</h3>
                <p className="mt-1 text-sm text-slate-600">
                  support@livo-housing.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="flex items-start gap-3.5 pt-6">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Phone</h3>
                <p className="mt-1 text-sm text-slate-600">+880 1700-000000</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="flex items-start gap-3.5 pt-6">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Support Hours</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Saturday – Thursday: 9:00 AM – 8:00 PM (BST)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send Us a Direct Message</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
