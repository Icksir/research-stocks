import { useState } from 'react';
import type { SentimentResponse } from '../types';
import { getSentiment } from '../api';

interface SentimentPanelProps {
  ticker: string;
}

export function SentimentPanel({ ticker }: SentimentPanelProps) {
  const [sentiment, setSentiment] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadSentiment = async () => {
    if (sentiment) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getSentiment(ticker);
      setSentiment(data);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sentiment');
    } finally {
      setLoading(false);
    }
  };

  const distribution = sentiment?.sentiment.distribution;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      <button
        onClick={loadSentiment}
        disabled={loading}
        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2">
          🗣️ Sentimiento de Redes Sociales
          {distribution && (
            <span className="text-sm text-gray-500">
              ({distribution.total} mensajes)
            </span>
          )}
        </span>
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span>{isExpanded ? '▲' : '▼'}</span>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isExpanded && sentiment && (
        <div className="mt-2 p-4 bg-white border rounded-lg">
          {/* Distribution */}
          {distribution && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Distribución del Sentimiento</h4>
              <div className="flex gap-4">
                <SentimentBar 
                  label="🐂 Bullish" 
                  count={distribution.bullish} 
                  total={distribution.total} 
                  color="bg-green-500" 
                />
                <SentimentBar 
                  label="🐻 Bearish" 
                  count={distribution.bearish} 
                  total={distribution.total} 
                  color="bg-red-500" 
                />
                <SentimentBar 
                  label="😐 Neutral" 
                  count={distribution.neutral} 
                  total={distribution.total} 
                  color="bg-gray-400" 
                />
              </div>
            </div>
          )}

          {/* Messages */}
          <div>
            <h4 className="font-semibold mb-2">Mensajes Recientes (StockTwits)</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {sentiment.sentiment.messages.slice(0, 10).map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg text-sm ${
                    msg.sentiment === 'Bullish' ? 'bg-green-50 border-l-4 border-green-500' :
                    msg.sentiment === 'Bearish' ? 'bg-red-50 border-l-4 border-red-500' :
                    'bg-gray-50 border-l-4 border-gray-300'
                  }`}
                >
                  <p>{msg.body}</p>
                  {msg.sentiment && (
                    <span className="text-xs text-gray-500 mt-1 block">
                      {msg.sentiment === 'Bullish' ? '🐂' : msg.sentiment === 'Bearish' ? '🐻' : '😐'} {msg.sentiment}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SentimentBar({ label, count, total, color }: { 
  label: string; 
  count: number; 
  total: number; 
  color: string; 
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex-1">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}