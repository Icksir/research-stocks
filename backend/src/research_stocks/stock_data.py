from llama_index.tools.yahoo_finance import YahooFinanceToolSpec
from research_stocks.data_fetchers import (
    check_options_volatility,
    detect_exchange,
    get_stock_info, 
    get_stocktwits_data, 
    get_robust_stock_news,
    get_tradingview_analysis,
    get_tradingview_multi_timeframe 
)
from research_stocks.schemas import AnalystInfo, DebtMetrics, DividendMetrics, FinancialMetricsSchema, GrowthMetrics, MovingAveragesAnalysis, MultiTimeframeSchema, OptionsMove, OptionsVolatilitySchema, OscillatorsAnalysis, ProfitabilityMetrics, SentimentAnalysisSchema, StockDataSchema, StockInfoSchema, StockTwitsMessage, TechnicalIndicators, TimeframeAnalysis, TradingViewAnalysisSchema, TradingViewSummary, ValuationMetrics
from utils.logger import setup_logging

_logger = setup_logging()

yahoo_finance = YahooFinanceToolSpec()

class StockData:
    """Clase para consolidar todos los datos de una acción."""
    
    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        self._raw_info = None
        self._raw_news = None
        self._raw_sentiment = None
        self._raw_options = None
        self._raw_technical = None  # TradingView analysis
        self._raw_technical_mtf = None  # Multi-timeframe analysis
    
    @classmethod
    async def create(cls, ticker: str) -> "StockData":
        """Factory method asíncrono para crear una instancia de StockData."""
        instance = cls(ticker)
        await instance._fetch_all_data()
        return instance
    
    async def _fetch_all_data(self):
        """Obtiene todos los datos de la acción."""
        _logger.info(f"Fetching Stock data for {self.ticker}...")
        
        # 1. Info y métricas financieras
        try:
            self._raw_info = get_stock_info(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching stock info for {self.ticker}: {e}")
            self._raw_info = {"ticker": self.ticker, "error": str(e)}
        
        # 2. News (async)
        try:
            self._raw_news = await get_robust_stock_news(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching news for {self.ticker}: {e}")
            self._raw_news = "News data unavailable."
        
        # 3. Sentiment
        try:
            self._raw_sentiment = get_stocktwits_data(self.ticker.lower())
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching sentiment for {self.ticker}: {e}")
            self._raw_sentiment = {"stock_name": self.ticker, "messages": []}
        
        # 4. Options
        try:
            self._raw_options = check_options_volatility(ticker=self.ticker)
        except Exception as e:
            _logger.error(f"⚠️ Error fetching options for {self.ticker}: {e}")
            self._raw_options = {
                "ticker": self.ticker,
                "price": 0.0,
                "atm_iv_avg": "N/A",
                "unusual_activity_count": 0,
                "top_unusual_moves": [],
                "error": str(e)
            }

        # 5. TradingView Technical Analysis (Nuevo)
        try:
            exchange = detect_exchange(self.ticker)
            self._raw_technical = get_tradingview_analysis(self.ticker, exchange)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching TradingView analysis for {self.ticker}: {e}")
            self._raw_technical = {"ticker": self.ticker, "error": str(e)}
        
        # 6. Multi-timeframe analysis (opcional, puede ser lento)
        try:
            exchange = detect_exchange(self.ticker)
            self._raw_technical_mtf = get_tradingview_multi_timeframe(self.ticker, exchange)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching multi-timeframe analysis for {self.ticker}: {e}")
            self._raw_technical_mtf = {"ticker": self.ticker, "error": str(e)}


    async def refresh_news(self):
        """Actualiza solo las noticias."""
        _logger.info(f"🔄 Refreshing news for {self.ticker}...")
        try:
            new_news = await get_robust_stock_news(self.ticker)
            if new_news and "Error" not in new_news:
                self._raw_news = new_news
        except Exception as e:
            _logger.error(f"⚠️ Error refreshing news for {self.ticker}: {e}")

    def refresh_sentiment(self):
        """Actualiza solo el sentimiento."""
        _logger.info(f"🔄 Refreshing sentiment for {self.ticker}...")
        try:
            new_sentiment = get_stocktwits_data(self.ticker.lower())
            if isinstance(new_sentiment, dict) and 'messages' in new_sentiment:
                self._raw_sentiment = new_sentiment
        except Exception as e:
            _logger.error(f"⚠️ Error refreshing sentiment for {self.ticker}: {e}")

    def get_news(self):
        """Retorna las noticias raw."""
        return self._raw_news
    
    # Properties
    @property
    def info(self):
        return self._raw_info
    
    @property
    def news(self):
        return self._raw_news
    
    @property
    def sentiment_analysis(self):
        return self._raw_sentiment
    
    @property
    def options_volatility(self):
        return self._raw_options
    
    @property
    def technical_analysis(self):
        """Retorna el análisis técnico de TradingView."""
        return self._raw_technical
    
    @property
    def multi_timeframe(self):
        """Retorna el análisis multi-timeframe."""
        return self._raw_technical_mtf
    
    # ===== Helper methods para métricas clave =====
    @property
    def financial_metrics(self) -> dict:
        """Retorna un resumen de las métricas financieras clave."""
        if not self._raw_info:
            return {}
        
        return {
            "profitability": {
                "eps_trailing": self._raw_info.get("eps_trailing"),
                "eps_forward": self._raw_info.get("eps_forward"),
                "gross_margin": self._raw_info.get("gross_margin"),
                "operating_margin": self._raw_info.get("operating_margin"),
                "profit_margin": self._raw_info.get("profit_margin"),
                "roe": self._raw_info.get("roe"),
                "roa": self._raw_info.get("roa"),
            },
            "valuation": {
                "pe_trailing": self._raw_info.get("pe_trailing"),
                "pe_forward": self._raw_info.get("pe_forward"),
                "peg_ratio": self._raw_info.get("peg_ratio"),
                "price_to_book": self._raw_info.get("price_to_book"),
                "ev_to_ebitda": self._raw_info.get("ev_to_ebitda"),
                "price_to_sales": self._raw_info.get("price_to_sales"),
            },
            "debt": {
                "total_debt": self._raw_info.get("total_debt"),
                "total_cash": self._raw_info.get("total_cash"),
                "debt_to_equity": self._raw_info.get("debt_to_equity"),
                "current_ratio": self._raw_info.get("current_ratio"),
            },
            "dividends": {
                "dividend_yield": self._raw_info.get("dividend_yield"),
                "dividend_rate": self._raw_info.get("dividend_rate"),
                "payout_ratio": self._raw_info.get("payout_ratio"),
            },
            "growth": {
                "earnings_growth": self._raw_info.get("earnings_growth"),
                "revenue_growth": self._raw_info.get("revenue_growth"),
            },
            "analyst": {
                "recommendation": self._raw_info.get("recommendation_key"),
                "target_mean_price": self._raw_info.get("target_mean_price"),
                "number_of_analysts": self._raw_info.get("number_of_analyst_opinions"),
            }
        }

    def to_schema(self) -> StockDataSchema:
        """Convierte los datos raw a un schema estructurado."""
        
        # Procesar info
        info_schema = StockInfoSchema(
            ticker=self.ticker,
            name=self._raw_info.get("name", "N/A"),
            sector=self._raw_info.get("sector"),
            industry=self._raw_info.get("industry"),
            country=self._raw_info.get("country"),
            description=self._raw_info.get("description", ""),
            price=self._raw_info.get("price"),
            previous_close=self._raw_info.get("previous_close"),
            day_high=self._raw_info.get("day_high"),
            day_low=self._raw_info.get("day_low"),
            volume=self._raw_info.get("volume"),
            avg_volume=self._raw_info.get("avg_volume"),
            market_cap=self._raw_info.get("market_cap"),
            enterprise_value=self._raw_info.get("enterprise_value"),
            fifty_two_week_high=self._raw_info.get("fifty_two_week_high"),
            fifty_two_week_low=self._raw_info.get("fifty_two_week_low"),
            fifty_two_week_change=self._raw_info.get("fifty_two_week_change"),
            fifty_day_average=self._raw_info.get("fifty_day_average"),
            two_hundred_day_average=self._raw_info.get("two_hundred_day_average"),
            beta=self._raw_info.get("beta"),
        )
        
        # Procesar métricas financieras
        financial_metrics = FinancialMetricsSchema(
            profitability=ProfitabilityMetrics(
                eps_trailing=self._raw_info.get("eps_trailing"),
                eps_forward=self._raw_info.get("eps_forward"),
                gross_margin=self._raw_info.get("gross_margin"),
                operating_margin=self._raw_info.get("operating_margin"),
                profit_margin=self._raw_info.get("profit_margin"),
                ebitda_margin=self._raw_info.get("ebitda_margin"),
                roe=self._raw_info.get("roe"),
                roa=self._raw_info.get("roa"),
            ),
            valuation=ValuationMetrics(
                pe_trailing=self._raw_info.get("pe_trailing"),
                pe_forward=self._raw_info.get("pe_forward"),
                peg_ratio=self._raw_info.get("peg_ratio"),
                price_to_book=self._raw_info.get("price_to_book"),
                price_to_sales=self._raw_info.get("price_to_sales"),
                ev_to_ebitda=self._raw_info.get("ev_to_ebitda"),
                ev_to_revenue=self._raw_info.get("ev_to_revenue"),
            ),
            debt=DebtMetrics(
                total_debt=self._raw_info.get("total_debt"),
                total_cash=self._raw_info.get("total_cash"),
                debt_to_equity=self._raw_info.get("debt_to_equity"),
                current_ratio=self._raw_info.get("current_ratio"),
                quick_ratio=self._raw_info.get("quick_ratio"),
            ),
            dividends=DividendMetrics(
                dividend_rate=self._raw_info.get("dividend_rate"),
                dividend_yield=self._raw_info.get("dividend_yield"),
                payout_ratio=self._raw_info.get("payout_ratio"),
                five_year_avg_dividend_yield=self._raw_info.get("five_year_avg_dividend_yield"),
            ),
            growth=GrowthMetrics(
                earnings_growth=self._raw_info.get("earnings_growth"),
                revenue_growth=self._raw_info.get("revenue_growth"),
                earnings_quarterly_growth=self._raw_info.get("earnings_quarterly_growth"),
            ),
            analyst=AnalystInfo(
                recommendation_key=self._raw_info.get("recommendation_key"),
                recommendation_mean=self._raw_info.get("recommendation_mean"),
                target_high_price=self._raw_info.get("target_high_price"),
                target_low_price=self._raw_info.get("target_low_price"),
                target_mean_price=self._raw_info.get("target_mean_price"),
                number_of_analyst_opinions=self._raw_info.get("number_of_analyst_opinions"),
            ),
        )
        
        # Procesar análisis técnico de TradingView
        technical_schema = None
        if self._raw_technical and 'error' not in self._raw_technical:
            tv = self._raw_technical
            tv_summary = tv.get('summary', {})
            tv_osc = tv.get('oscillators', {})
            tv_ma = tv.get('moving_averages', {})
            tv_ind = tv.get('indicators', {})
            osc_ind = tv_osc.get('indicators', {})
            ma_ind = tv_ma.get('indicators', {})
            
            technical_schema = TradingViewAnalysisSchema(
                ticker=self.ticker,
                exchange=tv.get('exchange'),
                interval=tv.get('interval', '1D'),
                summary=TradingViewSummary(
                    recommendation=tv_summary.get('recommendation', 'NEUTRAL'),
                    buy_signals=tv_summary.get('buy_signals', 0),
                    sell_signals=tv_summary.get('sell_signals', 0),
                    neutral_signals=tv_summary.get('neutral_signals', 0),
                ),
                oscillators=OscillatorsAnalysis(
                    recommendation=tv_osc.get('recommendation', 'NEUTRAL'),
                    buy=tv_osc.get('buy', 0),
                    sell=tv_osc.get('sell', 0),
                    neutral=tv_osc.get('neutral', 0),
                    rsi=osc_ind.get('rsi'),
                    stoch_k=osc_ind.get('stoch_k'),
                    stoch_d=osc_ind.get('stoch_d'),
                    cci=osc_ind.get('cci'),
                    adx=osc_ind.get('adx'),
                    macd=osc_ind.get('macd'),
                    macd_signal=osc_ind.get('macd_signal'),
                    momentum=osc_ind.get('momentum'),
                    williams_r=osc_ind.get('williams_r'),
                ),
                moving_averages=MovingAveragesAnalysis(
                    recommendation=tv_ma.get('recommendation', 'NEUTRAL'),
                    buy=tv_ma.get('buy', 0),
                    sell=tv_ma.get('sell', 0),
                    neutral=tv_ma.get('neutral', 0),
                    ema_10=ma_ind.get('ema_10'),
                    ema_20=ma_ind.get('ema_20'),
                    ema_50=ma_ind.get('ema_50'),
                    ema_100=ma_ind.get('ema_100'),
                    ema_200=ma_ind.get('ema_200'),
                    sma_10=ma_ind.get('sma_10'),
                    sma_20=ma_ind.get('sma_20'),
                    sma_50=ma_ind.get('sma_50'),
                    sma_100=ma_ind.get('sma_100'),
                    sma_200=ma_ind.get('sma_200'),
                ),
                indicators=TechnicalIndicators(
                    atr=tv_ind.get('atr'),
                    bb_upper=tv_ind.get('bb_upper'),
                    bb_lower=tv_ind.get('bb_lower'),
                    bb_middle=tv_ind.get('bb_middle'),
                    pivot_r1=tv_ind.get('pivot_classic_r1'),
                    pivot_s1=tv_ind.get('pivot_classic_s1'),
                    pivot_r2=tv_ind.get('pivot_classic_r2'),
                    pivot_s2=tv_ind.get('pivot_classic_s2'),
                ),
            )
        
        # Procesar multi-timeframe
        mtf_schema = None
        if self._raw_technical_mtf and 'error' not in self._raw_technical_mtf:
            timeframes_data = {}
            for tf_name, tf_data in self._raw_technical_mtf.get('timeframes', {}).items():
                if isinstance(tf_data, dict):
                    timeframes_data[tf_name] = TimeframeAnalysis(
                        recommendation=tf_data.get('recommendation', 'NEUTRAL'),
                        buy=tf_data.get('buy', 0),
                        sell=tf_data.get('sell', 0),
                        neutral=tf_data.get('neutral', 0),
                        rsi=tf_data.get('rsi'),
                        macd=tf_data.get('macd'),
                        error=tf_data.get('error'),
                    )
            mtf_schema = MultiTimeframeSchema(
                ticker=self.ticker,
                timeframes=timeframes_data
            )
        
        # Procesar sentimiento
        # msgs = self._raw_sentiment.get('messages', []) if isinstance(self._raw_sentiment, dict) else []
        # sentiment_messages = [
        #     StockTwitsMessage(body=m.get('body', ''), sentiment=m.get('sentiment'))
        #     for m in msgs
        # ]
        # sentiment_schema = SentimentAnalysisSchema(
        #     stock_name=self._raw_sentiment.get('stock_name', '') if isinstance(self._raw_sentiment, dict) else self.ticker,
        #     messages=sentiment_messages
        # )
        # sentiment_schema.distribution = sentiment_schema.calculate_distribution()
        
        # Procesar opciones
        opts = self._raw_options if isinstance(self._raw_options, dict) else {}
        options_moves = [
            OptionsMove(**move) for move in opts.get('top_unusual_moves', [])
        ]
        options_schema = OptionsVolatilitySchema(
            ticker=opts.get('ticker', self.ticker),
            price=opts.get('price', 0.0),
            atm_iv_avg=opts.get('atm_iv_avg', 'N/A'),
            unusual_activity_count=opts.get('unusual_activity_count', 0),
            top_unusual_moves=options_moves,
            error=opts.get('error')
        )
        
        return StockDataSchema(
            ticker=self.ticker,
            info=info_schema,
            financial_metrics=financial_metrics,
            technical_analysis=technical_schema,
            multi_timeframe=mtf_schema,
            #sentiment_analysis=sentiment_schema,
            options_volatility=options_schema,
            news=self._raw_news
        )