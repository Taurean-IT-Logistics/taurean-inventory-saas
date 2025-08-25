"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import type { InventoryItem } from "@/types";
import { getResourceUrl } from "@/lib/api";
import { currencyFormat } from "@/lib/utils";

interface RentalCardProps {
  rental: InventoryItem;
}

export function RentalCard({ rental }: RentalCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = () => {
    switch (rental.status) {
      case "maintenance":
        return (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white font-medium shadow-lg border-0">
            Limited
          </Badge>
        );
      case "unavailable":
        return (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white font-medium shadow-lg border-0">
            Unavailable
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/rental/${rental._id}`}>
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
                  ? "/placeholder.svg?height=400&width=300&query=rental equipment"
                  : getResourceUrl(rental.images[0].path)
              }
              alt={rental.name}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          </div>

          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight text-base">
                {rental.name}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {rental.category}
              </p>
            </div>
          </div>
          <div className="pt-1">
            <span className="font-semibold text-slate-900 text-base">
              {currencyFormat(rental.pricing.find((p) => p.isDefault)?.amount!)}
            </span>
            <span className="text-slate-500 font-normal text-sm">
              {" "}
              per {rental.pricing.find((p) => p.isDefault)?.unit}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
