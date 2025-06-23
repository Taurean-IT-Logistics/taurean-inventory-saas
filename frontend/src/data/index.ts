import { Booking, Facility, InventoryItem, User } from '../types';

export const mockUser: User = {
  _id: '1',
  name: 'Admin User',
  username: 'admin',
  email: 'admin@example.com',
  phone: '+1234567890',
  password: 'hashed',
  role: 'admin',
  cart: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockFacilities: Facility[] = [
  {
    _id: 'facility_001',
    name: 'Executive Conference Room Alpha',
    description:
      'Premium conference room with state-of-the-art technology and panoramic city views. Perfect for board meetings and executive presentations.',
    images: [
      {
        path: 'https://placehold.co/300x400',
        originalName: 'conference-room-alpha-1.jpg',
        mimetype: 'image/jpeg',
        size: 2048000
      },
      {
        path: 'https://placehold.co/300x400',
        originalName: 'conference-room-alpha-2.jpg',
        mimetype: 'image/jpeg',
        size: 1856000
      }
    ],
    terms:
      '24-hour cancellation policy. No food or drinks allowed except water. Professional attire required.',
    availability: [
      {
        day: 'monday',
        startTime: '08:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'tuesday',
        startTime: '08:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'wednesday',
        startTime: '08:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'thursday',
        startTime: '08:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'friday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '10:00',
        endTime: '14:00',
        isAvailable: false
      },
      {
        day: 'sunday',
        startTime: '10:00',
        endTime: '14:00',
        isAvailable: false
      }
    ],
    blockedDates: [
      {
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-25'),
        reason: 'Christmas Holiday',
        createdBy: mockUser,
        createdAt: new Date('2024-11-01')
      }
    ],
    pricing: [
      {
        unit: 'hour',
        amount: 125,
        isDefault: true
      },
      {
        unit: 'day',
        amount: 800,
        isDefault: false
      }
    ],
    rating: {
      average: 4.8,
      totalReviews: 42
    },
    reviews: [
      {
        user: mockUser,
        booking: {} as Booking, // Mock booking reference
        rating: 5,
        comment:
          'Exceptional facility with top-notch equipment. The video conferencing setup worked flawlessly for our international meeting.',
        isVerified: true,
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15')
      },
      {
        user: mockUser,
        booking: {} as Booking, // Mock booking reference
        rating: 4,
        comment:
          'Great location and professional atmosphere. Only minor issue was the temperature control.',
        isVerified: true,
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-10')
      }
    ],
    capacity: {
      maximum: 16,
      recommended: 12
    },
    amenities: [
      '4K Video Conferencing',
      'Wireless Presentation',
      'Premium Coffee Service',
      'Whiteboard',
      'High-Speed WiFi',
      'Climate Control',
      'City View'
    ],
    location: {
      address: '1200 Corporate Plaza, 25th Floor, Downtown Financial District',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851
      }
    },
    operationalHours: {
      opening: '07:00',
      closing: '20:00'
    },
    isActive: true,
    isDeleted: false,
    createdBy: mockUser,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-11-20')
  },
  {
    _id: 'facility_002',
    name: 'Creative Studio Workshop Space',
    description:
      'Bright, open studio space designed for creative workshops, team building activities, and brainstorming sessions. Features moveable furniture and artistic ambiance.',
    images: [
      {
        path: 'https://placehold.co/300x400',
        originalName: 'creative-studio-1.jpg',
        mimetype: 'image/jpeg',
        size: 1920000
      }
    ],
    terms:
      '48-hour cancellation policy. Art supplies available for additional fee. Cleanup required after use.',
    availability: [
      {
        day: 'monday',
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true
      },
      {
        day: 'tuesday',
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true
      },
      {
        day: 'wednesday',
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true
      },
      {
        day: 'thursday',
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true
      },
      {
        day: 'friday',
        startTime: '09:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '10:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'sunday',
        startTime: '12:00',
        endTime: '20:00',
        isAvailable: true
      }
    ],
    blockedDates: [],
    pricing: [
      {
        unit: 'hour',
        amount: 45,
        isDefault: true
      },
      {
        unit: 'day',
        amount: 320,
        isDefault: false
      }
    ],
    rating: {
      average: 4.6,
      totalReviews: 28
    },
    reviews: [
      {
        user: mockUser,
        booking: {} as Booking,
        rating: 5,
        comment:
          'Perfect space for our design thinking workshop! The natural light and flexible setup made it ideal for creative activities.',
        isVerified: true,
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-12')
      }
    ],
    capacity: {
      maximum: 25,
      recommended: 20
    },
    amenities: [
      'Natural Light',
      'Moveable Furniture',
      'Art Supplies Available',
      'Sound System',
      'WiFi',
      'Kitchenette',
      'Parking Available'
    ],
    location: {
      address: '456 Arts District, Creative Quarter, Studio Building B',
      coordinates: {
        latitude: 40.7505,
        longitude: -73.9934
      }
    },
    operationalHours: {
      opening: '08:00',
      closing: '23:00'
    },
    isActive: true,
    isDeleted: false,
    createdBy: mockUser,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-18')
  },
  {
    _id: 'facility_003',
    name: 'Grand Ballroom Heritage Hall',
    description:
      'Elegant ballroom with crystal chandeliers and classic architecture. Perfect for weddings, galas, corporate events, and large celebrations.',
    images: [
      {
        path: 'https://placehold.co/300x4000',
        originalName: 'grand-ballroom-1.jpg',
        mimetype: 'image/jpeg',
        size: 3200000
      }
    ],
    terms:
      '72-hour cancellation policy. Security deposit required. Professional event coordination recommended. Alcohol service requires licensed bartender.',
    availability: [
      {
        day: 'friday',
        startTime: '10:00',
        endTime: '24:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '09:00',
        endTime: '24:00',
        isAvailable: true
      },
      {
        day: 'sunday',
        startTime: '10:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'monday',
        startTime: '10:00',
        endTime: '23:00',
        isAvailable: false
      },
      {
        day: 'tuesday',
        startTime: '10:00',
        endTime: '23:00',
        isAvailable: false
      },
      {
        day: 'wednesday',
        startTime: '10:00',
        endTime: '23:00',
        isAvailable: false
      },
      {
        day: 'thursday',
        startTime: '10:00',
        endTime: '23:00',
        isAvailable: false
      }
    ],
    blockedDates: [
      {
        startDate: new Date('2024-12-31'),
        endDate: new Date('2025-01-01'),
        reason: "New Year's Private Event",
        createdBy: mockUser,
        createdAt: new Date('2024-10-15')
      }
    ],
    pricing: [
      {
        unit: 'day',
        amount: 2500,
        isDefault: true
      },
      {
        unit: 'hour',
        amount: 350,
        isDefault: false
      }
    ],
    rating: {
      average: 4.9,
      totalReviews: 67
    },
    reviews: [
      {
        user: mockUser,
        booking: {} as Booking,
        rating: 5,
        comment:
          "Absolutely stunning venue for our company's 50th anniversary gala. The staff was professional and the ambiance was perfect.",
        isVerified: true,
        createdAt: new Date('2024-11-08'),
        updatedAt: new Date('2024-11-08')
      }
    ],
    capacity: {
      maximum: 300,
      recommended: 250
    },
    amenities: [
      'Crystal Chandeliers',
      'Professional Sound System',
      'Stage/Platform',
      'Bridal Suite',
      'Catering Kitchen',
      'Valet Parking',
      'Event Coordination',
      'Dance Floor'
    ],
    location: {
      address: '789 Heritage Avenue, Historic District, Grand Hotel',
      coordinates: {
        latitude: 40.7614,
        longitude: -73.9776
      }
    },
    operationalHours: {
      opening: '09:00',
      closing: '24:00'
    },
    isActive: true,
    isDeleted: false,
    createdBy: mockUser,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-11-19')
  },
  {
    _id: 'facility_004',
    name: 'Tech Hub Co-Working Lounge',
    description:
      'Modern co-working space with high-speed internet, collaborative areas, and tech-friendly amenities. Ideal for startups, freelancers, and remote teams.',
    images: [
      {
        path: 'https://placehold.co/300x400',
        originalName: 'tech-hub-1.jpg',
        mimetype: 'image/jpeg',
        size: 1750000
      }
    ],
    terms:
      'Monthly membership available. Day passes require advance booking. No loud phone calls in quiet zones.',
    availability: [
      {
        day: 'monday',
        startTime: '07:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'tuesday',
        startTime: '07:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'wednesday',
        startTime: '07:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'thursday',
        startTime: '07:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'friday',
        startTime: '07:00',
        endTime: '20:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        day: 'sunday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: false
      }
    ],
    blockedDates: [],
    pricing: [
      {
        unit: 'day',
        amount: 35,
        isDefault: true
      },
      {
        unit: 'hour',
        amount: 8,
        isDefault: false
      },
      {
        unit: 'month',
        amount: 450,
        isDefault: false
      }
    ],
    rating: {
      average: 4.4,
      totalReviews: 156
    },
    reviews: [
      {
        user: mockUser,
        booking: {} as Booking,
        rating: 4,
        comment:
          'Great internet speed and comfortable workspace. Coffee could be better, but overall solid co-working experience.',
        isVerified: true,
        createdAt: new Date('2024-11-14'),
        updatedAt: new Date('2024-11-14')
      }
    ],
    capacity: {
      maximum: 50,
      recommended: 40
    },
    amenities: [
      'High-Speed WiFi',
      'Standing Desks',
      'Phone Booths',
      'Coffee Bar',
      'Printing Services',
      'Networking Events',
      '24/7 Access',
      'Bike Storage'
    ],
    location: {
      address: '321 Innovation Drive, Tech District, StartUp Center',
      coordinates: {
        latitude: 40.7282,
        longitude: -74.0776
      }
    },
    operationalHours: {
      opening: '06:00',
      closing: '23:00'
    },
    isActive: true,
    isDeleted: false,
    createdBy: mockUser,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-11-16')
  },
  {
    _id: 'facility_005',
    name: 'Outdoor Garden Pavilion',
    description:
      'Beautiful outdoor pavilion surrounded by landscaped gardens. Perfect for outdoor weddings, corporate retreats, and nature-inspired events.',
    images: [
      {
        path: 'https://placehold.co/300x400',
        originalName: 'garden-pavilion-1.jpg',
        mimetype: 'image/jpeg',
        size: 2400000
      }
    ],
    terms:
      'Weather-dependent bookings. Backup indoor facility available. No amplified music after 9 PM. Decorations must be approved in advance.',
    availability: [
      {
        day: 'monday',
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: false
      },
      {
        day: 'tuesday',
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: false
      },
      {
        day: 'wednesday',
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: true
      },
      {
        day: 'thursday',
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: true
      },
      {
        day: 'friday',
        startTime: '08:00',
        endTime: '21:00',
        isAvailable: true
      },
      {
        day: 'saturday',
        startTime: '07:00',
        endTime: '22:00',
        isAvailable: true
      },
      {
        day: 'sunday',
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: true
      }
    ],
    blockedDates: [
      {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-03-15'),
        reason: 'Winter Season - Weather Restrictions',
        createdBy: mockUser,
        createdAt: new Date('2024-09-01')
      }
    ],
    pricing: [
      {
        unit: 'day',
        amount: 1200,
        isDefault: true
      },
      {
        unit: 'hour',
        amount: 180,
        isDefault: false
      }
    ],
    rating: {
      average: 4.7,
      totalReviews: 34
    },
    reviews: [
      {
        user: mockUser,
        booking: {} as Booking,
        rating: 5,
        comment:
          'Magical setting for our outdoor wedding ceremony. The gardens provided the perfect natural backdrop.',
        isVerified: true,
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date('2024-09-22')
      }
    ],
    capacity: {
      maximum: 120,
      recommended: 100
    },
    amenities: [
      'Garden Setting',
      'Covered Pavilion',
      'Outdoor Lighting',
      'Backup Indoor Space',
      'Catering Prep Area',
      'Restroom Facilities',
      'Parking',
      'Photography Friendly'
    ],
    location: {
      address: '555 Garden Lane, Botanical District, Nature Center',
      coordinates: {
        latitude: 40.7831,
        longitude: -73.9712
      }
    },
    operationalHours: {
      opening: '07:00',
      closing: '22:00'
    },
    isActive: false,
    isDeleted: false,
    createdBy: mockUser,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-11-01')
  }
];

export const mockInventoryItems: InventoryItem[] = [
  {
    _id: '1',
    name: 'Projector - Epson EB-X41',
    description: 'High-quality business projector with 3600 lumens',
    sku: 'PROJ-EP-X41-001',
    quantity: 5,
    status: 'in_stock',
    category: 'AV Equipment',
    purchaseInfo: {
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 599.99,
      supplier: 'Tech Supplies Inc.',
      warrantyExpiry: new Date('2026-01-15')
    },
    history: [
      {
        date: new Date('2024-01-15'),
        change: 5,
        reason: 'Initial stock',
        user: mockUser,
        notes: 'Initial purchase for conference rooms'
      }
    ],
    maintenanceSchedule: [
      {
        scheduledDate: new Date('2024-06-15'),
        type: 'cleaning',
        completed: false
      }
    ],
    currentBookings: [],
    specifications: new Map([
      ['brightness', '3600 lumens'],
      ['resolution', '1024x768'],
      ['weight', '2.5kg']
    ]),
    alerts: {
      lowStock: false,
      maintenanceDue: false,
      warrantyExpiring: false
    },
    isDeleted: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];
