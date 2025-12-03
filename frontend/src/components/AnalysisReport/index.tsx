import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { BackendAnalysisResponse } from '../../api';
import type { TabType } from './types';
import { QuickStat } from './QuickStat';
import { TechnicalTab } from './TechnicalTab';
import { FinancialsTab } from './FinancialsTab';
import { OptionsTab } from './OptionsTab';
import { formatNumber, formatLargeNumber } from './helpers';

interface AnalysisReportProps {
  data: BackendAnalysisResponse;
}

export function AnalysisReport({ data }: AnalysisReportProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const { ticker, instrument_type, analysis, raw_data } = data;
  
  // Extraer datos de raw_data
  const info = raw_data?.info;
  const technicalAnalysis = raw_data?.technical_analysis;
  const multiTimeframe = raw_data?.multi_timeframe;
  const financialMetrics = raw_data?.financial_metrics;
  const optionsData = raw_data?.options; // La API devuelve 'options', no 'options_volatility'
  
  const price = optionsData?.price ?? info?.price;

  const tabs = [
    { id: 'analysis' as TabType, label: '🤖 Análisis IA', show: !!analysis },
    { id: 'technical' as TabType, label: '📊 Técnico', show: !!technicalAnalysis },
    { id: 'financials' as TabType, label: '💰 Fundamentales', show: !!financialMetrics },
    { id: 'options' as TabType, label: '📋 Opciones', show: !!optionsData },
  ].filter(tab => tab.show);

  // Si no hay tabs visibles, mostrar al menos el de análisis
  if (tabs.length === 0) {
    tabs.push({ id: 'analysis' as TabType, label: '🤖 Análisis IA', show: true });
  }

  // Si el tab activo no está disponible, cambiar al primero
  const currentTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id || 'analysis';

  return (
    <div className="w-full mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{ticker}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                instrument_type?.toUpperCase() === 'ETF' ? 'bg-purple-500' : 'bg-green-500'
              }`}>
                {instrument_type?.toUpperCase() === 'ETF' ? '📊 ETF' : '📈 Stock'}
              </span>
              {data.cached && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-yellow-900">
                  📦 Cached
                </span>
              )}
            </div>
            {info?.name && (
              <p className="text-blue-100 mt-1">{info.name}</p>
            )}
            {info?.sector && (
              <p className="text-blue-200 text-sm">{info.sector} • {info?.industry}</p>
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

        {/* Quick Stats */}
        {info && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-4 border-t border-blue-500/30">
            <QuickStat label="Vol" value={formatNumber(info.volume)} />
            <QuickStat label="Avg Vol" value={formatNumber(info.avg_volume)} />
            <QuickStat label="Market Cap" value={formatLargeNumber(info.market_cap)} />
            <QuickStat label="52W High" value={info.fifty_two_week_high ? `$${info.fifty_two_week_high.toFixed(2)}` : 'N/A'} />
            <QuickStat label="52W Low" value={info.fifty_two_week_low ? `$${info.fifty_two_week_low.toFixed(2)}` : 'N/A'} />
            <QuickStat label="Beta" value={info.beta?.toFixed(2)} />
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
            {analysis ? (
              <ReactMarkdown>{analysis}</ReactMarkdown>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-3">📰</span>
                <p>No hay análisis disponible para este ticker.</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'technical' && technicalAnalysis && (
          <TechnicalTab data={technicalAnalysis} multiTimeframe={multiTimeframe} />
        )}

        {currentTab === 'financials' && financialMetrics && (
          <FinancialsTab data={financialMetrics} info={info} />
        )}

        {currentTab === 'options' && optionsData && (
          <OptionsTab data={optionsData} />
        )}
      </div>
    </div>
  );
}