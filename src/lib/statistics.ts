import type { DrawData, NumberFrequency, StatsSummary } from '@/types/megasena';

const TOTAL_NUMBERS = 60;
const NUMBERS_PER_DRAW = 6;

/**
 * Calculate frequency statistics for all numbers
 */
export function calculateFrequencies(draws: DrawData[]): NumberFrequency[] {
  const frequencies: Map<number, { count: number; lastDrawn: number }> = new Map();
  
  // Initialize all numbers
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    frequencies.set(i, { count: 0, lastDrawn: 0 });
  }
  
  // Count occurrences
  for (const draw of draws) {
    for (const num of draw.dezenas) {
      const freq = frequencies.get(num)!;
      freq.count++;
      if (draw.numero > freq.lastDrawn) {
        freq.lastDrawn = draw.numero;
      }
    }
  }
  
  const latestDraw = draws.length > 0 
    ? Math.max(...draws.map(d => d.numero)) 
    : 0;
  
  // Convert to array with percentages
  return Array.from(frequencies.entries()).map(([number, { count, lastDrawn }]) => ({
    number,
    count,
    percentage: (count / draws.length) * 100,
    lastDrawn,
    gap: latestDraw - lastDrawn,
  }));
}

/**
 * Get the N most frequent numbers
 */
export function getHotNumbers(frequencies: NumberFrequency[], n: number = 10): NumberFrequency[] {
  return [...frequencies]
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Get the N least frequent numbers
 */
export function getColdNumbers(frequencies: NumberFrequency[], n: number = 10): NumberFrequency[] {
  return [...frequencies]
    .sort((a, b) => a.count - b.count)
    .slice(0, n);
}

/**
 * Get numbers that haven't appeared in the longest time
 */
export function getOverdueNumbers(frequencies: NumberFrequency[], n: number = 10): NumberFrequency[] {
  return [...frequencies]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, n);
}

/**
 * Calculate average gap between appearances for each number
 */
export function calculateAverageGaps(draws: DrawData[]): Record<number, number> {
  const gaps: Record<number, number[]> = {};
  const lastSeen: Record<number, number> = {};
  
  // Initialize
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    gaps[i] = [];
    lastSeen[i] = 0;
  }
  
  // Sort draws by number (ascending)
  const sortedDraws = [...draws].sort((a, b) => a.numero - b.numero);
  
  for (const draw of sortedDraws) {
    for (const num of draw.dezenas) {
      if (lastSeen[num] > 0) {
        gaps[num].push(draw.numero - lastSeen[num]);
      }
      lastSeen[num] = draw.numero;
    }
  }
  
  // Calculate averages
  const averages: Record<number, number> = {};
  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    averages[i] = gaps[i].length > 0
      ? gaps[i].reduce((a, b) => a + b, 0) / gaps[i].length
      : 0;
  }
  
  return averages;
}

/**
 * Calculate complete statistics summary
 */
export function calculateStatsSummary(draws: DrawData[]): StatsSummary {
  if (draws.length === 0) {
    return {
      hotNumbers: [],
      coldNumbers: [],
      overdueNumbers: [],
      averageGaps: {},
      totalDraws: 0,
      dateRange: { first: '', last: '' },
    };
  }
  
  const frequencies = calculateFrequencies(draws);
  const sortedByDate = [...draws].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  return {
    hotNumbers: getHotNumbers(frequencies),
    coldNumbers: getColdNumbers(frequencies),
    overdueNumbers: getOverdueNumbers(frequencies),
    averageGaps: calculateAverageGaps(draws),
    totalDraws: draws.length,
    dateRange: {
      first: sortedByDate[0].data,
      last: sortedByDate[sortedByDate.length - 1].data,
    },
  };
}

/**
 * Calculate sum statistics (total of numbers in each draw)
 */
export function calculateSumStats(draws: DrawData[]): {
  min: number;
  max: number;
  average: number;
  distribution: Record<number, number>;
} {
  const sums = draws.map(d => d.dezenas.reduce((a, b) => a + b, 0));
  
  const distribution: Record<number, number> = {};
  for (const sum of sums) {
    distribution[sum] = (distribution[sum] || 0) + 1;
  }
  
  return {
    min: Math.min(...sums),
    max: Math.max(...sums),
    average: sums.reduce((a, b) => a + b, 0) / sums.length,
    distribution,
  };
}

/**
 * Calculate odd/even distribution statistics
 */
export function calculateOddEvenStats(draws: DrawData[]): {
  distribution: Record<string, number>;
  percentages: Record<string, number>;
} {
  const distribution: Record<string, number> = {};
  
  for (const draw of draws) {
    const oddCount = draw.dezenas.filter(n => n % 2 === 1).length;
    const evenCount = NUMBERS_PER_DRAW - oddCount;
    const key = `${oddCount}-${evenCount}`;
    distribution[key] = (distribution[key] || 0) + 1;
  }
  
  const percentages: Record<string, number> = {};
  for (const [key, count] of Object.entries(distribution)) {
    percentages[key] = (count / draws.length) * 100;
  }
  
  return { distribution, percentages };
}

/**
 * Calculate consecutive numbers statistics
 */
export function calculateConsecutiveStats(draws: DrawData[]): {
  withConsecutive: number;
  withoutConsecutive: number;
  percentageWith: number;
} {
  let withConsecutive = 0;
  
  for (const draw of draws) {
    const sorted = [...draw.dezenas].sort((a, b) => a - b);
    let hasConsecutive = false;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        hasConsecutive = true;
        break;
      }
    }
    
    if (hasConsecutive) withConsecutive++;
  }
  
  return {
    withConsecutive,
    withoutConsecutive: draws.length - withConsecutive,
    percentageWith: (withConsecutive / draws.length) * 100,
  };
}

/**
 * Theoretical probability calculations
 */
export const probability = {
  /**
   * Calculate combinations C(n, k)
   */
  combinations(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
  },
  
  /**
   * Total possible combinations in Mega Sena
   * C(60, 6) = 50,063,860
   */
  get totalCombinations(): number {
    return this.combinations(60, 6);
  },
  
  /**
   * Probability of hitting exactly N numbers with M numbers bet
   */
  hitProbability(hits: number, numbersBet: number = 6): number {
    // P(hits) = C(6, hits) * C(54, numbersBet - hits) / C(60, numbersBet)
    const winning = this.combinations(6, hits);
    const losing = this.combinations(54, numbersBet - hits);
    const total = this.combinations(60, numbersBet);
    
    return (winning * losing) / total;
  },
  
  /**
   * Odds of hitting exactly N numbers (1 in X)
   */
  hitOdds(hits: number, numbersBet: number = 6): number {
    const prob = this.hitProbability(hits, numbersBet);
    return prob > 0 ? 1 / prob : Infinity;
  },
};
