import { useMemo } from "react";
import { useLatestDraw, useHistoricalData } from "@/hooks/useMegaSena";
import { formatBRL } from "@/api/megasena";
import { Card, StatCard, Section } from "@/components/ui/Card";
import { DrawResult } from "@/components/ui/LotteryBall";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/Loading";
import { Link } from "react-router-dom";
import type { MegaSenaResult } from "@/types/megasena";

export function Home() {
  const { data: latestDraw, isLoading: isLoadingLatest } = useLatestDraw();
  const { data: historicalData, isLoading: isLoadingHistorical } =
    useHistoricalData();

  // Fallback to latest from historical data if API fails
  const fallbackDraw = useMemo(() => {
    if (!historicalData?.draws?.length) return null;

    const latest = historicalData.draws.reduce((max, draw) =>
      draw.numero > max.numero ? draw : max
    );

    // Convert to MegaSenaResult-like structure for display
    return {
      numero: latest.numero,
      dataApuracao: new Date(latest.data).toLocaleDateString("pt-BR"),
      dataProximoConcurso: "",
      acumulado: latest.acumulado,
      listaDezenas: latest.dezenas.map((d) => d.toString().padStart(2, "0")),
      listaRateioPremio: [
        {
          descricaoFaixa: "6 acertos",
          faixa: 1,
          numeroDeGanhadores: latest.ganhadores[0],
          valorPremio: latest.premios[0],
        },
        {
          descricaoFaixa: "5 acertos",
          faixa: 2,
          numeroDeGanhadores: latest.ganhadores[1],
          valorPremio: latest.premios[1],
        },
        {
          descricaoFaixa: "4 acertos",
          faixa: 3,
          numeroDeGanhadores: latest.ganhadores[2],
          valorPremio: latest.premios[2],
        },
      ],
      listaMunicipioUFGanhadores:
        [] as MegaSenaResult["listaMunicipioUFGanhadores"],
      numeroConcursoProximo: latest.numero + 1,
      valorEstimadoProximoConcurso: 0,
      isFallback: true,
    } satisfies Partial<MegaSenaResult> & { isFallback: boolean };
  }, [historicalData]);

  const isLoading = isLoadingLatest && isLoadingHistorical;
  const displayDraw = latestDraw || fallbackDraw;
  const isUsingFallback = !latestDraw && fallbackDraw;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!displayDraw) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar dados</p>
        <p className="text-slate-500 mt-2">
          Não foi possível carregar os resultados
        </p>
      </div>
    );
  }

  const prize = displayDraw.listaRateioPremio[0];
  const winners = prize?.numeroDeGanhadores ?? 0;

  return (
    <div className="space-y-8">
      {/* Fallback Notice */}
      {isUsingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          <strong>Aviso:</strong> Não foi possível conectar à API da Caixa.
          Exibindo último resultado disponível do histórico local.
        </div>
      )}

      {/* Hero Section - Latest Draw */}
      <Card
        variant="elevated"
        className="bg-gradient-to-br from-mega-green to-mega-green-dark text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
                {isUsingFallback
                  ? "Último Concurso (Cache)"
                  : "Último Concurso"}
              </p>
              <h1 className="text-4xl font-bold mt-1">
                Concurso {displayDraw.numero}
              </h1>
              <p className="text-white/80 mt-2">{displayDraw.dataApuracao}</p>
            </div>

            <div className="text-right">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
                {displayDraw.acumulado ? "Acumulou!" : "Prêmio Principal"}
              </p>
              <p className="text-3xl md:text-4xl font-bold mt-1">
                {formatBRL(prize?.valorPremio ?? 0)}
              </p>
              <p className="text-white/80 mt-2">
                {winners === 0
                  ? "Nenhum ganhador"
                  : `${winners} ganhador${winners > 1 ? "es" : ""}`}
              </p>
            </div>
          </div>

          {/* Draw Numbers */}
          <div className="mt-8">
            <p className="text-white/80 text-sm font-medium mb-4 uppercase tracking-wide">
              Números Sorteados
            </p>
            <DrawResult
              numbers={displayDraw.listaDezenas.map((d) => parseInt(d, 10))}
              size="lg"
            />
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      {!isUsingFallback && (
        <Section
          title="Resumo do Concurso"
          subtitle="Detalhes do último sorteio"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Próximo Concurso"
              value={displayDraw.numeroConcursoProximo}
              subtitle={displayDraw.dataProximoConcurso}
            />
            <StatCard
              title="Estimativa Próximo"
              value={formatBRL(displayDraw.valorEstimadoProximoConcurso)}
              subtitle={displayDraw.acumulado ? "Acumulado!" : "Prêmio inicial"}
              trend={displayDraw.acumulado ? "up" : "neutral"}
            />
            <StatCard
              title="Ganhadores (5 acertos)"
              value={displayDraw.listaRateioPremio[1]?.numeroDeGanhadores ?? 0}
              subtitle={formatBRL(
                displayDraw.listaRateioPremio[1]?.valorPremio ?? 0
              )}
            />
            <StatCard
              title="Ganhadores (4 acertos)"
              value={displayDraw.listaRateioPremio[2]?.numeroDeGanhadores ?? 0}
              subtitle={formatBRL(
                displayDraw.listaRateioPremio[2]?.valorPremio ?? 0
              )}
            />
          </div>
        </Section>
      )}

      {/* Winners by Location */}
      {!isUsingFallback &&
        displayDraw.listaMunicipioUFGanhadores.length > 0 && (
          <Section title="Ganhadores por Local">
            <Card>
              <div className="divide-y divide-slate-100">
                {displayDraw.listaMunicipioUFGanhadores.map((winner, index) => (
                  <div
                    key={index}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {winner.municipio}
                      </p>
                      <p className="text-sm text-slate-500">
                        {winner.uf === "--" ? "Internet" : winner.uf}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-mega-green">
                        {winner.ganhadores}{" "}
                        {winner.ganhadores === 1 ? "aposta" : "apostas"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        )}

      {/* Quick Actions */}
      <Section title="Explore" subtitle="Descubra mais sobre a Mega Sena">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold text-lg text-slate-900">Estatísticas</h3>
              <p className="text-slate-500 text-sm mt-2">
                Números mais sorteados, atrasados e padrões
              </p>
              <Link to="/statistics">
                <Button variant="outline" size="sm" className="mt-4">
                  Ver Estatísticas
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-bold text-lg text-slate-900">Simulador</h3>
              <p className="text-slate-500 text-sm mt-2">
                Teste seus números contra o histórico
              </p>
              <Link to="/simulator">
                <Button variant="outline" size="sm" className="mt-4">
                  Simular Aposta
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="font-bold text-lg text-slate-900">Histórico</h3>
              <p className="text-slate-500 text-sm mt-2">
                Todos os resultados desde 1996
              </p>
              <Link to="/history">
                <Button variant="outline" size="sm" className="mt-4">
                  Ver Histórico
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}
