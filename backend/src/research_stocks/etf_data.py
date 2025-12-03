from research_stocks.etf_fetchers import (
    get_etf_holdings,
    get_etf_info,
    get_etf_sector_allocation
)
from research_stocks.data_fetchers import (
    check_options_volatility,
    get_stocktwits_data)
from research_stocks.news import get_complete_news
from research_stocks.schemas import (
    ETFDataSchema,
    ETFInfoSchema,
    ETFHoldingsSchema,
    ETFHolding,
    ETFSectorAllocation,
    SentimentAnalysisSchema,
    StockTwitsMessage,
    OptionsVolatilitySchema,
    OptionsMove
)
from utils.logger import setup_logging

_logger = setup_logging()


class ETFData:
    """Clase para consolidar todos los datos de un ETF."""
    
    def __init__(self, ticker: str):
        self.ticker = ticker.upper()
        self._raw_info = None
        self._raw_holdings = None
        self._raw_sectors = None
        self._raw_news = None
        self._raw_sentiment = None
        self._raw_options = None
        
    @classmethod
    async def create(cls, ticker: str) -> "ETFData":
        """Factory method asíncrono para crear una instancia de ETFData."""
        instance = cls(ticker)
        await instance._fetch_all_data()
        return instance
    
    async def _fetch_all_data(self):
        """Obtiene todos los datos del ETF."""
        _logger.info(f"Fetching ETF data for {self.ticker}...")
        
        # 1. Info general del ETF
        try:
            self._raw_info = get_etf_info(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching ETF info for {self.ticker}: {e}")
            self._raw_info = {"ticker": self.ticker, "error": str(e)}
        
        # 2. Holdings
        try:
            self._raw_holdings = get_etf_holdings(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching holdings for {self.ticker}: {e}")
            self._raw_holdings = {"ticker": self.ticker, "holdings": []}
        
        # 3. Sector allocation
        try:
            self._raw_sectors = get_etf_sector_allocation(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching sectors for {self.ticker}: {e}")
            self._raw_sectors = {"ticker": self.ticker, "sectors": {}}
        
        # 4. News - AHORA CON MULTI-FUENTE
        try:
            self._raw_news = await get_complete_news(self.ticker)
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching news for {self.ticker}: {e}")
            self._raw_news = {"summary": "News data unavailable.", "articles": []}
        
        # 5. Sentiment (StockTwits)
        try:
            self._raw_sentiment = get_stocktwits_data(self.ticker.lower())
        except Exception as e:
            _logger.warning(f"⚠️ Error fetching sentiment for {self.ticker}: {e}")
            self._raw_sentiment = {"stock_name": self.ticker, "messages": []}
        
        # 6. Options
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

    async def refresh_news(self):
        """Actualiza solo las noticias."""
        _logger.info(f"🔄 Refreshing news for ETF {self.ticker}...")
        try:
            new_news = await get_complete_news(self.ticker)
            if new_news:
                self._raw_news = new_news
        except Exception as e:
            _logger.error(f"⚠️ Error refreshing news for {self.ticker}: {e}")

    def refresh_sentiment(self):
        """Actualiza solo el sentimiento."""
        _logger.info(f"🔄 Refreshing sentiment for ETF {self.ticker}...")
        try:
            new_sentiment = get_stocktwits_data(self.ticker.lower())
            if isinstance(new_sentiment, dict) and 'messages' in new_sentiment:
                self._raw_sentiment = new_sentiment
        except Exception as e:
            _logger.error(f"⚠️ Error refreshing sentiment for {self.ticker}: {e}")

    def to_schema(self) -> ETFDataSchema:
        """Convierte los datos raw a un schema estructurado."""
        
        # Procesar info
        info_schema = ETFInfoSchema(**self._raw_info) if self._raw_info else ETFInfoSchema(ticker=self.ticker)
        
        # Procesar holdings
        holdings_list = [
            ETFHolding(**h) for h in self._raw_holdings.get('holdings', [])
        ]
        holdings_schema = ETFHoldingsSchema(
            ticker=self.ticker,
            holdings=holdings_list,
            total_holdings_fetched=len(holdings_list)
        )
        
        # Procesar sectores
        sectors_schema = ETFSectorAllocation(
            ticker=self.ticker,
            sectors=self._raw_sectors.get('sectors', {})
        )
        
        # Procesar sentimiento
        msgs = self._raw_sentiment.get('messages', []) if isinstance(self._raw_sentiment, dict) else []
        sentiment_messages = [
            StockTwitsMessage(body=m.get('body', ''), sentiment=m.get('sentiment'))
            for m in msgs
        ]
        sentiment_schema = SentimentAnalysisSchema(
            stock_name=self._raw_sentiment.get('stock_name', '') if isinstance(self._raw_sentiment, dict) else self.ticker,
            messages=sentiment_messages
        )
        sentiment_schema.distribution = sentiment_schema.calculate_distribution()
        
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
        
        return ETFDataSchema(
            ticker=self.ticker,
            info=info_schema,
            holdings=holdings_schema,
            sector_allocation=sectors_schema,
            sentiment_analysis=sentiment_schema,
            options_volatility=options_schema,
            news=self._raw_news
        )

    # Properties
    @property
    def info(self):
        return self._raw_info
    
    @property
    def holdings(self):
        return self._raw_holdings
    
    @property
    def sector_allocation(self):
        return self._raw_sectors
    
    @property
    def news(self):
        return self._raw_news
    
    @property
    def sentiment_analysis(self):
        return self._raw_sentiment
    
    @property
    def options_volatility(self):
        return self._raw_options