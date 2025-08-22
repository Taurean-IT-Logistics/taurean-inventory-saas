import { Header } from "@/components/layout/header"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-4">
                By accessing and using FacilityHub, you accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Subscription and Payment</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Subscription plans: Monthly, Bi-Annual (6 months), Annual (12 months), Tri-Annual (3 years)</li>
                <li>All plans provide full access to platform features</li>
                <li>Account access is tied to active subscription status</li>
                <li>Automatic suspension upon subscription expiration</li>
                <li>License keys are refreshed with each renewal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Multi-Tenant Usage</h2>
              <p className="text-slate-600 mb-4">
                Each organization operates independently within our shared platform environment. Companies are
                responsible for managing their own users, bookings, and data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Maintain accurate account information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect other users and facilities</li>
                <li>Report any security vulnerabilities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-slate-600 mb-4">
                Taurean IT Logistics shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Information</h2>
              <p className="text-slate-600">
                For questions about these Terms of Service, contact us at legal@facilityhub.com or through our contact
                page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
