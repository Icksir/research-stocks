import { useState } from 'react';
import type { FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

export function SearchBar({ onSearch, isLoading, compact = false }: SearchBarProps) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase());
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Buscar ticker..."
            className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ingresa un ticker (ej: AAPL, MSFT, SPY)"
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          {ticker && (
            <button
              type="button"
              onClick={() => setTicker('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !ticker.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analizando...
            </span>
          ) : (
            '🔍 Analizar'
          )}
        </button>
      </div>
    </form>
  );
}