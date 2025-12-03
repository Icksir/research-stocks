import type { FinancialMetrics, StockInfo } from './types';
import { MetricCard, SectionCard } from './MetricCard';
import { formatLargeNumber, formatPercent, formatDecimal, formatPrice, getRecommendationStyle, getValueStatus } from './helpers';

interface FinancialsTabProps {
  data: FinancialMetrics;
  info?: StockInfo;
}

export function FinancialsTab({ data, info }: FinancialsTabProps) {
  const { profitability, valuation, debt, dividends, growth, analyst } = data;

  return (
    <div className="space-y-6">
      {/* Company Description */}
      {info?.description && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span>🏢</span> Acerca de la Empresa
          </h3>
          <p className="text-sm text-blue-900 leading-relaxed">{info.description}</p>
        </div>
      )}

      {/* Analyst Recommendations */}
      {analyst && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span> Recomendación de Analistas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Main Recommendation */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <p className="text-sm text-gray-500 mb-2">Consenso</p>
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${getRecommendationStyle(analyst.recommendation_key).bg} ${getRecommendationStyle(analyst.recommendation_key).text}`}>
                  {getRecommendationStyle(analyst.recommendation_key).label}
                </span>
                {analyst.recommendation_mean && (
                  <p className="text-sm text-gray-500 mt-2">
                    Score: {formatDecimal(analyst.recommendation_mean)} / 5
                  </p>
                )}
                {analyst.number_of_analyst_opinions && (
                  <p className="text-xs text-gray-400 mt-1">
                    Basado en {analyst.number_of_analyst_opinions} analistas
                  </p>
                )}
              </div>
            </div>

            {/* Price Targets */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase mb-1">Precio Objetivo Alto</p>
              <p className="text-xl font-bold text-green-600">{formatPrice(analyst.target_high_price)}</p>
              {info?.price && analyst.target_high_price && (
                <p className="text-xs text-green-500">
                  +{formatPercent((analyst.target_high_price - info.price) / info.price)}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase mb-1">Precio Objetivo Medio</p>
              <p className="text-xl font-bold text-blue-600">{formatPrice(analyst.target_mean_price)}</p>
              {info?.price && analyst.target_mean_price && (
                <p className={`text-xs ${analyst.target_mean_price >= info.price ? 'text-green-500' : 'text-red-500'}`}>
                  {analyst.target_mean_price >= info.price ? '+' : ''}{formatPercent((analyst.target_mean_price - info.price) / info.price)}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase mb-1">Precio Objetivo Bajo</p>
              <p className="text-xl font-bold text-red-600">{formatPrice(analyst.target_low_price)}</p>
              {info?.price && analyst.target_low_price && (
                <p className="text-xs text-red-500">
                  {formatPercent((analyst.target_low_price - info.price) / info.price)}
                </p>
              )}
            </div>
          </div>

          {/* Price Target Bar */}
          {analyst.target_low_price && analyst.target_high_price && info?.price && (
            <PriceTargetBar 
              low={analyst.target_low_price}
              mean={analyst.target_mean_price}
              high={analyst.target_high_price}
              current={info.price}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability */}
        {profitability && (
          <SectionCard title="Rentabilidad" icon="💰">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="EPS (TTM)" 
                value={formatDecimal(profitability.eps_trailing)}
                colorClass={getValueStatus(profitability.eps_trailing, { good: 0, bad: -Infinity })}
                tooltip="Earnings Per Share - Ganancias por acción (últimos 12 meses)"
              />
              <MetricCard 
                label="EPS Forward" 
                value={formatDecimal(profitability.eps_forward)}
                colorClass={getValueStatus(profitability.eps_forward, { good: 0, bad: -Infinity })}
                tooltip="Ganancias por acción proyectadas"
              />
              <MetricCard 
                label="Margen Bruto" 
                value={formatPercent(profitability.gross_margin)}
                colorClass={getValueStatus(profitability.gross_margin, { good: 0.4, bad: 0.2 })}
                tooltip="Gross Margin - % de ingresos después del costo de bienes"
              />
              <MetricCard 
                label="Margen Operativo" 
                value={formatPercent(profitability.operating_margin)}
                colorClass={getValueStatus(profitability.operating_margin, { good: 0.15, bad: 0.05 })}
                tooltip="Operating Margin - % de ingresos después de gastos operativos"
              />
              <MetricCard 
                label="Margen Neto" 
                value={formatPercent(profitability.profit_margin)}
                colorClass={getValueStatus(profitability.profit_margin, { good: 0.1, bad: 0 })}
                tooltip="Net Profit Margin - % de ingresos que queda como ganancia"
              />
              <MetricCard 
                label="Margen EBITDA" 
                value={formatPercent(profitability.ebitda_margin)}
                tooltip="EBITDA Margin"
              />
              <MetricCard 
                label="ROE" 
                value={formatPercent(profitability.roe)}
                colorClass={getValueStatus(profitability.roe, { good: 0.15, bad: 0.05 })}
                tooltip="Return on Equity - Retorno sobre capital"
              />
              <MetricCard 
                label="ROA" 
                value={formatPercent(profitability.roa)}
                colorClass={getValueStatus(profitability.roa, { good: 0.05, bad: 0.02 })}
                tooltip="Return on Assets - Retorno sobre activos"
              />
            </div>
          </SectionCard>
        )}

        {/* Valuation */}
        {valuation && (
          <SectionCard title="Valoración" icon="📊">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="P/E (TTM)" 
                value={formatDecimal(valuation.pe_trailing)}
                colorClass={getValueStatus(valuation.pe_trailing, { good: 15, bad: 30, inverse: true })}
                tooltip="Price to Earnings - Precio/Ganancias (últimos 12 meses)"
              />
              <MetricCard 
                label="P/E Forward" 
                value={formatDecimal(valuation.pe_forward)}
                colorClass={getValueStatus(valuation.pe_forward, { good: 15, bad: 30, inverse: true })}
                tooltip="P/E proyectado"
              />
              <MetricCard 
                label="PEG Ratio" 
                value={valuation.peg_ratio != null ? formatDecimal(valuation.peg_ratio) : 'N/A'}
                colorClass={getValueStatus(valuation.peg_ratio, { good: 1, bad: 2, inverse: true })}
                tooltip="Price/Earnings to Growth - P/E ajustado por crecimiento"
              />
              <MetricCard 
                label="P/B" 
                value={formatDecimal(valuation.price_to_book)}
                tooltip="Price to Book - Precio/Valor en libros"
              />
              <MetricCard 
                label="P/S" 
                value={formatDecimal(valuation.price_to_sales)}
                tooltip="Price to Sales - Precio/Ventas"
              />
              <MetricCard 
                label="EV/EBITDA" 
                value={formatDecimal(valuation.ev_to_ebitda)}
                colorClass={getValueStatus(valuation.ev_to_ebitda, { good: 10, bad: 20, inverse: true })}
                tooltip="Enterprise Value / EBITDA"
              />
              <MetricCard 
                label="EV/Revenue" 
                value={formatDecimal(valuation.ev_to_revenue)}
                tooltip="Enterprise Value / Ingresos"
              />
            </div>
          </SectionCard>
        )}

        {/* Debt & Liquidity */}
        {debt && (
          <SectionCard title="Deuda y Liquidez" icon="🏦">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                  label="Deuda Total" 
                  value={formatLargeNumber(debt.total_debt)}
                  icon="💳"
                />
                <MetricCard 
                  label="Efectivo Total" 
                  value={formatLargeNumber(debt.total_cash)}
                  icon="💵"
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Ratios de Liquidez</h4>
                <div className="space-y-2">
                  <RatioBar 
                    label="Deuda/Equity" 
                    value={debt.debt_to_equity} 
                    max={200}
                    good={50}
                    bad={100}
                    inverse
                  />
                  <RatioBar 
                    label="Current Ratio" 
                    value={debt.current_ratio} 
                    max={3}
                    good={1.5}
                    bad={1}
                  />
                  <RatioBar 
                    label="Quick Ratio" 
                    value={debt.quick_ratio} 
                    max={3}
                    good={1}
                    bad={0.5}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Growth */}
        {growth && (
          <SectionCard title="Crecimiento" icon="📈">
            <div className="grid grid-cols-1 gap-4">
              <GrowthMetric 
                label="Crecimiento de Ingresos" 
                value={growth.revenue_growth}
                icon="💹"
              />
              <GrowthMetric 
                label="Crecimiento de Ganancias" 
                value={growth.earnings_growth}
                icon="📊"
              />
              <GrowthMetric 
                label="Crecimiento Trimestral" 
                value={growth.earnings_quarterly_growth}
                icon="📅"
              />
            </div>
          </SectionCard>
        )}

        {/* Dividends */}
        {dividends && (dividends.dividend_rate || dividends.dividend_yield) && (
          <SectionCard title="Dividendos" icon="💎">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                label="Dividendo Anual" 
                value={dividends.dividend_rate != null ? formatPrice(dividends.dividend_rate) : 'N/A'}
                icon="💰"
              />
              <MetricCard 
                label="Rendimiento" 
                value={dividends.dividend_yield != null ? formatPercent(dividends.dividend_yield) : 'N/A'}
                colorClass={getValueStatus(dividends.dividend_yield, { good: 0.03, bad: 0 })}
                icon="📊"
              />
              <MetricCard 
                label="Payout Ratio" 
                value={formatPercent(dividends.payout_ratio)}
                colorClass={getValueStatus(dividends.payout_ratio, { good: 0.6, bad: 0.8, inverse: true })}
                tooltip="% de ganancias pagadas como dividendos"
              />
              <MetricCard 
                label="Promedio 5 Años" 
                value={dividends.five_year_avg_dividend_yield != null ? formatPercent(dividends.five_year_avg_dividend_yield, true) : 'N/A'}
                tooltip="Rendimiento promedio de dividendos en 5 años"
              />
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// Sub-components

function PriceTargetBar({ low, mean, high, current }: { low: number; mean?: number; high: number; current: number }) {
  const range = high - low;
  const currentPos = Math.max(0, Math.min(100, ((current - low) / range) * 100));
  const meanPos = mean ? Math.max(0, Math.min(100, ((mean - low) / range) * 100)) : null;

  return (
    <div className="mt-6 pt-4 border-t border-purple-100">
      <p className="text-sm text-gray-600 mb-2">Precio actual vs Objetivos</p>
      <div className="relative h-4 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full">
        {/* Current Price Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg z-10"
          style={{ left: `${currentPos}%`, transform: 'translate(-50%, -50%)' }}
          title={`Precio actual: $${current.toFixed(2)}`}
        />
        {/* Mean Target Marker */}
        {meanPos !== null && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 border-2 border-white rounded-full shadow"
            style={{ left: `${meanPos}%`, transform: 'translate(-50%, -50%)' }}
            title={`Objetivo medio: $${mean?.toFixed(2)}`}
          />
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>${low.toFixed(2)}</span>
        <span className="text-blue-600 font-medium">Actual: ${current.toFixed(2)}</span>
        <span>${high.toFixed(2)}</span>
      </div>
    </div>
  );
}

function RatioBar({ label, value, max, good, bad, inverse }: { 
  label: string; 
  value?: number; 
  max: number;
  good: number;
  bad: number;
  inverse?: boolean;
}) {
  if (value == null) return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-400">N/A</span>
    </div>
  );

  const percent = Math.min((value / max) * 100, 100);
  let color = 'bg-yellow-400';
  
  if (inverse) {
    if (value <= good) color = 'bg-green-500';
    else if (value >= bad) color = 'bg-red-500';
  } else {
    if (value >= good) color = 'bg-green-500';
    else if (value <= bad) color = 'bg-red-500';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{formatDecimal(value)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function GrowthMetric({ label, value, icon }: { label: string; value?: number | null; icon: string }) {
  if (value == null) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <span className="text-gray-400">N/A</span>
      </div>
    );
  }

  const isPositive = value >= 0;
  const displayValue = formatPercent(value);

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {displayValue}
        </span>
      </div>
    </div>
  );
}