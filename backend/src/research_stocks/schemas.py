from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field


# ===== STOCK SCHEMAS =====

class StockInfoSchema(BaseModel):
    """Información básica de la acción."""
    ticker: str
    name: str = "N/A"
    sector: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    description: str = "No description available."
    
    # Trading
    price: Optional[float] = None
    previous_close: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    volume: Optional[int] = None
    avg_volume: Optional[int] = None
    market_cap: Optional[float] = None
    enterprise_value: Optional[float] = None
    
    # 52 week
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    fifty_two_week_change: Optional[float] = None
    
    # Moving averages
    fifty_day_average: Optional[float] = None
    two_hundred_day_average: Optional[float] = None
    
    # Risk
    beta: Optional[float] = None


class ProfitabilityMetrics(BaseModel):
    """Métricas de rentabilidad."""
    eps_trailing: Optional[float] = None
    eps_forward: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    profit_margin: Optional[float] = None
    ebitda_margin: Optional[float] = None
    roe: Optional[float] = None  # Return on Equity
    roa: Optional[float] = None  # Return on Assets


class ValuationMetrics(BaseModel):
    """Ratios de valuación."""
    pe_trailing: Optional[float] = None
    pe_forward: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_book: Optional[float] = None
    price_to_sales: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    ev_to_revenue: Optional[float] = None


class DebtMetrics(BaseModel):
    """Métricas de deuda y liquidez."""
    total_debt: Optional[float] = None
    total_cash: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None


class DividendMetrics(BaseModel):
    """Métricas de dividendos."""
    dividend_rate: Optional[float] = None
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    five_year_avg_dividend_yield: Optional[float] = None


class GrowthMetrics(BaseModel):
    """Métricas de crecimiento."""
    earnings_growth: Optional[float] = None
    revenue_growth: Optional[float] = None
    earnings_quarterly_growth: Optional[float] = None


class AnalystInfo(BaseModel):
    """Información de analistas."""
    recommendation_key: Optional[str] = None  # buy, hold, sell
    recommendation_mean: Optional[float] = None  # 1-5 scale
    target_high_price: Optional[float] = None
    target_low_price: Optional[float] = None
    target_mean_price: Optional[float] = None
    number_of_analyst_opinions: Optional[int] = None


class FinancialMetricsSchema(BaseModel):
    """Métricas financieras consolidadas."""
    profitability: ProfitabilityMetrics = Field(default_factory=ProfitabilityMetrics)
    valuation: ValuationMetrics = Field(default_factory=ValuationMetrics)
    debt: DebtMetrics = Field(default_factory=DebtMetrics)
    dividends: DividendMetrics = Field(default_factory=DividendMetrics)
    growth: GrowthMetrics = Field(default_factory=GrowthMetrics)
    analyst: AnalystInfo = Field(default_factory=AnalystInfo)


# ===== SCHEMAS EXISTENTES (Sentiment, Options, etc.) =====

class SentimentDistribution(BaseModel):
    """Distribución de sentimiento."""
    bullish: int = 0
    bearish: int = 0
    neutral: int = 0


class StockTwitsMessage(BaseModel):
    """Mensaje de StockTwits."""
    body: str = ""
    sentiment: Optional[str] = None


class SentimentAnalysisSchema(BaseModel):
    """Schema para análisis de sentimiento."""
    stock_name: str = ""
    messages: List[StockTwitsMessage] = []
    distribution: SentimentDistribution = Field(default_factory=SentimentDistribution)
    
    def calculate_distribution(self) -> SentimentDistribution:
        bullish = sum(1 for m in self.messages if m.sentiment == 'Bullish')
        bearish = sum(1 for m in self.messages if m.sentiment == 'Bearish')
        neutral = len(self.messages) - bullish - bearish
        return SentimentDistribution(bullish=bullish, bearish=bearish, neutral=neutral)


class OptionsMove(BaseModel):
    """Movimiento inusual de opciones."""
    type: str
    strike: float
    volume: int
    oi: int
    ratio: Any


class OptionsVolatilitySchema(BaseModel):
    """Schema para volatilidad de opciones."""
    ticker: str
    price: float = 0.0
    atm_iv_avg: str = "N/A"
    unusual_activity_count: int = 0
    top_unusual_moves: List[OptionsMove] = []
    error: Optional[str] = None


# ===== STOCK DATA SCHEMA =====

class StockDataSchema(BaseModel):
    """Schema completo de datos de una acción."""
    ticker: str
    timestamp: datetime = Field(default_factory=datetime.now)
    is_etf: bool = False
    
    # Info general
    info: StockInfoSchema
    
    # Métricas financieras
    financial_metrics: FinancialMetricsSchema
    
    # Sentimiento y opciones
    # sentiment_analysis: SentimentAnalysisSchema
    options_volatility: OptionsVolatilitySchema
    
    # Noticias (ahora incluye summary y articles)
    news: dict = Field(default_factory=lambda: {"summary": "", "articles": []})

    class Config:
        arbitrary_types_allowed = True


# ===== ETF SCHEMAS (existentes) =====

class ETFHolding(BaseModel):
    """Posición individual dentro de un ETF."""
    symbol: str
    name: str = "N/A"
    weight: float = 0.0


class ETFHoldingsSchema(BaseModel):
    """Holdings de un ETF."""
    ticker: str
    holdings: List[ETFHolding] = []
    total_holdings_fetched: int = 0
    error: Optional[str] = None


class ETFSectorAllocation(BaseModel):
    """Distribución por sectores."""
    ticker: str
    sectors: dict = {}
    error: Optional[str] = None


class ETFInfoSchema(BaseModel):
    """Información general de un ETF."""
    ticker: str
    name: str = "N/A"
    category: Optional[str] = None
    fund_family: Optional[str] = None
    legal_type: Optional[str] = None
    
    # Rendimientos
    ytd_return: Optional[float] = None
    three_year_return: Optional[float] = None
    five_year_return: Optional[float] = None
    trailing_three_month_returns: Optional[float] = None
    fifty_two_week_change_percent: Optional[float] = None
    
    # Costos y tamaño
    expense_ratio: Optional[float] = None
    total_assets: Optional[float] = None
    net_assets: Optional[float] = None
    
    # Trading
    price: Optional[float] = None
    previous_close: Optional[float] = None
    volume: Optional[int] = None
    avg_volume: Optional[int] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    
    # Moving averages
    fifty_day_average: Optional[float] = None
    two_hundred_day_average: Optional[float] = None
    
    # Dividendos
    dividend_yield: Optional[float] = None
    dividend_yield_percent: Optional[float] = None
    trailing_annual_dividend_rate: Optional[float] = None
    
    # Valuación
    nav_price: Optional[float] = None
    trailing_pe: Optional[float] = None
    price_to_book: Optional[float] = None
    
    # Riesgo
    beta: Optional[float] = None
    
    description: str = "No description available."
    error: Optional[str] = None


class ETFDataSchema(BaseModel):
    """Schema completo de datos de un ETF."""
    ticker: str
    timestamp: datetime = Field(default_factory=datetime.now)
    is_etf: bool = True
    
    # Info general
    info: ETFInfoSchema
    
    # Holdings y sectores
    holdings: ETFHoldingsSchema
    sector_allocation: ETFSectorAllocation
    
    # Sentimiento y opciones
    # sentiment_analysis: SentimentAnalysisSchema
    options_volatility: OptionsVolatilitySchema
    
    # Noticias (ahora incluye summary y articles)
    news: dict = Field(default_factory=lambda: {"summary": "", "articles": []})

    class Config:
        arbitrary_types_allowed = True


# ===== REQUEST/RESPONSE SCHEMAS =====

class AnalysisRequest(BaseModel):
    """Request para análisis."""
    ticker: str = Field(..., description="Símbolo del instrumento (ej: MSTR, SPY, QQQ)")


class AnalysisResponse(BaseModel):
    """Response del análisis."""
    ticker: str
    instrument_type: str  # "STOCK" o "ETF"
    analysis: str
    raw_data: Optional[dict] = None

# ===== TRADINGVIEW SCHEMAS =====

class TradingViewSummary(BaseModel):
    """Resumen de recomendación de TradingView."""
    recommendation: str = "NEUTRAL"  # BUY, SELL, NEUTRAL, STRONG_BUY, STRONG_SELL
    buy_signals: int = 0
    sell_signals: int = 0
    neutral_signals: int = 0


class OscillatorsAnalysis(BaseModel):
    """Análisis de osciladores."""
    recommendation: str = "NEUTRAL"
    buy: int = 0
    sell: int = 0
    neutral: int = 0
    rsi: Optional[float] = None
    stoch_k: Optional[float] = None
    stoch_d: Optional[float] = None
    cci: Optional[float] = None
    adx: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    momentum: Optional[float] = None
    williams_r: Optional[float] = None


class MovingAveragesAnalysis(BaseModel):
    """Análisis de medias móviles."""
    recommendation: str = "NEUTRAL"
    buy: int = 0
    sell: int = 0
    neutral: int = 0
    ema_10: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None
    ema_100: Optional[float] = None
    ema_200: Optional[float] = None
    sma_10: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_100: Optional[float] = None
    sma_200: Optional[float] = None


class TechnicalIndicators(BaseModel):
    """Indicadores técnicos adicionales."""
    atr: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_lower: Optional[float] = None
    bb_middle: Optional[float] = None
    pivot_r1: Optional[float] = None
    pivot_s1: Optional[float] = None
    pivot_r2: Optional[float] = None
    pivot_s2: Optional[float] = None


class TradingViewAnalysisSchema(BaseModel):
    """Schema completo de análisis técnico de TradingView."""
    ticker: str
    exchange: Optional[str] = None
    interval: str = "1D"
    summary: TradingViewSummary = Field(default_factory=TradingViewSummary)
    oscillators: OscillatorsAnalysis = Field(default_factory=OscillatorsAnalysis)
    moving_averages: MovingAveragesAnalysis = Field(default_factory=MovingAveragesAnalysis)
    indicators: TechnicalIndicators = Field(default_factory=TechnicalIndicators)
    error: Optional[str] = None


class TimeframeAnalysis(BaseModel):
    """Análisis de un timeframe específico."""
    recommendation: str = "NEUTRAL"
    buy: int = 0
    sell: int = 0
    neutral: int = 0
    rsi: Optional[float] = None
    macd: Optional[float] = None
    error: Optional[str] = None


class MultiTimeframeSchema(BaseModel):
    """Análisis multi-timeframe."""
    ticker: str
    timeframes: dict[str, TimeframeAnalysis] = {}


# Actualiza StockDataSchema para incluir el análisis técnico
class StockDataSchema(BaseModel):
    """Schema completo de datos de una acción."""
    ticker: str
    timestamp: datetime = Field(default_factory=datetime.now)
    is_etf: bool = False
    
    # Info general
    info: StockInfoSchema
    
    # Métricas financieras
    financial_metrics: FinancialMetricsSchema
    
    # Análisis técnico (TradingView) - NUEVO
    technical_analysis: Optional[TradingViewAnalysisSchema] = None
    multi_timeframe: Optional[MultiTimeframeSchema] = None
    
    # Sentimiento y opciones
    # sentiment_analysis: SentimentAnalysisSchema
    options_volatility: OptionsVolatilitySchema
    
    # Noticias
    news: Any

    class Config:
        arbitrary_types_allowed = True