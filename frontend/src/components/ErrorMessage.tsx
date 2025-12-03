interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">❌</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Error en el análisis</h3>
          <p className="text-red-600 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              🔄 Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}