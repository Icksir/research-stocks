export type TabType = 'analysis' | 'technical' | 'financials' | 'options' | 'news';
export type ETFTabType = 'analysis' | 'etf-info' | 'holdings' | 'sectors' | 'options' | 'news';

export interface StockInfo {
  ticker?: string;
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

export interface Profitability {
  eps_trailing?: number;
  eps_forward?: number;
  gross_margin?: number;
  operating_margin?: number;
  profit_margin?: number;
  ebitda_margin?: number;
  roe?: number;
  roa?: number;
}

export interface Valuation {
  pe_trailing?: number;
  pe_forward?: number;
  peg_ratio?: number | null;
  price_to_book?: number;
  price_to_sales?: number;
  ev_to_ebitda?: number;
  ev_to_revenue?: number;
}

export interface Debt {
  total_debt?: number;
  total_cash?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  quick_ratio?: number;
}

export interface Dividends {
  dividend_rate?: number | null;
  dividend_yield?: number | null;
  payout_ratio?: number;
  five_year_avg_dividend_yield?: number | null;
}

export interface Growth {
  earnings_growth?: number | null;
  revenue_growth?: number;
  earnings_quarterly_growth?: number | null;
}

export interface Analyst {
  recommendation_key?: string;
  recommendation_mean?: number;
  target_high_price?: number;
  target_low_price?: number;
  target_mean_price?: number;
  number_of_analyst_opinions?: number;
}

export interface FinancialMetrics {
  profitability?: Profitability;
  valuation?: Valuation;
  debt?: Debt;
  dividends?: Dividends;
  growth?: Growth;
  analyst?: Analyst;
}

export interface TechnicalSummary {
  recommendation?: string;
  buy_signals?: number;
  sell_signals?: number;
  neutral_signals?: number;
}

export interface Oscillators {
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

export interface MovingAverages {
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

export interface Indicators {
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
  oscillators?: Oscillators;
  moving_averages?: MovingAverages;
  indicators?: Indicators;
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

export interface UnusualMove {
  type: 'CALL' | 'PUT';
  strike: number;
  volume?: number;
  oi?: number;
  ratio?: number;
}

export interface OptionsData {
  ticker?: string;
  price?: number;
  atm_iv_avg?: string;
  unusual_activity_count?: number;
  top_unusual_moves?: UnusualMove[];
  error?: string | null;
}