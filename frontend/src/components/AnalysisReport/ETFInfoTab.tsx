import type { ETFInfo, ETFHoldings, ETFSectorAllocation } from '../../api';
import { MetricCard, SectionCard } from './MetricCard';
import { formatLargeNumber, formatPercent, formatDecimal, formatPrice } from './helpers';

interface ETFInfoTabProps {
  info: ETFInfo;
  holdings?: ETFHoldings;
  sectorAllocation?: ETFSectorAllocation;
}

export function ETFInfoTab({ info, holdings, sectorAllocation }: ETFInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* ETF Description */}
      {info?.description && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <span>📊</span> Acerca del ETF
          </h3>
          <p className="text-sm text-purple-900 leading-relaxed">{info.description}</p>
        </div>
      )}

      {/* ETF Basic Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏛️</span> Información del Fondo
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {info.category && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500 uppercase">Categoría</p>
              <p className="font-semibold text-gray-800">{info.category}</p>
            </div>
          )}
          {info.fund_family && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500 uppercase">Familia</p>
              <p className="font-semibold text-gray-800">{info.fund_family}</p>
            </div>
          )}
          {info.legal_type && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500 uppercase">Tipo Legal</p>
              <p className="font-semibold text-gray-800">{info.legal_type}</p>
            </div>
          )}
          {info.expense_ratio != null && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500 uppercase">Expense Ratio</p>
              <p className={`font-semibold ${info.expense_ratio <= 0.1 ? 'text-green-600' : info.expense_ratio <= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatPercent(info.expense_ratio, true)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Returns */}
        <SectionCard title="Rendimientos" icon="📈">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="YTD Return" 
              value={info.ytd_return != null ? formatPercent(info.ytd_return, true) : 'N/A'}
              colorClass={info.ytd_return != null ? (info.ytd_return >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}
              tooltip="Rendimiento en lo que va del año"
            />
            <MetricCard 
              label="3 Meses" 
              value={info.trailing_three_month_returns != null ? formatPercent(info.trailing_three_month_returns, true) : 'N/A'}
              colorClass={info.trailing_three_month_returns != null ? (info.trailing_three_month_returns >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}
              tooltip="Rendimiento últimos 3 meses"
            />
            <MetricCard 
              label="3 Años (anual)" 
              value={info.three_year_return != null ? formatPercent(info.three_year_return) : 'N/A'}
              colorClass={info.three_year_return != null ? (info.three_year_return >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}
              tooltip="Rendimiento anualizado a 3 años"
            />
            <MetricCard 
              label="5 Años (anual)" 
              value={info.five_year_return != null ? formatPercent(info.five_year_return) : 'N/A'}
              colorClass={info.five_year_return != null ? (info.five_year_return >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}
              tooltip="Rendimiento anualizado a 5 años"
            />
            <MetricCard 
              label="52 Semanas" 
              value={info.fifty_two_week_change_percent != null ? formatPercent(info.fifty_two_week_change_percent, true) : 'N/A'}
              colorClass={info.fifty_two_week_change_percent != null ? (info.fifty_two_week_change_percent >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}
              tooltip="Cambio porcentual en las últimas 52 semanas"
            />
          </div>
        </SectionCard>

        {/* Assets & Valuation */}
        <SectionCard title="Activos y Valoración" icon="💰">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="Total Assets" 
              value={formatLargeNumber(info.total_assets)}
              tooltip="Activos totales bajo gestión"
            />
            <MetricCard 
              label="Net Assets" 
              value={formatLargeNumber(info.net_assets)}
              tooltip="Activos netos"
            />
            <MetricCard 
              label="NAV" 
              value={info.nav_price != null ? formatPrice(info.nav_price) : 'N/A'}
              tooltip="Net Asset Value - Valor neto por acción"
            />
            <MetricCard 
              label="P/E Trailing" 
              value={info.trailing_pe != null ? formatDecimal(info.trailing_pe) : 'N/A'}
              tooltip="Price/Earnings del portafolio"
            />
            <MetricCard 
              label="P/B" 
              value={info.price_to_book != null ? formatDecimal(info.price_to_book) : 'N/A'}
              tooltip="Price to Book del portafolio"
            />
            <MetricCard 
              label="Beta" 
              value={info.beta != null ? formatDecimal(info.beta) : 'N/A'}
              tooltip="Volatilidad relativa al mercado"
            />
          </div>
        </SectionCard>

        {/* Dividends */}
        <SectionCard title="Dividendos" icon="💵">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="Dividend Yield" 
              value={info.dividend_yield_percent != null ? formatPercent(info.dividend_yield_percent, true) : 'N/A'}
              colorClass={info.dividend_yield_percent != null && info.dividend_yield_percent > 2 ? 'text-green-600' : 'text-gray-600'}
              tooltip="Rendimiento por dividendos anual"
            />
            <MetricCard 
              label="Dividendo Anual" 
              value={info.trailing_annual_dividend_rate != null ? formatPrice(info.trailing_annual_dividend_rate) : 'N/A'}
              tooltip="Dividendo anual por acción"
            />
          </div>
        </SectionCard>

        {/* Price Levels */}
        <SectionCard title="Niveles de Precio" icon="📊">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="52W High" 
              value={info.fifty_two_week_high != null ? formatPrice(info.fifty_two_week_high) : 'N/A'}
              tooltip="Máximo de 52 semanas"
            />
            <MetricCard 
              label="52W Low" 
              value={info.fifty_two_week_low != null ? formatPrice(info.fifty_two_week_low) : 'N/A'}
              tooltip="Mínimo de 52 semanas"
            />
            <MetricCard 
              label="SMA 50" 
              value={info.fifty_day_average != null ? formatPrice(info.fifty_day_average) : 'N/A'}
              tooltip="Media móvil de 50 días"
            />
            <MetricCard 
              label="SMA 200" 
              value={info.two_hundred_day_average != null ? formatPrice(info.two_hundred_day_average) : 'N/A'}
              tooltip="Media móvil de 200 días"
            />
          </div>
        </SectionCard>
      </div>

      {/* Top Holdings */}
      {holdings && holdings.holdings && holdings.holdings.length > 0 && (
        <SectionCard title={`Top Holdings (${holdings.total_holdings_fetched || holdings.holdings.length})`} icon="🏆">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">#</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Símbolo</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Peso</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 w-48">Distribución</th>
                </tr>
              </thead>
              <tbody>
                {holdings.holdings.map((holding, idx) => (
                  <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {holding.symbol}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{holding.name}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      {formatPercent(holding.weight, true)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(holding.weight * 10, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Sector Allocation */}
      {sectorAllocation && sectorAllocation.sectors && Object.keys(sectorAllocation.sectors).length > 0 && (
        <SectionCard title="Asignación por Sector" icon="🏭">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector List */}
            <div className="space-y-3">
              {Object.entries(sectorAllocation.sectors)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, weight]) => (
                  <div key={sector} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600 truncate" title={sector}>
                      {sector}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all ${getSectorColor(sector)}`}
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-medium text-gray-700">
                      {formatPercent(weight, true)}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Sector Chart (Simple pie representation) */}
            <div className="flex items-center justify-center">
              <SectorPieChart sectors={sectorAllocation.sectors} />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// Helper function for sector colors
function getSectorColor(sector: string): string {
  const colors: Record<string, string> = {
    'Technology': 'bg-blue-500',
    'Healthcare': 'bg-green-500',
    'Financial Services': 'bg-yellow-500',
    'Consumer Cyclical': 'bg-purple-500',
    'Communication Services': 'bg-pink-500',
    'Industrials': 'bg-gray-500',
    'Consumer Defensive': 'bg-orange-500',
    'Energy': 'bg-red-500',
    'Utilities': 'bg-cyan-500',
    'Basic Materials': 'bg-amber-500',
    'Realestate': 'bg-emerald-500',
    'Real Estate': 'bg-emerald-500',
  };
  return colors[sector] || 'bg-indigo-500';
}

// Simple Sector Pie Chart
function SectorPieChart({ sectors }: { sectors: Record<string, number> }) {
  const sortedSectors = Object.entries(sectors).sort(([, a], [, b]) => b - a);
  const total = sortedSectors.reduce((sum, [, val]) => sum + val, 0);
  
  let cumulativePercent = 0;
  
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-48 h-48">
        {sortedSectors.map(([sector, value], idx) => {
          const percent = (value / total) * 100;
          const startAngle = (cumulativePercent / 100) * 360;
          const endAngle = ((cumulativePercent + percent) / 100) * 360;
          cumulativePercent += percent;
          
          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = percent > 50 ? 1 : 0;
          
          const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
            '#6B7280', '#F97316', '#EF4444', '#06B6D4', '#D97706',
            '#059669'
          ];
          
          return (
            <path
              key={sector}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[idx % colors.length]}
              stroke="white"
              strokeWidth="1"
            >
              <title>{sector}: {formatPercent(value, true)}</title>
            </path>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-inner">
          <span className="text-xs text-gray-500 text-center">
            {sortedSectors.length}<br/>Sectores
          </span>
        </div>
      </div>
    </div>
  );
}
