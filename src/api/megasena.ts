import type { HistoricalData } from "@/types/megasena";

/**
 * Fetch historical data from static JSON
 */
export async function fetchHistoricalData(): Promise<HistoricalData> {
  const response = await fetch("/data/megasena-history.json");

  if (!response.ok) {
    throw new Error(`Failed to fetch historical data: ${response.status}`);
  }

  return response.json();
}

/**
 * Format currency in Brazilian Real
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format date from ISO to Brazilian format
 */
export function formatDateBR(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
