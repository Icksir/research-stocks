"""
Prompts para análisis de instrumentos financieros.
Diseñados para generar explicaciones comprensibles para usuarios no expertos.
"""


def get_stock_analysis_prompt(
    ticker: str,
    info: dict,
    technical: dict,
    mtf: dict,
    options: dict,
    news: str
) -> str:
    """
    Genera el prompt para análisis de acciones.
    Incluye explicaciones detalladas para usuarios no expertos.
    """
    
    # Formatear datos técnicos
    tv_summary = technical.get('summary', {})
    tv_osc = technical.get('oscillators', {})
    tv_ma = technical.get('moving_averages', {})
    tv_vol = technical.get('volatility', {})
    tv_trend = technical.get('trend', {})
    tv_pivots = technical.get('pivot_points', {}).get('classic', {})
    osc_ind = tv_osc.get('indicators', {})
    ma_ind = tv_ma.get('indicators', {})
    
    # Formatear multi-timeframe
    mtf_data = mtf.get('timeframes', {})
    confluence = mtf.get('confluence', {})
    
    return f"""
Eres un asesor financiero experto que explica conceptos de inversión de manera clara y sencilla.
Tu audiencia son personas que NO son expertas en finanzas, así que debes:
- Explicar cada término técnico la primera vez que lo uses
- Usar analogías simples cuando sea posible
- Evitar jerga innecesaria
- Ser directo sobre los riesgos

Analiza la siguiente información de **{ticker}** y genera un reporte de inversión completo.

═══════════════════════════════════════════════════════════════════════════════
📊 INFORMACIÓN DE LA EMPRESA
═══════════════════════════════════════════════════════════════════════════════

• Nombre: {info.get('name', 'N/A')}
• Sector: {info.get('sector', 'N/A')}
• Industria: {info.get('industry', 'N/A')}
• País: {info.get('country', 'N/A')}
• Empleados: {_format_number(info.get('employees'))}
• Descripción: {info.get('description', 'N/A')[:600]}...

═══════════════════════════════════════════════════════════════════════════════
💰 PRECIO Y MERCADO
═══════════════════════════════════════════════════════════════════════════════

PRECIO ACTUAL:
• Precio: ${info.get('price', 'N/A')}
• Cierre anterior: ${info.get('previous_close', 'N/A')}
• Rango del día: ${info.get('day_low', 'N/A')} - ${info.get('day_high', 'N/A')}

VOLUMEN (cantidad de acciones que se compraron/vendieron hoy):
• Volumen hoy: {_format_number(info.get('volume'))}
• Volumen promedio: {_format_number(info.get('avg_volume'))}
• ¿Volumen inusual?: {"SÍ ⚠️" if info.get('volume') and info.get('avg_volume') and info.get('volume') > info.get('avg_volume') * 1.5 else "Normal"}

TAMAÑO DE LA EMPRESA:
• Market Cap (valor total de la empresa): {_format_currency(info.get('market_cap'))}
  → {_get_market_cap_category(info.get('market_cap'))}
• Enterprise Value: {_format_currency(info.get('enterprise_value'))}

RANGO DE 52 SEMANAS (último año):
• Máximo del año: ${info.get('fifty_two_week_high', 'N/A')}
• Mínimo del año: ${info.get('fifty_two_week_low', 'N/A')}
• Posición actual: {_get_52w_position(info.get('price'), info.get('fifty_two_week_low'), info.get('fifty_two_week_high'))}
• Cambio en 52 semanas: {_format_percent(info.get('fifty_two_week_change'))}

═══════════════════════════════════════════════════════════════════════════════
📈 MÉTRICAS DE RENTABILIDAD
(¿Qué tan buena es la empresa generando dinero?)
═══════════════════════════════════════════════════════════════════════════════

GANANCIAS POR ACCIÓN (EPS):
(Cuánto dinero gana la empresa por cada acción que existe)
• EPS actual: ${info.get('eps_trailing', 'N/A')}
• EPS esperado (próximo año): ${info.get('eps_forward', 'N/A')}

MÁRGENES DE GANANCIA:
(Por cada $100 que vende la empresa, ¿cuánto queda de ganancia?)
• Margen Bruto: {_format_percent(info.get('gross_margin'))}
  → De cada $100 en ventas, ${_margin_to_dollars(info.get('gross_margin'))} queda después de costos de producción
• Margen Operativo: {_format_percent(info.get('operating_margin'))}
  → De cada $100, ${_margin_to_dollars(info.get('operating_margin'))} queda después de gastos operativos
• Margen Neto: {_format_percent(info.get('profit_margin'))}
  → De cada $100, ${_margin_to_dollars(info.get('profit_margin'))} es ganancia final

RETORNO SOBRE CAPITAL:
(¿Qué tan eficiente es la empresa usando el dinero?)
• ROE (Return on Equity): {_format_percent(info.get('roe'))}
  → Por cada $100 de los accionistas, genera ${_margin_to_dollars(info.get('roe'))} de ganancia
  → {_evaluate_roe(info.get('roe'))}
• ROA (Return on Assets): {_format_percent(info.get('roa'))}
  → Por cada $100 en activos, genera ${_margin_to_dollars(info.get('roa'))} de ganancia

═══════════════════════════════════════════════════════════════════════════════
🏷️ VALUACIÓN
(¿El precio de la acción es justo, caro o barato?)
═══════════════════════════════════════════════════════════════════════════════

RATIOS DE PRECIO:
• P/E (Price to Earnings): {_format_number(info.get('pe_trailing'))}
  → Estás pagando ${_format_number(info.get('pe_trailing'))} por cada $1 de ganancias
  → {_evaluate_pe(info.get('pe_trailing'))}

• P/E Forward (estimado): {_format_number(info.get('pe_forward'))}
  → Basado en ganancias esperadas del próximo año

• PEG Ratio: {_format_number(info.get('peg_ratio'))}
  → P/E dividido por crecimiento. Menos de 1 = posiblemente subvaluada
  → {_evaluate_peg(info.get('peg_ratio'))}

• P/B (Price to Book): {_format_number(info.get('price_to_book'))}
  → Precio vs valor en libros. Menos de 1 = posible ganga
  → {_evaluate_pb(info.get('price_to_book'))}

• EV/EBITDA: {_format_number(info.get('ev_to_ebitda'))}
  → Valor de empresa vs ganancias operativas. Menor = más barata
  → {_evaluate_ev_ebitda(info.get('ev_to_ebitda'))}

• P/S (Price to Sales): {_format_number(info.get('price_to_sales'))}
  → Precio vs ventas totales

═══════════════════════════════════════════════════════════════════════════════
💳 DEUDA Y SALUD FINANCIERA
(¿La empresa tiene sus finanzas en orden?)
═══════════════════════════════════════════════════════════════════════════════

• Deuda Total: {_format_currency(info.get('total_debt'))}
• Efectivo Total: {_format_currency(info.get('total_cash'))}
• Efectivo por Acción: ${info.get('total_cash_per_share', 'N/A')}

RATIOS DE DEUDA:
• Debt/Equity (Deuda/Capital): {_format_number(info.get('debt_to_equity'))}
  → Por cada $1 de los accionistas, la empresa debe ${_format_number(info.get('debt_to_equity'))}
  → {_evaluate_debt_equity(info.get('debt_to_equity'))}

• Current Ratio (Liquidez): {_format_number(info.get('current_ratio'))}
  → Capacidad de pagar deudas a corto plazo. Mayor a 1 = puede pagar sus deudas
  → {_evaluate_current_ratio(info.get('current_ratio'))}

• Quick Ratio: {_format_number(info.get('quick_ratio'))}
  → Similar pero sin contar inventario

═══════════════════════════════════════════════════════════════════════════════
💵 DIVIDENDOS
(¿La empresa te paga por tener sus acciones?)
═══════════════════════════════════════════════════════════════════════════════

• ¿Paga dividendos?: {"SÍ ✅" if info.get('dividend_yield') else "NO ❌"}
• Dividend Yield: {_format_percent(info.get('dividend_yield'))}
  → Por cada $100 invertidos, recibes ${_margin_to_dollars(info.get('dividend_yield'))} al año
• Dividendo anual por acción: ${info.get('dividend_rate', 'N/A')}
• Payout Ratio: {_format_percent(info.get('payout_ratio'))}
  → {_evaluate_payout_ratio(info.get('payout_ratio'))}

═══════════════════════════════════════════════════════════════════════════════
📊 CRECIMIENTO
(¿La empresa está creciendo o decreciendo?)
═══════════════════════════════════════════════════════════════════════════════

• Crecimiento de Ganancias: {_format_percent(info.get('earnings_growth'))}
  → {_evaluate_growth(info.get('earnings_growth'), 'earnings')}
• Crecimiento de Ingresos: {_format_percent(info.get('revenue_growth'))}
  → {_evaluate_growth(info.get('revenue_growth'), 'revenue')}
• Crecimiento Trimestral: {_format_percent(info.get('earnings_quarterly_growth'))}

═══════════════════════════════════════════════════════════════════════════════
🎯 RECOMENDACIONES DE ANALISTAS PROFESIONALES
═══════════════════════════════════════════════════════════════════════════════

• Recomendación consenso: {info.get('recommendation_key', 'N/A').upper() if info.get('recommendation_key') else 'N/A'}
• Número de analistas: {info.get('number_of_analyst_opinions', 'N/A')}

PRECIOS OBJETIVO:
• Precio objetivo promedio: ${info.get('target_mean_price', 'N/A')}
• Precio objetivo más alto: ${info.get('target_high_price', 'N/A')}
• Precio objetivo más bajo: ${info.get('target_low_price', 'N/A')}
• Potencial de subida/bajada: {_calculate_upside(info.get('price'), info.get('target_mean_price'))}

═══════════════════════════════════════════════════════════════════════════════
📉 ANÁLISIS TÉCNICO (Señales de TradingView)
(¿Qué dicen los gráficos sobre el momento de comprar o vender?)
═══════════════════════════════════════════════════════════════════════════════

🎯 RESUMEN GENERAL: {tv_summary.get('recommendation', 'N/A')}
   • Señales de COMPRA: {tv_summary.get('buy_signals', 0)} de 26 indicadores
   • Señales de VENTA: {tv_summary.get('sell_signals', 0)} de 26 indicadores
   • Señales NEUTRALES: {tv_summary.get('neutral_signals', 0)} de 26 indicadores

📊 OSCILADORES ({tv_osc.get('recommendation', 'N/A')}):
(Indicadores que muestran si la acción está "sobrecomprada" o "sobrevendida")

• RSI (Índice de Fuerza Relativa): {_format_number(osc_ind.get('rsi'))}
  → Mide si la acción subió mucho (>70) o bajó mucho (<30) recientemente
  → {_evaluate_rsi(osc_ind.get('rsi'))}

• MACD: {_format_number(osc_ind.get('macd'))} | Señal: {_format_number(osc_ind.get('macd_signal'))}
  → Muestra la dirección y fuerza de la tendencia
  → {_evaluate_macd(osc_ind.get('macd'), osc_ind.get('macd_signal'))}

• Stochastic %K: {_format_number(osc_ind.get('stoch_k'))}
  → Similar al RSI. >80 = sobrecompra, <20 = sobreventa
  → {_evaluate_stochastic(osc_ind.get('stoch_k'))}

• ADX (Fuerza de Tendencia): {_format_number(osc_ind.get('adx'))}
  → Mide qué tan fuerte es la tendencia actual (no la dirección)
  → {_evaluate_adx(osc_ind.get('adx'))}

• CCI: {_format_number(osc_ind.get('cci'))}
  → >100 = sobrecompra, <-100 = sobreventa

• Momentum: {_format_number(osc_ind.get('momentum'))}
• Williams %R: {_format_number(osc_ind.get('williams_r'))}

📈 MEDIAS MÓVILES ({tv_ma.get('recommendation', 'N/A')}):
(Promedios del precio que ayudan a ver la tendencia)

CORTO PLAZO:
• EMA 10: ${_format_number(ma_ind.get('ema_10'))}
• EMA 20: ${_format_number(ma_ind.get('ema_20'))}
• SMA 20: ${_format_number(ma_ind.get('sma_20'))}

MEDIANO PLAZO:
• EMA 50: ${_format_number(ma_ind.get('ema_50'))}
• SMA 50: ${_format_number(ma_ind.get('sma_50'))}

LARGO PLAZO:
• EMA 200: ${_format_number(ma_ind.get('ema_200'))}
• SMA 200: ${_format_number(ma_ind.get('sma_200'))}

SEÑALES DE TENDENCIA:
• Precio vs EMA 20: {tv_trend.get('price_vs_ema_20', 'N/A')}
  → {_explain_price_vs_ma(tv_trend.get('price_vs_ema_20'), 'EMA 20', 'corto plazo')}
• Precio vs SMA 50: {tv_trend.get('price_vs_sma_50', 'N/A')}
  → {_explain_price_vs_ma(tv_trend.get('price_vs_sma_50'), 'SMA 50', 'mediano plazo')}
• Precio vs SMA 200: {tv_trend.get('price_vs_sma_200', 'N/A')}
  → {_explain_price_vs_ma(tv_trend.get('price_vs_sma_200'), 'SMA 200', 'largo plazo')}

• Golden/Death Cross: {tv_trend.get('ma_cross_50_200', 'N/A')}
  → {_explain_cross(tv_trend.get('ma_cross_50_200'))}

📊 VOLATILIDAD:
(¿Qué tanto se mueve el precio?)

• ATR (Rango Promedio): ${_format_number(tv_vol.get('atr'))}
  → El precio se mueve en promedio ${_format_number(tv_vol.get('atr'))} por día

BANDAS DE BOLLINGER:
(Canal donde el precio suele moverse)
• Banda Superior: ${_format_number(tv_vol.get('bb_upper'))}
• Banda Media: ${_format_number(tv_vol.get('bb_middle'))}
• Banda Inferior: ${_format_number(tv_vol.get('bb_lower'))}
• Posición del precio: {_get_bb_position(info.get('price'), tv_vol.get('bb_lower'), tv_vol.get('bb_middle'), tv_vol.get('bb_upper'))}

📍 NIVELES DE SOPORTE Y RESISTENCIA (Pivot Points):
(Precios donde el movimiento podría detenerse o rebotar)

RESISTENCIAS (techos de precio):
• R3: ${_format_number(tv_pivots.get('r3'))}
• R2: ${_format_number(tv_pivots.get('r2'))}
• R1: ${_format_number(tv_pivots.get('r1'))}

• PIVOT: ${_format_number(tv_pivots.get('p'))}

SOPORTES (pisos de precio):
• S1: ${_format_number(tv_pivots.get('s1'))}
• S2: ${_format_number(tv_pivots.get('s2'))}
• S3: ${_format_number(tv_pivots.get('s3'))}

═══════════════════════════════════════════════════════════════════════════════
⏰ ANÁLISIS MULTI-TIMEFRAME
(¿Las señales coinciden en diferentes períodos de tiempo?)
═══════════════════════════════════════════════════════════════════════════════

• 1 Hora:  {mtf_data.get('1h', {}).get('recommendation', 'N/A')} (RSI: {_format_number(mtf_data.get('1h', {}).get('rsi'))})
• 4 Horas: {mtf_data.get('4h', {}).get('recommendation', 'N/A')} (RSI: {_format_number(mtf_data.get('4h', {}).get('rsi'))})
• 1 Día:   {mtf_data.get('1d', {}).get('recommendation', 'N/A')} (RSI: {_format_number(mtf_data.get('1d', {}).get('rsi'))})
• 1 Semana:{mtf_data.get('1w', {}).get('recommendation', 'N/A')} (RSI: {_format_number(mtf_data.get('1w', {}).get('rsi'))})

CONFLUENCIA:
• Timeframes alcistas: {confluence.get('bullish_timeframes', 0)} de 4
• Timeframes bajistas: {confluence.get('bearish_timeframes', 0)} de 4
• Tendencia general: {confluence.get('overall', 'N/A')}
→ {_explain_confluence(confluence)}

═══════════════════════════════════════════════════════════════════════════════
📋 OPCIONES Y VOLATILIDAD IMPLÍCITA
(¿Qué esperan los traders profesionales?)
═══════════════════════════════════════════════════════════════════════════════

• Volatilidad Implícita (IV) ATM: {options.get('atm_iv_avg', 'N/A')}
  → {_explain_iv(options.get('atm_iv_avg'))}

• Actividad inusual detectada: {options.get('unusual_activity_count', 0)} movimientos
  → {_explain_unusual_activity(options.get('unusual_activity_count', 0))}

• Movimientos inusuales principales:
{_format_unusual_moves(options.get('top_unusual_moves', []))}

═══════════════════════════════════════════════════════════════════════════════
📰 NOTICIAS RECIENTES
═══════════════════════════════════════════════════════════════════════════════

{news}

═══════════════════════════════════════════════════════════════════════════════
📊 RIESGO
═══════════════════════════════════════════════════════════════════════════════

• Beta: {info.get('beta', 'N/A')}
  → {_explain_beta(info.get('beta'))}

• Short Interest (% de acciones apostando a la baja): {_format_percent(info.get('short_percent_of_float'))}
  → {_evaluate_short_interest(info.get('short_percent_of_float'))}

• % en manos de instituciones: {_format_percent(info.get('held_percent_institutions'))}
• % en manos de insiders: {_format_percent(info.get('held_percent_insiders'))}

═══════════════════════════════════════════════════════════════════════════════

INSTRUCCIONES PARA EL ANÁLISIS:

Genera un reporte de inversión estructurado con las siguientes secciones.
Usa un lenguaje claro y accesible, como si explicaras a un amigo inteligente que no sabe de finanzas.
Incluye emojis para hacer el reporte más visual y fácil de leer.

## 📋 RESUMEN EJECUTIVO
- Recomendación clara: COMPRAR 🟢 / MANTENER 🟡 / VENDER 🔴
- Explicación en 2-3 oraciones de por qué
- Nivel de riesgo: BAJO / MEDIO / ALTO

## 💡 ¿QUÉ HACE ESTA EMPRESA?
- Explicación simple del negocio
- ¿Cómo gana dinero?
- ¿En qué industria compite?

## 📊 ANÁLISIS FUNDAMENTAL (La salud de la empresa)
### Lo bueno ✅
### Lo preocupante ⚠️
### Valuación: ¿Está cara o barata?

## 📈 ANÁLISIS TÉCNICO (Lo que dicen los gráficos)
### Tendencia actual
### Señales importantes
### Niveles clave de precio (dónde comprar/vender)

## 🎯 CATALIZADORES PRÓXIMOS
- Eventos que podrían mover el precio
- Noticias importantes recientes

## ⚠️ RIESGOS PRINCIPALES
- 3 riesgos específicos que un inversor debe conocer
- Explica cada riesgo de forma simple

## 💰 MI RECOMENDACIÓN DETALLADA
- **Veredicto final**: COMPRAR / MANTENER / VENDER
- **Precio objetivo**: $X (potencial de +X% o -X%)
- **Para quién es esta inversión**: (perfil de inversor ideal)
- **Horizonte temporal**: (corto/mediano/largo plazo)
- **Cuánto invertir**: (sugerencia de % del portafolio)

## 📝 NOTA IMPORTANTE
Incluye siempre un disclaimer sobre que esto no es asesoría financiera profesional.
"""


def get_etf_analysis_prompt(
    ticker: str,
    info: dict,
    holdings: dict,
    sectors: dict,
    technical: dict,
    mtf: dict,
    options: dict,
    news: str
) -> str:
    """
    Genera el prompt para análisis de ETFs.
    """
    
    # Formatear holdings
    holdings_list = holdings.get('holdings', [])
    holdings_str = ""
    for i, h in enumerate(holdings_list[:10], 1):
        holdings_str += f"   {i}. {h.get('symbol', 'N/A')}: {h.get('name', 'N/A')} ({h.get('weight', 0):.2f}%)\n"
    
    # Formatear sectores
    sectors_dict = sectors.get('sectors', {})
    sectors_str = ""
    for sector, weight in sorted(sectors_dict.items(), key=lambda x: x[1], reverse=True):
        sectors_str += f"   • {sector}: {weight:.2f}%\n"
    
    # Formatear datos técnicos
    tv_summary = technical.get('summary', {})
    tv_osc = technical.get('oscillators', {})
    tv_ma = technical.get('moving_averages', {})
    osc_ind = tv_osc.get('indicators', {})
    
    # Formatear multi-timeframe
    mtf_data = mtf.get('timeframes', {})
    confluence = mtf.get('confluence', {})
    
    return f"""
Eres un asesor financiero experto en ETFs que explica conceptos de manera clara y sencilla.
Tu audiencia son personas que NO son expertas en finanzas.

Analiza la siguiente información del ETF **{ticker}** y genera un reporte completo.

═══════════════════════════════════════════════════════════════════════════════
📊 ¿QUÉ ES UN ETF?
═══════════════════════════════════════════════════════════════════════════════

Un ETF (Exchange-Traded Fund) es como una "canasta" de inversiones.
En lugar de comprar acciones de UNA empresa, compras un pedacito de MUCHAS empresas a la vez.
Es una forma fácil y económica de diversificar tu inversión.

═══════════════════════════════════════════════════════════════════════════════
📋 INFORMACIÓN DEL ETF
═══════════════════════════════════════════════════════════════════════════════

• Nombre: {info.get('name', 'N/A')}
• Categoría: {info.get('category', 'N/A')}
• Familia del fondo: {info.get('fund_family', 'N/A')}
• Descripción: {info.get('description', 'N/A')[:600]}...

═══════════════════════════════════════════════════════════════════════════════
💰 PRECIO Y COSTOS
═══════════════════════════════════════════════════════════════════════════════

PRECIO:
• Precio actual: ${info.get('price', 'N/A')}
• NAV (Valor neto del activo): ${info.get('nav_price', 'N/A')}
• Rango 52 semanas: ${info.get('fifty_two_week_low', 'N/A')} - ${info.get('fifty_two_week_high', 'N/A')}

COSTOS:
• Expense Ratio: {_format_percent(info.get('expense_ratio'))}
  → Por cada $10,000 invertidos, pagas ${_expense_to_dollars(info.get('expense_ratio'))} al año en comisiones
  → {_evaluate_expense_ratio(info.get('expense_ratio'))}

TAMAÑO DEL FONDO:
• Total Assets: {_format_currency(info.get('total_assets'))}
  → {_evaluate_etf_size(info.get('total_assets'))}

═══════════════════════════════════════════════════════════════════════════════
📈 RENDIMIENTOS HISTÓRICOS
(¿Cuánto ha ganado este ETF en el pasado?)
═══════════════════════════════════════════════════════════════════════════════

• Este año (YTD): {_format_percent(info.get('ytd_return'))}
• Últimos 3 meses: {_format_percent(info.get('trailing_three_month_returns'))}
• Últimos 3 años (anualizado): {_format_percent(info.get('three_year_return'))}
• Últimos 5 años (anualizado): {_format_percent(info.get('five_year_return'))}
• Cambio 52 semanas: {_format_percent(info.get('fifty_two_week_change_percent'))}

NOTA: Rendimientos pasados NO garantizan rendimientos futuros.

═══════════════════════════════════════════════════════════════════════════════
💵 DIVIDENDOS
═══════════════════════════════════════════════════════════════════════════════

• ¿Paga dividendos?: {"SÍ ✅" if info.get('dividend_yield') else "NO ❌"}
• Dividend Yield: {_format_percent(info.get('dividend_yield'))}
  → Por cada $10,000 invertidos, recibes ~${_yield_to_annual(info.get('dividend_yield'))} al año

═══════════════════════════════════════════════════════════════════════════════
🏢 TOP 10 HOLDINGS (Las empresas más grandes dentro del ETF)
═══════════════════════════════════════════════════════════════════════════════

{holdings_str if holdings_str else "   Información no disponible"}

Concentración: Las 10 principales posiciones representan {_calculate_top10_concentration(holdings_list)}% del ETF
→ {_evaluate_concentration(_calculate_top10_concentration(holdings_list))}

═══════════════════════════════════════════════════════════════════════════════
📊 DISTRIBUCIÓN POR SECTORES
═══════════════════════════════════════════════════════════════════════════════

{sectors_str if sectors_str else "   Información no disponible"}

═══════════════════════════════════════════════════════════════════════════════
📉 ANÁLISIS TÉCNICO
═══════════════════════════════════════════════════════════════════════════════

RESUMEN: {tv_summary.get('recommendation', 'N/A')}
• Señales de COMPRA: {tv_summary.get('buy_signals', 0)}/26
• Señales de VENTA: {tv_summary.get('sell_signals', 0)}/26

INDICADORES CLAVE:
• RSI: {_format_number(osc_ind.get('rsi'))} → {_evaluate_rsi(osc_ind.get('rsi'))}
• MACD: {_format_number(osc_ind.get('macd'))}

MEDIAS MÓVILES ({tv_ma.get('recommendation', 'N/A')}):
• Precio vs SMA 50: {"Por encima ✅" if info.get('price') and info.get('fifty_day_average') and info.get('price') > info.get('fifty_day_average') else "Por debajo ⚠️"}
• Precio vs SMA 200: {"Por encima ✅" if info.get('price') and info.get('two_hundred_day_average') and info.get('price') > info.get('two_hundred_day_average') else "Por debajo ⚠️"}

═══════════════════════════════════════════════════════════════════════════════
⏰ MULTI-TIMEFRAME
═══════════════════════════════════════════════════════════════════════════════

• 1 Hora:  {mtf_data.get('1h', {}).get('recommendation', 'N/A')}
• 4 Horas: {mtf_data.get('4h', {}).get('recommendation', 'N/A')}
• 1 Día:   {mtf_data.get('1d', {}).get('recommendation', 'N/A')}
• 1 Semana:{mtf_data.get('1w', {}).get('recommendation', 'N/A')}

Confluencia: {confluence.get('overall', 'N/A')}

═══════════════════════════════════════════════════════════════════════════════
📋 OPCIONES
═══════════════════════════════════════════════════════════════════════════════

• IV Promedio: {options.get('atm_iv_avg', 'N/A')}
• Actividad inusual: {options.get('unusual_activity_count', 0)} movimientos

═══════════════════════════════════════════════════════════════════════════════
📰 NOTICIAS
═══════════════════════════════════════════════════════════════════════════════

{news}

═══════════════════════════════════════════════════════════════════════════════
📊 RIESGO
═══════════════════════════════════════════════════════════════════════════════

• Beta: {info.get('beta', 'N/A')}
  → {_explain_beta(info.get('beta'))}

═══════════════════════════════════════════════════════════════════════════════

INSTRUCCIONES:

Genera un reporte estructurado con:

## 📋 RESUMEN EJECUTIVO
- Recomendación: COMPRAR 🟢 / MANTENER 🟡 / VENDER 🔴
- Explicación simple de qué es este ETF
- Nivel de riesgo

## 🎯 ¿PARA QUÉ SIRVE ESTE ETF?
- ¿Qué tipo de exposición da?
- ¿A qué mercado/sector/región da acceso?

## ✅ VENTAJAS DE ESTE ETF
- Puntos positivos
- Costos
- Diversificación

## ⚠️ DESVENTAJAS Y RIESGOS
- Concentración
- Riesgos específicos
- Qué podría salir mal

## 📊 ANÁLISIS TÉCNICO RESUMIDO
- Tendencia actual
- Señales importantes

## 💰 RECOMENDACIÓN FINAL
- **Veredicto**: COMPRAR / MANTENER / VENDER
- **Para quién es ideal**: (perfil de inversor)
- **Alternativas**: (otros ETFs similares a considerar)
- **Horizonte temporal recomendado**

## 📝 DISCLAIMER
Incluye que esto no es asesoría financiera profesional.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES AUXILIARES DE FORMATEO
# ═══════════════════════════════════════════════════════════════════════════════

def _format_number(value) -> str:
    """Formatea números con separadores."""
    if value is None:
        return "N/A"
    try:
        if abs(value) >= 1_000_000_000:
            return f"{value / 1_000_000_000:.2f}B"
        elif abs(value) >= 1_000_000:
            return f"{value / 1_000_000:.2f}M"
        elif abs(value) >= 1_000:
            return f"{value / 1_000:.2f}K"
        elif abs(value) < 1:
            return f"{value:.4f}"
        return f"{value:.2f}"
    except:
        return "N/A"


def _format_currency(value) -> str:
    """Formatea valores monetarios."""
    if value is None:
        return "N/A"
    try:
        if value >= 1_000_000_000_000:
            return f"${value / 1_000_000_000_000:.2f} Trillones"
        elif value >= 1_000_000_000:
            return f"${value / 1_000_000_000:.2f} Billones"
        elif value >= 1_000_000:
            return f"${value / 1_000_000:.2f} Millones"
        return f"${value:,.0f}"
    except:
        return "N/A"


def _format_percent(value) -> str:
    """Formatea porcentajes."""
    if value is None:
        return "N/A"
    try:
        if abs(value) < 1:
            return f"{value * 100:.2f}%"
        return f"{value:.2f}%"
    except:
        return "N/A"


def _margin_to_dollars(value) -> str:
    """Convierte margen a dólares por cada $100."""
    if value is None:
        return "N/A"
    try:
        if abs(value) < 1:
            return f"{value * 100:.2f}"
        return f"{value:.2f}"
    except:
        return "N/A"


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE EVALUACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

def _get_market_cap_category(market_cap) -> str:
    """Categoriza el tamaño de la empresa."""
    if market_cap is None:
        return ""
    if market_cap >= 200_000_000_000:
        return "🏢 Mega Cap (gigante como Apple, Microsoft)"
    elif market_cap >= 10_000_000_000:
        return "🏢 Large Cap (empresa grande y establecida)"
    elif market_cap >= 2_000_000_000:
        return "🏠 Mid Cap (empresa mediana)"
    elif market_cap >= 300_000_000:
        return "🏠 Small Cap (empresa pequeña, más riesgo)"
    else:
        return "⚠️ Micro Cap (muy pequeña, alto riesgo)"


def _get_52w_position(price, low, high) -> str:
    """Calcula posición en el rango de 52 semanas."""
    if not all([price, low, high]) or high == low:
        return "N/A"
    position = (price - low) / (high - low) * 100
    if position >= 90:
        return f"📈 Cerca del máximo ({position:.0f}% del rango)"
    elif position >= 70:
        return f"📈 Zona alta ({position:.0f}% del rango)"
    elif position >= 30:
        return f"➡️ Zona media ({position:.0f}% del rango)"
    elif position >= 10:
        return f"📉 Zona baja ({position:.0f}% del rango)"
    else:
        return f"📉 Cerca del mínimo ({position:.0f}% del rango)"


def _evaluate_roe(roe) -> str:
    if roe is None:
        return ""
    roe_pct = roe * 100 if abs(roe) < 1 else roe
    if roe_pct >= 20:
        return "🟢 Excelente (>20% es muy bueno)"
    elif roe_pct >= 15:
        return "🟢 Bueno"
    elif roe_pct >= 10:
        return "🟡 Aceptable"
    elif roe_pct >= 0:
        return "🟠 Bajo"
    else:
        return "🔴 Negativo (la empresa pierde dinero)"


def _evaluate_pe(pe) -> str:
    if pe is None:
        return ""
    if pe < 0:
        return "🔴 Negativo (la empresa tiene pérdidas)"
    elif pe < 10:
        return "🟢 Muy bajo (posible ganga o problemas)"
    elif pe < 15:
        return "🟢 Bajo (relativamente barata)"
    elif pe < 25:
        return "🟡 Normal (precio justo)"
    elif pe < 40:
        return "🟠 Alto (se espera mucho crecimiento)"
    else:
        return "🔴 Muy alto (cara, mucho optimismo incluido)"


def _evaluate_peg(peg) -> str:
    if peg is None:
        return ""
    if peg < 0:
        return "⚠️ Negativo (ganancias decreciendo)"
    elif peg < 1:
        return "🟢 Menor a 1 (posiblemente subvaluada)"
    elif peg < 2:
        return "🟡 Normal (precio justo vs crecimiento)"
    else:
        return "🟠 Alto (cara para su crecimiento)"


def _evaluate_pb(pb) -> str:
    if pb is None:
        return ""
    if pb < 1:
        return "🟢 Menor a 1 (cotiza por debajo de su valor en libros)"
    elif pb < 3:
        return "🟡 Normal"
    else:
        return "🟠 Alto (pagas prima por intangibles/marca)"


def _evaluate_ev_ebitda(ev_ebitda) -> str:
    if ev_ebitda is None:
        return ""
    if ev_ebitda < 0:
        return "⚠️ Negativo (EBITDA negativo)"
    elif ev_ebitda < 10:
        return "🟢 Bajo (relativamente barata)"
    elif ev_ebitda < 15:
        return "🟡 Normal"
    else:
        return "🟠 Alto"


def _evaluate_debt_equity(de) -> str:
    if de is None:
        return ""
    if de < 0.3:
        return "🟢 Muy bajo (empresa conservadora)"
    elif de < 1:
        return "🟢 Saludable"
    elif de < 2:
        return "🟡 Moderado"
    else:
        return "🔴 Alto (mucha deuda, más riesgo)"


def _evaluate_current_ratio(cr) -> str:
    if cr is None:
        return ""
    if cr >= 2:
        return "🟢 Excelente liquidez"
    elif cr >= 1.5:
        return "🟢 Buena liquidez"
    elif cr >= 1:
        return "🟡 Liquidez justa"
    else:
        return "🔴 Problemas de liquidez (no puede pagar deudas corto plazo)"


def _evaluate_payout_ratio(pr) -> str:
    if pr is None:
        return ""
    pr_pct = pr * 100 if abs(pr) < 1 else pr
    if pr_pct < 30:
        return "Paga poco dividendo, reinvierte en el negocio"
    elif pr_pct < 60:
        return "🟢 Sostenible"
    elif pr_pct < 80:
        return "🟡 Alto, poco margen para aumentar"
    else:
        return "🔴 Muy alto, podría no ser sostenible"


def _evaluate_growth(growth, type) -> str:
    if growth is None:
        return ""
    g_pct = growth * 100 if abs(growth) < 1 else growth
    if g_pct >= 25:
        return "🚀 Crecimiento excepcional"
    elif g_pct >= 10:
        return "🟢 Buen crecimiento"
    elif g_pct >= 0:
        return "🟡 Crecimiento lento"
    else:
        return "🔴 Decreciendo"


def _calculate_upside(current, target) -> str:
    if not current or not target:
        return "N/A"
    upside = ((target - current) / current) * 100
    if upside > 0:
        return f"📈 +{upside:.1f}% de potencial alcista"
    else:
        return f"📉 {upside:.1f}% de potencial bajista"


def _evaluate_rsi(rsi) -> str:
    if rsi is None:
        return ""
    if rsi >= 70:
        return "🔴 SOBRECOMPRADO - Posible corrección pronto"
    elif rsi >= 60:
        return "🟠 Zona alta - Cautela"
    elif rsi >= 40:
        return "🟢 Zona neutral - Normal"
    elif rsi >= 30:
        return "🟠 Zona baja - Posible oportunidad"
    else:
        return "🟢 SOBREVENDIDO - Posible rebote pronto"


def _evaluate_macd(macd, signal) -> str:
    if macd is None or signal is None:
        return ""
    if macd > signal:
        return "🟢 MACD por encima de señal (momentum alcista)"
    else:
        return "🔴 MACD por debajo de señal (momentum bajista)"


def _evaluate_stochastic(stoch) -> str:
    if stoch is None:
        return ""
    if stoch >= 80:
        return "🔴 Sobrecomprado"
    elif stoch <= 20:
        return "🟢 Sobrevendido"
    else:
        return "🟡 Neutral"


def _evaluate_adx(adx) -> str:
    if adx is None:
        return ""
    if adx >= 50:
        return "💪 Tendencia MUY fuerte"
    elif adx >= 25:
        return "📈 Tendencia fuerte"
    elif adx >= 20:
        return "➡️ Tendencia débil"
    else:
        return "😴 Sin tendencia clara (mercado lateral)"


def _explain_price_vs_ma(position, ma_name, timeframe) -> str:
    if position == "ABOVE":
        return f"Precio por encima de {ma_name} (tendencia alcista en {timeframe})"
    else:
        return f"Precio por debajo de {ma_name} (tendencia bajista en {timeframe})"


def _explain_cross(cross) -> str:
    if cross == "GOLDEN":
        return "🟢 Golden Cross: SMA 50 > SMA 200 (señal alcista de largo plazo)"
    else:
        return "🔴 Death Cross: SMA 50 < SMA 200 (señal bajista de largo plazo)"


def _get_bb_position(price, lower, middle, upper) -> str:
    if not all([price, lower, middle, upper]):
        return "N/A"
    if price >= upper:
        return "🔴 Por encima de banda superior (sobrecomprado)"
    elif price >= middle:
        return "🟢 Entre media y banda superior (alcista)"
    elif price >= lower:
        return "🟠 Entre banda inferior y media (bajista)"
    else:
        return "🟢 Por debajo de banda inferior (sobrevendido, posible rebote)"


def _explain_confluence(confluence) -> str:
    if not confluence:
        return ""
    bullish = confluence.get('bullish_timeframes', 0)
    bearish = confluence.get('bearish_timeframes', 0)
    
    if bullish >= 3:
        return "🟢 Fuerte confluencia alcista (múltiples timeframes confirman subida)"
    elif bearish >= 3:
        return "🔴 Fuerte confluencia bajista (múltiples timeframes confirman bajada)"
    elif bullish > bearish:
        return "🟡 Confluencia ligeramente alcista"
    elif bearish > bullish:
        return "🟡 Confluencia ligeramente bajista"
    else:
        return "😐 Sin confluencia clara (señales mixtas)"


def _explain_iv(iv) -> str:
    if iv is None or iv == "N/A":
        return ""
    try:
        iv_val = float(str(iv).replace('%', ''))
        if iv_val >= 80:
            return "🔴 MUY ALTA - El mercado espera movimientos grandes"
        elif iv_val >= 50:
            return "🟠 Alta - Expectativa de volatilidad"
        elif iv_val >= 30:
            return "🟡 Normal"
        else:
            return "🟢 Baja - Mercado tranquilo"
    except:
        return ""


def _explain_unusual_activity(count) -> str:
    if count >= 5:
        return "🚨 MUCHA actividad inusual - Los profesionales están posicionándose"
    elif count >= 2:
        return "⚠️ Actividad inusual detectada"
    else:
        return "Normal"


def _format_unusual_moves(moves) -> str:
    if not moves:
        return "   Sin actividad inusual significativa"
    result = ""
    for m in moves[:3]:
        move_type = "📈 CALL" if m.get('type') == 'CALL' else "📉 PUT"
        result += f"   • {move_type} Strike ${m.get('strike', 'N/A')} | Vol: {m.get('volume', 0):,} | Ratio: {m.get('ratio', 'N/A')}x\n"
    return result


def _explain_beta(beta) -> str:
    if beta is None:
        return ""
    if beta >= 2:
        return "🔴 MUY VOLÁTIL - Se mueve el doble que el mercado"
    elif beta >= 1.5:
        return "🟠 Volátil - Se mueve 50% más que el mercado"
    elif beta >= 1.1:
        return "🟡 Ligeramente más volátil que el mercado"
    elif beta >= 0.9:
        return "🟢 Similar al mercado"
    elif beta >= 0.5:
        return "🟢 Menos volátil que el mercado (defensivo)"
    else:
        return "🟢 MUY defensivo - Casi no se mueve con el mercado"


def _evaluate_short_interest(short_pct) -> str:
    if short_pct is None:
        return ""
    pct = short_pct * 100 if abs(short_pct) < 1 else short_pct
    if pct >= 20:
        return "🔴 MUY ALTO - Muchos apuestan a la baja (posible short squeeze)"
    elif pct >= 10:
        return "🟠 Alto - Escepticismo significativo"
    elif pct >= 5:
        return "🟡 Moderado"
    else:
        return "🟢 Bajo"


def _expense_to_dollars(expense) -> str:
    if expense is None:
        return "N/A"
    try:
        if abs(expense) < 1:
            return f"{expense * 10000:.0f}"
        return f"{expense * 100:.0f}"
    except:
        return "N/A"


def _evaluate_expense_ratio(expense) -> str:
    if expense is None:
        return ""
    exp_pct = expense * 100 if abs(expense) < 1 else expense
    if exp_pct <= 0.1:
        return "🟢 Muy bajo (excelente)"
    elif exp_pct <= 0.3:
        return "🟢 Bajo (bueno)"
    elif exp_pct <= 0.5:
        return "🟡 Moderado"
    elif exp_pct <= 1:
        return "🟠 Alto"
    else:
        return "🔴 Muy alto (caro)"


def _evaluate_etf_size(assets) -> str:
    if assets is None:
        return ""
    if assets >= 10_000_000_000:
        return "🟢 ETF grande y líquido (fácil de comprar/vender)"
    elif assets >= 1_000_000_000:
        return "🟢 ETF mediano con buena liquidez"
    elif assets >= 100_000_000:
        return "🟡 ETF pequeño"
    else:
        return "🔴 ETF muy pequeño (posibles problemas de liquidez)"


def _yield_to_annual(yield_pct) -> str:
    if yield_pct is None:
        return "0"
    try:
        if abs(yield_pct) < 1:
            return f"{yield_pct * 10000:.0f}"
        return f"{yield_pct * 100:.0f}"
    except:
        return "0"


def _calculate_top10_concentration(holdings) -> float:
    if not holdings:
        return 0
    return sum(h.get('weight', 0) for h in holdings[:10])


def _evaluate_concentration(concentration) -> str:
    if concentration >= 70:
        return "🔴 MUY concentrado (alto riesgo si las top 10 caen)"
    elif concentration >= 50:
        return "🟠 Moderadamente concentrado"
    elif concentration >= 30:
        return "🟡 Diversificación moderada"
    else:
        return "🟢 Bien diversificado"