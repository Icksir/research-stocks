"""
Módulo de obtención de noticias financieras desde múltiples fuentes.
Integra: Yahoo Finance, Google News, Finnhub, Polygon.io
"""

import os
import asyncio
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional
import aiohttp
import yfinance as yf
from GoogleNews import GoogleNews
from dataclasses import dataclass
from enum import Enum

from utils.logger import setup_logging
from utils.models import Settings

_logger = setup_logging()


class NewsSource(Enum):
    """Fuentes de noticias disponibles."""
    YAHOO_FINANCE = "Yahoo Finance"
    GOOGLE_NEWS = "Google News"
    FINNHUB = "Finnhub"
    POLYGON = "Polygon.io"


@dataclass
class NewsArticle:
    """Estructura de un artículo de noticias."""
    title: str
    source: NewsSource
    publisher: str
    content: str = ""
    summary: str = ""
    url: str = ""
    published_at: Optional[datetime] = None
    sentiment: Optional[str] = None
    relevance_score: Optional[float] = None
    
    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "source": self.source.value,
            "publisher": self.publisher,
            "content": self.content or self.summary,
            "url": self.url,
            "date": self.published_at.isoformat() if self.published_at else "",
            "sentiment": self.sentiment,
            "relevance_score": self.relevance_score
        }


class NewsProvider(ABC):
    """Clase base abstracta para proveedores de noticias."""
    
    @abstractmethod
    async def fetch_news(self, ticker: str, limit: int = 5) -> list[NewsArticle]:
        """Obtiene noticias para un ticker específico."""
        pass
    
    @property
    @abstractmethod
    def source(self) -> NewsSource:
        """Retorna la fuente de noticias."""
        pass
    
    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """Verifica si el proveedor está configurado correctamente."""
        pass


class YahooFinanceProvider(NewsProvider):
    """Proveedor de noticias de Yahoo Finance."""
    
    @property
    def source(self) -> NewsSource:
        return NewsSource.YAHOO_FINANCE
    
    @property
    def is_configured(self) -> bool:
        return True
    
    async def fetch_news(self, ticker: str, limit: int = 5) -> list[NewsArticle]:
        articles = []
        try:
            stock = yf.Ticker(ticker)
            news_data = stock.news
            
            if news_data:
                for item in news_data[:limit]:
                    content = (
                        item.get('summary', '') or 
                        item.get('description', '') or 
                        (item.get('content', {}).get('body', '') if isinstance(item.get('content'), dict) else '')
                    )
                    
                    published_at = None
                    if item.get('providerPublishTime'):
                        try:
                            published_at = datetime.fromtimestamp(item['providerPublishTime'])
                        except (ValueError, TypeError):
                            pass
                    
                    articles.append(NewsArticle(
                        title=item.get('title', 'No Title'),
                        source=self.source,
                        publisher=item.get('publisher', 'Yahoo Finance'),
                        content=content,
                        url=item.get('link', ''),
                        published_at=published_at
                    ))
                    
            _logger.info(f"✅ Yahoo Finance: {len(articles)} articles for {ticker}")
        except Exception as e:
            _logger.error(f"❌ Yahoo Finance error for {ticker}: {e}")
        
        return articles


class GoogleNewsProvider(NewsProvider):
    """Proveedor de noticias de Google News."""
    
    @property
    def source(self) -> NewsSource:
        return NewsSource.GOOGLE_NEWS
    
    @property
    def is_configured(self) -> bool:
        return True
    
    async def fetch_news(self, ticker: str, limit: int = 10) -> list[NewsArticle]:
        articles = []
        try:
            googlenews = GoogleNews(lang='en', period='7d')
            googlenews.clear()
            googlenews.search(f"{ticker} stock news")
            results = googlenews.result()
            
            if results:
                for item in results[:limit]:
                    published_at = None
                    date_str = item.get('date', '')
                    if date_str:
                        try:
                            if 'ago' in date_str.lower():
                                published_at = datetime.now()
                            else:
                                published_at = datetime.strptime(date_str, '%b %d, %Y')
                        except (ValueError, TypeError):
                            pass
                    
                    articles.append(NewsArticle(
                        title=item.get('title', 'No Title'),
                        source=self.source,
                        publisher=item.get('media', 'Unknown'),
                        content=item.get('desc', '') or item.get('description', ''),
                        url=item.get('link', ''),
                        published_at=published_at
                    ))
            
            _logger.info(f"✅ Google News: {len(articles)} articles for {ticker}")
        except Exception as e:
            _logger.error(f"❌ Google News error for {ticker}: {e}")
        
        return articles


class FinnhubProvider(NewsProvider):
    """
    Proveedor de Finnhub.
    Documentación: https://finnhub.io/docs/api/company-news
    - Gratis: 60 calls/minuto
    """
    
    def __init__(self):
        self.api_key = os.getenv("FINNHUB_API_KEY", "")
        self.base_url = "https://finnhub.io/api/v1"
    
    @property
    def source(self) -> NewsSource:
        return NewsSource.FINNHUB
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)
    
    async def fetch_news(self, ticker: str, limit: int = 10) -> list[NewsArticle]:
        if not self.is_configured:
            _logger.warning("⚠️ Finnhub not configured (missing FINNHUB_API_KEY)")
            return []
        
        articles = []
        try:
            from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            to_date = datetime.now().strftime('%Y-%m-%d')
            
            url = f"{self.base_url}/company-news"
            params = {
                "symbol": ticker.upper(),
                "from": from_date,
                "to": to_date,
                "token": self.api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for item in data[:limit]:
                            published_at = None
                            if item.get('datetime'):
                                try:
                                    published_at = datetime.fromtimestamp(item['datetime'])
                                except (ValueError, TypeError):
                                    pass
                            
                            articles.append(NewsArticle(
                                title=item.get('headline', 'No Title'),
                                source=self.source,
                                publisher=item.get('source', 'Finnhub'),
                                content=item.get('summary', ''),
                                url=item.get('url', ''),
                                published_at=published_at
                            ))
                    else:
                        _logger.error(f"❌ Finnhub returned {response.status}")
            
            _logger.info(f"✅ Finnhub: {len(articles)} articles for {ticker}")
        except Exception as e:
            _logger.error(f"❌ Finnhub error for {ticker}: {e}")
        
        return articles


class PolygonProvider(NewsProvider):
    """
    Proveedor de Polygon.io.
    Documentación: https://polygon.io/docs/stocks/get_v2_reference_news
    - Gratis: 5 calls/minuto
    """
    
    def __init__(self):
        self.api_key = os.getenv("POLYGON_API_KEY", "")
        self.base_url = "https://api.polygon.io/v2"
    
    @property
    def source(self) -> NewsSource:
        return NewsSource.POLYGON
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)
    
    async def fetch_news(self, ticker: str, limit: int = 10) -> list[NewsArticle]:
        if not self.is_configured:
            _logger.warning("⚠️ Polygon not configured (missing POLYGON_API_KEY)")
            return []
        
        articles = []
        try:
            url = f"{self.base_url}/reference/news"
            params = {
                "ticker": ticker.upper(),
                "limit": limit,
                "order": "desc",
                "sort": "published_utc",
                "apiKey": self.api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for item in data.get('results', []):
                            published_at = None
                            if item.get('published_utc'):
                                try:
                                    published_at = datetime.fromisoformat(
                                        item['published_utc'].replace('Z', '+00:00')
                                    )
                                except (ValueError, TypeError):
                                    pass
                            
                            articles.append(NewsArticle(
                                title=item.get('title', 'No Title'),
                                source=self.source,
                                publisher=item.get('publisher', {}).get('name', 'Polygon'),
                                content=item.get('description', ''),
                                url=item.get('article_url', ''),
                                published_at=published_at
                            ))
                    else:
                        _logger.error(f"❌ Polygon returned {response.status}")
            
            _logger.info(f"✅ Polygon: {len(articles)} articles for {ticker}")
        except Exception as e:
            _logger.error(f"❌ Polygon error for {ticker}: {e}")
        
        return articles

@dataclass
class NewsResult:
    """Resultado completo de búsqueda de noticias."""
    ticker: str
    summary: str
    articles: list[NewsArticle]
    sources_used: list[str]
    total_articles: int
    fetch_timestamp: datetime
    
    def to_dict(self) -> dict:
        return {
            "ticker": self.ticker,
            "summary": self.summary,
            "articles": [article.to_dict() for article in self.articles],
            "sources_used": self.sources_used,
            "total_articles": self.total_articles,
            "fetch_timestamp": self.fetch_timestamp.isoformat()
        }

class MultiSourceNewsFetcher:
    """Agregador de noticias de múltiples fuentes."""
    
    def __init__(self):
        self.providers: list[NewsProvider] = [
            YahooFinanceProvider(),
            GoogleNewsProvider(),
            FinnhubProvider(),
            PolygonProvider(),
        ]
        self._log_provider_status()
    
    def _log_provider_status(self):
        """Log del estado de cada proveedor."""
        _logger.info("📰 News Providers Status:")
        for provider in self.providers:
            status = "✅ Configured" if provider.is_configured else "❌ Not configured"
            _logger.info(f"   - {provider.source.value}: {status}")
    
    def get_active_providers(self) -> list[NewsProvider]:
        """Retorna solo los proveedores configurados."""
        return [p for p in self.providers if p.is_configured]
    
    async def fetch_all_news(
        self, 
        ticker: str, 
        limit_per_source: int = 5,
        sources: Optional[list[NewsSource]] = None
    ) -> list[NewsArticle]:
        """Obtiene noticias de todas las fuentes configuradas."""
        providers = self.get_active_providers()
        
        if sources:
            providers = [p for p in providers if p.source in sources]
        
        if not providers:
            _logger.warning("⚠️ No news providers available!")
            return []
        
        _logger.info(f"📰 Fetching news for {ticker} from {len(providers)} sources...")
        
        tasks = [provider.fetch_news(ticker, limit_per_source) for provider in providers]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_articles = []
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)
            elif isinstance(result, Exception):
                _logger.error(f"❌ Provider error: {result}")
        
        deduplicated = self._deduplicate_articles(all_articles)
        deduplicated.sort(key=lambda x: x.published_at or datetime.min, reverse=True)
        
        _logger.info(f"📰 Total: {len(all_articles)} articles, {len(deduplicated)} after deduplication")
        
        return deduplicated
    
    async def fetch_complete(
        self, 
        ticker: str, 
        limit_per_source: int = 5,
        use_llm: bool = True,
        sources: Optional[list[NewsSource]] = None
    ) -> NewsResult:
        """
        Obtiene noticias completas: resumen + artículos individuales.
        
        Args:
            ticker: Símbolo del instrumento
            limit_per_source: Máximo de noticias por fuente
            use_llm: Si usar LLM para generar resumen
            sources: Lista opcional de fuentes específicas
        
        Returns:
            NewsResult con resumen y todos los artículos
        """
        articles = await self.fetch_all_news(ticker, limit_per_source, sources)
        
        # Generar resumen
        if not articles:
            summary = f"No recent news found for {ticker}."
        elif use_llm:
            summary = await self._generate_llm_summary(ticker, articles)
        else:
            summary = self._format_articles(articles)
        
        # Obtener fuentes usadas
        sources_used = list(set(article.source.value for article in articles))
        
        return NewsResult(
            ticker=ticker,
            summary=summary,
            articles=articles,
            sources_used=sources_used,
            total_articles=len(articles),
            fetch_timestamp=datetime.now()
        )
    
    def _deduplicate_articles(self, articles: list[NewsArticle]) -> list[NewsArticle]:
        """Elimina artículos duplicados basándose en similitud de títulos."""
        seen_titles = set()
        unique_articles = []
        
        for article in articles:
            normalized = article.title.lower().strip()
            key = ' '.join(normalized.split()[:8])
            
            if key not in seen_titles:
                seen_titles.add(key)
                unique_articles.append(article)
        
        return unique_articles
    
    async def fetch_and_summarize(
        self, 
        ticker: str, 
        limit_per_source: int = 5,
        use_llm: bool = True
    ) -> str:
        """Obtiene noticias y genera un resumen."""
        articles = await self.fetch_all_news(ticker, limit_per_source)
        
        if not articles:
            return f"No recent news found for {ticker}."
        
        if use_llm:
            return await self._generate_llm_summary(ticker, articles)
        else:
            return self._format_articles(articles)
    
    def _format_articles(self, articles: list[NewsArticle]) -> str:
        """Formatea artículos sin usar LLM."""
        formatted = ["📰 Recent News:\n"]
        
        for i, article in enumerate(articles[:10], 1):
            formatted.append(f"**{i}. {article.title}**")
            formatted.append(f"   Source: {article.publisher} ({article.source.value})")
            if article.published_at:
                formatted.append(f"   Date: {article.published_at.strftime('%Y-%m-%d %H:%M')}")
            if article.content:
                truncated = article.content[:300] + "..." if len(article.content) > 300 else article.content
                formatted.append(f"   Summary: {truncated}")
            formatted.append("")
        
        return "\n".join(formatted)
    
    async def _generate_llm_summary(self, ticker: str, articles: list[NewsArticle]) -> str:
        """Genera un resumen usando el LLM."""
        news_text = f"News articles for {ticker}:\n\n"
        
        for i, article in enumerate(articles[:15], 1):
            news_text += f"--- Article {i} ---\n"
            news_text += f"Title: {article.title}\n"
            news_text += f"Source: {article.publisher} ({article.source.value})\n"
            if article.published_at:
                news_text += f"Date: {article.published_at.strftime('%Y-%m-%d')}\n"
            content = article.content or article.summary
            if content:
                news_text += f"Content: {content[:500]}\n"
            news_text += "\n"
        
        prompt = f"""Analiza las siguientes noticias sobre {ticker} y genera un resumen ejecutivo en español:

{news_text}

Incluye:
1. **Resumen General**: 5-6 oraciones con los puntos más importantes.
2. **Eventos Clave**: Lista de eventos relevantes.
3. **Sentimiento del Mercado**: Positivo, negativo o neutral.
4. **Impacto Potencial**: Cómo podrían afectar el precio.

Sé conciso y enfócate en información accionable.
"""
        
        try:
            response = await Settings.llm.acomplete(prompt)
            return response.text
        except Exception as e:
            _logger.error(f"Error generating news summary: {e}")
            return self._format_articles(articles)


# Singleton
_news_fetcher: Optional[MultiSourceNewsFetcher] = None

async def get_complete_news(
    ticker: str, 
    limit: int = 5,
    use_llm: bool = True
) -> dict:
    """
    Función de conveniencia para obtener noticias completas (resumen + artículos).
    
    Returns:
        Dict con 'summary' y 'articles'
    """
    fetcher = get_news_fetcher()
    result = await fetcher.fetch_complete(ticker, limit, use_llm)
    return result.to_dict()


def get_news_fetcher() -> MultiSourceNewsFetcher:
    """Obtiene la instancia singleton del fetcher."""
    global _news_fetcher
    if _news_fetcher is None:
        _news_fetcher = MultiSourceNewsFetcher()
    return _news_fetcher


async def get_multi_source_news(ticker: str, limit: int = 10) -> str:
    """Función de conveniencia para obtener noticias resumidas."""
    fetcher = get_news_fetcher()
    return await fetcher.fetch_and_summarize(ticker, limit)

async def get_raw_news_articles(
    ticker: str, 
    limit: int = 5,
    sources: Optional[list[NewsSource]] = None
) -> list[dict]:
    """Obtiene artículos raw sin resumir."""
    fetcher = get_news_fetcher()
    articles = await fetcher.fetch_all_news(ticker, limit, sources)
    return [article.to_dict() for article in articles]


def get_available_sources() -> list[dict]:
    """Retorna información sobre las fuentes disponibles."""
    fetcher = get_news_fetcher()
    return [
        {"source": p.source.value, "configured": p.is_configured}
        for p in fetcher.providers
    ]