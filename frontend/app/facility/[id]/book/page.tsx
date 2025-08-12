"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { BookingsAPI } from "@/lib/api"
import { FacilitiesAPI } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function BookingPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    guests: 1,
    purpose: "",
    specialRequests: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    paymentMethod: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Mock facility data
  const facility = {
    id: params.id,
    name: "Modern Conference Center in East Legon",
    location: "East Legon, Accra, Ghana",
    rating: 4.8,
    reviewCount: 127,
    price: 450,
    currency: "GH₵",
    image: "/placeholder.svg?height=200&width=300",
    host: {
      name: "Pamela",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  }

  const { data: calendar } = useQuery({ queryKey: ["facility-calendar", params.id], queryFn: () => FacilitiesAPI.calendar(params.id) })
  const calBookings = (calendar?.bookings || calendar?.data?.bookings || []) as Array<{ startDate: string; endDate: string }>

  const hasOverlap = () => {
    if (!bookingData.startDate || !bookingData.endDate) return false
    const s = new Date(bookingData.startDate).getTime()
    const e = new Date(bookingData.endDate).getTime()
    return calBookings.some((b) => {
      const bs = new Date(b.startDate).getTime()
      const be = new Date(b.endDate).getTime()
      return Math.max(s, bs) <= Math.min(e, be)
    })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    const days = 1 // Simplified for demo
    const subtotal = facility.price * days
    const serviceFee = 45
    const tax = Math.round(subtotal * 0.15) // 15% tax
    return { subtotal, serviceFee, tax, total: subtotal + serviceFee + tax }
  }

  const submitBooking = async () => {
    setError(null)
    setSuccess(null)
    if (hasOverlap()) {
      setError("Selected dates overlap with existing bookings. Please choose different dates.")
      return
    }
    setSubmitting(true)
    try {
      await BookingsAPI.create({
        facility: params.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        guests: bookingData.guests,
        purpose: bookingData.purpose,
        specialRequests: bookingData.specialRequests,
        contact: {
          name: bookingData.contactName,
          email: bookingData.contactEmail,
          phone: bookingData.contactPhone,
        },
        paymentMethod: bookingData.paymentMethod,
      })
      setSuccess("Booking submitted successfully")
      setStep(3)
    } catch (e: any) {
      setError(e.message || "Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  const { subtotal, serviceFee, tax, total } = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/facility/${params.id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to facility
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete your booking</h1>

            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && <div className={`w-16 h-1 ${step > stepNumber ? "bg-gray-900" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            {/* Steps Content */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start date</Label>
                    <Input id="startDate" type="date" value={bookingData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End date</Label>
                    <Input id="endDate" type="date" value={bookingData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Input id="guests" type="number" min={1} value={bookingData.guests} onChange={(e) => handleInputChange("guests", Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose of booking</Label>
                  <Input id="purpose" value={bookingData.purpose} onChange={(e) => handleInputChange("purpose", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="specialRequests">Special requests</Label>
                  <Textarea id="specialRequests" value={bookingData.specialRequests} onChange={(e) => handleInputChange("specialRequests", e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)}>Continue</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Full name</Label>
                    <Input id="contactName" value={bookingData.contactName} onChange={(e) => handleInputChange("contactName", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input id="contactEmail" type="email" value={bookingData.contactEmail} onChange={(e) => handleInputChange("contactEmail", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" value={bookingData.contactPhone} onChange={(e) => handleInputChange("contactPhone", e.target.value)} />
                </div>
                <div>
                  <Label>Payment method</Label>
                  <Select value={bookingData.paymentMethod} onValueChange={(v) => handleInputChange("paymentMethod", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={submitBooking} disabled={submitting}>{submitting ? "Submitting..." : "Submit booking"}</Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="text-green-700">Booking submitted! We will confirm shortly.</div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <Image src={facility.image || "/placeholder.svg"} alt={facility.name} width={80} height={80} className="rounded-lg" />
                <div>
                  <h2 className="font-semibold text-gray-900">{facility.name}</h2>
                  <p className="text-gray-600 text-sm">{facility.location}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{facility.currency}{subtotal}</span></div>
                <div className="flex justify-between"><span>Service fee</span><span>{facility.currency}{serviceFee}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{facility.currency}{tax}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{facility.currency}{total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
