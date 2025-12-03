import type { TechnicalAnalysis, MultiTimeframe } from './types';
import { MetricCard, MetricRow, SectionCard } from './MetricCard';
import { formatDecimal, formatPrice, getRSIStatus, getRecommendationStyle } from './helpers';

interface TechnicalTabProps {
  data: TechnicalAnalysis;
  multiTimeframe?: MultiTimeframe;
}

export function TechnicalTab({ data, multiTimeframe }: TechnicalTabProps) {
  const { summary, oscillators, moving_averages, indicators } = data;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {data.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">⚠️ {data.error}</p>
        </div>
      )}

      {/* Exchange & Interval Info */}
      {(data.exchange || data.interval) && (
        <div className="flex gap-4 text-sm text-gray-500">
          {data.exchange && <span>📍 Exchange: <strong>{data.exchange}</strong></span>}
          {data.interval && <span>⏱️ Intervalo: <strong>{data.interval}</strong></span>}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Resumen Técnico
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm text-gray-500 mb-2">Recomendación General</p>
              <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${getRecommendationStyle(summary.recommendation).bg} ${getRecommendationStyle(summary.recommendation).text}`}>
                {getRecommendationStyle(summary.recommendation).label}
              </span>
            </div>
            <div className="flex gap-4">
              <SignalBox label="Compra" value={summary.buy_signals} color="green" />
              <SignalBox label="Venta" value={summary.sell_signals} color="red" />
              <SignalBox label="Neutral" value={summary.neutral_signals} color="yellow" />
            </div>
          </div>
          {/* Signal Bar */}
          <div className="mt-4">
            <SignalBar 
              buy={summary.buy_signals || 0} 
              sell={summary.sell_signals || 0} 
              neutral={summary.neutral_signals || 0} 
            />
          </div>
        </div>
      )}

      {/* Multi-Timeframe Analysis */}
      {multiTimeframe?.timeframes && Object.keys(multiTimeframe.timeframes).length > 0 && (
        <SectionCard title="Análisis Multi-Timeframe" icon="⏰">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Timeframe</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Señal</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Compra</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Venta</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600">Neutral</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">RSI</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">MACD</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(multiTimeframe.timeframes).map(([tf, tfData]) => {
                  const rsiStatus = getRSIStatus(tfData.rsi);
                  const recStyle = getRecommendationStyle(tfData.recommendation);
                  return (
                    <tr key={tf} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-800">{formatTimeframe(tf)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${recStyle.bg} ${recStyle.text}`}>
                          {recStyle.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-green-600 font-medium">{tfData.buy ?? '-'}</td>
                      <td className="py-3 px-3 text-center text-red-600 font-medium">{tfData.sell ?? '-'}</td>
                      <td className="py-3 px-3 text-center text-yellow-600 font-medium">{tfData.neutral ?? '-'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={rsiStatus.color}>{formatDecimal(tfData.rsi)}</span>
                      </td>
                      <td className={`py-3 px-3 text-right ${(tfData.macd ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatDecimal(tfData.macd)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oscillators */}
        {oscillators && (
          <SectionCard title="Osciladores" icon="📈">
            <div className="space-y-4">
              {/* Oscillator Recommendation */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Señal</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationStyle(oscillators.recommendation).bg} ${getRecommendationStyle(oscillators.recommendation).text}`}>
                  {getRecommendationStyle(oscillators.recommendation).label}
                </span>
              </div>
              
              {/* Signal counts */}
              <div className="flex gap-2 text-sm pb-3 border-b border-gray-100">
                <span className="text-green-600">✓ {oscillators.buy ?? 0} Compra</span>
                <span className="text-red-600">✗ {oscillators.sell ?? 0} Venta</span>
                <span className="text-yellow-600">○ {oscillators.neutral ?? 0} Neutral</span>
              </div>

              {/* RSI with visual indicator */}
              {oscillators.rsi != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">RSI (14)</span>
                    <span className={getRSIStatus(oscillators.rsi).color}>
                      {formatDecimal(oscillators.rsi)} - {getRSIStatus(oscillators.rsi).text}
                    </span>
                  </div>
                  <RSIBar value={oscillators.rsi} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <MetricRow label="Stoch %K" value={formatDecimal(oscillators.stoch_k)} />
                <MetricRow label="Stoch %D" value={formatDecimal(oscillators.stoch_d)} />
                <MetricRow label="CCI (20)" value={formatDecimal(oscillators.cci)} />
                <MetricRow label="ADX (14)" value={formatDecimal(oscillators.adx)} />
                <MetricRow label="MACD" value={formatDecimal(oscillators.macd)} colorClass={(oscillators.macd ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'} />
                <MetricRow label="MACD Signal" value={formatDecimal(oscillators.macd_signal)} />
                <MetricRow label="Momentum" value={formatDecimal(oscillators.momentum)} colorClass={(oscillators.momentum ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'} />
                <MetricRow label="Williams %R" value={formatDecimal(oscillators.williams_r)} />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Moving Averages */}
        {moving_averages && (
          <SectionCard title="Medias Móviles" icon="📉">
            <div className="space-y-4">
              {/* MA Recommendation */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Señal</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationStyle(moving_averages.recommendation).bg} ${getRecommendationStyle(moving_averages.recommendation).text}`}>
                  {getRecommendationStyle(moving_averages.recommendation).label}
                </span>
              </div>

              {/* Signal counts */}
              <div className="flex gap-2 text-sm pb-3 border-b border-gray-100">
                <span className="text-green-600">✓ {moving_averages.buy ?? 0} Compra</span>
                <span className="text-red-600">✗ {moving_averages.sell ?? 0} Venta</span>
                <span className="text-yellow-600">○ {moving_averages.neutral ?? 0} Neutral</span>
              </div>

              {/* EMA */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">EMA (Exponencial)</p>
                <div className="grid grid-cols-2 gap-2">
                  <MetricRow label="EMA 10" value={formatPrice(moving_averages.ema_10)} />
                  <MetricRow label="EMA 20" value={formatPrice(moving_averages.ema_20)} />
                  <MetricRow label="EMA 50" value={formatPrice(moving_averages.ema_50)} />
                  <MetricRow label="EMA 100" value={formatPrice(moving_averages.ema_100)} />
                  <MetricRow label="EMA 200" value={formatPrice(moving_averages.ema_200)} />
                </div>
              </div>

              {/* SMA */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">SMA (Simple)</p>
                <div className="grid grid-cols-2 gap-2">
                  <MetricRow label="SMA 10" value={formatPrice(moving_averages.sma_10)} />
                  <MetricRow label="SMA 20" value={formatPrice(moving_averages.sma_20)} />
                  <MetricRow label="SMA 50" value={formatPrice(moving_averages.sma_50)} />
                  <MetricRow label="SMA 100" value={formatPrice(moving_averages.sma_100)} />
                  <MetricRow label="SMA 200" value={formatPrice(moving_averages.sma_200)} />
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Technical Indicators */}
      {indicators && (
        <SectionCard title="Indicadores Técnicos" icon="🎯">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Bollinger Superior" 
              value={formatPrice(indicators.bb_upper)} 
              icon="📈"
              tooltip="Banda superior de Bollinger"
            />
            <MetricCard 
              label="Bollinger Inferior" 
              value={formatPrice(indicators.bb_lower)} 
              icon="📉"
              tooltip="Banda inferior de Bollinger"
            />
            <MetricCard 
              label="Pivot R1" 
              value={formatPrice(indicators.pivot_r1)} 
              colorClass="text-green-600"
              tooltip="Primera resistencia pivot"
            />
            <MetricCard 
              label="Pivot S1" 
              value={formatPrice(indicators.pivot_s1)} 
              colorClass="text-red-600"
              tooltip="Primer soporte pivot"
            />
            <MetricCard 
              label="Pivot R2" 
              value={formatPrice(indicators.pivot_r2)} 
              colorClass="text-green-600"
              tooltip="Segunda resistencia pivot"
            />
            <MetricCard 
              label="Pivot S2" 
              value={formatPrice(indicators.pivot_s2)} 
              colorClass="text-red-600"
              tooltip="Segundo soporte pivot"
            />
            {indicators.atr != null && (
              <MetricCard 
                label="ATR" 
                value={formatDecimal(indicators.atr)} 
                tooltip="Average True Range - Volatilidad"
              />
            )}
            {indicators.bb_middle != null && (
              <MetricCard 
                label="Bollinger Media" 
                value={formatPrice(indicators.bb_middle)} 
                tooltip="Banda media de Bollinger (SMA 20)"
              />
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// Sub-components

function SignalBox({ label, value, color }: { label: string; value?: number; color: 'green' | 'red' | 'yellow' }) {
  const colors = {
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };
  
  return (
    <div className={`px-4 py-3 rounded-lg border ${colors[color]} text-center min-w-[80px]`}>
      <p className="text-2xl font-bold">{value ?? 0}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

function SignalBar({ buy, sell, neutral }: { buy: number; sell: number; neutral: number }) {
  const total = buy + sell + neutral;
  if (total === 0) return null;
  
  const buyPercent = (buy / total) * 100;
  const sellPercent = (sell / total) * 100;
  const neutralPercent = (neutral / total) * 100;

  return (
    <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200">
      <div className="bg-green-500 h-full transition-all" style={{ width: `${buyPercent}%` }} />
      <div className="bg-yellow-400 h-full transition-all" style={{ width: `${neutralPercent}%` }} />
      <div className="bg-red-500 h-full transition-all" style={{ width: `${sellPercent}%` }} />
    </div>
  );
}

function RSIBar({ value }: { value: number }) {
  return (
    <div className="relative w-full h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full">
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow"
        style={{ left: `${Math.min(Math.max(value, 0), 100)}%`, transform: 'translate(-50%, -50%)' }}
      />
      {/* Labels */}
      <div className="absolute -bottom-4 left-0 text-xs text-gray-400">0</div>
      <div className="absolute -bottom-4 left-[30%] text-xs text-gray-400">30</div>
      <div className="absolute -bottom-4 left-[70%] text-xs text-gray-400">70</div>
      <div className="absolute -bottom-4 right-0 text-xs text-gray-400">100</div>
    </div>
  );
}

function formatTimeframe(tf: string): string {
  const map: Record<string, string> = {
    '1m': '1 Minuto',
    '5m': '5 Minutos',
    '15m': '15 Minutos',
    '30m': '30 Minutos',
    '1h': '1 Hora',
    '4h': '4 Horas',
    '1d': '1 Día',
    '1D': '1 Día',
    '1w': '1 Semana',
    '1W': '1 Semana',
    '1M': '1 Mes',
  };
  return map[tf] || tf;
}