"use client";

import { FacilityGrid } from "@/components/facilities/facility-grid";
import { RentalGrid } from "@/components/rentals/rental-grid";
import { TopCompanies } from "@/components/hosts/top-companies";
import { HostBanner } from "@/components/layout/host-banner";
import { useFacilities } from "@/hooks/useFacilities";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { ErrorComponent } from "@/components/ui/error";
import { Facility, InventoryItem } from "@/types";
import { Loader } from "@/components/ui/loader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Star, Zap, Building2, CreditCard, Shield } from "lucide-react";

const carouselSlides = [
  {
    id: 1,
    title: "Discover Premium Facilities",
    subtitle: "Book spaces and equipment for any event with ease",
    description:
      "From corporate meetings to grand celebrations, find the perfect venue for your next event.",
    gradient: "from-slate-900 to-blue-700",
    icon: Building2,
    cta: "Explore Facilities",
    features: ["Instant Booking", "Verified Venues", "24/7 Support"],
  },
  {
    id: 2,
    title: "Smart Inventory Management",
    subtitle: "Track, manage, and optimize your equipment",
    description:
      "Comprehensive inventory management system with real-time tracking and automated alerts.",
    gradient: "from-emerald-600 to-teal-700",
    icon: CreditCard,
    cta: "Manage Inventory",
    features: ["Real-time Tracking", "Automated Alerts", "Analytics Dashboard"],
  },
  {
    id: 3,
    title: "Enterprise Solutions",
    subtitle: "Scalable platform for growing businesses",
    description:
      "Advanced features for enterprise clients including white-label solutions and custom integrations.",
    gradient: "from-purple-600 to-indigo-700",
    icon: Shield,
    cta: "Enterprise Plans",
    features: [
      "White-label Options",
      "Custom Integrations",
      "Dedicated Support",
    ],
  },
  {
    id: 4,
    title: "Free Trial Available",
    subtitle: "Start your journey with a 14-day free trial",
    description:
      "No credit card required. Experience all features and see how we can transform your business.",
    gradient: "from-orange-500 to-red-600",
    icon: Zap,
    cta: "Start Free Trial",
    features: ["No Credit Card", "Full Access", "Easy Setup"],
  },
  {
    id: 5,
    title: "Trusted by Thousands",
    subtitle: "Join businesses already using our platform",
    description:
      "Over 10,000+ businesses trust us for their facility and inventory management needs.",
    gradient: "from-pink-500 to-rose-600",
    icon: Star,
    cta: "See Success Stories",
    features: ["10,000+ Users", "99.9% Uptime", "5-Star Reviews"],
  },
];

export default function FacilityRentalPlatform() {
  const { user } = useAuth();
  const {
    data: inventoryItems,
    isLoading: isLoadingInventory,
    isError: isErrorInventory,
    refetch: refetchInventory,
    error: inventoryError,
  } = useInventoryItems();

  const {
    data: facilities,
    isLoading: isLoadingFacilities,
    isError: isErrorFacilities,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useFacilities();

  if (isLoadingFacilities || isLoadingInventory) {
    return <Loader />;
  }

  if (isErrorFacilities || isErrorInventory) {
    return (
      <ErrorComponent
        message={facilitiesError?.message || inventoryError?.message}
        onRetry={() => {
          refetchFacilities();
          refetchInventory();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 space-y-16">
        {/* Hero Carousel */}
        <section>
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {carouselSlides.map((slide) => {
                  const IconComponent = slide.icon;
                  return (
                    <CarouselItem key={slide.id}>
                      <div
                        className={`h-80 md:h-96 w-full rounded-2xl bg-gradient-to-br ${slide.gradient} text-white relative overflow-hidden`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                        </div>

                        <div className="relative z-10 h-full flex items-center">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-8 md:px-12">
                            {/* Content */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-8 w-8" />
                                <h2 className="text-3xl md:text-4xl font-bold">
                                  {slide.title}
                                </h2>
                              </div>
                              <div className="space-y-3">
                                <p className="text-xl md:text-2xl font-semibold text-white/90">
                                  {slide.subtitle}
                                </p>
                                <p className="text-white/80 text-sm md:text-base">
                                  {slide.description}
                                </p>
                              </div>

                              {/* Features */}
                              <div className="flex flex-wrap gap-3">
                                {slide.features.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm"
                                  >
                                    <Check className="h-3 w-3" />
                                    {feature}
                                  </div>
                                ))}
                              </div>

                              <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                {slide.cta}
                              </Button>
                            </div>

                            {/* Visual Element */}
                            <div className="hidden md:flex justify-center">
                              <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <IconComponent className="h-24 w-24 text-white/80" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-50 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Why Choose Us?
            </h2>
            <p className="text-gray-600">
              Trusted by thousands of businesses worldwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                99.9%
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                4.9★
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </section>

        <FacilityGrid
          title="Popular facilities"
          facilities={facilities?.facilities as Facility[]}
          isLoading={isLoadingFacilities}
          onRetry={refetchFacilities}
        />

        <FacilityGrid
          title="Available this weekend"
          facilities={facilities?.facilities as Facility[]}
          isLoading={isLoadingFacilities}
          onRetry={refetchFacilities}
        />

        <RentalGrid
          title="Popular equipment rentals"
          rentals={inventoryItems as InventoryItem[]}
          isLoading={isLoadingInventory}
          onRetry={refetchInventory}
        />

        <TopCompanies />
      </main>

      {!user?.company && <HostBanner />}
    </div>
  );
}

// Helper component for check icon
const Check = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
