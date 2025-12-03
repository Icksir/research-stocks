import numpy as np
import pandas as pd
import requests
import yfinance as yf
from GoogleNews import GoogleNews 
from utils.logger import setup_logging
from tradingview_ta import TA_Handler, Interval

_logger = setup_logging()

def get_stocktwits_data(ticker: str) -> dict:
    """Fetch StockTwits data for a given ticker."""
    url = f"https://api.stocktwits.com/api/2/streams/symbol/{ticker}.json"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://stocktwits.com/'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        if not response.text:
            return {"stock_name": "", "messages": []}
        
        data = response.json()
        stock_name = data.get("symbol", {}).get("symbol", "")
        
        messages = []
        for msg in data.get("messages", []):
            message_data = {
                "body": msg.get("body", ""),
                "sentiment": msg.get("entities", {}).get("sentiment", {}).get("basic") if msg.get("entities", {}).get("sentiment") else None
            }
            messages.append(message_data)
        
        return {"stock_name": stock_name, "messages": messages}
        
    except Exception as e:
        print(f"Error fetching StockTwits data: {e}")
        return {"stock_name": "", "messages": []}


def check_options_volatility(ticker: str) -> dict:
    """Analiza la cadena de opciones para detectar actividad inusual."""
    stock = yf.Ticker(ticker)
    
    try:
        current_price = stock.fast_info['last_price']
        expirations = stock.options
        
        if not expirations:
            return {"error": "No options data found."}
        
        all_unusual_ops = []
        atm_iv_values = []
        
        for expiry in expirations[:min(3, len(expirations))]:
            opt_chain = stock.option_chain(expiry)
            
            calls = opt_chain.calls.assign(type="CALL")
            puts = opt_chain.puts.assign(type="PUT")
            options = pd.concat([calls, puts])
            
            atm_options = options[
                (options['strike'] > current_price * 0.90) & 
                (options['strike'] < current_price * 1.10)
            ]
            atm_iv_values.extend(atm_options['impliedVolatility'].dropna().tolist())
            
            options['vol_oi_ratio'] = options['volume'] / (options['openInterest'] + 1)
            
            unusual = options[
                (options['vol_oi_ratio'] > 2.0) & 
                (options['volume'] > 100)
            ]
            
            if not unusual.empty:
                all_unusual_ops.append(unusual)
        
        avg_iv = np.mean(atm_iv_values) * 100 if atm_iv_values else 0
        
        report = {
            "ticker": ticker,
            "price": round(current_price, 2),
            "atm_iv_avg": f"{round(avg_iv, 2)}%",
            "unusual_activity_count": 0,
            "top_unusual_moves": []
        }
        
        if all_unusual_ops:
            combined_df = pd.concat(all_unusual_ops)
            report["unusual_activity_count"] = len(combined_df)
            
            top_moves = combined_df.nlargest(5, 'volume')
            
            for _, row in top_moves.iterrows():
                real_oi = row['openInterest']
                display_ratio = round(row['volume'] / real_oi, 1) if real_oi > 0 else "∞"
                
                report["top_unusual_moves"].append({
                    "type": row['type'],
                    "strike": float(row['strike']),
                    "volume": int(row['volume']),
                    "oi": int(real_oi),
                    "ratio": display_ratio
                })
                
        return report

    except Exception as e:
        return {"error": f"Error: {str(e)}"}
    
def _fetch_raw_news(ticker: str, limit: int = 5) -> list[dict]:
    """
    Obtiene noticias raw de Yahoo Finance y Google News.
    Retorna una lista de diccionarios con la información de cada noticia.
    """
    news_list = []
    seen_titles = set()
    
    # --- 1. Yahoo Finance ---
    try:
        stock = yf.Ticker(ticker)
        news_data = stock.news
        
        if news_data:
            for item in news_data[:limit]:
                title = item.get('title', 'No Title')
                publisher = item.get('publisher', 'Unknown')
                
                # Obtener el contenido/resumen de la noticia
                content = item.get('summary', '')
                if not content:
                    content = item.get('description', '')
                if not content:
                    content = item.get('content', {}).get('body', '') if isinstance(item.get('content'), dict) else ''
                
                clean_title = title.lower().strip()
                if clean_title not in seen_titles:
                    news_list.append({
                        "source": "Yahoo Finance",
                        "publisher": publisher,
                        "title": title,
                        "content": content,
                        "date": item.get('providerPublishTime', '')
                    })
                    seen_titles.add(clean_title)
                    
    except Exception as e:
        _logger.error(f"Error fetching Yahoo Finance news for {ticker}: {e}")

    # --- 2. Google News ---
    try:
        googlenews = GoogleNews(lang='en', period='7d')
        googlenews.clear()
        googlenews.search(f"{ticker} stock related news")
        g_results = googlenews.result()
        
        if g_results:
            count = 0
            for item in g_results:
                if count >= limit:
                    break
                
                title = item.get('title', 'No Title')
                media = item.get('media', 'Unknown')
                date = item.get('date', '')
                description = item.get('desc', '') or item.get('description', '')
                
                clean_title = title.lower().strip()
                
                if clean_title not in seen_titles:
                    news_list.append({
                        "source": "Google News",
                        "publisher": media,
                        "title": title,
                        "content": description,
                        "date": date
                    })
                    seen_titles.add(clean_title)
                    count += 1
                    
    except Exception as e:
        _logger.error(f"Error fetching Google News for {ticker}: {e}")
    
    return news_list

def get_stock_info(ticker: str) -> dict:
    """
    Obtiene información general y métricas financieras de una acción.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        return {
            "ticker": ticker,
            
            # Info básica
            "name": info.get('longName', info.get('shortName', 'N/A')),
            "sector": info.get('sector', 'N/A'),
            "industry": info.get('industry', 'N/A'),
            "description": info.get('longBusinessSummary', 'No description available.'),
            "country": info.get('country', 'N/A'),
            "website": info.get('website', 'N/A'),
            "employees": info.get('fullTimeEmployees'),
            
            # Precio y Trading
            "price": info.get('regularMarketPrice', info.get('currentPrice')),
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
            "fifty_two_week_change": info.get('52WeekChange'),
            
            # Moving averages
            "fifty_day_average": info.get('fiftyDayAverage'),
            "two_hundred_day_average": info.get('twoHundredDayAverage'),
            
            # Market Cap
            "market_cap": info.get('marketCap'),
            "enterprise_value": info.get('enterpriseValue'),
            
            # ===== MÉTRICAS DE RENTABILIDAD =====
            # EPS (Earnings Per Share)
            "eps_trailing": info.get('trailingEps'),
            "eps_forward": info.get('forwardEps'),
            
            # Márgenes de Ganancia
            "gross_margin": info.get('grossMargins'),  # Margen bruto
            "operating_margin": info.get('operatingMargins'),  # Margen operativo
            "profit_margin": info.get('profitMargins'),  # Margen neto
            "ebitda_margin": info.get('ebitdaMargins'),  # Margen EBITDA
            
            # Rentabilidad (Returns)
            "roe": info.get('returnOnEquity'),  # Return on Equity
            "roa": info.get('returnOnAssets'),  # Return on Assets
            
            # ===== RATIOS DE VALUACIÓN =====
            "pe_trailing": info.get('trailingPE'),  # P/E trailing
            "pe_forward": info.get('forwardPE'),  # P/E forward
            "peg_ratio": info.get('pegRatio'),  # PEG ratio
            "price_to_book": info.get('priceToBook'),  # P/B ratio
            "price_to_sales": info.get('priceToSalesTrailing12Months'),  # P/S ratio
            "ev_to_ebitda": info.get('enterpriseToEbitda'),  # EV/EBITDA
            "ev_to_revenue": info.get('enterpriseToRevenue'),  # EV/Revenue
            
            # ===== DEUDA Y LIQUIDEZ =====
            "total_debt": info.get('totalDebt'),
            "total_cash": info.get('totalCash'),
            "total_cash_per_share": info.get('totalCashPerShare'),
            "debt_to_equity": info.get('debtToEquity'),  # Debt/Equity ratio
            "current_ratio": info.get('currentRatio'),  # Current ratio
            "quick_ratio": info.get('quickRatio'),  # Quick ratio
            
            # ===== DIVIDENDOS =====
            "dividend_rate": info.get('dividendRate'),  # Dividendo anual por acción
            "dividend_yield": info.get('dividendYield'),  # Rendimiento del dividendo
            "payout_ratio": info.get('payoutRatio'),  # Ratio de pago
            "ex_dividend_date": info.get('exDividendDate'),
            "last_dividend_value": info.get('lastDividendValue'),
            "last_dividend_date": info.get('lastDividendDate'),
            "five_year_avg_dividend_yield": info.get('fiveYearAvgDividendYield'),
            
            # ===== CRECIMIENTO =====
            "earnings_growth": info.get('earningsGrowth'),  # Crecimiento de ganancias
            "revenue_growth": info.get('revenueGrowth'),  # Crecimiento de ingresos
            "earnings_quarterly_growth": info.get('earningsQuarterlyGrowth'),
            "revenue_per_share": info.get('revenuePerShare'),
            
            # ===== INCOME STATEMENT =====
            "total_revenue": info.get('totalRevenue'),
            "gross_profit": info.get('grossProfits'),
            "ebitda": info.get('ebitda'),
            "net_income": info.get('netIncomeToCommon'),
            "free_cash_flow": info.get('freeCashflow'),
            "operating_cash_flow": info.get('operatingCashflow'),
            
            # ===== BALANCE SHEET =====
            "total_assets": info.get('totalAssets'),
            "book_value": info.get('bookValue'),
            
            # ===== ANALYST INFO =====
            "target_high_price": info.get('targetHighPrice'),
            "target_low_price": info.get('targetLowPrice'),
            "target_mean_price": info.get('targetMeanPrice'),
            "target_median_price": info.get('targetMedianPrice'),
            "recommendation_key": info.get('recommendationKey'),  # buy, hold, sell
            "recommendation_mean": info.get('recommendationMean'),  # 1-5 scale
            "number_of_analyst_opinions": info.get('numberOfAnalystOpinions'),
            
            # ===== RISK =====
            "beta": info.get('beta'),
            "audit_risk": info.get('auditRisk'),
            "board_risk": info.get('boardRisk'),
            "compensation_risk": info.get('compensationRisk'),
            "shareholder_rights_risk": info.get('shareHolderRightsRisk'),
            "overall_risk": info.get('overallRisk'),
            
            # ===== SHORT INTEREST =====
            "shares_outstanding": info.get('sharesOutstanding'),
            "float_shares": info.get('floatShares'),
            "shares_short": info.get('sharesShort'),
            "short_ratio": info.get('shortRatio'),
            "short_percent_of_float": info.get('shortPercentOfFloat'),
            "held_percent_insiders": info.get('heldPercentInsiders'),
            "held_percent_institutions": info.get('heldPercentInstitutions'),
        }
        
    except Exception as e:
        _logger.error(f"Error fetching stock info for {ticker}: {e}")
        return {"ticker": ticker, "error": str(e)}

def get_tradingview_analysis(ticker: str, exchange: str = "NASDAQ") -> dict:
    """
    Obtiene análisis técnico de TradingView.
    
    Args:
        ticker: Símbolo del instrumento (ej: AAPL, MSFT)
        exchange: Exchange donde cotiza (NASDAQ, NYSE, AMEX, etc.)
    
    Returns:
        dict con indicadores técnicos y recomendaciones
    """
    try:
        handler = TA_Handler(
            symbol=ticker.upper(),
            screener="america",
            exchange=exchange,
            interval=Interval.INTERVAL_1_DAY
        )
        
        analysis = handler.get_analysis()
        
        return {
            "ticker": ticker,
            "exchange": exchange,
            "interval": "1D",
            
            # Resumen de recomendación
            "summary": {
                "recommendation": analysis.summary["RECOMMENDATION"],  # BUY, SELL, NEUTRAL, STRONG_BUY, STRONG_SELL
                "buy_signals": analysis.summary["BUY"],
                "sell_signals": analysis.summary["SELL"],
                "neutral_signals": analysis.summary["NEUTRAL"],
            },
            
            # Análisis por tipo
            "oscillators": {
                "recommendation": analysis.oscillators["RECOMMENDATION"],
                "buy": analysis.oscillators["BUY"],
                "sell": analysis.oscillators["SELL"],
                "neutral": analysis.oscillators["NEUTRAL"],
                "indicators": {
                    "rsi": analysis.indicators.get("RSI"),
                    "stoch_k": analysis.indicators.get("Stoch.K"),
                    "stoch_d": analysis.indicators.get("Stoch.D"),
                    "cci": analysis.indicators.get("CCI20"),
                    "adx": analysis.indicators.get("ADX"),
                    "ao": analysis.indicators.get("AO"),  # Awesome Oscillator
                    "momentum": analysis.indicators.get("Mom"),
                    "macd": analysis.indicators.get("MACD.macd"),
                    "macd_signal": analysis.indicators.get("MACD.signal"),
                    "stoch_rsi_k": analysis.indicators.get("Stoch.RSI.K"),
                    "williams_r": analysis.indicators.get("W.R"),
                    "bull_bear_power": analysis.indicators.get("BBPower"),
                    "uo": analysis.indicators.get("UO"),  # Ultimate Oscillator
                }
            },
            
            # Moving Averages
            "moving_averages": {
                "recommendation": analysis.moving_averages["RECOMMENDATION"],
                "buy": analysis.moving_averages["BUY"],
                "sell": analysis.moving_averages["SELL"],
                "neutral": analysis.moving_averages["NEUTRAL"],
                "indicators": {
                    "ema_10": analysis.indicators.get("EMA10"),
                    "ema_20": analysis.indicators.get("EMA20"),
                    "ema_30": analysis.indicators.get("EMA30"),
                    "ema_50": analysis.indicators.get("EMA50"),
                    "ema_100": analysis.indicators.get("EMA100"),
                    "ema_200": analysis.indicators.get("EMA200"),
                    "sma_10": analysis.indicators.get("SMA10"),
                    "sma_20": analysis.indicators.get("SMA20"),
                    "sma_30": analysis.indicators.get("SMA30"),
                    "sma_50": analysis.indicators.get("SMA50"),
                    "sma_100": analysis.indicators.get("SMA100"),
                    "sma_200": analysis.indicators.get("SMA200"),
                    "ichimoku_base": analysis.indicators.get("Ichimoku.BLine"),
                    "vwma": analysis.indicators.get("VWMA"),
                    "hull_ma": analysis.indicators.get("HullMA9"),
                }
            },
            
            # Indicadores adicionales
            "indicators": {
                # Precio
                "open": analysis.indicators.get("open"),
                "high": analysis.indicators.get("high"),
                "low": analysis.indicators.get("low"),
                "close": analysis.indicators.get("close"),
                "volume": analysis.indicators.get("volume"),
                "change": analysis.indicators.get("change"),
                "change_percent": analysis.indicators.get("change_abs"),
                
                # Volatilidad
                "atr": analysis.indicators.get("ATR"),
                "bb_upper": analysis.indicators.get("BB.upper"),
                "bb_lower": analysis.indicators.get("BB.lower"),
                "bb_middle": analysis.indicators.get("BB.middle"),
                
                # Pivot Points
                "pivot_classic_p": analysis.indicators.get("Pivot.M.Classic.Middle"),
                "pivot_classic_r1": analysis.indicators.get("Pivot.M.Classic.R1"),
                "pivot_classic_s1": analysis.indicators.get("Pivot.M.Classic.S1"),
                "pivot_classic_r2": analysis.indicators.get("Pivot.M.Classic.R2"),
                "pivot_classic_s2": analysis.indicators.get("Pivot.M.Classic.S2"),
                
                # Otros
                "average_volume_10d": analysis.indicators.get("average_volume_10d_calc"),
                "average_volume_30d": analysis.indicators.get("average_volume_30d_calc"),
            }
        }
        
    except Exception as e:
        _logger.error(f"Error fetching TradingView analysis for {ticker}: {e}")
        return {"ticker": ticker, "error": str(e)}


def get_tradingview_multi_timeframe(ticker: str, exchange: str = "NASDAQ") -> dict:
    """
    Obtiene análisis técnico en múltiples timeframes.
    """
    intervals = {
        "1m": Interval.INTERVAL_1_MINUTE,
        "5m": Interval.INTERVAL_5_MINUTES,
        "15m": Interval.INTERVAL_15_MINUTES,
        "1h": Interval.INTERVAL_1_HOUR,
        "4h": Interval.INTERVAL_4_HOURS,
        "1d": Interval.INTERVAL_1_DAY,
        "1w": Interval.INTERVAL_1_WEEK,
        "1M": Interval.INTERVAL_1_MONTH,
    }
    
    results = {"ticker": ticker, "timeframes": {}}
    
    for name, interval in intervals.items():
        try:
            handler = TA_Handler(
                symbol=ticker.upper(),
                screener="america",
                exchange=exchange,
                interval=interval
            )
            analysis = handler.get_analysis()
            
            results["timeframes"][name] = {
                "recommendation": analysis.summary["RECOMMENDATION"],
                "buy": analysis.summary["BUY"],
                "sell": analysis.summary["SELL"],
                "neutral": analysis.summary["NEUTRAL"],
                "rsi": analysis.indicators.get("RSI"),
                "macd": analysis.indicators.get("MACD.macd"),
            }
        except Exception as e:
            results["timeframes"][name] = {"error": str(e)}
    
    return results


def detect_exchange(ticker: str) -> str:
    """
    Detecta el exchange basado en el ticker.
    """
    import yfinance as yf
    
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        exchange = info.get('exchange', '')
        _logger.info(f"Exchange detected: {exchange}")
        
        exchange_map = {
            'NMS': 'NASDAQ',
            'NGM': 'NASDAQ',
            'NCM': 'NASDAQ',
            'NYQ': 'NYSE',
            'NYS': 'NYSE',
            'PCX': 'NYSE',  # NYSE Arca (ETFs)
            'ASE': 'AMEX',
            'BTS': 'NYSE',
        }
        _logger.info(f"Exchange mapped: {exchange_map.get(exchange, 'NASDAQ')}")
        
        return exchange_map.get(exchange, 'NASDAQ')
    except Exception:
        return 'NASDAQ'