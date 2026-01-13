import { useQuery } from "@tanstack/react-query";
import {
  fetchDraw,
  fetchLatestDraw,
  fetchHistoricalData,
} from "@/api/megasena";
import type { MegaSenaResult, HistoricalData } from "@/types/megasena";

/**
 * Fetch a specific draw by number
 */
export function useDraw(concurso: number) {
  return useQuery<MegaSenaResult>({
    queryKey: ["draw", concurso],
    queryFn: () => fetchDraw(concurso),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - historical draws don't change
  });
}

/**
 * Fetch the latest draw
 */
export function useLatestDraw() {
  return useQuery<MegaSenaResult>({
    queryKey: ["draw", "latest"],
    queryFn: fetchLatestDraw,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

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
