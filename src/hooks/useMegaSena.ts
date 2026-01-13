import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalData } from "@/api/megasena";
import type { HistoricalData } from "@/types/megasena";

/**
 * Fetch all historical data
 */
export function useHistoricalData() {
  return useQuery<HistoricalData>({
    queryKey: ["historical"],
    queryFn: fetchHistoricalData,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
