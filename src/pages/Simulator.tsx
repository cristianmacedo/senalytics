import { useState, useMemo } from "react";
import { useHistoricalData } from "@/hooks/useMegaSena";
import {
  generateRandomDraw,
  simulateAgainstHistory,
  validateNumbers,
  type SimulationResult,
} from "@/lib/simulator";
import { formatBRL, formatDateBR } from "@/api/megasena";
import { Card, Section } from "@/components/ui/Card";
import { LotteryBallGrid, DrawResult } from "@/components/ui/LotteryBall";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/Loading";

const ALL_NUMBERS = Array.from({ length: 60 }, (_, i) => i + 1);

export function Simulator() {
  const { data: historicalData, isLoading } = useHistoricalData();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);

  const validation = useMemo(() => {
    if (selectedNumbers.length === 0) return { valid: false, errors: [] };
    return validateNumbers(selectedNumbers);
  }, [selectedNumbers]);

  const handleNumberClick = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
    setSimulationResult(null);
  };

  const handleRandomize = () => {
    setSelectedNumbers(generateRandomDraw());
    setSimulationResult(null);
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setSimulationResult(null);
  };

  const handleSimulate = () => {
    if (!historicalData?.draws || !validation.valid) return;

    const result = simulateAgainstHistory(
      selectedNumbers,
      historicalData.draws
    );
    setSimulationResult(result);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Number Selection */}
      <Section
        title="Simulador de Apostas"
        subtitle="Escolha 6 números e veja como teriam se saído no histórico"
      >
        <Card>
          <div className="space-y-6">
            {/* Selected Numbers Display */}
            <div className="bg-slate-50 rounded-xl p-6">
              <p className="text-sm text-slate-500 mb-4 text-center">
                {selectedNumbers.length === 0
                  ? "Selecione 6 números abaixo"
                  : `${selectedNumbers.length} de 6 números selecionados`}
              </p>
              <div className="flex justify-center min-h-[64px]">
                {selectedNumbers.length > 0 ? (
                  <DrawResult numbers={selectedNumbers} size="lg" />
                ) : (
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400"
                      >
                        ?
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Number Grid */}
            <LotteryBallGrid
              numbers={ALL_NUMBERS}
              selectedNumbers={selectedNumbers}
              onNumberClick={handleNumberClick}
              size="sm"
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleRandomize} variant="secondary">
                🎲 Sortear Números
              </Button>
              <Button
                onClick={handleClear}
                variant="ghost"
                disabled={selectedNumbers.length === 0}
              >
                Limpar
              </Button>
              <Button onClick={handleSimulate} disabled={!validation.valid}>
                Simular contra Histórico
              </Button>
            </div>

            {!validation.valid && selectedNumbers.length > 0 && (
              <p className="text-center text-sm text-amber-600">
                {validation.errors[0]}
              </p>
            )}
          </div>
        </Card>
      </Section>

      {/* Simulation Results */}
      {simulationResult && (
        <Section
          title="Resultado da Simulação"
          subtitle={`Seus números testados contra ${simulationResult.totalDraws.toLocaleString("pt-BR")} concursos`}
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card
              className={
                simulationResult.results.matches6 > 0
                  ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                  : ""
              }
            >
              <div className="text-center">
                <p className="text-sm opacity-80">Sena (6)</p>
                <p className="text-3xl font-bold">
                  {simulationResult.results.matches6}
                </p>
              </div>
            </Card>
            <Card
              className={
                simulationResult.results.matches5 > 0
                  ? "bg-gradient-to-br from-mega-green to-mega-green-dark text-white"
                  : ""
              }
            >
              <div className="text-center">
                <p className="text-sm opacity-80">Quina (5)</p>
                <p className="text-3xl font-bold">
                  {simulationResult.results.matches5}
                </p>
              </div>
            </Card>
            <Card
              className={
                simulationResult.results.matches4 > 0
                  ? "bg-gradient-to-br from-caixa-blue to-caixa-blue-dark text-white"
                  : ""
              }
            >
              <div className="text-center">
                <p className="text-sm opacity-80">Quadra (4)</p>
                <p className="text-3xl font-bold">
                  {simulationResult.results.matches4}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-slate-500">3 ou menos</p>
                <p className="text-3xl font-bold text-slate-400">
                  {simulationResult.results.matches3 +
                    simulationResult.results.matches2 +
                    simulationResult.results.matches1 +
                    simulationResult.results.matches0}
                </p>
              </div>
            </Card>
          </div>

          {/* Distribution */}
          <Card className="mb-6">
            <h3 className="font-bold text-slate-900 mb-4">
              Distribuição de Acertos
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "6 acertos",
                  value: simulationResult.results.matches6,
                  color: "bg-amber-400",
                },
                {
                  label: "5 acertos",
                  value: simulationResult.results.matches5,
                  color: "bg-mega-green",
                },
                {
                  label: "4 acertos",
                  value: simulationResult.results.matches4,
                  color: "bg-caixa-blue",
                },
                {
                  label: "3 acertos",
                  value: simulationResult.results.matches3,
                  color: "bg-slate-400",
                },
                {
                  label: "2 acertos",
                  value: simulationResult.results.matches2,
                  color: "bg-slate-300",
                },
                {
                  label: "1 acerto",
                  value: simulationResult.results.matches1,
                  color: "bg-slate-200",
                },
                {
                  label: "0 acertos",
                  value: simulationResult.results.matches0,
                  color: "bg-slate-100",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-slate-600">{label}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{
                        width: `${(value / simulationResult.totalDraws) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 text-sm text-right text-slate-900 font-medium">
                    {value.toLocaleString("pt-BR")}
                  </span>
                  <span className="w-16 text-sm text-right text-slate-500">
                    ({((value / simulationResult.totalDraws) * 100).toFixed(2)}
                    %)
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Match Details (4+ matches) */}
          {simulationResult.matchDetails.length > 0 && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">
                Concursos com 4+ Acertos
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {simulationResult.matchDetails.map(({ draw, matches }) => (
                  <div
                    key={draw.numero}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        Concurso {draw.numero}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateBR(draw.data)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {draw.dezenas.map((num) => (
                        <span
                          key={num}
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${
                              selectedNumbers.includes(num)
                                ? "bg-mega-green text-white"
                                : "bg-slate-200 text-slate-600"
                            }
                          `}
                        >
                          {num.toString().padStart(2, "0")}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-sm font-bold
                        ${matches === 6 ? "bg-amber-400 text-white" : ""}
                        ${matches === 5 ? "bg-mega-green text-white" : ""}
                        ${matches === 4 ? "bg-caixa-blue text-white" : ""}
                      `}
                      >
                        {matches} acertos
                      </span>
                      {(() => {
                        // premios: [sena, quina, quadra] - index by (6 - matches)
                        // Backward compat: fall back to premioSena for old data format
                        const prizeIndex = 6 - matches;
                        const prize =
                          draw.premios?.[prizeIndex] ??
                          (matches === 6
                            ? (draw as unknown as { premioSena?: number })
                                .premioSena
                            : 0) ??
                          0;
                        if (prize > 0) {
                          const colorClass =
                            matches === 6
                              ? "text-amber-600"
                              : matches === 5
                                ? "text-mega-green"
                                : "text-caixa-blue";
                          return (
                            <p
                              className={`text-sm font-medium mt-1 ${colorClass}`}
                            >
                              {formatBRL(prize)}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Section>
      )}
    </div>
  );
}
