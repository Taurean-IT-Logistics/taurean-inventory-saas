"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"

export interface Rental {
  id: string
  name: string
  category: string
  location: string
  price: number
  currency: string
  duration: string
  rating: number
  reviewCount: number
  imageUrl: string
  availability: "available" | "limited" | "unavailable"
  isFavorite?: boolean
}

interface RentalCardProps {
  rental: Rental
  onFavoriteToggle?: (rentalId: string) => void
}

export function RentalCard({ rental, onFavoriteToggle }: RentalCardProps) {
  const [isFavorited, setIsFavorited] = useState(rental.isFavorite || false)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsFavorited(!isFavorited)
      await onFavoriteToggle?.(rental.id)
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: `${rental.name} has been ${isFavorited ? "removed from" : "added to"} your favorites.`,
      })
    } catch (error) {
      setIsFavorited(isFavorited)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAvailabilityBadge = () => {
    switch (rental.availability) {
      case "limited":
        return (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white font-medium shadow-lg border-0">
            Limited
          </Badge>
        )
      case "unavailable":
        return (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white font-medium shadow-lg border-0">
            Unavailable
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Link href={`/rental/${rental.id}`}>
      <motion.div className="cursor-pointer group" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <div className="relative mb-3 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={imageError ? "/placeholder.svg?height=400&width=300&query=rental equipment" : rental.imageUrl}
              alt={rental.name}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
          </Button>
          {getAvailabilityBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight text-base">{rental.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{rental.category}</p>
            </div>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              <Star className="h-4 w-4 fill-current text-slate-900" />
              <span className="text-sm font-medium">{rental.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">{rental.location}</p>
          <p className="text-sm text-slate-500">{rental.reviewCount} reviews</p>
          <div className="pt-1">
            <span className="font-semibold text-slate-900 text-base">
              {rental.currency}
              {rental.price.toLocaleString()}
            </span>
            <span className="text-slate-500 font-normal text-sm"> per {rental.duration}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
