import { useQuery } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";

export const useFacilities = () => {
  // Fetch company facilities
  const {
    data: facilities = [],
    isLoading: isLoadingFacilities,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useQuery({
    queryKey: ["facilities-company"],
    queryFn: async () => {
      const result = await FacilitiesAPI.listCompany();
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    facilities,
    isLoadingFacilities,
    facilitiesError,
    refetchFacilities,
  };
};

export const usePublicFacilities = () => {
  // Fetch public facilities for home page
  const {
    data: response,
    isLoading: isLoadingFacilities,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useQuery({
    queryKey: ["facilities-public"],
    queryFn: async () => {
      const result = await FacilitiesAPI.list();
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Extract facilities from the response
  const facilities = (response as any)?.facilities || [];

  return {
    facilities,
    isLoadingFacilities,
    facilitiesError,
    refetchFacilities,
  };
};
