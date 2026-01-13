import { useMemo } from "react";
import { useHistoricalData } from "@/hooks/useMegaSena";
import {
  calculateFrequencies,
  getHotNumbers,
  getColdNumbers,
  getOverdueNumbers,
  calculateOddEvenStats,
  calculateConsecutiveStats,
  probability,
} from "@/lib/statistics";
import { formatDateBR } from "@/api/megasena";
import { Card, StatCard, Section } from "@/components/ui/Card";
import { LotteryBall } from "@/components/ui/LotteryBall";
import { LoadingPage } from "@/components/ui/Loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function Statistics() {
  const { data: historicalData, isLoading, error } = useHistoricalData();

  const stats = useMemo(() => {
    if (!historicalData?.draws) return null;

    const frequencies = calculateFrequencies(historicalData.draws);
    const hotNumbers = getHotNumbers(frequencies, 10);
    const coldNumbers = getColdNumbers(frequencies, 10);
    const overdueNumbers = getOverdueNumbers(frequencies, 10);
    const oddEven = calculateOddEvenStats(historicalData.draws);
    const consecutive = calculateConsecutiveStats(historicalData.draws);

    // Prepare chart data
    const frequencyChartData = frequencies
      .sort((a, b) => a.number - b.number)
      .map((f) => ({
        number: f.number,
        count: f.count,
        isHot: hotNumbers.some((h) => h.number === f.number),
        isCold: coldNumbers.some((c) => c.number === f.number),
      }));

    return {
      frequencies,
      hotNumbers,
      coldNumbers,
      overdueNumbers,
      oddEven,
      consecutive,
      frequencyChartData,
      totalDraws: historicalData.draws.length,
      dateRange: {
        first: historicalData.draws[0]?.data,
        last: historicalData.draws[historicalData.draws.length - 1]?.data,
      },
    };
  }, [historicalData]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar estatísticas</p>
        <p className="text-slate-500 mt-2">
          É necessário gerar o arquivo de histórico primeiro
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <Section
        title="Estatísticas da Mega Sena"
        subtitle={`Baseado em ${stats.totalDraws} concursos`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Concursos"
            value={stats.totalDraws.toLocaleString("pt-BR")}
            subtitle={`Desde ${stats.dateRange.first ? formatDateBR(stats.dateRange.first) : "1996"}`}
          />
          <StatCard
            title="Combinações Possíveis"
            value={probability.totalCombinations.toLocaleString("pt-BR")}
            subtitle="C(60,6)"
          />
          <StatCard
            title="Chance de Sena"
            value={`1 em ${Math.round(probability.hitOdds(6)).toLocaleString("pt-BR")}`}
            subtitle="Com 6 números"
          />
          <StatCard
            title="Chance de Quina"
            value={`1 em ${Math.round(probability.hitOdds(5)).toLocaleString("pt-BR")}`}
            subtitle="Com 6 números"
          />
        </div>
      </Section>

      {/* Frequency Chart */}
      <Section
        title="Frequência de Números"
        subtitle="Quantas vezes cada número foi sorteado"
      >
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.frequencyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="number" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [`${value ?? 0} vezes`, "Sorteado"]}
                labelFormatter={(label) => `Número ${label}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.frequencyChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isHot
                        ? "#209869"
                        : entry.isCold
                          ? "#ef4444"
                          : "#94a3b8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-mega-green" />
              <span className="text-slate-600">Mais sorteados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-600">Menos sorteados</span>
            </div>
          </div>
        </Card>
      </Section>

      {/* Hot/Cold/Overdue Numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Numbers */}
        <Section title="🔥 Números Quentes" subtitle="Mais sorteados">
          <Card>
            <div className="space-y-3">
              {stats.hotNumbers.map((num) => (
                <div
                  key={num.number}
                  className="flex items-center justify-between"
                >
                  <LotteryBall
                    number={num.number}
                    size="sm"
                    variant="default"
                  />
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mega-green rounded-full transition-all"
                        style={{
                          width: `${(num.count / stats.hotNumbers[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-16 text-right">
                    {num.count}x
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Cold Numbers */}
        <Section title="❄️ Números Frios" subtitle="Menos sorteados">
          <Card>
            <div className="space-y-3">
              {stats.coldNumbers.map((num) => (
                <div
                  key={num.number}
                  className="flex items-center justify-between"
                >
                  <LotteryBall number={num.number} size="sm" variant="muted" />
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all"
                        style={{
                          width: `${(num.count / stats.hotNumbers[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-16 text-right">
                    {num.count}x
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Overdue Numbers */}
        <Section title="⏰ Números Atrasados" subtitle="Mais tempo sem sair">
          <Card>
            <div className="space-y-3">
              {stats.overdueNumbers.map((num) => (
                <div
                  key={num.number}
                  className="flex items-center justify-between"
                >
                  <LotteryBall
                    number={num.number}
                    size="sm"
                    variant="highlight"
                  />
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{
                          width: `${(num.gap / stats.overdueNumbers[0].gap) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-24 text-right">
                    {num.gap} concursos
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      </div>

      {/* Patterns */}
      <Section title="Padrões" subtitle="Distribuição de características">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Odd/Even */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Ímpares vs Pares</h3>
            <div className="space-y-2">
              {Object.entries(stats.oddEven.percentages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([key, percentage]) => {
                  const [odd, even] = key.split("-");
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-600">
                        {odd} ímpares / {even} pares
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-caixa-blue rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Consecutive */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">
              Números Consecutivos
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Com consecutivos</span>
                <span className="font-bold text-mega-green">
                  {stats.consecutive.percentageWith.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sem consecutivos</span>
                <span className="font-bold text-slate-600">
                  {(100 - stats.consecutive.percentageWith).toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-mega-green"
                  style={{ width: `${stats.consecutive.percentageWith}%` }}
                />
                <div
                  className="h-full bg-slate-400"
                  style={{
                    width: `${100 - stats.consecutive.percentageWith}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {stats.consecutive.withConsecutive.toLocaleString("pt-BR")}{" "}
                concursos tinham ao menos dois números consecutivos
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Probability Table */}
      <Section title="Probabilidades" subtitle="Chances teóricas de acerto">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Acertos
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">
                    Probabilidade
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">
                    1 em
                  </th>
                </tr>
              </thead>
              <tbody>
                {[6, 5, 4, 3, 2, 1, 0].map((hits) => {
                  const prob = probability.hitProbability(hits);
                  const odds = probability.hitOdds(hits);
                  return (
                    <tr
                      key={hits}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${hits >= 4 ? "text-mega-green" : "text-slate-600"}`}
                        >
                          {hits} números
                        </span>
                        {hits === 6 && (
                          <span className="ml-2 text-xs text-amber-500 font-bold">
                            SENA
                          </span>
                        )}
                        {hits === 5 && (
                          <span className="ml-2 text-xs text-slate-400 font-bold">
                            QUINA
                          </span>
                        )}
                        {hits === 4 && (
                          <span className="ml-2 text-xs text-slate-400 font-bold">
                            QUADRA
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {(prob * 100).toFixed(6)}%
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {odds === Infinity
                          ? "—"
                          : Math.round(odds).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>
    </div>
  );
}
