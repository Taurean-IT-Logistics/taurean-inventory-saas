import { useQuery } from "@tanstack/react-query";
import { InventoryAPI } from "@/lib/api";

export function useInventoryItems(
  params?: Record<string, string | number | boolean>
) {
  return useQuery({
    queryKey: ["inventoryItems", params],
    queryFn: () => InventoryAPI.list(),
  });
}
