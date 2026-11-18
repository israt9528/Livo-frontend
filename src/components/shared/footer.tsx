import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Livo</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Modern housing, verified roommate matching, digital lease
              workflows, and transparent utility management built for tenants
              and property owners.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="hover:text-emerald-400">
                  Browse Properties & Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400">
                  Plans & Fee Structure
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400">
                  About Livo
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400">
                  Help & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Role Portals
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-emerald-400">
                  Tenant Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400">
                  Property Owner Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Gulshan Avenue, Dhaka 1212</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>support@livo-housing.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Livo Housing Management. All
            rights reserved.
          </p>
          <p className="mt-2 sm:mt-0">
            Secure Payments Powered by Stripe / SSLCommerz
          </p>
        </div>
      </div>
    </footer>
  );
}
