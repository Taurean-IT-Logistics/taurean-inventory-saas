import { Header } from "@/components/layout/header"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
              <p className="text-slate-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, make a booking,
                or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Account information (name, email, phone number)</li>
                <li>Company information and registration documents</li>
                <li>Booking and transaction data</li>
                <li>Payment information (processed securely through Paystack)</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide and maintain our facility management services</li>
                <li>Process bookings and payments</li>
                <li>Send important notifications about your account</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Data Security</h2>
              <p className="text-slate-600 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Multi-Tenant Data Isolation</h2>
              <p className="text-slate-600 mb-4">
                Our multi-tenant architecture ensures that each organization&apos;s data is completely isolated and secure
                from other tenants on the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
              <p className="text-slate-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@facilityhub.com or
                through our contact page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
