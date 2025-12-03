import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wide?: boolean;
}

export function Tooltip({ content, children, position = 'top', wide = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();
      
      // Ajustar posición si se sale de la pantalla
      if (position === 'top' && container.top - tooltip.height < 10) {
        setActualPosition('bottom');
      } else if (position === 'bottom' && container.bottom + tooltip.height > window.innerHeight - 10) {
        setActualPosition('top');
      } else if (position === 'left' && container.left - tooltip.width < 10) {
        setActualPosition('right');
      } else if (position === 'right' && container.right + tooltip.width > window.innerWidth - 10) {
        setActualPosition('left');
      } else {
        setActualPosition(position);
      }
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800',
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[actualPosition]}`}
        >
          <div className={`bg-gray-800 text-white text-sm rounded-lg py-3 px-4 shadow-xl ${wide ? 'w-80' : 'max-w-sm min-w-[200px]'}`}>
            {content}
            <div className={`absolute w-0 h-0 border-[6px] ${arrowClasses[actualPosition]}`} />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para info icon con tooltip
interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wide?: boolean;
}

export function InfoTooltip({ content, position = 'top', wide = false }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position} wide={wide}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 cursor-help text-xs transition-colors ml-1">
        ?
      </span>
    </Tooltip>
  );
}