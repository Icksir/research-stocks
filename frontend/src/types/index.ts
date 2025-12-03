// Tipos para la información básica del instrumento
export interface StockInfo {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  country?: string;
  description?: string;
  employees?: number;
  
  // Precio
  price?: number;
  previous_close?: number;
  day_high?: number;
  day_low?: number;
  volume?: number;
  avg_volume?: number;
  
  // Market cap
  market_cap?: number;
  enterprise_value?: number;
  
  // 52 semanas
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  fifty_two_week_change?: number;
  fifty_day_average?: number;
  two_hundred_day_average?: number;
  
  // Métricas
  beta?: number;
  pe_trailing?: number;
  pe_forward?: number;
  peg_ratio?: number;
  price_to_book?: number;
  price_to_sales?: number;
  ev_to_ebitda?: number;
  
  // Profitability
  eps_trailing?: number;
  eps_forward?: number;
  gross_margin?: number;
  operating_margin?: number;
  profit_margin?: number;
  roe?: number;
  roa?: number;
  
  // Debt
  total_debt?: number;
  total_cash?: number;
  total_cash_per_share?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  quick_ratio?: number;
  
  // Dividends
  dividend_yield?: number;
  dividend_rate?: number;
  payout_ratio?: number;
  
  // Growth
  earnings_growth?: number;
  revenue_growth?: number;
  earnings_quarterly_growth?: number;
  
  // Analyst
  recommendation_key?: string;
  recommendation_mean?: number;
  target_high_price?: number;
  target_low_price?: number;
  target_mean_price?: number;
  number_of_analyst_opinions?: number;
  
  // Risk
  short_percent_of_float?: number;
  held_percent_institutions?: number;
  held_percent_insiders?: number;
}

// ETF específico
export interface ETFInfo extends StockInfo {
  category?: string;
  fund_family?: string;
  nav_price?: number;
  expense_ratio?: number;
  total_assets?: number;
  ytd_return?: number;
  three_year_return?: number;
  five_year_return?: number;
  trailing_three_month_returns?: number;
}

// Holdings de ETF
export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
}

export interface ETFHoldings {
  holdings: ETFHolding[];
}

export interface ETFSectors {
  sectors: Record<string, number>;
}

// Análisis técnico de TradingView
export interface TradingViewSummary {
  recommendation: string;
  buy_signals: number;
  sell_signals: number;
  neutral_signals: number;
}

export interface OscillatorIndicators {
  rsi?: number;
  stoch_k?: number;
  stoch_d?: number;
  stoch_rsi_k?: number;
  cci?: number;
  adx?: number;
  adx_plus_di?: number;
  adx_minus_di?: number;
  ao?: number;
  momentum?: number;
  macd?: number;
  macd_signal?: number;
  macd_histogram?: number;
  williams_r?: number;
  bull_bear_power?: number;
  ultimate_oscillator?: number;
}

export interface MovingAverageIndicators {
  ema_5?: number;
  ema_10?: number;
  ema_20?: number;
  ema_30?: number;
  ema_50?: number;
  ema_100?: number;
  ema_200?: number;
  sma_5?: number;
  sma_10?: number;
  sma_20?: number;
  sma_30?: number;
  sma_50?: number;
  sma_100?: number;
  sma_200?: number;
  ichimoku_baseline?: number;
  ichimoku_conversion?: number;
  vwma?: number;
  hull_ma_9?: number;
}

export interface VolatilityIndicators {
  atr?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  bb_width?: number;
  high_low_percent?: number;
}

export interface PriceVolumeData {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number;
  change_percent?: number;
  avg_volume_10d?: number;
  avg_volume_30d?: number;
  relative_volume?: number;
}

export interface PivotPoints {
  p?: number;
  r1?: number;
  r2?: number;
  r3?: number;
  s1?: number;
  s2?: number;
  s3?: number;
}

export interface TrendIndicators {
  psar?: number;
  supertrend?: number;
  aroon_up?: number;
  aroon_down?: number;
  price_vs_ema_20?: string;
  price_vs_sma_50?: string;
  price_vs_sma_200?: string;
  ma_cross_50_200?: string;
}

export interface TechnicalAnalysis {
  ticker: string;
  exchange?: string;
  interval?: string;
  summary: TradingViewSummary;
  oscillators: {
    recommendation: string;
    buy: number;
    sell: number;
    neutral: number;
    indicators: OscillatorIndicators;
  };
  moving_averages: {
    recommendation: string;
    buy: number;
    sell: number;
    neutral: number;
    indicators: MovingAverageIndicators;
  };
  volatility: VolatilityIndicators;
  price_volume: PriceVolumeData;
  pivot_points: {
    classic: PivotPoints;
    fibonacci: PivotPoints;
    camarilla: PivotPoints;
  };
  trend: TrendIndicators;
  error?: string;
}

// Multi-timeframe
export interface TimeframeAnalysis {
  recommendation: string;
  buy: number;
  sell: number;
  neutral: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  adx?: number;
  ema_20?: number;
  sma_50?: number;
  error?: string;
}

export interface MultiTimeframe {
  ticker: string;
  exchange?: string;
  timeframes: {
    '1h'?: TimeframeAnalysis;
    '4h'?: TimeframeAnalysis;
    '1d'?: TimeframeAnalysis;
    '1w'?: TimeframeAnalysis;
  };
  confluence?: {
    bullish_timeframes: number;
    bearish_timeframes: number;
    neutral_timeframes: number;
    overall: string;
  };
}

// Opciones
export interface OptionsMove {
  type: string;
  strike: number;
  expiration?: string;
  volume: number;
  open_interest?: number;
  ratio?: number;
  premium?: number;
}

export interface OptionsVolatility {
  ticker: string;
  price: number;
  atm_iv_avg: string;
  unusual_activity_count: number;
  top_unusual_moves: OptionsMove[];
  error?: string;
}

// Sentiment (separado del análisis técnico)
export interface SentimentMessage {
  body: string;
  sentiment?: string;
  created_at?: string;
}

export interface SentimentDistribution {
  bullish: number;
  bearish: number;
  neutral: number;
  total: number;
}

export interface SentimentAnalysis {
  stock_name: string;
  messages: SentimentMessage[];
  distribution?: SentimentDistribution;
}

// Tipos para Sentiment (endpoint separado)
export interface SentimentMessage {
  body: string;
  sentiment?: string;
  created_at?: string;
}

export interface SentimentDistribution {
  bullish: number;
  bearish: number;
  neutral: number;
  total: number;
}

export interface SentimentAnalysis {
  stock_name: string;
  messages: SentimentMessage[];
  distribution?: SentimentDistribution;
}

export interface SentimentResponse {
  ticker: string;
  sentiment: SentimentAnalysis;
  generated_at: string;
}

// Response completo del análisis de stock
export interface StockAnalysisResponse {
  ticker: string;
  type: 'stock' | 'etf';
  info: StockInfo;
  technical_analysis?: TechnicalAnalysis;
  multi_timeframe?: MultiTimeframe;
  options_volatility?: OptionsVolatility;
  news?: string;
  analysis: string; // El análisis generado por el LLM
}

// Response completo del análisis de ETF
export interface ETFAnalysisResponse {
  ticker: string;
  type: 'etf';
  info: ETFInfo;
  holdings?: ETFHoldings;
  sector_allocation?: ETFSectors;
  technical_analysis?: TechnicalAnalysis;
  multi_timeframe?: MultiTimeframe;
  options_volatility?: OptionsVolatility;
  news?: string;
  analysis: string;
}

// Sentiment response separado
export interface SentimentResponse {
  ticker: string;
  sentiment: SentimentAnalysis;
  generated_at: string;
}

// Union type para cualquier análisis
export type AnalysisResponse = StockAnalysisResponse | ETFAnalysisResponse;