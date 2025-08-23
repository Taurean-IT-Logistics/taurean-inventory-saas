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
    queryFn: FacilitiesAPI.listCompany,
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
