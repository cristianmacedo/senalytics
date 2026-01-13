/**
 * Winner location information
 */
export interface WinnerLocation {
  ganhadores: number;
  municipio: string;
  nomeFatansiaUL: string;
  posicao: number;
  serie: string;
  uf: string;
}

/**
 * Prize tier information
 */
export interface PrizeTier {
  descricaoFaixa: string;
  faixa: number;
  numeroDeGanhadores: number;
  valorPremio: number;
}

/**
 * Full Mega Sena draw result from Caixa API
 */
export interface MegaSenaResult {
  /** Whether the prize accumulated (no winners) */
  acumulado: boolean;
  
  /** Draw date (DD/MM/YYYY format) */
  dataApuracao: string;
  
  /** Next draw date (DD/MM/YYYY format) */
  dataProximoConcurso: string;
  
  /** Numbers drawn in order of draw */
  dezenasSorteadasOrdemSorteio: string[];
  
  /** Whether to show winners by city detail */
  exibirDetalhamentoPorCidade: boolean;
  
  /** Internal ID (usually null) */
  id: string | null;
  
  /** Special draw indicator (0=normal, 1=Mega da Virada, 2=other special) */
  indicadorConcursoEspecial: number;

  /** Total amount collected in bets */
  valorArrecadado: number;

  /** Accumulated prize for next draw */
  valorAcumuladoProximoConcurso: number;
  
  /** Numbers drawn in ascending order */
  listaDezenas: string[];
  
  /** Second draw numbers (for special draws, usually null) */
  listaDezenasSegundoSorteio: string[] | null;
  
  /** List of winner locations */
  listaMunicipioUFGanhadores: WinnerLocation[];
  
  /** Prize breakdown by tier */
  listaRateioPremio: PrizeTier[];
  
  /** Sports team results (for specific games, usually null) */
  listaResultadoEquipeEsportiva: unknown[] | null;
  
  /** Draw location name */
  localSorteio: string;
  
  /** Draw city and state */
  nomeMunicipioUFSorteio: string;
  
  /** Heart team month of luck (legacy field with garbage data) */
  nomeTimeCoracaoMesSorte: string;
  
  /** Draw number (concurso) */
  numero: number;
  
  /** Previous draw number */
  numeroConcursoAnterior: number;
  
  /** Final draw number for 0-5 accumulation */
  numeroConcursoFinal_0_5: number;
  
  /** Next draw number */
  numeroConcursoProximo: number;
  
  /** Game type number */
  numeroJogo: number;
  
  /** Observation text */
  observacao: string;
  
  /** Contingency prize (usually null) */
  premiacaoContingencia: unknown | null;
  
  /** Game type identifier */
  tipoJogo: 'MEGA_SENA';
  
  /** Publication type */
  tipoPublicacao: number;
  
  /** Whether this is the latest draw */
  ultimoConcurso: boolean;
  
  /** Total amount collected */
  valorArrecadado: number;
  
  /** Accumulated value for 0-5 special */
  valorAcumuladoConcurso_0_5: number;
  
  /** Accumulated value for special draw */
  valorAcumuladoConcursoEspecial: number;
  
  /** Accumulated value for next draw */
  valorAcumuladoProximoConcurso: number;
  
  /** Estimated prize for next draw */
  valorEstimadoProximoConcurso: number;
  
  /** Reserve fund balance */
  valorSaldoReservaGarantidora: number;
  
  /** Total prize for first tier */
  valorTotalPremioFaixaUm: number;
}

/**
 * Simplified draw data for statistics (lighter weight)
 */
export interface DrawData {
  /** Draw number */
  numero: number;

  /** Draw date (ISO format for easier parsing) */
  data: string;

  /** Numbers drawn (as integers, sorted) */
  dezenas: number[];

  /** Whether it accumulated */
  acumulado: boolean;

  /** Special draw indicator: 0=normal, 1=Mega da Virada, 2=other special */
  especial: number;

  /** Number of winners in each tier [6 acertos, 5 acertos, 4 acertos] */
  ganhadores: [number, number, number];

  /** Prizes for each tier [sena, quina, quadra] */
  premios: [number, number, number];

  /** Total amount collected in bets */
  arrecadacao: number;

  /** Accumulated prize for next draw (0 if someone won) */
  acumuladoProximo: number;

  /** Winners by state (UF) - only present if there were Sena winners */
  ganhadoresPorUF?: Record<string, number>;
}

/**
 * Historical data file structure
 */
export interface HistoricalData {
  /** Last update timestamp */
  updatedAt: string;
  
  /** Total number of draws */
  totalDraws: number;
  
  /** All draws */
  draws: DrawData[];
}

/**
 * Number frequency statistics
 */
export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastDrawn: number; // Draw number where it was last drawn
  gap: number; // Current gap since last drawn
}

/**
 * Statistics summary
 */
export interface StatsSummary {
  /** Most frequent numbers */
  hotNumbers: NumberFrequency[];
  
  /** Least frequent numbers */
  coldNumbers: NumberFrequency[];
  
  /** Numbers with longest current gap */
  overdueNumbers: NumberFrequency[];
  
  /** Average gap between draws for each number */
  averageGaps: Record<number, number>;
  
  /** Total draws analyzed */
  totalDraws: number;
  
  /** Date range */
  dateRange: {
    first: string;
    last: string;
  };
}
