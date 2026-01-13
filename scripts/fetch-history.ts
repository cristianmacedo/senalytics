/**
 * Script to fetch Mega Sena historical data
 * - Checks existing data first and only fetches missing concursos
 * - Uses gentle rate limiting to avoid API blocks
 * - Saves progress on Ctrl+C or termination
 *
 * Run with: npm run fetch-history
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const API_BASE =
  "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena";

const DATA_PATH = join(
  process.cwd(),
  "public",
  "data",
  "megasena-history.json"
);

// Gentle rate limiting settings
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES_MS = 2000;

// State for graceful shutdown
let existingDraws: DrawData[] = [];
let newDraws: DrawData[] = [];
let isShuttingDown = false;

interface MegaSenaResult {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  acumulado: boolean;
  indicadorConcursoEspecial: number;
  valorArrecadado: number;
  valorAcumuladoProximoConcurso: number;
  listaRateioPremio: Array<{
    numeroDeGanhadores: number;
    valorPremio: number;
  }>;
  listaMunicipioUFGanhadores: Array<{
    ganhadores: number;
    uf: string;
  }>;
}

interface DrawData {
  numero: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
  especial: number;
  ganhadores: [number, number, number];
  premios: [number, number, number];
  arrecadacao: number;
  acumuladoProximo: number;
  ganhadoresPorUF?: Record<string, number>;
}

interface HistoricalData {
  updatedAt: string;
  totalDraws: number;
  draws: DrawData[];
}

function toDrawData(result: MegaSenaResult): DrawData {
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

async function fetchDraw(concurso: number): Promise<MegaSenaResult | null> {
  try {
    const response = await fetch(`${API_BASE}/${concurso}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Senalytics/1.0",
      },
    });

    if (response.status === 403) {
      return null; // Rate limited
    }

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function fetchLatest(): Promise<MegaSenaResult | null> {
  try {
    const response = await fetch(API_BASE, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Senalytics/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadExistingData(): HistoricalData | null {
  if (!existsSync(DATA_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveData(data: HistoricalData): void {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function saveProgress(): boolean {
  if (newDraws.length === 0) {
    return false;
  }

  const allDraws = [...existingDraws, ...newDraws].sort(
    (a, b) => a.numero - b.numero
  );

  const uniqueDraws = allDraws.filter(
    (draw, index, self) =>
      index === self.findIndex((d) => d.numero === draw.numero)
  );

  const updatedData: HistoricalData = {
    updatedAt: new Date().toISOString(),
    totalDraws: uniqueDraws.length,
    draws: uniqueDraws,
  };

  saveData(updatedData);
  return true;
}

function handleShutdown(signal: string): void {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n\n🛑 Received ${signal}, saving progress...`);

  if (saveProgress()) {
    console.log(`✅ Saved ${newDraws.length} new draws before exit`);
    console.log("   Run the script again to continue fetching.");
  } else {
    console.log("   No new draws to save.");
  }

  process.exit(0);
}

// Register signal handlers
process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

async function main() {
  console.log("🎰 Mega Sena History Fetcher\n");
  console.log("   (Press Ctrl+C to stop and save progress)\n");

  // Load existing data
  const existingData = loadExistingData();
  existingDraws = existingData?.draws ?? [];
  const existingNumbers = new Set(existingDraws.map((d) => d.numero));

  if (existingData) {
    console.log(`📂 Found existing data: ${existingData.draws.length} draws`);
  } else {
    console.log("📂 No existing data found, starting fresh");
  }

  // Get latest draw number from API
  console.log("\n🔍 Checking latest draw from API...");
  const latest = await fetchLatest();

  let latestNumber: number;
  if (latest) {
    latestNumber = latest.numero;
    console.log(`   Latest draw: ${latestNumber}`);
  } else {
    console.warn("⚠️  Could not reach API (might be rate limited)");
    if (existingData && existingData.draws.length > 0) {
      latestNumber = Math.max(...existingData.draws.map((d) => d.numero));
      console.log(`   Using latest from existing data: ${latestNumber}`);
    } else {
      console.error(
        "❌ No existing data and API unavailable. Try again later."
      );
      process.exit(1);
    }
  }

  // Find missing concursos
  const missing: number[] = [];
  for (let i = 1; i <= latestNumber; i++) {
    if (!existingNumbers.has(i)) {
      missing.push(i);
    }
  }

  if (missing.length === 0) {
    console.log("\n✅ Data is complete! No missing concursos.");
    return;
  }

  console.log(`\n📋 Missing concursos: ${missing.length}`);
  if (missing.length <= 20) {
    console.log(`   Numbers: ${missing.join(", ")}`);
  } else {
    console.log(`   Range: ${missing[0]} to ${missing[missing.length - 1]}`);
  }

  console.log(`\n🚀 Fetching missing draws...`);
  console.log(
    `   (${BATCH_SIZE} at a time, ${DELAY_BETWEEN_BATCHES_MS / 1000}s delay)\n`
  );

  newDraws = [];
  let rateLimited = false;
  let consecutiveErrors = 0;

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchDraw));

    for (const result of results) {
      if (result) {
        newDraws.push(toDrawData(result));
        consecutiveErrors = 0;
      } else {
        consecutiveErrors++;
      }
    }

    const progress = Math.min(i + BATCH_SIZE, missing.length);
    const percentage = ((progress / missing.length) * 100).toFixed(1);
    process.stdout.write(
      `\rProgress: ${progress}/${missing.length} (${percentage}%) - Fetched: ${newDraws.length}`
    );

    // Stop if we hit too many errors (likely rate limited)
    if (consecutiveErrors >= 10) {
      console.log("\n\n⚠️  Too many errors. Likely rate limited. Stopping.");
      rateLimited = true;
      break;
    }

    // Wait between batches
    if (i + BATCH_SIZE < missing.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log("\n");

  if (newDraws.length === 0) {
    console.log("❌ Could not fetch any new draws. API might be blocked.");
    console.log("   Wait a few hours and try again.");
    return;
  }

  // Save all fetched data
  saveProgress();

  const totalDraws = existingDraws.length + newDraws.length;
  console.log(`✅ Added ${newDraws.length} new draws`);
  console.log(`   Total draws: ${totalDraws}`);

  // Check what's still missing
  const stillMissing = missing.length - newDraws.length;
  if (stillMissing > 0 || rateLimited) {
    console.log(`\n⚠️  Still missing: ${stillMissing} draws`);
    console.log("   Run this script again later to continue.");
  } else {
    console.log("\n🎉 All concursos fetched successfully!");
  }
}

main().catch(console.error);
