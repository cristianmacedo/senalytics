import { describe, expect, it } from "vitest";
import { formatDateBR } from "@/api/megasena";
import {
  calculateConsecutiveStats,
  calculateFrequencies,
  calculateOddEvenStats,
  calculateSumStats,
} from "@/lib/statistics";
import type { DrawData } from "@/types/megasena";

const sampleDraw: DrawData = {
  numero: 1,
  data: "2024-01-01",
  dezenas: [1, 2, 3, 4, 5, 6],
  acumulado: false,
  especial: 0,
  ganhadores: [1, 2, 3],
  premios: [10, 20, 30],
  arrecadacao: 100,
  acumuladoProximo: 0,
};

describe("formatDateBR", () => {
  it("formats ISO dates without timezone drift", () => {
    expect(formatDateBR("2024-01-01")).toBe("01/01/2024");
  });

  it("returns the original input when the format is invalid", () => {
    expect(formatDateBR("01/01/2024")).toBe("01/01/2024");
  });
});

describe("statistics helpers", () => {
  it("handles empty collections safely", () => {
    expect(calculateFrequencies([])).toHaveLength(60);
    expect(calculateFrequencies([]).every((entry) => entry.percentage === 0)).toBe(
      true
    );
    expect(calculateOddEvenStats([])).toEqual({
      distribution: {},
      percentages: {},
    });
    expect(calculateConsecutiveStats([])).toEqual({
      withConsecutive: 0,
      withoutConsecutive: 0,
      percentageWith: 0,
    });
    expect(calculateSumStats([])).toEqual({
      min: 0,
      max: 0,
      average: 0,
      distribution: {},
    });
  });

  it("computes non-empty statistics correctly", () => {
    expect(calculateOddEvenStats([sampleDraw]).percentages).toEqual({
      "3-3": 100,
    });
    expect(calculateConsecutiveStats([sampleDraw]).percentageWith).toBe(100);
    expect(calculateSumStats([sampleDraw]).average).toBe(21);
  });
});
