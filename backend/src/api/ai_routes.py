from fastapi import APIRouter, HTTPException

from research_stocks.data_fetchers import get_robust_stock_news
from research_stocks.schemas import AnalysisRequest, AnalysisResponse
from services.stock_manager import stock_manager

router = APIRouter(tags=["ai"])

@router.get("/")
async def root():
    return {
        "message": "Stock & ETF Analysis API",
        "endpoints": {
            "analyze": "/analyze",
            "health": "/health"
        }
    }

@router.get("/health")
async def health_check():
    return {"status": "healthy", "model": "gemini-2.0-flash"}

@router.get("/data/{ticker}")
async def get_instrument_data(ticker: str):
    """
    Retorna todos los datos de un instrumento (Stock o ETF).
    Usa el cache si existe, si no genera los datos nuevos.
    """
    try:
        ticker = ticker.upper()
        
        # Verificar si está en cache
        if ticker in stock_manager.instruments:
            entry = stock_manager.instruments[ticker]
            instrument_data = entry["data"]
            instrument_type = entry["type"]
            cached = True
        else:
            # No está en cache, crear nuevo
            instrument_data, _, instrument_type = await stock_manager.get_or_create_instrument(ticker)
            cached = False
        
        # Convertir a schema
        instrument_schema = instrument_data.to_schema()
        
        return {
            "ticker": ticker,
            "instrument_type": instrument_type,
            "cached": cached,
            "data": instrument_schema.model_dump()
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error obteniendo datos de {ticker}: {str(e)}")

@router.get("/news/{ticker}")
async def get_instrument_news(ticker: str):
    """
    Retorna las noticias relacionadas con un ticker.
    Usa el cache si existe, si no obtiene las noticias directamente.
    """
    try:
        ticker = ticker.upper()
        
        # Verificar si está en cache
        if ticker in stock_manager.instruments:
            entry = stock_manager.instruments[ticker]
            news = entry["data"].news
            cached = True
        else:
            # No está en cache, obtener noticias directamente
            news = await get_robust_stock_news(ticker)
            cached = False
        
        return {
            "ticker": ticker,
            "cached": cached,
            "news": news
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error obteniendo noticias de {ticker}: {str(e)}")


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_instrument_endpoint(request: AnalysisRequest):
    """
    Analiza una acción o ETF y retorna un informe completo.
    Detecta automáticamente el tipo de instrumento.
    """
    try:
        ticker = request.ticker.upper()
        
        # Usar el manager unificado
        instrument_data, analysis, instrument_type = await stock_manager.get_or_create_instrument(ticker)
        
        # Convertir a schema según tipo
        instrument_schema = instrument_data.to_schema()
        
        # Construir raw_data según el tipo
        if instrument_type == "ETF":
            raw_data = {
                "info": instrument_schema.info.model_dump(),
                "holdings": {
                    "top_holdings": [h.model_dump() for h in instrument_schema.holdings.holdings[:5]],
                    "total_count": instrument_schema.holdings.total_holdings_fetched
                },
                "sectors": instrument_schema.sector_allocation.sectors,
                # "sentiment": {
                #     "bullish": instrument_schema.sentiment_analysis.distribution.bullish,
                #     "bearish": instrument_schema.sentiment_analysis.distribution.bearish,
                #     "neutral": instrument_schema.sentiment_analysis.distribution.neutral
                # },
                "options": instrument_schema.options_volatility.model_dump()
            }
        else:
            raw_data = {
                # "sentiment": {
                #     "bullish": instrument_schema.sentiment_analysis.distribution.bullish,
                #     "bearish": instrument_schema.sentiment_analysis.distribution.bearish,
                #     "neutral": instrument_schema.sentiment_analysis.distribution.neutral
                # },
                "options": instrument_schema.options_volatility.model_dump()
            }
        
        return AnalysisResponse(
            ticker=ticker,
            instrument_type=instrument_type,
            analysis=analysis,
            raw_data=raw_data
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error analizando {ticker}: {str(e)}")