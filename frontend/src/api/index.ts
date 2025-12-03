const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8100';

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.detail || `Error ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS BASE PARA STOCKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface StockInfo {
  ticker: string;
  name?: string;
  sector?: string;
  industry?: string;
  country?: string;
  description?: string;
  price?: number;
  previous_close?: number;
  day_high?: number;
  day_low?: number;
  volume?: number;
  avg_volume?: number;
  market_cap?: number;
  enterprise_value?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  fifty_two_week_change?: number;
  fifty_day_average?: number;
  two_hundred_day_average?: number;
  beta?: number;
}

export interface ProfitabilityMetrics {
  eps_trailing?: number;
  eps_forward?: number;
  gross_margin?: number;
  operating_margin?: number;
  profit_margin?: number;
  ebitda_margin?: number;
  roe?: number;
  roa?: number;
}

export interface ValuationMetrics {
  pe_trailing?: number;
  pe_forward?: number;
  peg_ratio?: number | null;
  price_to_book?: number;
  price_to_sales?: number;
  ev_to_ebitda?: number;
  ev_to_revenue?: number;
}

export interface DebtMetrics {
  total_debt?: number;
  total_cash?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  quick_ratio?: number;
}

export interface DividendMetrics {
  dividend_rate?: number | null;
  dividend_yield?: number | null;
  payout_ratio?: number;
  five_year_avg_dividend_yield?: number | null;
}

export interface GrowthMetrics {
  earnings_growth?: number | null;
  revenue_growth?: number;
  earnings_quarterly_growth?: number | null;
}

export interface AnalystMetrics {
  recommendation_key?: string;
  recommendation_mean?: number;
  target_high_price?: number;
  target_low_price?: number;
  target_mean_price?: number;
  number_of_analyst_opinions?: number;
}

export interface FinancialMetrics {
  profitability?: ProfitabilityMetrics;
  valuation?: ValuationMetrics;
  debt?: DebtMetrics;
  dividends?: DividendMetrics;
  growth?: GrowthMetrics;
  analyst?: AnalystMetrics;
}

export interface TechnicalSummary {
  recommendation?: string;
  buy_signals?: number;
  sell_signals?: number;
  neutral_signals?: number;
}

export interface OscillatorsAnalysis {
  recommendation?: string;
  buy?: number;
  sell?: number;
  neutral?: number;
  rsi?: number;
  stoch_k?: number;
  stoch_d?: number;
  cci?: number;
  adx?: number;
  macd?: number;
  macd_signal?: number;
  momentum?: number;
  williams_r?: number;
}

export interface MovingAveragesAnalysis {
  recommendation?: string;
  buy?: number;
  sell?: number;
  neutral?: number;
  ema_10?: number;
  ema_20?: number;
  ema_50?: number;
  ema_100?: number;
  ema_200?: number;
  sma_10?: number;
  sma_20?: number;
  sma_50?: number;
  sma_100?: number;
  sma_200?: number;
}

export interface TechnicalIndicators {
  atr?: number | null;
  bb_upper?: number;
  bb_lower?: number;
  bb_middle?: number | null;
  pivot_r1?: number;
  pivot_s1?: number;
  pivot_r2?: number;
  pivot_s2?: number;
}

export interface TechnicalAnalysis {
  ticker?: string;
  exchange?: string;
  interval?: string;
  summary?: TechnicalSummary;
  oscillators?: OscillatorsAnalysis;
  moving_averages?: MovingAveragesAnalysis;
  indicators?: TechnicalIndicators;
  error?: string | null;
}

export interface TimeframeData {
  recommendation?: string;
  buy?: number;
  sell?: number;
  neutral?: number;
  rsi?: number;
  macd?: number;
  error?: string | null;
}

export interface MultiTimeframe {
  ticker?: string;
  timeframes?: Record<string, TimeframeData>;
}

export interface OptionsMove {
  type: 'CALL' | 'PUT';
  strike: number;
  volume?: number;
  oi?: number;
  ratio?: string | number;
}

export interface OptionsVolatility {
  ticker?: string;
  price?: number;
  atm_iv_avg?: string;
  unusual_activity_count?: number;
  top_unusual_moves?: OptionsMove[];
  error?: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA NOTICIAS
// ═══════════════════════════════════════════════════════════════════════════════

export interface NewsArticle {
  title: string;
  source: string;
  publisher: string;
  content: string;
  url: string;
  date: string;
  sentiment?: string | null;
  relevance_score?: number | null;
}

export interface NewsResponse {
  ticker: string;
  summary: string;
  articles?: NewsArticle[];
  sources_used?: string[];
  total_articles?: number;
  fetch_timestamp?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA ETF
// ═══════════════════════════════════════════════════════════════════════════════

export interface ETFInfo {
  ticker: string;
  name?: string;
  category?: string;
  fund_family?: string;
  legal_type?: string;
  description?: string;
  error?: string | null;
  // Precios y volumen
  price?: number;
  previous_close?: number;
  volume?: number;
  avg_volume?: number;
  nav_price?: number;
  // Rangos de precio
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  fifty_two_week_change_percent?: number;
  fifty_day_average?: number;
  two_hundred_day_average?: number;
  // Retornos
  ytd_return?: number;
  three_year_return?: number;
  five_year_return?: number;
  trailing_three_month_returns?: number;
  // Costos y activos
  expense_ratio?: number;
  total_assets?: number;
  net_assets?: number;
  // Dividendos
  dividend_yield?: number;
  dividend_yield_percent?: number;
  trailing_annual_dividend_rate?: number;
  // Valuación
  trailing_pe?: number;
  price_to_book?: number;
  beta?: number;
}

export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
}

export interface ETFHoldings {
  ticker?: string;
  holdings: ETFHolding[];
  total_holdings_fetched: number;
  error?: string | null;
}

export interface ETFSectorAllocation {
  ticker?: string;
  sectors: Record<string, number>;
  error?: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA /data/{ticker} ENDPOINT - STOCK
// ═══════════════════════════════════════════════════════════════════════════════

export interface NewsData {
  summary: string;
  articles: NewsArticle[];
  sources_used?: string[];
  total_articles?: number;
  fetch_timestamp?: string;
}

export interface StockDataSchema {
  ticker: string;
  timestamp: string;
  is_etf: false;
  info: StockInfo;
  financial_metrics: FinancialMetrics;
  technical_analysis: TechnicalAnalysis;
  multi_timeframe: MultiTimeframe;
  options_volatility: OptionsVolatility;
  news: NewsData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA /data/{ticker} ENDPOINT - ETF
// ═══════════════════════════════════════════════════════════════════════════════

export interface ETFDataSchema {
  ticker: string;
  timestamp: string;
  is_etf: true;
  info: ETFInfo;
  holdings: ETFHoldings;
  sector_allocation: ETFSectorAllocation;
  options_volatility: OptionsVolatility;
  news: NewsData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA /data/{ticker} RESPONSE
// ═══════════════════════════════════════════════════════════════════════════════

export interface StockDataResponse {
  ticker: string;
  instrument_type: 'STOCK';
  cached: boolean;
  data: StockDataSchema;
}

export interface ETFDataResponse {
  ticker: string;
  instrument_type: 'ETF';
  cached: boolean;
  data: ETFDataSchema;
}

export type InstrumentDataResponse = StockDataResponse | ETFDataResponse;

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA /analyze ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

export interface StockAnalysisRawData {
  options: OptionsVolatility;
}

export interface ETFAnalysisRawData {
  info: ETFInfo;
  holdings: {
    top_holdings: ETFHolding[];
    total_count: number;
  };
  sectors: Record<string, number>;
  options: OptionsVolatility;
}

export interface StockAnalysisResponse {
  ticker: string;
  instrument_type: 'STOCK';
  analysis: string;
  raw_data: StockAnalysisRawData;
}

export interface ETFAnalysisResponse {
  ticker: string;
  instrument_type: 'ETF';
  analysis: string;
  raw_data: ETFAnalysisRawData;
}

export type AnalysisResponse = StockAnalysisResponse | ETFAnalysisResponse;

// Alias para compatibilidad con código existente
export type BackendAnalysisResponse = InstrumentDataResponse;

// ═══════════════════════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los datos de un instrumento (Stock o ETF)
 * Endpoint: GET /data/{ticker}
 */
export async function getInstrumentData(ticker: string): Promise<InstrumentDataResponse> {
  return fetchApi<InstrumentDataResponse>(`/data/${ticker.toUpperCase()}`);
}

/**
 * Obtiene datos de un Stock específicamente
 * Endpoint: GET /data/{ticker}
 */
export async function getStockData(ticker: string): Promise<StockDataResponse> {
  const response = await getInstrumentData(ticker);
  if (!isStockResponse(response)) {
    throw new Error(`${ticker} is not a Stock, it's an ETF`);
  }
  return response;
}

/**
 * Obtiene datos de un ETF específicamente
 * Endpoint: GET /data/{ticker}
 */
export async function getETFData(ticker: string): Promise<ETFDataResponse> {
  const response = await getInstrumentData(ticker);
  if (!isETFResponse(response)) {
    throw new Error(`${ticker} is not an ETF, it's a Stock`);
  }
  return response;
}

/**
 * Analiza un instrumento y retorna un informe con análisis de IA
 * Endpoint: POST /analyze
 */
export async function analyzeInstrument(ticker: string): Promise<AnalysisResponse> {
  return fetchApi<AnalysisResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ ticker: ticker.toUpperCase() }),
  });
}

/**
 * Obtiene datos completos + análisis de IA de un instrumento
 * Combina /data/{ticker} y /analyze en una sola llamada
 */
export async function getCompleteInstrumentData(ticker: string): Promise<{
  data: InstrumentDataResponse;
  analysis: string;
}> {
  const [dataResponse, analysisResponse] = await Promise.all([
    getInstrumentData(ticker),
    analyzeInstrument(ticker),
  ]);
  
  return {
    data: dataResponse,
    analysis: analysisResponse.analysis,
  };
}

/**
 * Obtiene noticias de un ticker con resumen y artículos
 * Endpoint: GET /news/{ticker}
 */
export async function getNews(ticker: string, includeArticles: boolean = true): Promise<NewsResponse> {
  const endpoint = `/news/${ticker.toUpperCase()}?include_articles=${includeArticles}`;
  return fetchApi<NewsResponse>(endpoint);
}

/**
 * Obtiene solo el resumen de noticias (sin artículos)
 * Endpoint: GET /news/{ticker}?include_articles=false
 */
export async function getNewsSummary(ticker: string): Promise<{ ticker: string; summary: string }> {
  return fetchApi<{ ticker: string; summary: string }>(`/news/${ticker.toUpperCase()}?include_articles=false`);
}

/**
 * Obtiene las fuentes de noticias disponibles
 * Endpoint: GET /news/{ticker}/sources
 */
export async function getNewsSources(): Promise<{ sources: Array<{ source: string; configured: boolean }> }> {
  return fetchApi<{ sources: Array<{ source: string; configured: boolean }> }>('/news/sources');
}

/**
 * Health check
 * Endpoint: GET /health
 */
export async function healthCheck(): Promise<{ status: string; model: string }> {
  return fetchApi<{ status: string; model: string }>('/health');
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Type guard para verificar si la respuesta es de un Stock
 */
export function isStockResponse(response: InstrumentDataResponse): response is StockDataResponse {
  return response.instrument_type === 'STOCK';
}

/**
 * Type guard para verificar si la respuesta es de un ETF
 */
export function isETFResponse(response: InstrumentDataResponse): response is ETFDataResponse {
  return response.instrument_type === 'ETF';
}

/**
 * Type guard para verificar si es StockDataSchema
 */
export function isStockData(data: StockDataSchema | ETFDataSchema): data is StockDataSchema {
  return data.is_etf === false;
}

/**
 * Type guard para verificar si es ETFDataSchema
 */
export function isETFData(data: StockDataSchema | ETFDataSchema): data is ETFDataSchema {
  return data.is_etf === true;
}

/**
 * Type guard para verificar si el análisis es de un Stock
 */
export function isStockAnalysis(response: AnalysisResponse): response is StockAnalysisResponse {
  return response.instrument_type === 'STOCK';
}

/**
 * Type guard para verificar si el análisis es de un ETF
 */
export function isETFAnalysis(response: AnalysisResponse): response is ETFAnalysisResponse {
  return response.instrument_type === 'ETF';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formatea un número grande a formato legible (1.2M, 3.5B, etc.)
 */
export function formatLargeNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return 'N/A';
  
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * Formatea un porcentaje (recibe decimal, ej: 0.15 -> "15.00%")
 */
export function formatPercentage(num: number | undefined | null): string {
  if (num === undefined || num === null) return 'N/A';
  return `${(num * 100).toFixed(2)}%`;
}

/**
 * Formatea un porcentaje que ya viene en formato porcentual (ej: 15.5 -> "15.50%")
 */
export function formatPercentageRaw(num: number | undefined | null): string {
  if (num === undefined || num === null) return 'N/A';
  return `${num.toFixed(2)}%`;
}

/**
 * Obtiene el color según la recomendación técnica
 */
export function getRecommendationColor(recommendation: string | undefined): string {
  if (!recommendation) return 'gray';
  
  const rec = recommendation.toUpperCase();
  if (rec.includes('STRONG_BUY')) return 'green';
  if (rec.includes('BUY')) return 'lime';
  if (rec.includes('STRONG_SELL')) return 'red';
  if (rec.includes('SELL')) return 'orange';
  return 'gray';
}

/**
 * Obtiene el nombre legible del instrumento
 */
export function getInstrumentName(response: InstrumentDataResponse): string {
  return response.data.info.name || response.ticker;
}

/**
 * Obtiene el precio actual del instrumento
 */
export function getInstrumentPrice(response: InstrumentDataResponse): number | undefined {
  return response.data.info.price;
}

/**
 * Obtiene la descripción del instrumento
 */
export function getInstrumentDescription(response: InstrumentDataResponse): string | undefined {
  return response.data.info.description;
}

export { ApiError };