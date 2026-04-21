import { useState, useMemo } from "react";
import { useHistoricalData } from "@/hooks/useMegaSena";
import { formatBRL, formatDateBR } from "@/api/megasena";
import { Card, Section } from "@/components/ui/Card";
import { DrawResult } from "@/components/ui/LotteryBall";
import { Button } from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/Loading";

const ITEMS_PER_PAGE = 20;

export function History() {
  const { data: historicalData, isLoading } = useHistoricalData();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDraw, setSelectedDraw] = useState<number | null>(null);

  const filteredDraws = useMemo(() => {
    if (!historicalData?.draws) return [];

    let draws = [...historicalData.draws].sort((a, b) => b.numero - a.numero);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      draws = draws.filter((draw) => {
        // Search by draw number
        if (draw.numero.toString().includes(term)) return true;
        // Search by number in draw
        if (draw.dezenas.some((d) => d.toString() === term)) return true;
        // Search by date
        if (formatDateBR(draw.data).includes(term)) return true;
        return false;
      });
    }

    return draws;
  }, [historicalData, searchTerm]);

  const paginatedDraws = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredDraws.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDraws, page]);

  const totalPages = Math.ceil(filteredDraws.length / ITEMS_PER_PAGE);

  // Get selected draw details from historical data
  const selectedDrawData = useMemo(() => {
    if (!selectedDraw || !historicalData?.draws) return null;
    return historicalData.draws.find((d) => d.numero === selectedDraw);
  }, [selectedDraw, historicalData]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!historicalData?.draws?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Dados históricos não disponíveis</p>
        <p className="text-slate-500 mt-2">
          É necessário gerar o arquivo de histórico primeiro
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Section
        title="Histórico de Resultados"
        subtitle={`${historicalData.totalDraws.toLocaleString("pt-BR")} concursos desde 1996`}
      >
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por número do concurso, dezena ou data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-caixa-blue focus:ring-2 focus:ring-caixa-blue/20 outline-none transition-all"
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {paginatedDraws.map((draw) => (
            <Card key={draw.numero} className="hover:shadow-md transition-shadow">
              <button
                type="button"
                className="w-full text-left"
                aria-expanded={selectedDraw === draw.numero}
                onClick={() =>
                  setSelectedDraw(
                    selectedDraw === draw.numero ? null : draw.numero
                  )
                }
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase">
                        Concurso
                      </p>
                      <p className="text-2xl font-bold text-caixa-blue">
                        {draw.numero}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                      <p className="text-sm text-slate-500">
                        {formatDateBR(draw.data)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {draw.acumulado && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Acumulou
                          </span>
                        )}
                        {draw.ganhadores[0] > 0 && (
                          <span className="text-xs bg-mega-green/10 text-mega-green px-2 py-0.5 rounded-full font-medium">
                            {draw.ganhadores[0]} ganhador
                            {draw.ganhadores[0] > 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DrawResult numbers={draw.dezenas} size="sm" />

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Prêmio Sena</p>
                    <p className="font-bold text-mega-green">
                      {formatBRL(draw.premios[0])}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {selectedDraw === draw.numero && selectedDrawData && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">
                        Premiação
                      </p>
                      <div className="space-y-1">
                        {[
                          { label: "6 acertos (Sena)", index: 0 },
                          { label: "5 acertos (Quina)", index: 1 },
                          { label: "4 acertos (Quadra)", index: 2 },
                        ].map(({ label, index }) => (
                          <div
                            key={label}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-600">{label}</span>
                            <span className="font-medium">
                              {selectedDrawData.ganhadores[index] > 0
                                ? `${selectedDrawData.ganhadores[index]}x ${formatBRL(selectedDrawData.premios[index])}`
                                : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">
                        Arrecadação
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatBRL(selectedDrawData.arrecadacao)}
                      </p>
                      {selectedDrawData.acumuladoProximo > 0 && (
                        <>
                          <p className="text-xs text-slate-500 uppercase mb-2 mt-4">
                            Acumulou para próximo
                          </p>
                          <p className="text-sm font-medium text-amber-600">
                            {formatBRL(selectedDrawData.acumuladoProximo)}
                          </p>
                        </>
                      )}
                    </div>

                    {selectedDrawData.ganhadoresPorUF &&
                      Object.keys(selectedDrawData.ganhadoresPorUF).length >
                        0 && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase mb-2">
                            Ganhadores por Estado
                          </p>
                          <div className="space-y-1">
                            {Object.entries(selectedDrawData.ganhadoresPorUF)
                              .sort(([, a], [, b]) => b - a)
                              .map(([uf, count]) => (
                                <div
                                  key={uf}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-slate-600">{uf}</span>
                                  <span className="font-medium text-mega-green">
                                    {count}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`
                      w-10 h-10 rounded-lg text-sm font-medium transition-all
                      ${
                        page === pageNum
                          ? "bg-caixa-blue text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    `}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Próximo →
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-4">
          Mostrando {page * ITEMS_PER_PAGE + 1} -{" "}
          {Math.min((page + 1) * ITEMS_PER_PAGE, filteredDraws.length)} de{" "}
          {filteredDraws.length.toLocaleString("pt-BR")} resultados
        </p>
      </Section>
    </div>
  );
}
