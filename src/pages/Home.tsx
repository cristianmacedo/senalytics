import { useMemo } from "react";
import { useHistoricalData } from "@/hooks/useMegaSena";
import { formatBRL, formatDateBR } from "@/api/megasena";
import { Card, StatCard, Section } from "@/components/ui/Card";
import { DrawResult } from "@/components/ui/LotteryBall";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/Loading";
import { Link } from "react-router-dom";

export function Home() {
  const { data: historicalData, isLoading } = useHistoricalData();

  // Get the latest draw from historical data
  const latestDraw = useMemo(() => {
    if (!historicalData?.draws?.length) return null;

    return historicalData.draws.reduce((max, draw) =>
      draw.numero > max.numero ? draw : max
    );
  }, [historicalData]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!latestDraw) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar dados</p>
        <p className="text-slate-500 mt-2">
          Não foi possível carregar os resultados
        </p>
      </div>
    );
  }

  const winners = latestDraw.ganhadores[0];

  return (
    <div className="space-y-8">
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
                Último Concurso
              </p>
              <h1 className="text-4xl font-bold mt-1">
                Concurso {latestDraw.numero}
              </h1>
              <p className="text-white/80 mt-2">
                {formatDateBR(latestDraw.data)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
                {latestDraw.acumulado ? "Acumulou!" : "Prêmio Principal"}
              </p>
              <p className="text-3xl md:text-4xl font-bold mt-1">
                {formatBRL(latestDraw.premios[0])}
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
            <DrawResult numbers={latestDraw.dezenas} size="lg" />
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Section title="Resumo do Concurso" subtitle="Detalhes do último sorteio">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ganhadores (6 acertos)"
            value={latestDraw.ganhadores[0]}
            subtitle={formatBRL(latestDraw.premios[0])}
            trend={latestDraw.ganhadores[0] > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Ganhadores (5 acertos)"
            value={latestDraw.ganhadores[1]}
            subtitle={formatBRL(latestDraw.premios[1])}
          />
          <StatCard
            title="Ganhadores (4 acertos)"
            value={latestDraw.ganhadores[2]}
            subtitle={formatBRL(latestDraw.premios[2])}
          />
          <StatCard
            title="Arrecadação"
            value={formatBRL(latestDraw.arrecadacao)}
            subtitle={latestDraw.acumulado ? "Acumulou!" : ""}
            trend={latestDraw.acumulado ? "up" : "neutral"}
          />
        </div>
      </Section>

      {/* Winners by State */}
      {latestDraw.ganhadoresPorUF &&
        Object.keys(latestDraw.ganhadoresPorUF).length > 0 && (
          <Section title="Ganhadores por Estado">
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(latestDraw.ganhadoresPorUF)
                  .sort(([, a], [, b]) => b - a)
                  .map(([uf, count]) => (
                    <div
                      key={uf}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="font-bold text-slate-900">{uf}</span>
                      <span className="text-mega-green font-medium">
                        {count} {count === 1 ? "aposta" : "apostas"}
                      </span>
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
