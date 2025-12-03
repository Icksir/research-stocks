interface TooltipContent {
  title: string;
  description: string;
  interpretation: {
    good: string;
    neutral?: string;
    bad: string;
  };
  formula?: string;
}

// Componente para renderizar el contenido del tooltip
export function MetricTooltipContent({ data }: { data: TooltipContent }) {
  return (
    <div className="space-y-2">
      <p className="font-bold text-white border-b border-gray-600 pb-1">{data.title}</p>
      <p className="text-gray-200 text-xs leading-relaxed">{data.description}</p>
      {data.formula && (
        <p className="text-gray-400 text-xs italic bg-gray-700/50 px-2 py-1 rounded">
          📐 {data.formula}
        </p>
      )}
      <div className="space-y-1 pt-1 border-t border-gray-600">
        <p className="text-xs text-gray-300 font-medium">📊 Interpretación:</p>
        <p className="text-xs text-green-400">✅ Bueno: {data.interpretation.good}</p>
        {data.interpretation.neutral && (
          <p className="text-xs text-yellow-400">⚠️ Neutral: {data.interpretation.neutral}</p>
        )}
        <p className="text-xs text-red-400">❌ Malo: {data.interpretation.bad}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFINICIONES DE MÉTRICAS
// ═══════════════════════════════════════════════════════════════════════════════

export const METRIC_TOOLTIPS: Record<string, TooltipContent> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // RENTABILIDAD
  // ─────────────────────────────────────────────────────────────────────────────
  eps_trailing: {
    title: 'EPS (Earnings Per Share) - TTM',
    description: 'Ganancias por acción de los últimos 12 meses (Trailing Twelve Months). Indica cuánto dinero gana la empresa por cada acción en circulación.',
    formula: 'Utilidad Neta / Acciones en Circulación',
    interpretation: {
      good: 'EPS positivo y creciente indica rentabilidad sólida',
      neutral: 'EPS bajo pero positivo puede indicar empresa en crecimiento',
      bad: 'EPS negativo significa que la empresa está perdiendo dinero',
    },
  },
  eps_forward: {
    title: 'EPS Forward (Proyectado)',
    description: 'Ganancias por acción estimadas para los próximos 12 meses según analistas. Útil para evaluar expectativas de crecimiento.',
    formula: 'Utilidad Neta Proyectada / Acciones en Circulación',
    interpretation: {
      good: 'EPS Forward > EPS actual indica expectativas de crecimiento',
      neutral: 'EPS Forward similar al actual sugiere estabilidad',
      bad: 'EPS Forward < EPS actual indica expectativas de declive',
    },
  },
  gross_margin: {
    title: 'Margen Bruto (Gross Margin)',
    description: 'Porcentaje de ingresos que queda después de restar el costo directo de producir bienes/servicios. Mide la eficiencia productiva básica.',
    formula: '(Ingresos - Costo de Ventas) / Ingresos × 100',
    interpretation: {
      good: '> 40% es excelente, indica fuerte poder de precios',
      neutral: '20-40% es aceptable para la mayoría de industrias',
      bad: '< 20% puede indicar competencia intensa o ineficiencia',
    },
  },
  operating_margin: {
    title: 'Margen Operativo (Operating Margin)',
    description: 'Porcentaje de ingresos que queda después de pagar costos operativos (salarios, alquiler, etc.). Mide la eficiencia operativa general.',
    formula: 'Utilidad Operativa / Ingresos × 100',
    interpretation: {
      good: '> 15% indica operaciones muy eficientes',
      neutral: '5-15% es normal para muchas industrias',
      bad: '< 5% puede indicar problemas de eficiencia operativa',
    },
  },
  profit_margin: {
    title: 'Margen Neto (Net Profit Margin)',
    description: 'Porcentaje de cada dólar de ingresos que se convierte en ganancia neta. Es la medida más completa de rentabilidad.',
    formula: 'Utilidad Neta / Ingresos × 100',
    interpretation: {
      good: '> 10% es excelente para la mayoría de industrias',
      neutral: '5-10% es aceptable',
      bad: '< 5% o negativo indica baja rentabilidad',
    },
  },
  ebitda_margin: {
    title: 'Margen EBITDA',
    description: 'Ganancias antes de intereses, impuestos, depreciación y amortización como porcentaje de ingresos. Útil para comparar empresas con diferentes estructuras de capital.',
    formula: 'EBITDA / Ingresos × 100',
    interpretation: {
      good: '> 20% indica fuerte generación de efectivo operativo',
      neutral: '10-20% es aceptable',
      bad: '< 10% puede indicar problemas operativos',
    },
  },
  roe: {
    title: 'ROE (Return on Equity)',
    description: 'Retorno sobre el patrimonio de los accionistas. Mide qué tan eficientemente la empresa usa el dinero de los accionistas para generar ganancias.',
    formula: 'Utilidad Neta / Patrimonio Neto × 100',
    interpretation: {
      good: '> 15% indica uso eficiente del capital de accionistas',
      neutral: '10-15% es aceptable',
      bad: '< 10% puede indicar uso ineficiente del capital',
    },
  },
  roa: {
    title: 'ROA (Return on Assets)',
    description: 'Retorno sobre activos totales. Mide qué tan eficientemente la empresa utiliza todos sus activos para generar ganancias.',
    formula: 'Utilidad Neta / Activos Totales × 100',
    interpretation: {
      good: '> 5% es bueno para la mayoría de industrias',
      neutral: '2-5% es aceptable',
      bad: '< 2% indica uso ineficiente de activos',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VALORACIÓN
  // ─────────────────────────────────────────────────────────────────────────────
  pe_trailing: {
    title: 'P/E Ratio (Price to Earnings) - TTM',
    description: 'Relación precio/ganancias de los últimos 12 meses. Indica cuánto están dispuestos a pagar los inversores por cada dólar de ganancias.',
    formula: 'Precio por Acción / EPS',
    interpretation: {
      good: '< 15 puede indicar acción infravalorada',
      neutral: '15-25 es típico para empresas estables',
      bad: '> 30 puede indicar sobrevaloración o altas expectativas',
    },
  },
  pe_forward: {
    title: 'P/E Forward (Proyectado)',
    description: 'Relación precio/ganancias basada en ganancias proyectadas. Útil para evaluar si el precio actual refleja el crecimiento esperado.',
    formula: 'Precio por Acción / EPS Proyectado',
    interpretation: {
      good: 'P/E Forward < P/E Trailing indica expectativas de crecimiento',
      neutral: 'Similar al P/E trailing sugiere estabilidad',
      bad: 'P/E Forward > P/E Trailing indica expectativas de declive',
    },
  },
  peg_ratio: {
    title: 'PEG Ratio (Price/Earnings to Growth)',
    description: 'P/E ajustado por la tasa de crecimiento. Permite comparar valoraciones considerando el crecimiento esperado de ganancias.',
    formula: 'P/E Ratio / Tasa de Crecimiento de Ganancias',
    interpretation: {
      good: '< 1 sugiere que la acción está infravalorada vs su crecimiento',
      neutral: '1-2 indica valoración justa',
      bad: '> 2 puede indicar sobrevaloración',
    },
  },
  price_to_book: {
    title: 'P/B Ratio (Price to Book)',
    description: 'Relación entre el precio de mercado y el valor en libros por acción. Compara lo que pagan los inversores vs el valor contable de la empresa.',
    formula: 'Precio por Acción / Valor en Libros por Acción',
    interpretation: {
      good: '< 1 puede indicar infravaloración (o problemas)',
      neutral: '1-3 es típico para empresas saludables',
      bad: '> 5 puede indicar sobrevaloración significativa',
    },
  },
  price_to_sales: {
    title: 'P/S Ratio (Price to Sales)',
    description: 'Relación precio/ventas. Útil para empresas sin ganancias o con ganancias volátiles, ya que los ingresos son más estables.',
    formula: 'Capitalización de Mercado / Ingresos Totales',
    interpretation: {
      good: '< 2 es atractivo para muchas industrias',
      neutral: '2-5 es aceptable para empresas en crecimiento',
      bad: '> 10 requiere alto crecimiento para justificarse',
    },
  },
  ev_to_ebitda: {
    title: 'EV/EBITDA',
    description: 'Enterprise Value dividido por EBITDA. Métrica de valoración que considera la deuda y es útil para comparar empresas con diferentes estructuras de capital.',
    formula: 'Enterprise Value / EBITDA',
    interpretation: {
      good: '< 10 puede indicar empresa infravalorada',
      neutral: '10-15 es típico',
      bad: '> 20 puede indicar sobrevaloración',
    },
  },
  ev_to_revenue: {
    title: 'EV/Revenue (EV/Ingresos)',
    description: 'Enterprise Value dividido por ingresos totales. Similar a P/S pero incluye la deuda en la valoración.',
    formula: 'Enterprise Value / Ingresos Totales',
    interpretation: {
      good: '< 2 es atractivo',
      neutral: '2-5 es normal',
      bad: '> 8 indica valoración premium alta',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DEUDA Y LIQUIDEZ
  // ─────────────────────────────────────────────────────────────────────────────
  debt_to_equity: {
    title: 'Deuda/Equity (D/E Ratio)',
    description: 'Proporción de deuda respecto al patrimonio de los accionistas. Mide el apalancamiento financiero de la empresa.',
    formula: 'Deuda Total / Patrimonio Neto',
    interpretation: {
      good: '< 0.5 indica bajo apalancamiento y menor riesgo',
      neutral: '0.5-1 es aceptable para la mayoría de industrias',
      bad: '> 2 indica alto apalancamiento y mayor riesgo',
    },
  },
  current_ratio: {
    title: 'Current Ratio (Razón Corriente)',
    description: 'Capacidad de pagar obligaciones a corto plazo con activos corrientes. Mide la liquidez de la empresa.',
    formula: 'Activos Corrientes / Pasivos Corrientes',
    interpretation: {
      good: '> 1.5 indica buena capacidad de pago a corto plazo',
      neutral: '1-1.5 es aceptable pero ajustado',
      bad: '< 1 puede indicar problemas de liquidez',
    },
  },
  quick_ratio: {
    title: 'Quick Ratio (Prueba Ácida)',
    description: 'Similar al Current Ratio pero excluye inventarios. Medida más estricta de liquidez inmediata.',
    formula: '(Activos Corrientes - Inventarios) / Pasivos Corrientes',
    interpretation: {
      good: '> 1 indica buena liquidez inmediata',
      neutral: '0.5-1 es aceptable',
      bad: '< 0.5 puede indicar riesgo de liquidez',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CRECIMIENTO
  // ─────────────────────────────────────────────────────────────────────────────
  revenue_growth: {
    title: 'Crecimiento de Ingresos',
    description: 'Tasa de crecimiento de los ingresos respecto al período anterior. Indica si la empresa está expandiendo sus ventas.',
    formula: '(Ingresos Actuales - Ingresos Anteriores) / Ingresos Anteriores × 100',
    interpretation: {
      good: '> 10% indica fuerte crecimiento',
      neutral: '0-10% indica crecimiento moderado',
      bad: 'Negativo indica contracción de ventas',
    },
  },
  earnings_growth: {
    title: 'Crecimiento de Ganancias',
    description: 'Tasa de crecimiento de las ganancias netas. Indica si la empresa está mejorando su rentabilidad.',
    formula: '(Ganancias Actuales - Ganancias Anteriores) / Ganancias Anteriores × 100',
    interpretation: {
      good: '> 15% indica fuerte mejora en rentabilidad',
      neutral: '0-15% es crecimiento moderado',
      bad: 'Negativo indica deterioro de ganancias',
    },
  },
  earnings_quarterly_growth: {
    title: 'Crecimiento Trimestral de Ganancias',
    description: 'Crecimiento de ganancias del trimestre actual vs el mismo trimestre del año anterior (YoY).',
    formula: '(Ganancias Q Actual - Ganancias Q Año Anterior) / Ganancias Q Año Anterior × 100',
    interpretation: {
      good: '> 20% indica fuerte momentum',
      neutral: '0-20% es crecimiento aceptable',
      bad: 'Negativo indica deterioro reciente',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DIVIDENDOS
  // ─────────────────────────────────────────────────────────────────────────────
  dividend_yield: {
    title: 'Dividend Yield (Rendimiento por Dividendo)',
    description: 'Porcentaje de retorno anual por dividendos respecto al precio de la acción. Importante para inversores que buscan ingresos.',
    formula: 'Dividendo Anual por Acción / Precio por Acción × 100',
    interpretation: {
      good: '2-6% es atractivo y sostenible para muchas empresas',
      neutral: '< 2% es bajo pero común en empresas de crecimiento',
      bad: '> 8% puede ser insostenible o indicar problemas',
    },
  },
  dividend_rate: {
    title: 'Dividendo Anual',
    description: 'Monto total de dividendos pagados por acción durante el año.',
    formula: 'Suma de todos los dividendos pagados por acción en 12 meses',
    interpretation: {
      good: 'Dividendo estable o creciente indica solidez',
      neutral: 'Dividendo sin cambios indica estabilidad',
      bad: 'Dividendo reducido o eliminado es señal de alerta',
    },
  },
  payout_ratio: {
    title: 'Payout Ratio',
    description: 'Porcentaje de ganancias que se pagan como dividendos. Indica la sostenibilidad del dividendo.',
    formula: 'Dividendos Totales / Utilidad Neta × 100',
    interpretation: {
      good: '30-50% permite reinversión y dividendos sostenibles',
      neutral: '50-70% es aceptable pero con menos margen',
      bad: '> 80% puede ser insostenible a largo plazo',
    },
  },
  five_year_avg_dividend_yield: {
    title: 'Rendimiento Promedio 5 Años',
    description: 'Promedio del dividend yield durante los últimos 5 años. Útil para evaluar la consistencia histórica.',
    formula: 'Promedio de Dividend Yield de los últimos 5 años',
    interpretation: {
      good: 'Similar o menor al actual indica dividendo creciente',
      neutral: 'Estable indica consistencia',
      bad: 'Mayor al actual puede indicar recorte de dividendos',
    },
  },
};

// Función helper para obtener el contenido del tooltip
export function getMetricTooltip(metricKey: string): TooltipContent | null {
  return METRIC_TOOLTIPS[metricKey] || null;
}
