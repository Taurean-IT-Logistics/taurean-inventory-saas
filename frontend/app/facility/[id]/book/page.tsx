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
                      step >= stepNumber ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Booking Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select onValueChange={(value) => handleInputChange("guests", Number.parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(50)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i === 0 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose of Event</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Corporate meeting, Conference, Workshop"
                    value={bookingData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requirements or requests..."
                    value={bookingData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                  disabled={!bookingData.startDate || !bookingData.endDate}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>

                <div>
                  <Label htmlFor="contactName">Full Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Enter your full name"
                    value={bookingData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={bookingData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+233 XX XXX XXXX"
                    value={bookingData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={!bookingData.contactName || !bookingData.contactEmail || !bookingData.contactPhone}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>

                <div className="space-y-4">
                  {[
                    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
                    { id: "momo", name: "Mobile Money", icon: Shield },
                    { id: "cash", name: "Cash on Arrival", icon: Shield },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        bookingData.paymentMethod === method.id
                          ? "border-[#1e3a5f] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={bookingData.paymentMethod === method.id}
                        onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                        className="sr-only"
                      />
                      <method.icon className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67c00] text-white"
                    disabled={!bookingData.paymentMethod}
                  >
                    Complete Booking
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h2>

            <div className="flex items-start space-x-4 mb-6">
              <Image
                src={facility.image || "/placeholder.svg"}
                alt={facility.name}
                width={80}
                height={60}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{facility.name}</h3>
                <p className="text-sm text-gray-600">{facility.location}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{facility.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({facility.reviewCount})</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Dates</span>
                <span className="text-gray-900">
                  {bookingData.startDate && bookingData.endDate
                    ? `${bookingData.startDate} - ${bookingData.endDate}`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="text-gray-900">{bookingData.guests} guests</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {facility.currency}
                  {facility.price} x 1 day
                </span>
                <span className="text-gray-900">
                  {facility.currency}
                  {subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span className="text-gray-900">
                  {facility.currency}
                  {serviceFee}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  {facility.currency}
                  {tax}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {facility.currency}
                  {total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
