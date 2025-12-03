import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wide?: boolean;
  block?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function Tooltip({ content, children, position = 'top', wide = false, block = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let newPosition = position;
    let top = 0;
    let left = 0;

    // Calcular posición inicial según la preferencia
    switch (position) {
      case 'top':
        top = containerRect.top - tooltipRect.height - gap;
        left = containerRect.left + (containerRect.width / 2) - (tooltipRect.width / 2);
        if (top < 10) newPosition = 'bottom';
        break;
      case 'bottom':
        top = containerRect.bottom + gap;
        left = containerRect.left + (containerRect.width / 2) - (tooltipRect.width / 2);
        if (top + tooltipRect.height > window.innerHeight - 10) newPosition = 'top';
        break;
      case 'left':
        top = containerRect.top + (containerRect.height / 2) - (tooltipRect.height / 2);
        left = containerRect.left - tooltipRect.width - gap;
        if (left < 10) newPosition = 'right';
        break;
      case 'right':
        top = containerRect.top + (containerRect.height / 2) - (tooltipRect.height / 2);
        left = containerRect.right + gap;
        if (left + tooltipRect.width > window.innerWidth - 10) newPosition = 'left';
        break;
    }

    // Recalcular si la posición cambió
    if (newPosition !== position) {
      switch (newPosition) {
        case 'top':
          top = containerRect.top - tooltipRect.height - gap;
          left = containerRect.left + (containerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = containerRect.bottom + gap;
          left = containerRect.left + (containerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = containerRect.top + (containerRect.height / 2) - (tooltipRect.height / 2);
          left = containerRect.left - tooltipRect.width - gap;
          break;
        case 'right':
          top = containerRect.top + (containerRect.height / 2) - (tooltipRect.height / 2);
          left = containerRect.right + gap;
          break;
      }
    }

    // Ajustar para que no se salga de la pantalla horizontalmente
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // Ajustar para que no se salga verticalmente
    if (top < 10) top = 10;
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    setActualPosition(newPosition);
    setTooltipPos({ top, left });
    setIsPositioned(true);
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      // Pequeño delay para que el tooltip se renderice primero
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isVisible, calculatePosition]);

  const arrowStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: -6,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #1f2937',
    },
    bottom: {
      top: -6,
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: '6px solid #1f2937',
    },
    left: {
      right: -6,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '6px solid #1f2937',
    },
    right: {
      left: -6,
      top: '50%',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderRight: '6px solid #1f2937',
    },
  };

  const handleMouseEnter = () => {
    setIsPositioned(false);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setIsPositioned(false);
  };

  return (
    <div 
      ref={containerRef}
      className={block ? 'block w-full' : 'inline-block'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            zIndex: 99999,
            pointerEvents: 'none',
            opacity: isPositioned ? 1 : 0,
            transition: 'opacity 0.1s ease-in-out',
          }}
        >
          <div className={`bg-gray-800 text-white text-sm rounded-lg py-3 px-4 shadow-xl ${wide ? 'w-80' : 'max-w-sm min-w-[200px]'}`}>
            {content}
            <div style={{ position: 'absolute', width: 0, height: 0, ...arrowStyles[actualPosition] }} />
          </div>
        </div>,
        document.body
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