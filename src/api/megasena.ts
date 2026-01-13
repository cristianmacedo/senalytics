import type {
  MegaSenaResult,
  HistoricalData,
  DrawData,
} from "@/types/megasena";

const API_BASE = "/api/megasena";

/**
 * Fetch a specific draw or the latest one
 */
export async function fetchDraw(concurso?: number): Promise<MegaSenaResult> {
  const url = concurso ? `${API_BASE}/${concurso}` : `${API_BASE}/latest`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch draw: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch the latest draw
 */
export async function fetchLatestDraw(): Promise<MegaSenaResult> {
  return fetchDraw();
}

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
 * Convert API result to simplified DrawData format
 */
export function toDrawData(result: MegaSenaResult): DrawData {
  // Parse Brazilian date format (DD/MM/YYYY) to ISO
  const [day, month, year] = result.dataApuracao.split("/");
  const isoDate = `${year}-${month}-${day}`;

  // Aggregate winners by UF (state)
  const ganhadoresPorUF: Record<string, number> = {};
  for (const winner of result.listaMunicipioUFGanhadores ?? []) {
    if (winner.uf && winner.uf !== "--") {
      ganhadoresPorUF[winner.uf] =
        (ganhadoresPorUF[winner.uf] ?? 0) + winner.ganhadores;
    }
  }

  const draw: DrawData = {
    numero: result.numero,
    data: isoDate,
    dezenas: result.listaDezenas
      .map((d) => parseInt(d, 10))
      .sort((a, b) => a - b),
    acumulado: result.acumulado,
    especial: result.indicadorConcursoEspecial ?? 0,
    ganhadores: [
      result.listaRateioPremio[0]?.numeroDeGanhadores ?? 0,
      result.listaRateioPremio[1]?.numeroDeGanhadores ?? 0,
      result.listaRateioPremio[2]?.numeroDeGanhadores ?? 0,
    ],
    premios: [
      result.listaRateioPremio[0]?.valorPremio ?? 0,
      result.listaRateioPremio[1]?.valorPremio ?? 0,
      result.listaRateioPremio[2]?.valorPremio ?? 0,
    ],
    arrecadacao: result.valorArrecadado ?? 0,
    acumuladoProximo: result.valorAcumuladoProximoConcurso ?? 0,
  };

  // Only include ganhadoresPorUF if there are Sena winners
  if (Object.keys(ganhadoresPorUF).length > 0) {
    draw.ganhadoresPorUF = ganhadoresPorUF;
  }

  return draw;
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

/**
 * Parse Brazilian date string to Date object
 */
export function parseBrazilianDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
