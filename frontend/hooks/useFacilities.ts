import { useQuery } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";

export function useFacilities(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["facilities", params],
    queryFn: () => FacilitiesAPI.list(params),
  });
}
