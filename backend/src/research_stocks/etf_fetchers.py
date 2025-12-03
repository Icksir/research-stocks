import yfinance as yf
from utils.logger import setup_logging

_logger = setup_logging()


def get_etf_holdings(ticker: str, limit: int = 20) -> dict:
    """
    Obtiene las principales posiciones (holdings) de un ETF.
    """
    try:
        etf = yf.Ticker(ticker)
        holdings = []
        
        # Obtener holdings desde funds_data
        if hasattr(etf, 'funds_data') and etf.funds_data is not None:
            top_holdings = etf.funds_data.top_holdings
            
            if top_holdings is not None and not top_holdings.empty:
                for symbol, row in top_holdings.head(limit).iterrows():
                    holdings.append({
                        "symbol": symbol,
                        "name": row.get('Name', 'N/A'),
                        "weight": float(row.get('Holding Percent', 0)) * 100  # Convertir a porcentaje
                    })
        
        return {
            "ticker": ticker,
            "holdings": holdings,
            "total_holdings_fetched": len(holdings)
        }
        
    except Exception as e:
        _logger.error(f"Error fetching ETF holdings for {ticker}: {e}")
        return {"ticker": ticker, "holdings": [], "error": str(e)}


def get_etf_info(ticker: str) -> dict:
    """
    Obtiene información general de un ETF incluyendo métricas clave.
    """
    try:
        etf = yf.Ticker(ticker)
        info = etf.info
        
        return {
            "ticker": ticker,
            "name": info.get('longName', info.get('shortName', 'N/A')),
            "category": info.get('category', 'N/A'),
            "fund_family": info.get('fundFamily', 'N/A'),
            "legal_type": info.get('legalType', 'N/A'),
            
            # Métricas de rendimiento (ya vienen como porcentaje o decimal)
            "ytd_return": info.get('ytdReturn'),  # Viene como 14.80406 (%)
            "three_year_return": info.get('threeYearAverageReturn'),  # Viene como 0.24263781
            "five_year_return": info.get('fiveYearAverageReturn'),  # Viene como 0.16042851
            "trailing_three_month_returns": info.get('trailingThreeMonthReturns'),
            "fifty_two_week_change_percent": info.get('fiftyTwoWeekChangePercent'),
            
            # Costos
            "expense_ratio": info.get('netExpenseRatio'),  # 0.03 = 0.03%
            "total_assets": info.get('totalAssets'),
            "net_assets": info.get('netAssets'),
            
            # Trading info
            "price": info.get('regularMarketPrice', info.get('previousClose')),
            "previous_close": info.get('previousClose'),
            "open": info.get('open'),
            "day_high": info.get('dayHigh'),
            "day_low": info.get('dayLow'),
            "volume": info.get('volume'),
            "avg_volume": info.get('averageVolume'),
            "avg_volume_10days": info.get('averageVolume10days'),
            
            # 52 week range
            "fifty_two_week_high": info.get('fiftyTwoWeekHigh'),
            "fifty_two_week_low": info.get('fiftyTwoWeekLow'),
            "fifty_two_week_range": info.get('fiftyTwoWeekRange'),
            
            # Moving averages
            "fifty_day_average": info.get('fiftyDayAverage'),
            "two_hundred_day_average": info.get('twoHundredDayAverage'),
            
            # Dividendos
            "dividend_yield": info.get('yield'),  # 0.0115
            "dividend_yield_percent": info.get('dividendYield'),  # 1.15 (ya en %)
            "trailing_annual_dividend_rate": info.get('trailingAnnualDividendRate'),
            "trailing_annual_dividend_yield": info.get('trailingAnnualDividendYield'),
            
            # Valuación
            "nav_price": info.get('navPrice'),
            "trailing_pe": info.get('trailingPE'),
            "price_to_book": info.get('priceToBook'),
            "book_value": info.get('bookValue'),
            
            # Beta y riesgo
            "beta": info.get('beta3Year'),
            
            # Metadata
            "currency": info.get('currency', 'USD'),
            "exchange": info.get('fullExchangeName'),
            "fund_inception_date": info.get('fundInceptionDate'),
            
            # Descripción
            "description": info.get('longBusinessSummary', 'No description available.')
        }
        
    except Exception as e:
        _logger.error(f"Error fetching ETF info for {ticker}: {e}")
        return {"ticker": ticker, "error": str(e)}



def get_etf_sector_allocation(ticker: str) -> dict:
    """
    Obtiene la distribución por sectores del ETF.
    """
    try:
        etf = yf.Ticker(ticker)
        sector_weights = {}
        
        # Obtener sectores desde funds_data
        if hasattr(etf, 'funds_data') and etf.funds_data is not None:
            sectors = etf.funds_data.sector_weightings
            
            # sector_weightings ya es un dict, no un DataFrame
            if sectors is not None and isinstance(sectors, dict):
                for sector, weight in sectors.items():
                    # Formatear nombre del sector (realestate -> Real Estate)
                    formatted_sector = sector.replace('_', ' ').title()
                    sector_weights[formatted_sector] = round(float(weight) * 100, 2)  # Convertir a porcentaje
        
        return {
            "ticker": ticker,
            "sectors": sector_weights
        }
        
    except Exception as e:
        _logger.error(f"Error fetching sector allocation for {ticker}: {e}")
        return {"ticker": ticker, "sectors": {}, "error": str(e)}


def is_etf(ticker: str) -> bool:
    """
    Determina si un ticker es un ETF o una acción individual.
    """
    try:
        instrument = yf.Ticker(ticker)
        info = instrument.info
        quote_type = info.get('quoteType', '').upper()
        return quote_type == 'ETF'
    except Exception:
        return False