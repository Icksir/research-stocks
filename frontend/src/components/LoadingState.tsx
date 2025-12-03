interface LoadingStateProps {
  ticker: string;
}

export function LoadingState({ ticker }: LoadingStateProps) {
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
        <span className="absolute inset-0 flex items-center justify-center text-3xl">📊</span>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-800">Analizando {ticker}</h3>
      <p className="mt-2 text-gray-500">Esto puede tomar unos segundos...</p>
      
      <div className="mt-8 space-y-3 max-w-xs mx-auto">
        <LoadingStep step="Obteniendo datos de mercado" delay={0} />
        <LoadingStep step="Análisis técnico" delay={300} />
        <LoadingStep step="Revisando opciones" delay={600} />
        <LoadingStep step="Generando análisis con IA" delay={900} />
      </div>
    </div>
  );
}

function LoadingStep({ step, delay }: { step: string; delay: number }) {
  return (
    <div 
      className="flex items-center gap-3 text-sm text-gray-500 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
      <span>{step}</span>
    </div>
  );
}