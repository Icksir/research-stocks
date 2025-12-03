import ReactMarkdown from 'react-markdown';
import type { NewsData, NewsArticle } from '../../api';

interface NewsTabProps {
  data: NewsData;
}

export function NewsTab({ data }: NewsTabProps) {
  const { summary, articles, sources_used } = data;
  
  // Filtrar artículos que tengan contenido válido (no vacío, no "No title", etc.)
  const validArticles = articles?.filter((article) => {
    if (!article) return false;
    const title = article.title?.trim().toLowerCase();
    if (!title || title === '' || title === 'no title' || title === 'untitled') return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📝</span> Resumen de Noticias
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Fuentes utilizadas */}
      {sources_used && sources_used.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Fuentes:</span>
          {sources_used.map((source, idx) => (
            <span 
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {source}
            </span>
          ))}
        </div>
      )}

      {/* Lista de Artículos */}
      {validArticles.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📰</span> Artículos Recientes ({validArticles.length})
          </h3>
          <div className="space-y-4">
            {validArticles.map((article, idx) => (
              <ArticleCard key={idx} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Sin artículos */}
      {validArticles.length === 0 && !summary && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-4">📭</span>
          <p>No hay noticias disponibles para este ticker.</p>
        </div>
      )}
    </div>
  );
}

interface ArticleCardProps {
  article: NewsArticle;
}

function ArticleCard({ article }: ArticleCardProps) {
  const { title, publisher, content, url, date, sentiment } = article;
  
  // Formatear fecha
  const formattedDate = date ? formatDate(date) : null;
  
  // Truncar contenido
  const truncatedContent = content 
    ? (content.length > 250 ? content.substring(0, 250) + '...' : content)
    : null;

  // Color del sentimiento
  const sentimentColor = sentiment 
    ? sentiment.toLowerCase() === 'positive' || sentiment.toLowerCase() === 'bullish'
      ? 'bg-green-100 text-green-700'
      : sentiment.toLowerCase() === 'negative' || sentiment.toLowerCase() === 'bearish'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600'
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
            {url ? (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h4>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
            {publisher && (
              <span className="font-medium">{publisher}</span>
            )}
            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}
            {sentiment && sentimentColor && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${sentimentColor}`}>
                {sentiment}
              </span>
            )}
          </div>
          
          {/* Contenido truncado */}
          {truncatedContent && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {truncatedContent}
            </p>
          )}
        </div>
        
        {/* Link externo */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Abrir artículo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  } catch {
    return dateString;
  }
}
