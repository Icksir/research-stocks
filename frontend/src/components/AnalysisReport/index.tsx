import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { 
  InstrumentDataResponse, 
  StockDataResponse, 
  ETFDataResponse,
  ETFHoldings,
  ETFSectorAllocation
} from '../../api';
import type { TabType, ETFTabType } from './types';
import { TechnicalTab } from './TechnicalTab';
import { FinancialsTab } from './FinancialsTab';
import { OptionsTab } from './OptionsTab';
import { ETFInfoTab } from './ETFInfoTab';
import { NewsTab } from './NewsTab';

import { formatNumber, formatLargeNumber } from './helpers';

interface AnalysisReportProps {
  data: InstrumentDataResponse;
  analysis?: string;
}

export function AnalysisReport({ data, analysis }: AnalysisReportProps) {
  const isETF = data.instrument_type === 'ETF';
  
  if (isETF) {
    return <ETFAnalysisReport data={data as ETFDataResponse} analysis={analysis} />;
  }
  
  return <StockAnalysisReport data={data as StockDataResponse} analysis={analysis} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STOCK ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════════════════════

interface StockAnalysisReportProps {
  data: StockDataResponse;
  analysis?: string;
}

function StockAnalysisReport({ data, analysis }: StockAnalysisReportProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const { ticker } = data;
  const { info, financial_metrics, technical_analysis, multi_timeframe, options_volatility, news } = data.data;
  
  const price = options_volatility?.price ?? info?.price;
  const analysisContent = analysis || news?.summary;
  const hasNews = news && (news.summary || (news.articles && news.articles.length > 0));

  const tabs: Array<{ id: TabType; label: string; show: boolean }> = [
    { id: 'analysis' as TabType, label: '🤖 Análisis IA', show: !!analysisContent },
    { id: 'news' as TabType, label: '📰 Noticias', show: !!hasNews },
    { id: 'technical' as TabType, label: '📊 Técnico', show: !!technical_analysis },
    { id: 'financials' as TabType, label: '💰 Fundamentales', show: !!financial_metrics },
    { id: 'options' as TabType, label: '📋 Opciones', show: !!options_volatility },
  ].filter(tab => tab.show);

  if (tabs.length === 0) {
    tabs.push({ id: 'analysis', label: '🤖 Análisis IA', show: true });
  }

  const currentTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id || 'analysis';

  return (
    <div className="w-full mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header - Stock */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{ticker}</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500">
                📈 Stock
              </span>
            </div>
            {info?.name && (
              <p className="text-blue-100 mt-1">{info.name}</p>
            )}
            {info?.sector && (
              <p className="text-blue-200 text-sm">
                {info.sector}
                {info?.industry && ` • ${info.industry}`}
                {info?.country && ` • ${info.country}`}
              </p>
            )}
          </div>
          <div className="text-right">
            {price && (
              <>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
                {info?.previous_close && (
                  <p className={`text-sm ${price >= info.previous_close ? 'text-green-300' : 'text-red-300'}`}>
                    {price >= info.previous_close ? '▲' : '▼'} 
                    {' '}{((price - info.previous_close) / info.previous_close * 100).toFixed(2)}% 
                    {' '}(${(price - info.previous_close).toFixed(2)})
                  </p>
                )}
                {info?.day_high && info?.day_low && (
                  <p className="text-xs text-blue-200 mt-1">
                    Rango: ${info.day_low.toFixed(2)} - ${info.day_high.toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stock Quick Stats */}
        {info && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-4 border-t border-blue-500/30">
            <QuickStatItem label="Vol" value={formatNumber(info.volume)} />
            <QuickStatItem label="Avg Vol" value={formatNumber(info.avg_volume)} />
            <QuickStatItem label="Market Cap" value={formatLargeNumber(info.market_cap)} />
            <QuickStatItem label="52W High" value={info.fifty_two_week_high ? `$${info.fifty_two_week_high.toFixed(2)}` : 'N/A'} />
            <QuickStatItem label="52W Low" value={info.fifty_two_week_low ? `$${info.fifty_two_week_low.toFixed(2)}` : 'N/A'} />
            <QuickStatItem label="Beta" value={info.beta?.toFixed(2)} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                currentTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {currentTab === 'analysis' && (
          <div className="prose prose-lg max-w-none">
            {analysisContent ? (
              <ReactMarkdown>{analysisContent}</ReactMarkdown>
            ) : (
              <EmptyState icon="📰" message="No hay análisis disponible para este ticker." />
            )}
          </div>
        )}

        {currentTab === 'news' && news && (
          <NewsTab data={news} />
        )}

        {currentTab === 'technical' && technical_analysis && (
          <TechnicalTab data={technical_analysis} multiTimeframe={multi_timeframe} />
        )}

        {currentTab === 'financials' && financial_metrics && (
          <FinancialsTab data={financial_metrics} info={info} />
        )}

        {currentTab === 'options' && options_volatility && (
          <OptionsTab data={options_volatility} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETF ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════════════════════

interface ETFAnalysisReportProps {
  data: ETFDataResponse;
  analysis?: string;
}

function ETFAnalysisReport({ data, analysis }: ETFAnalysisReportProps) {
  const [activeTab, setActiveTab] = useState<ETFTabType>('analysis');
  const { ticker } = data;
  const { info, holdings, sector_allocation, options_volatility, news } = data.data;
  
  const price = options_volatility?.price ?? info?.price;
  const analysisContent = analysis || news?.summary;
  const hasNews = news && (news.summary || (news.articles && news.articles.length > 0));

  const tabs: Array<{ id: ETFTabType; label: string; show: boolean }> = [
    { id: 'analysis' as ETFTabType, label: '🤖 Análisis IA', show: !!analysisContent },
    { id: 'news' as ETFTabType, label: '📰 Noticias', show: !!hasNews },
    { id: 'etf-info' as ETFTabType, label: '📊 Info ETF', show: !!info },
    { id: 'holdings' as ETFTabType, label: '🏆 Holdings', show: !!holdings?.holdings?.length },
    { id: 'sectors' as ETFTabType, label: '🏭 Sectores', show: !!sector_allocation?.sectors },
    { id: 'options' as ETFTabType, label: '📋 Opciones', show: !!options_volatility },
  ].filter(tab => tab.show);

  if (tabs.length === 0) {
    tabs.push({ id: 'analysis', label: '🤖 Análisis IA', show: true });
  }

  const currentTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id || 'analysis';

  return (
    <div className="w-full mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header - ETF */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{ticker}</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-400">
                📊 ETF
              </span>
            </div>
            {info?.name && (
              <p className="text-purple-100 mt-1">{info.name}</p>
            )}
            {(info?.category || info?.fund_family) && (
              <p className="text-purple-200 text-sm">
                {info.category}
                {info?.fund_family && ` • ${info.fund_family}`}
              </p>
            )}
          </div>
          <div className="text-right">
            {price && (
              <>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
                {info?.previous_close && (
                  <p className={`text-sm ${price >= info.previous_close ? 'text-green-300' : 'text-red-300'}`}>
                    {price >= info.previous_close ? '▲' : '▼'} 
                    {' '}{((price - info.previous_close) / info.previous_close * 100).toFixed(2)}% 
                    {' '}(${(price - info.previous_close).toFixed(2)})
                  </p>
                )}
                {info?.nav_price && (
                  <p className="text-xs text-purple-200 mt-1">
                    NAV: ${info.nav_price.toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ETF Quick Stats */}
        {info && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-4 border-t border-purple-500/30">
            <QuickStatItem label="Vol" value={formatNumber(info.volume)} />
            <QuickStatItem label="Avg Vol" value={formatNumber(info.avg_volume)} />
            <QuickStatItem label="AUM" value={formatLargeNumber(info.total_assets)} />
            <QuickStatItem 
              label="Expense Ratio" 
              value={info.expense_ratio != null ? `${(info.expense_ratio * 100).toFixed(2)}%` : 'N/A'} 
            />
            <QuickStatItem 
              label="Yield" 
              value={info.dividend_yield_percent != null ? `${info.dividend_yield_percent.toFixed(2)}%` : 'N/A'} 
            />
            <QuickStatItem 
              label="YTD" 
              value={info.ytd_return != null ? `${info.ytd_return.toFixed(2)}%` : 'N/A'}
              colorClass={info.ytd_return != null ? (info.ytd_return >= 0 ? 'text-green-300' : 'text-red-300') : ''}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                currentTab === tab.id
                  ? 'border-purple-600 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {currentTab === 'analysis' && (
          <div className="prose prose-lg max-w-none">
            {analysisContent ? (
              <ReactMarkdown>{analysisContent}</ReactMarkdown>
            ) : (
              <EmptyState icon="📰" message="No hay análisis disponible para este ETF." />
            )}
          </div>
        )}

        {currentTab === 'news' && news && (
          <NewsTab data={news} />
        )}

        {currentTab === 'etf-info' && info && (
          <ETFInfoTab info={info} holdings={holdings} sectorAllocation={sector_allocation} />
        )}

        {currentTab === 'holdings' && holdings && (
          <HoldingsTab holdings={holdings} />
        )}

        {currentTab === 'sectors' && sector_allocation && (
          <SectorsTab sectorAllocation={sector_allocation} />
        )}

        {currentTab === 'options' && options_volatility && (
          <OptionsTab data={options_volatility} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface QuickStatItemProps {
  label: string;
  value?: string | null;
  colorClass?: string;
}

function QuickStatItem({ label, value, colorClass = '' }: QuickStatItemProps) {
  return (
    <div className="text-center">
      <p className="text-blue-200 text-xs uppercase tracking-wide">{label}</p>
      <p className={`font-semibold ${colorClass || 'text-white'}`}>{value ?? 'N/A'}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  message: string;
}

function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500">
      <span className="text-4xl block mb-3">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ETF SPECIFIC TABS
// ═══════════════════════════════════════════════════════════════════════════════

interface HoldingsTabProps {
  holdings: ETFHoldings;
}

function HoldingsTab({ holdings }: HoldingsTabProps) {
  if (!holdings.holdings || holdings.holdings.length === 0) {
    return <EmptyState icon="📭" message="No hay información de holdings disponible." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <p className="text-purple-800">
          <strong>Total Holdings mostrados:</strong> {holdings.total_holdings_fetched || holdings.holdings.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Símbolo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Peso</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 w-64">Distribución</th>
            </tr>
          </thead>
          <tbody>
            {holdings.holdings.map((holding, idx) => (
              <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-gray-400 font-medium">{idx + 1}</td>
                <td className="py-4 px-4">
                  <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {holding.symbol}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-700">{holding.name}</td>
                <td className="py-4 px-4 text-right font-bold text-gray-800">
                  {holding.weight.toFixed(2)}%
                </td>
                <td className="py-4 px-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(holding.weight * 10, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SectorsTabProps {
  sectorAllocation: ETFSectorAllocation;
}

function SectorsTab({ sectorAllocation }: SectorsTabProps) {
  if (!sectorAllocation.sectors || Object.keys(sectorAllocation.sectors).length === 0) {
    return <EmptyState icon="🏭" message="No hay información de sectores disponible." />;
  }

  const sortedSectors = Object.entries(sectorAllocation.sectors).sort(([, a], [, b]) => b - a);
  const total = sortedSectors.reduce((sum, [, val]) => sum + val, 0);

  const sectorColors: Record<string, { bg: string; bar: string }> = {
    'Technology': { bg: 'bg-blue-50', bar: 'bg-blue-500' },
    'Healthcare': { bg: 'bg-green-50', bar: 'bg-green-500' },
    'Financial Services': { bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
    'Consumer Cyclical': { bg: 'bg-purple-50', bar: 'bg-purple-500' },
    'Communication Services': { bg: 'bg-pink-50', bar: 'bg-pink-500' },
    'Industrials': { bg: 'bg-gray-50', bar: 'bg-gray-500' },
    'Consumer Defensive': { bg: 'bg-orange-50', bar: 'bg-orange-500' },
    'Energy': { bg: 'bg-red-50', bar: 'bg-red-500' },
    'Utilities': { bg: 'bg-cyan-50', bar: 'bg-cyan-500' },
    'Basic Materials': { bg: 'bg-amber-50', bar: 'bg-amber-500' },
    'Realestate': { bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
    'Real Estate': { bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-indigo-800">
          <strong>Total de sectores:</strong> {sortedSectors.length} | 
          <strong className="ml-2">Cobertura:</strong> {total.toFixed(1)}%
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector List */}
        <div className="space-y-3">
          {sortedSectors.map(([sector, weight]) => {
            const colors = sectorColors[sector] || { bg: 'bg-indigo-50', bar: 'bg-indigo-500' };
            return (
              <div 
                key={sector} 
                className={`${colors.bg} rounded-lg p-4 border transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{sector}</span>
                  <span className="font-bold text-lg">{weight.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colors.bar} h-2 rounded-full transition-all`}
                    style={{ width: `${weight}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <SectorPieChart sectors={sectorAllocation.sectors} />
        </div>
      </div>
    </div>
  );
}

// Pie Chart Component
function SectorPieChart({ sectors }: { sectors: Record<string, number> }) {
  const sortedSectors = Object.entries(sectors).sort(([, a], [, b]) => b - a);
  const total = sortedSectors.reduce((sum, [, val]) => sum + val, 0);
  
  let cumulativePercent = 0;
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
    '#6B7280', '#F97316', '#EF4444', '#06B6D4', '#D97706',
    '#059669'
  ];

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-64 h-64">
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
          
          return (
            <path
              key={sector}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[idx % colors.length]}
              stroke="white"
              strokeWidth="1"
              className="transition-opacity hover:opacity-80 cursor-pointer"
            >
              <title>{sector}: {value.toFixed(2)}%</title>
            </path>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-inner">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-800">{sortedSectors.length}</span>
            <p className="text-xs text-gray-500">Sectores</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisReport;