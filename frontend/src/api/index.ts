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

// Tipos
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

export interface FinancialMetrics {
  profitability?: {
    eps_trailing?: number;
    eps_forward?: number;
    gross_margin?: number;
    operating_margin?: number;
    profit_margin?: number;
    ebitda_margin?: number;
    roe?: number;
    roa?: number;
  };
  valuation?: {
    pe_trailing?: number;
    pe_forward?: number;
    peg_ratio?: number | null;
    price_to_book?: number;
    price_to_sales?: number;
    ev_to_ebitda?: number;
    ev_to_revenue?: number;
  };
  debt?: {
    total_debt?: number;
    total_cash?: number;
    debt_to_equity?: number;
    current_ratio?: number;
    quick_ratio?: number;
  };
  dividends?: {
    dividend_rate?: number | null;
    dividend_yield?: number | null;
    payout_ratio?: number;
    five_year_avg_dividend_yield?: number | null;
  };
  growth?: {
    earnings_growth?: number | null;
    revenue_growth?: number;
    earnings_quarterly_growth?: number | null;
  };
  analyst?: {
    recommendation_key?: string;
    recommendation_mean?: number;
    target_high_price?: number;
    target_low_price?: number;
    target_mean_price?: number;
    number_of_analyst_opinions?: number;
  };
}

export interface TechnicalAnalysis {
  ticker?: string;
  exchange?: string;
  interval?: string;
  summary?: {
    recommendation?: string;
    buy_signals?: number;
    sell_signals?: number;
    neutral_signals?: number;
  };
  oscillators?: {
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
  };
  moving_averages?: {
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
  };
  indicators?: {
    atr?: number | null;
    bb_upper?: number;
    bb_lower?: number;
    bb_middle?: number | null;
    pivot_r1?: number;
    pivot_s1?: number;
    pivot_r2?: number;
    pivot_s2?: number;
  };
  error?: string | null;
}

export interface MultiTimeframe {
  ticker?: string;
  timeframes?: Record<string, {
    recommendation?: string;
    buy?: number;
    sell?: number;
    neutral?: number;
    rsi?: number;
    macd?: number;
    error?: string | null;
  }>;
}

export interface OptionsData {
  ticker?: string;
  price?: number;
  atm_iv_avg?: string;
  unusual_activity_count?: number;
  top_unusual_moves?: Array<{
    type: 'CALL' | 'PUT';
    strike: number;
    volume?: number;
    oi?: number;
    ratio?: number;
  }>;
  error?: string | null;
}

export interface RawData {
  ticker?: string;
  timestamp?: string;
  is_etf?: boolean;
  info?: StockInfo;
  financial_metrics?: FinancialMetrics;
  technical_analysis?: TechnicalAnalysis;
  multi_timeframe?: MultiTimeframe;
  options?: OptionsData;
  news?: string;
}

export interface BackendAnalysisResponse {
  ticker: string;
  instrument_type: string;
  analysis: string;
  raw_data: RawData;
  cached?: boolean;
}

export interface SentimentResponse {
  ticker: string;
  sentiment: string;
  score: number;
}

// Análisis completo
export async function analyzeInstrument(ticker: string): Promise<BackendAnalysisResponse> {
  return fetchApi<BackendAnalysisResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ ticker: ticker.toUpperCase() }),
  });
}

// Health check
export async function healthCheck(): Promise<{ status: string; model: string }> {
  return fetchApi<{ status: string; model: string }>('/health');
}

export { ApiError };