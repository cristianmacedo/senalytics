import type { DrawData } from '@/types/megasena';

const TOTAL_NUMBERS = 60;
const NUMBERS_PER_DRAW = 6;

/**
 * Generate a random set of unique numbers
 */
export function generateRandomDraw(): number[] {
  const numbers: Set<number> = new Set();
  
  while (numbers.size < NUMBERS_PER_DRAW) {
    numbers.add(Math.floor(Math.random() * TOTAL_NUMBERS) + 1);
  }
  
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate multiple random draws
 */
export function generateMultipleDraws(count: number): number[][] {
  return Array.from({ length: count }, () => generateRandomDraw());
}

/**
 * Check how many numbers match between two sets
 */
export function countMatches(draw1: number[], draw2: number[]): number {
  const set2 = new Set(draw2);
  return draw1.filter(n => set2.has(n)).length;
}

/**
 * Simulate playing against historical draws
 */
export function simulateAgainstHistory(
  userNumbers: number[],
  historicalDraws: DrawData[]
): SimulationResult {
  const results = {
    matches6: 0,
    matches5: 0,
    matches4: 0,
    matches3: 0,
    matches2: 0,
    matches1: 0,
    matches0: 0,
  };
  
  const matchDetails: { draw: DrawData; matches: number }[] = [];
  
  for (const draw of historicalDraws) {
    const matches = countMatches(userNumbers, draw.dezenas);
    
    switch (matches) {
      case 6: results.matches6++; break;
      case 5: results.matches5++; break;
      case 4: results.matches4++; break;
      case 3: results.matches3++; break;
      case 2: results.matches2++; break;
      case 1: results.matches1++; break;
      default: results.matches0++;
    }
    
    if (matches >= 4) {
      matchDetails.push({ draw, matches });
    }
  }
  
  return {
    userNumbers,
    totalDraws: historicalDraws.length,
    results,
    matchDetails: matchDetails.sort((a, b) => b.matches - a.matches),
  };
}

/**
 * Simulation result structure
 */
export interface SimulationResult {
  userNumbers: number[];
  totalDraws: number;
  results: {
    matches6: number;
    matches5: number;
    matches4: number;
    matches3: number;
    matches2: number;
    matches1: number;
    matches0: number;
  };
  matchDetails: { draw: DrawData; matches: number }[];
}

/**
 * Run a Monte Carlo simulation
 * Simulates playing random numbers against a target draw many times
 */
export function monteCarloSimulation(
  targetDraw: number[],
  iterations: number
): MonteCarloResult {
  const results = {
    matches6: 0,
    matches5: 0,
    matches4: 0,
    matches3: 0,
    matches2: 0,
    matches1: 0,
    matches0: 0,
  };
  
  for (let i = 0; i < iterations; i++) {
    const randomDraw = generateRandomDraw();
    const matches = countMatches(randomDraw, targetDraw);
    
    switch (matches) {
      case 6: results.matches6++; break;
      case 5: results.matches5++; break;
      case 4: results.matches4++; break;
      case 3: results.matches3++; break;
      case 2: results.matches2++; break;
      case 1: results.matches1++; break;
      default: results.matches0++;
    }
  }
  
  return {
    iterations,
    results,
    percentages: {
      matches6: (results.matches6 / iterations) * 100,
      matches5: (results.matches5 / iterations) * 100,
      matches4: (results.matches4 / iterations) * 100,
      matches3: (results.matches3 / iterations) * 100,
      matches2: (results.matches2 / iterations) * 100,
      matches1: (results.matches1 / iterations) * 100,
      matches0: (results.matches0 / iterations) * 100,
    },
  };
}

export interface MonteCarloResult {
  iterations: number;
  results: {
    matches6: number;
    matches5: number;
    matches4: number;
    matches3: number;
    matches2: number;
    matches1: number;
    matches0: number;
  };
  percentages: {
    matches6: number;
    matches5: number;
    matches4: number;
    matches3: number;
    matches2: number;
    matches1: number;
    matches0: number;
  };
}

/**
 * Generate numbers based on frequency (weighted random)
 * More frequent numbers have higher chance of being selected
 */
export function generateWeightedDraw(
  frequencies: Map<number, number>,
  bias: 'hot' | 'cold' = 'hot'
): number[] {
  const entries = Array.from(frequencies.entries());
  
  // Invert weights for cold numbers
  const weights = entries.map(([num, freq]) => ({
    number: num,
    weight: bias === 'hot' ? freq : 1 / (freq + 1),
  }));
  
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const selected: Set<number> = new Set();
  
  while (selected.size < NUMBERS_PER_DRAW) {
    let random = Math.random() * totalWeight;
    
    for (const { number, weight } of weights) {
      random -= weight;
      if (random <= 0 && !selected.has(number)) {
        selected.add(number);
        break;
      }
    }
  }
  
  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Check if numbers are valid for Mega Sena
 */
export function validateNumbers(numbers: number[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (numbers.length !== NUMBERS_PER_DRAW) {
    errors.push(`Deve selecionar exatamente ${NUMBERS_PER_DRAW} números`);
  }
  
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    errors.push('Números devem ser únicos');
  }
  
  for (const num of numbers) {
    if (num < 1 || num > TOTAL_NUMBERS) {
      errors.push(`Números devem estar entre 1 e ${TOTAL_NUMBERS}`);
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
