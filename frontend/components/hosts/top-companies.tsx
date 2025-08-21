"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Star, Users, Calendar } from "lucide-react";
import { CompaniesAPI, getResourceUrl } from "@/lib/api";
import Image from "next/image";
import { logo } from "@/assets";

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
    queryKey: ["companies"],
    queryFn: async () => CompaniesAPI.list(),
  });

  const companies = companiesData?.companies || companiesData?.data || [];
  console.log(companies);

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
    <section className="py-16">
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
          {companies.slice(0, 3).map((company: any) => (
            <Card
              key={company._id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-x-4">
                  <Image
                    src={
                      company?.logo?.path
                        ? getResourceUrl(company.logo.path)
                        : logo
                    }
                    alt={`${company.name} logo`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors ml-2"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
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
                  </div>
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
      </div>
    </section>
  );
}
