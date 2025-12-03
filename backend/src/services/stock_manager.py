from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from research_stocks.stock_data import StockData
from research_stocks.etf_data import ETFData
from research_stocks.etf_fetchers import is_etf
from research_stocks.analysis import analyze_stock, analyze_etf
from utils.logger import setup_logging

_logger = setup_logging()

class StockManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StockManager, cls).__new__(cls)
            cls._instance.instruments = {}  # Cache unificado para stocks y ETFs
            cls._instance.scheduler = AsyncIOScheduler()
        return cls._instance

    def start(self):
        """Inicia el scheduler."""
        if not self.scheduler.running:
            self.scheduler.start()
            _logger.info("🚀 StockManager Scheduler started.")

    def _get_news_hash(self, instrument_data) -> str:
        """Genera un hash basado en las noticias actuales."""
        try:
            news = instrument_data.news
            if news and isinstance(news, str):
                return str(hash(news[:500]))
            return str(hash(""))
        except Exception:
            return str(hash(""))

    async def _regenerate_analysis(self, ticker: str):
        """Regenera el análisis para un ticker."""
        if ticker not in self.instruments:
            return
            
        entry = self.instruments[ticker]
        _logger.info(f"🤖 Regenerating analysis for {ticker}...")
        
        try:
            if entry["type"] == "ETF":
                new_analysis = await analyze_etf(entry["data"])
            else:
                new_analysis = await analyze_stock(entry["data"])
            
            entry["analysis"] = new_analysis
            entry["analysis_time"] = datetime.now()
            _logger.info(f"✅ Analysis regenerated for {ticker}")
        except Exception as e:
            _logger.error(f"❌ Error regenerating analysis for {ticker}: {e}")

    async def get_or_create_instrument(self, ticker: str):
        """
        Obtiene datos del cache o crea nueva instancia.
        Detecta automáticamente si es Stock o ETF.
        """
        ticker = ticker.upper()
        
        # 1. Si ya existe en caché
        if ticker in self.instruments:
            entry = self.instruments[ticker]
            
            # Regenerar si es muy viejo
            if datetime.now() - entry["analysis_time"] > timedelta(hours=1):
                _logger.info(f"🔄 Regenerating stale analysis for {ticker}...")
                await self._regenerate_analysis(ticker)
            
            return entry["data"], entry["analysis"], entry["type"]

        # 2. Detectar tipo de instrumento
        instrument_type = "ETF" if is_etf(ticker) else "STOCK"
        _logger.info(f"✨ Initializing monitoring for {ticker} (Type: {instrument_type})...")
        
        # 3. Crear instancia según tipo
        if instrument_type == "ETF":
            instrument_data = await ETFData.create(ticker)
            analysis = await analyze_etf(instrument_data)
        else:
            instrument_data = await StockData.create(ticker)
            analysis = await analyze_stock(instrument_data)
        
        # 4. Guardar en caché
        self.instruments[ticker] = {
            "data": instrument_data,
            "analysis": analysis,
            "analysis_time": datetime.now(),
            "type": instrument_type,
            "last_news_hash": self._get_news_hash(instrument_data)
        }
        
        # 5. Programar actualizaciones
        self._schedule_updates(ticker)
        
        return instrument_data, analysis, instrument_type

    def _schedule_updates(self, ticker: str):
        """Configura los jobs de actualización automática."""
        
        self.scheduler.add_job(
            self._update_news, 
            'interval', 
            minutes=30, 
            args=[ticker], 
            id=f"{ticker}_news",
            replace_existing=True
        )
        
        self.scheduler.add_job(
            self._update_sentiment, 
            'interval', 
            minutes=15, 
            args=[ticker], 
            id=f"{ticker}_sentiment",
            replace_existing=True
        )
        
        _logger.info(f"⏰ Scheduled updates for {ticker}")

    def _update_news(self, ticker: str):
        """Actualiza noticias y regenera análisis si hay cambios."""
        if ticker not in self.instruments:
            return
        
        entry = self.instruments[ticker]
        old_hash = entry.get("last_news_hash", "")
        
        _logger.debug(f"📰 Auto-refreshing NEWS for {ticker}")
        entry["data"].refresh_news()
        
        new_hash = self._get_news_hash(entry["data"])
        
        if new_hash != old_hash:
            _logger.info(f"🆕 New news detected for {ticker}!")
            entry["last_news_hash"] = new_hash
            
            self.scheduler.add_job(
                self._regenerate_analysis,
                'date',
                run_date=datetime.now(),
                args=[ticker],
                id=f"{ticker}_regen_{datetime.now().timestamp()}",
                replace_existing=False
            )

    def _update_sentiment(self, ticker: str):
        """Actualiza sentimiento."""
        if ticker in self.instruments:
            _logger.debug(f"🧠 Auto-refreshing SENTIMENT for {ticker}")
            self.instruments[ticker]["data"].refresh_sentiment()

    # Mantener compatibilidad con código existente
    async def get_or_create_stock(self, ticker: str):
        """Wrapper para compatibilidad."""
        data, analysis, _ = await self.get_or_create_instrument(ticker)
        return data, analysis

stock_manager = StockManager()