import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  const faqs = [
    {
      question: "What is FacilityHub?",
      answer:
        "FacilityHub is a comprehensive multi-tenant SaaS platform for facility and event management. It helps organizations manage facility rentals, bookings, payments, and operations efficiently.",
    },
    {
      question: "How does the multi-tenant architecture work?",
      answer:
        "Each organization operates independently within our shared platform. Your data is completely isolated and secure from other tenants, while you benefit from shared infrastructure and regular updates.",
    },
    {
      question: "What subscription plans are available?",
      answer:
        "We offer flexible subscription plans: Monthly, Bi-Annual (6 months), Annual (12 months), and Tri-Annual (3 years). All plans provide full access to platform features.",
    },
    {
      question: "How does billing and invoicing work?",
      answer:
        "Each company can customize invoice formatting with auto-incrementing numbers, custom patterns, or Paystack references. Invoices include detailed breakdowns with quantities, durations, and tax calculations.",
    },
    {
      question: "Can I manage user roles and permissions?",
      answer:
        "Yes! Companies can define custom user roles with granular permissions. Control access to financial modules, booking systems, and administrative functions based on your organizational needs.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "We support multiple payment methods including cash, mobile money (MTN, Vodafone, AirtelTigo, Telecel), and card payments through Paystack integration.",
    },
    {
      question: "How does facility availability work?",
      answer:
        "Each facility has its own availability calendar. The system prevents booking conflicts and automatically manages inventory quantities based on bookings and returns.",
    },
    {
      question: "Is the platform mobile-friendly?",
      answer:
        "FacilityHub is fully responsive and optimized for mobile devices, tablets, and desktops to ensure a seamless experience across all platforms.",
    },
    {
      question: "What happens if my subscription expires?",
      answer:
        "Account access is automatically suspended when subscriptions expire. Simply renew your subscription to restore full access to your data and platform features.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We implement bank-level security with encryption, audit trails, and compliance features. Each tenant's data is completely isolated with comprehensive access controls.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-slate-600">
              Find answers to common questions about FacilityHub and our platform features.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center bg-slate-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
            <p className="text-slate-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
