export interface SearchParams {
  location: string
  item: string
  duration: string
  guests: {
    adults: number
    children: number
    infants: number
    pets: number
  }
}

export interface Facility {
  id: string
  title: string
  location: string
  price: number
  rating: number
  images: string[]
  amenities: string[]
  description: string
  host: {
    name: string
    avatar: string
    rating: number
    reviewCount: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  isHost: boolean
}

export interface Booking {
  id: string
  facilityId: string
  userId: string
  startDate: string
  endDate: string
  guests: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
}
