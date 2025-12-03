from utils.models import Settings
from research_stocks.prompts import get_stock_analysis_prompt, get_etf_analysis_prompt
from utils.logger import setup_logging

_logger = setup_logging()


async def analyze_stock(stock_data) -> str:
    """Genera un análisis completo de una acción usando el LLM."""
    
    prompt = get_stock_analysis_prompt(
        ticker=stock_data.ticker,
        info=stock_data.info or {},
        technical=stock_data.technical_analysis or {},
        mtf=stock_data.multi_timeframe or {},
        options=stock_data.options_volatility or {},
        news=stock_data.news or "No hay noticias disponibles."
    )
    
    try:
        response = await Settings.llm.acomplete(prompt)
        return response.text
    except Exception as e:
        _logger.error(f"Error generating stock analysis for {stock_data.ticker}: {e}")
        return f"Error generating analysis: {str(e)}"


async def analyze_etf(etf_data) -> str:
    """Genera un análisis completo de un ETF usando el LLM."""
    
    prompt = get_etf_analysis_prompt(
        ticker=etf_data.ticker,
        info=etf_data.info or {},
        holdings=etf_data.holdings or {},
        sectors=etf_data.sector_allocation or {},
        technical=getattr(etf_data, 'technical_analysis', {}) or {},
        mtf=getattr(etf_data, 'multi_timeframe', {}) or {},
        options=etf_data.options_volatility or {},
        news=etf_data.news or "No hay noticias disponibles."
    )
    
    try:
        response = await Settings.llm.acomplete(prompt)
        return response.text
    except Exception as e:
        _logger.error(f"Error generating ETF analysis for {etf_data.ticker}: {e}")
        return f"Error generating analysis: {str(e)}"