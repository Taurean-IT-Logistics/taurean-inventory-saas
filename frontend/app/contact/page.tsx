import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Get in Touch</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ready to revolutionize your facility management? Our team is here to help you get started with FacilityHub
              and answer any questions you may have.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input type="email" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <Input placeholder="Your Company Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <Input placeholder="+233 XX XXX XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <Textarea placeholder="Tell us about your facility management needs..." rows={4} />
                </div>
                <Button className="w-full bg-slate-900 hover:bg-slate-800">Send Message</Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Email Us</h3>
                      <p className="text-slate-600">info@taureanit.com</p>
                      <p className="text-slate-600">support@facilityhub.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Call Us</h3>
                      <p className="text-slate-600">+233 XX XXX XXXX</p>
                      <p className="text-sm text-slate-500">Monday - Friday, 8AM - 6PM GMT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Visit Us</h3>
                      <p className="text-slate-600">
                        Taurean IT Logistics
                        <br />
                        Accra, Ghana
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Business Hours</h3>
                      <div className="text-slate-600 space-y-1">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 2:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enterprise Section */}
          <div className="mt-16 text-center bg-slate-50 rounded-lg p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Enterprise Solutions</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Looking for a custom solution for your large organization? Our enterprise team can work with you to create
              a tailored facility management platform that meets your specific requirements.
            </p>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
