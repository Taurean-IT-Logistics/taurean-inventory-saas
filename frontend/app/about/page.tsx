import { logo } from "@/assets";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">
              About FacilityHub
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Revolutionizing facility management through innovative SaaS
              solutions. We empower organizations to streamline their
              operations, enhance user experiences, and maximize facility
              utilization.
            </p>
          </div>

          {/* Company Overview */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-slate-600 mb-6">
                  At Taurean IT Logistics, we believe that efficient facility
                  management should be accessible to every organization. Our
                  multi-tenant SaaS platform provides comprehensive solutions
                  for facility rentals, event management, and operational
                  oversight.
                </p>
                <p className="text-slate-600 mb-6">
                  From small businesses to large enterprises, our platform
                  scales to meet your needs while maintaining the highest
                  standards of security, reliability, and user experience.
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src={logo}
                  alt="Taurean IT Logo"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              What Sets Us Apart
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Multi-Tenant Architecture
                  </h3>
                  <p className="text-sm text-slate-600">
                    Secure, isolated environments for each organization with
                    shared infrastructure benefits.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Role-Based Access
                  </h3>
                  <p className="text-sm text-slate-600">
                    Granular permission controls ensuring the right people have
                    access to the right information.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Enterprise Security
                  </h3>
                  <p className="text-sm text-slate-600">
                    Bank-level security with encryption, audit trails, and
                    compliance features.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Global Ready
                  </h3>
                  <p className="text-sm text-slate-600">
                    Multi-currency support and localization features for
                    worldwide deployment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Platform Capabilities
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center justify-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Facility Management
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Real-time availability tracking</li>
                  <li>• Automated booking conflict prevention</li>
                  <li>• Inventory quantity management</li>
                  <li>• Return and condition tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Financial Operations
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Dynamic invoice customization</li>
                  <li>• Multi-payment method support</li>
                  <li>• Tax compliance management</li>
                  <li>• Cash flow analysis tools</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  User Experience
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Intuitive booking interface</li>
                  <li>• Mobile-responsive design</li>
                  <li>• Shopping cart functionality</li>
                  <li>• Real-time notifications</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Administration
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Super admin oversight</li>
                  <li>• Company-specific dashboards</li>
                  <li>• Subscription management</li>
                  <li>• License key system</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Ready to Transform Your Facility Management?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join organizations worldwide who trust FacilityHub for their
              facility management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
                  Contact Sales
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
