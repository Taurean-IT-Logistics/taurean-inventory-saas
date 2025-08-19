"use client";

import type React from "react";

import { Star, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Facility } from "@/types";
import { getResourceUrl } from "@/lib/api";
import { currencyFormat } from "@/lib/utils";

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/facility/${facility._id}`}>
      <motion.div
        className="cursor-pointer group"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative mb-3 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={
                imageError
                  ? "/placeholder.svg?height=400&width=300&query=modern event facility"
                  : getResourceUrl(facility.images[0].path)
              }
              alt={facility.name}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-slate-900 leading-tight text-base">
              {facility.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              <Star className="h-4 w-4 fill-current text-slate-900" />
              <span className="text-sm font-medium">
                {facility.rating.average}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {facility.location.address}
          </p>
          <p className="text-sm text-slate-500">
            {facility.reviews.length} reviews
          </p>
          <div className="pt-1">
            <span className="font-semibold text-slate-900 text-base">
              {currencyFormat(
                facility.pricing.find((p) => p.isDefault)?.amount!
              )}
            </span>
            <span className="text-slate-500 font-normal text-sm">
              {" "}
              for {facility.pricing.find((p) => p.isDefault)?.unit!}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
