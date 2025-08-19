"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Star, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Company {
  _id: string;
  name: string;
  description: string;
  location: string;
  logo?: {
    path?: string;
    url?: string;
    _id?: string;
  };
  subscription?: {
    plan: string;
    expiresAt: string;
  };
  isActive: boolean;
}

export function TopCompanies() {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["top-companies"],
    queryFn: async () => {
      const response = await fetch(
        "/api/company/public?limit=6&sortBy=bookings"
      );
      if (!response.ok) throw new Error("Failed to fetch top companies");
      return response.json();
    },
  });

  const companies = companiesData?.companies || [];

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top Companies
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the most successful companies using our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Top Companies
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the most successful companies using our platform. These
            companies have demonstrated excellence in facility management and
            customer service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: Company) => (
            <Card
              key={company._id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {company.logo ? (
                      <img
                        src={
                          company.logo.path ||
                          company.logo.url ||
                          `/api/images/${company.logo._id}`
                        }
                        alt={`${company.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-logo.png";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      <Badge
                        variant={company.isActive ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {company.description ||
                        "Leading company in facility management"}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {company.location || "Location not specified"}
                      </span>
                    </div>

                    {company.subscription && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="capitalize">
                            {company.subscription.plan}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-700">
                            Top Rated
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                  >
                    View Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Companies Found
            </h3>
            <p className="text-gray-500">Check back later for top companies</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Companies
          </Button>
        </div>
      </div>
    </section>
  );
}
