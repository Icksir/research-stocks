import { useState } from 'react';
import { analyzeInstrument, type BackendAnalysisResponse } from './api';
import { SearchBar } from './components/SearchBar';
import { AnalysisReport } from './components/AnalysisReport';

interface HistoryItem {
  ticker: string;
  type: 'Stock' | 'ETF';
  timestamp: Date;
}

function normalizeInstrumentType(type: string): 'Stock' | 'ETF' {
  const upper = type.toUpperCase();
  if (upper === 'ETF') return 'ETF';
  return 'Stock';
}

function App() {
  const [analysis, setAnalysis] = useState<BackendAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleSearch = async (ticker: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentTicker(ticker);

    try {
      const result = await analyzeInstrument(ticker);
      setAnalysis(result);
      
      const normalizedType = normalizeInstrumentType(result.instrument_type);
      
      setHistory(prev => {
        const exists = prev.some(item => item.ticker === result.ticker);
        if (exists) {
          return [
            { ticker: result.ticker, type: normalizedType, timestamp: new Date() },
            ...prev.filter(item => item.ticker !== result.ticker)
          ];
        }
        return [
          { ticker: result.ticker, type: normalizedType, timestamp: new Date() },
          ...prev
        ].slice(0, 20);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al analizar el instrumento');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentTicker) {
      handleSearch(currentTicker);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const popularTickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'SPY', 'QQQ'];

  return (
    <div className="fixed inset-0 flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 min-w-64 bg-white border-r flex flex-col h-full">
        {/* Logo */}
        <div className="p-5 border-b">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📈 Stock Research
          </h1>
          <p className="text-xs text-gray-500 mt-1">Análisis potenciado por IA</p>
        </div>

        {/* Search in sidebar */}
        <div className="p-3 border-b">
          <SearchBar onSearch={handleSearch} isLoading={loading} compact />
        </div>
        
        {/* History */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-600">Historial</h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Limpiar
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto sidebar-scroll min-h-0">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 px-4">Sin búsquedas recientes</p>
            ) : (
              <ul className="space-y-1 px-2">
                {history.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSearch(item.ticker)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium text-gray-700">{item.ticker}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.type === 'ETF' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Access */}
        <div className="border-t p-4 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2 font-medium">Populares</p>
          <div className="flex flex-wrap gap-1.5">
            {popularTickers.map(t => (
              <button
                key={t}
                onClick={() => handleSearch(t)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto main-scroll p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Analizando {currentTicker}...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <span className="text-4xl block mb-3">⚠️</span>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error al analizar</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {analysis && !loading && (
            <AnalysisReport data={analysis} />
          )}

          {!loading && !error && !analysis && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Busca un ticker para comenzar
              </h2>
              <p className="text-gray-500 max-w-md">
                Ingresa el símbolo de una acción o ETF para obtener un análisis completo 
                con datos técnicos, fundamentales y de opciones.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t px-6 py-3 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            ⚠️ Disclaimer: Esta herramienta es solo para fines educativos. No constituye asesoría financiera profesional.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;