"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Star, Heart, Settings, Edit, Camera } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg?height=120&width=120",
    joinDate: "March 2023",
    verified: true,
    rating: 4.9,
    reviewCount: 47,
    location: "Accra, Ghana",
    bio: "Love exploring new places and experiencing different cultures. Always looking for unique facilities and memorable experiences.",
  }

  const mockBookings = [
    {
      id: 1,
      title: "Modern Conference Room",
      location: "East Legon, Accra",
      dates: "Dec 15-16, 2024",
      status: "confirmed",
      image: "/placeholder.svg?height=200&width=300",
      price: "GH₵450",
    },
    {
      id: 2,
      title: "Event Hall with Pool",
      location: "Airport Hills, Accra",
      dates: "Jan 5-7, 2025",
      status: "pending",
      image: "/placeholder.svg?height=200&width=300",
      price: "GH₵1,200",
    },
  ]

  const mockFavorites = [
    {
      id: 1,
      title: "Luxury Apartment",
      location: "Cantonments, Accra",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      price: "GH₵800/night",
    },
    {
      id: 2,
      title: "Modern Office Space",
      location: "Osu, Accra",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      price: "GH₵300/day",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{mockUser.name}</h1>
                  {mockUser.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockUser.rating}</span>
                    <span>({mockUser.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockUser.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {mockUser.joinDate}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{mockUser.bio}</p>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mockBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={booking.image || "/placeholder.svg"}
                      alt={booking.title}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${
                        booking.status === "confirmed"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{booking.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{booking.location}</p>
                    <p className="text-gray-700 mb-3">{booking.dates}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{booking.price}</span>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mockFavorites.map((favorite) => (
                <Card key={favorite.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={favorite.image || "/placeholder.svg"}
                      alt={favorite.title}
                      fill
                      className="object-cover"
                    />
                    <Button size="sm" variant="secondary" className="absolute top-3 right-3 rounded-full h-8 w-8 p-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{favorite.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{favorite.location}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{favorite.rating}</span>
                      </div>
                      <span className="font-semibold">{favorite.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews from hosts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">No reviews yet. Complete your first booking to receive reviews!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
