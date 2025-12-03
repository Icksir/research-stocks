import type { OptionsVolatility, OptionsMove } from '../../api';
import { Tooltip, InfoTooltip } from './Tooltip';

type OptionsData = OptionsVolatility;

interface OptionsTabProps {
  data: OptionsData;
}

// Definiciones de tooltips
const TOOLTIPS = {
  price: (
    <div>
      <p className="font-semibold mb-1">💰 Precio Actual</p>
      <p>Es el precio al que se cotiza actualmente la acción en el mercado. Este valor se usa como referencia para determinar si las opciones están ITM, ATM u OTM.</p>
    </div>
  ),
  iv: (
    <div>
      <p className="font-semibold mb-1">📊 Volatilidad Implícita (IV)</p>
      <p className="mb-2">Mide las expectativas del mercado sobre la volatilidad futura del activo. Se calcula a partir de los precios de las opciones ATM (At The Money).</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="text-blue-400">IV &lt; 20%</span>: Muy baja volatilidad</li>
        <li>• <span className="text-green-400">IV 20-30%</span>: Volatilidad normal</li>
        <li>• <span className="text-yellow-400">IV 30-50%</span>: Volatilidad elevada</li>
        <li>• <span className="text-orange-400">IV 50-80%</span>: Alta volatilidad</li>
        <li>• <span className="text-red-400">IV &gt; 80%</span>: Volatilidad extrema</li>
      </ul>
    </div>
  ),
  unusualActivity: (
    <div>
      <p className="font-semibold mb-1">🔥 Actividad Inusual</p>
      <p className="mb-2">Número de contratos de opciones con un volumen de negociación significativamente mayor al habitual (Open Interest).</p>
      <p className="text-xs mt-2">Un ratio Vol/OI alto puede indicar que traders institucionales están tomando posiciones significativas, lo que podría anticipar un movimiento importante en el precio.</p>
    </div>
  ),
  topMoves: (
    <div>
      <p className="font-semibold mb-1">📈 Top Moves</p>
      <p>Los contratos de opciones con mayor actividad inusual, ordenados por relevancia. Estos representan las apuestas más significativas del mercado.</p>
    </div>
  ),
  callPutRatio: (
    <div>
      <p className="font-semibold mb-1">⚖️ Ratio Call/Put</p>
      <p className="mb-2">Relación entre el volumen de opciones CALL y PUT negociadas.</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="text-green-400">Ratio &gt; 1.5</span>: Sentimiento alcista (más calls)</li>
        <li>• <span className="text-gray-400">Ratio 0.7-1.5</span>: Sentimiento neutral</li>
        <li>• <span className="text-red-400">Ratio &lt; 0.7</span>: Sentimiento bajista (más puts)</li>
      </ul>
    </div>
  ),
  sentiment: (
    <div>
      <p className="font-semibold mb-1">🎯 Sentimiento del Mercado</p>
      <p className="mb-2">Indicador basado en el flujo de opciones que muestra la dirección esperada por los traders.</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="text-green-400">Bullish</span>: Mayoría apuesta a subida</li>
        <li>• <span className="text-red-400">Bearish</span>: Mayoría apuesta a bajada</li>
        <li>• <span className="text-yellow-400">Neutral</span>: Sin dirección clara</li>
      </ul>
    </div>
  ),
  calls: (
    <div>
      <p className="font-semibold mb-1">📈 Opciones CALL</p>
      <p className="mb-2">Contratos que dan el derecho a COMPRAR el activo a un precio determinado (strike). Los traders compran calls cuando esperan que el precio suba.</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="font-medium">Volumen</span>: Contratos negociados hoy</li>
        <li>• <span className="font-medium">Open Interest</span>: Contratos abiertos totales</li>
        <li>• <span className="font-medium">Vol/OI</span>: Ratio que indica actividad inusual</li>
      </ul>
    </div>
  ),
  puts: (
    <div>
      <p className="font-semibold mb-1">📉 Opciones PUT</p>
      <p className="mb-2">Contratos que dan el derecho a VENDER el activo a un precio determinado (strike). Los traders compran puts cuando esperan que el precio baje o para proteger posiciones.</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="font-medium">Volumen</span>: Contratos negociados hoy</li>
        <li>• <span className="font-medium">Open Interest</span>: Contratos abiertos totales</li>
        <li>• <span className="font-medium">Vol/OI</span>: Ratio que indica actividad inusual</li>
      </ul>
    </div>
  ),
  volume: (
    <div>
      <p className="font-semibold mb-1">📊 Volumen</p>
      <p>Número total de contratos de opciones negociados durante la sesión actual. Un volumen alto indica mayor interés y liquidez.</p>
    </div>
  ),
  openInterest: (
    <div>
      <p className="font-semibold mb-1">📋 Open Interest (OI)</p>
      <p>Número total de contratos de opciones que permanecen abiertos (no cerrados ni ejercidos). Representa las posiciones activas en el mercado.</p>
    </div>
  ),
  volOiRatio: (
    <div>
      <p className="font-semibold mb-1">🔥 Ratio Vol/OI</p>
      <p className="mb-2">Relación entre el volumen diario y el open interest. Indica qué tan inusual es la actividad.</p>
      <ul className="text-xs space-y-1 mt-2">
        <li>• <span className="text-gray-400">Ratio &lt; 1.5x</span>: Actividad normal</li>
        <li>• <span className="text-yellow-400">Ratio 1.5-2x</span>: Actividad elevada</li>
        <li>• <span className="text-orange-400">Ratio 2-3x</span>: Actividad inusual</li>
        <li>• <span className="text-red-400">Ratio &gt; 3x</span>: Actividad muy inusual</li>
      </ul>
    </div>
  ),
  strike: (
    <div>
      <p className="font-semibold mb-1">🎯 Strike Price</p>
      <p>Precio al cual el titular de la opción puede comprar (call) o vender (put) el activo subyacente. Es el precio "de ejercicio" del contrato.</p>
    </div>
  ),
  itm: (
    <div>
      <p className="font-semibold mb-1">💎 In The Money (ITM)</p>
      <p className="mb-2">La opción tiene valor intrínseco:</p>
      <ul className="text-xs space-y-1">
        <li>• <span className="text-green-400">CALL ITM</span>: Strike &lt; Precio actual</li>
        <li>• <span className="text-red-400">PUT ITM</span>: Strike &gt; Precio actual</li>
      </ul>
    </div>
  ),
  atm: (
    <div>
      <p className="font-semibold mb-1">⚖️ At The Money (ATM)</p>
      <p>La opción tiene un strike muy cercano al precio actual del activo. Son las más sensibles a cambios en volatilidad.</p>
    </div>
  ),
  otm: (
    <div>
      <p className="font-semibold mb-1">📭 Out of The Money (OTM)</p>
      <p className="mb-2">La opción no tiene valor intrínseco actualmente:</p>
      <ul className="text-xs space-y-1">
        <li>• <span className="text-green-400">CALL OTM</span>: Strike &gt; Precio actual</li>
        <li>• <span className="text-red-400">PUT OTM</span>: Strike &lt; Precio actual</li>
      </ul>
    </div>
  ),
};

export function OptionsTab({ data }: OptionsTabProps) {
  // Calcular estadísticas
  const calls = data.top_unusual_moves?.filter((m: OptionsMove) => m.type === 'CALL') || [];
  const puts = data.top_unusual_moves?.filter((m: OptionsMove) => m.type === 'PUT') || [];
  
  const totalCallVolume = calls.reduce((acc: number, m: OptionsMove) => acc + (m.volume || 0), 0);
  const totalPutVolume = puts.reduce((acc: number, m: OptionsMove) => acc + (m.volume || 0), 0);
  const totalCallOI = calls.reduce((acc: number, m: OptionsMove) => acc + (m.oi || 0), 0);
  const totalPutOI = puts.reduce((acc: number, m: OptionsMove) => acc + (m.oi || 0), 0);

  const callPutVolumeRatio = totalPutVolume > 0 
    ? (totalCallVolume / totalPutVolume).toFixed(2) 
    : 'N/A';

  const callPutOIRatio = totalPutOI > 0 
    ? (totalCallOI / totalPutOI).toFixed(2) 
    : 'N/A';

  // Determinar sentimiento basado en la actividad
  const getSentiment = () => {
    const callCount = calls.length;
    const putCount = puts.length;
    
    if (callCount === 0 && putCount === 0) return { label: 'Sin datos', color: 'text-gray-600', bg: 'bg-gray-100', icon: '😐' };
    if (callCount > putCount * 1.5 && totalCallVolume > totalPutVolume * 1.5) {
      return { label: 'Muy Bullish', color: 'text-green-700', bg: 'bg-green-100', icon: '🐂🚀' };
    }
    if (callCount > putCount) {
      return { label: 'Bullish', color: 'text-green-600', bg: 'bg-green-50', icon: '🐂' };
    }
    if (putCount > callCount * 1.5 && totalPutVolume > totalCallVolume * 1.5) {
      return { label: 'Muy Bearish', color: 'text-red-700', bg: 'bg-red-100', icon: '🐻📉' };
    }
    if (putCount > callCount) {
      return { label: 'Bearish', color: 'text-red-600', bg: 'bg-red-50', icon: '🐻' };
    }
    return { label: 'Neutral', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '😐' };
  };

  const sentiment = getSentiment();

  // Obtener el movimiento más significativo
  const topMove = data.top_unusual_moves?.[0];
  const highestRatio = data.top_unusual_moves?.reduce((max: number, m: OptionsMove) => {
    const ratio = typeof m.ratio === 'number' ? m.ratio : parseFloat(String(m.ratio) || '0');
    return ratio > max ? ratio : max;
  }, 0) || 0;

  // Parsear IV
  const ivValue = data.atm_iv_avg ? parseFloat(data.atm_iv_avg.replace('%', '')) : null;
  const getIVLevel = (iv: number | null) => {
    if (iv === null) return { label: 'N/A', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (iv < 20) return { label: 'Muy Baja', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (iv < 30) return { label: 'Baja', color: 'text-green-600', bg: 'bg-green-50' };
    if (iv < 50) return { label: 'Normal', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (iv < 80) return { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Muy Alta', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const ivLevel = getIVLevel(ivValue);

  return (
    <div className="space-y-8">
      {/* Error message if any */}
      {data.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">Error al obtener datos de opciones</p>
            <p className="text-red-600 text-sm">{data.error}</p>
          </div>
        </div>
      )}

      {/* ===================== RESUMEN PRINCIPAL ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Precio */}
        <Tooltip content={TOOLTIPS.price} position="bottom" wide>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 cursor-help hover:shadow-md transition-shadow">
            <span className="text-2xl block mb-2">💰</span>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
              Precio Actual
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {data.price ? `$${data.price.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </Tooltip>

        {/* IV */}
        <Tooltip content={TOOLTIPS.iv} position="bottom" wide>
          <div className={`${ivLevel.bg} rounded-xl p-4 text-center border border-gray-200 cursor-help hover:shadow-md transition-shadow`}>
            <span className="text-2xl block mb-2">📊</span>
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              IV Promedio ATM
            </p>
            <p className={`text-2xl font-bold ${ivLevel.color} mt-1`}>
              {data.atm_iv_avg || 'N/A'}
            </p>
            <p className={`text-xs ${ivLevel.color} mt-1`}>{ivLevel.label}</p>
          </div>
        </Tooltip>

        {/* Actividad Inusual */}
        <Tooltip content={TOOLTIPS.unusualActivity} position="bottom" wide>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200 cursor-help hover:shadow-md transition-shadow">
            <span className="text-2xl block mb-2">🔥</span>
            <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">
              Actividad Inusual
            </p>
            <p className="text-2xl font-bold text-orange-700 mt-1">
              {data.unusual_activity_count ?? 0}
            </p>
            <p className="text-xs text-orange-500 mt-1">contratos detectados</p>
          </div>
        </Tooltip>

        {/* Top Moves */}
        <Tooltip content={TOOLTIPS.topMoves} position="bottom" wide>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200 cursor-help hover:shadow-md transition-shadow">
            <span className="text-2xl block mb-2">📈</span>
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
              Top Moves
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {data.top_unusual_moves?.length ?? 0}
            </p>
            <p className="text-xs text-purple-500 mt-1">movimientos destacados</p>
          </div>
        </Tooltip>

        {/* Ratio Call/Put */}
        <Tooltip content={TOOLTIPS.callPutRatio} position="bottom" wide>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center border border-indigo-200 cursor-help hover:shadow-md transition-shadow">
            <span className="text-2xl block mb-2">⚖️</span>
            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
              Call/Put Ratio
            </p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{callPutVolumeRatio}</p>
            <p className="text-xs text-indigo-500 mt-1">{calls.length}C / {puts.length}P</p>
          </div>
        </Tooltip>

        {/* Sentimiento */}
        <Tooltip content={TOOLTIPS.sentiment} position="bottom" wide>
          <div className={`${sentiment.bg} rounded-xl p-4 text-center border border-gray-200 cursor-help hover:shadow-md transition-shadow`}>
            <span className="text-2xl block mb-2">{sentiment.icon}</span>
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Sentimiento
            </p>
            <p className={`text-2xl font-bold ${sentiment.color} mt-1`}>{sentiment.label}</p>
            <p className="text-xs text-gray-500 mt-1">basado en flujo</p>
          </div>
        </Tooltip>
      </div>

      {/* ===================== DESGLOSE CALLS VS PUTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CALLS */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800 text-lg flex items-center gap-2">
                CALLS (Alcistas)
                <InfoTooltip content={TOOLTIPS.calls} position="right" wide />
              </h4>
              <p className="text-sm text-green-600">Apuestas a que el precio suba</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-green-600 uppercase font-medium">Contratos</p>
              <p className="text-xl font-bold text-green-700">{calls.length}</p>
            </div>
            <Tooltip content={TOOLTIPS.volume} position="top" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-green-600 uppercase font-medium">
                  Volumen Total
                </p>
                <p className="text-xl font-bold text-green-700">{totalCallVolume.toLocaleString()}</p>
              </div>
            </Tooltip>
            <Tooltip content={TOOLTIPS.openInterest} position="bottom" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-green-600 uppercase font-medium">
                  Open Interest
                </p>
                <p className="text-xl font-bold text-green-700">{totalCallOI.toLocaleString()}</p>
              </div>
            </Tooltip>
            <Tooltip content={TOOLTIPS.volOiRatio} position="bottom" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-green-600 uppercase font-medium">
                  Vol/OI Ratio
                </p>
                <p className="text-xl font-bold text-green-700">
                  {totalCallOI > 0 ? (totalCallVolume / totalCallOI).toFixed(2) : 'N/A'}
                </p>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* PUTS */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📉</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 text-lg flex items-center gap-2">
                PUTS (Bajistas)
                <InfoTooltip content={TOOLTIPS.puts} position="right" wide />
              </h4>
              <p className="text-sm text-red-600">Apuestas a que el precio baje</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-red-600 uppercase font-medium">Contratos</p>
              <p className="text-xl font-bold text-red-700">{puts.length}</p>
            </div>
            <Tooltip content={TOOLTIPS.volume} position="top" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-red-600 uppercase font-medium">
                  Volumen Total
                </p>
                <p className="text-xl font-bold text-red-700">{totalPutVolume.toLocaleString()}</p>
              </div>
            </Tooltip>
            <Tooltip content={TOOLTIPS.openInterest} position="bottom" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-red-600 uppercase font-medium">
                  Open Interest
                </p>
                <p className="text-xl font-bold text-red-700">{totalPutOI.toLocaleString()}</p>
              </div>
            </Tooltip>
            <Tooltip content={TOOLTIPS.volOiRatio} position="bottom" wide>
              <div className="bg-white/60 rounded-lg p-3 cursor-help hover:bg-white/80 transition-colors">
                <p className="text-xs text-red-600 uppercase font-medium">
                  Vol/OI Ratio
                </p>
                <p className="text-xl font-bold text-red-700">
                  {totalPutOI > 0 ? (totalPutVolume / totalPutOI).toFixed(2) : 'N/A'}
                </p>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ===================== RESUMEN VISUAL ===================== */}
      {(calls.length > 0 || puts.length > 0) && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Balance Call/Put
            <InfoTooltip content="Comparación visual del balance entre posiciones alcistas (Calls) y bajistas (Puts). Las barras muestran la proporción relativa." wide />
          </h3>
          
          {/* Barra visual - Cantidad */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600 font-medium">Calls ({calls.length})</span>
              <span className="text-red-600 font-medium">Puts ({puts.length})</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ 
                  width: `${calls.length + puts.length > 0 ? (calls.length / (calls.length + puts.length)) * 100 : 50}%` 
                }}
              />
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                style={{ 
                  width: `${calls.length + puts.length > 0 ? (puts.length / (calls.length + puts.length)) * 100 : 50}%` 
                }}
              />
            </div>
          </div>

          {/* Barra de volumen */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600 font-medium">Vol: {totalCallVolume.toLocaleString()}</span>
              <span className="text-red-600 font-medium">Vol: {totalPutVolume.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ 
                  width: `${totalCallVolume + totalPutVolume > 0 ? (totalCallVolume / (totalCallVolume + totalPutVolume)) * 100 : 50}%` 
                }}
              />
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                style={{ 
                  width: `${totalCallVolume + totalPutVolume > 0 ? (totalPutVolume / (totalCallVolume + totalPutVolume)) * 100 : 50}%` 
                }}
              />
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1">
                Ratio Vol C/P
                <InfoTooltip content={TOOLTIPS.callPutRatio} position="top" wide />
              </p>
              <p className="text-lg font-bold text-gray-800">{callPutVolumeRatio}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1">
                Ratio OI C/P
                <InfoTooltip content="Ratio entre el Open Interest de Calls y Puts. Similar al ratio de volumen pero para posiciones abiertas." position="top" wide />
              </p>
              <p className="text-lg font-bold text-gray-800">{callPutOIRatio}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1">
                Mayor Ratio
                <InfoTooltip content={TOOLTIPS.volOiRatio} position="top" wide />
              </p>
              <p className="text-lg font-bold text-gray-800">{highestRatio.toFixed(1)}x</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1">
                Top Move
                <InfoTooltip content="El contrato con mayor actividad inusual detectada." position="top" />
              </p>
              <p className={`text-lg font-bold ${topMove?.type === 'CALL' ? 'text-green-600' : 'text-red-600'}`}>
                {topMove ? `${topMove.type} $${topMove.strike}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TABLA DE MOVIMIENTOS INUSUALES ===================== */}
      {data.top_unusual_moves && data.top_unusual_moves.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🔥 Actividad Inusual en Opciones
              <InfoTooltip content={TOOLTIPS.unusualActivity} wide />
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {data.unusual_activity_count} detectados
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-right p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      Strike
                      <InfoTooltip content={TOOLTIPS.strike} position="bottom" wide />
                    </span>
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      Volumen
                      <InfoTooltip content={TOOLTIPS.volume} position="bottom" />
                    </span>
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      Open Interest
                      <InfoTooltip content={TOOLTIPS.openInterest} position="bottom" />
                    </span>
                  </th>
                  <th className="text-right p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      Vol/OI
                      <InfoTooltip content={TOOLTIPS.volOiRatio} position="bottom" wide />
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      vs Precio
                      <InfoTooltip content="Diferencia porcentual entre el Strike y el precio actual del activo." position="bottom" />
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      Estado
                      <InfoTooltip content={
                        <div>
                          <p className="font-semibold mb-1">Estado de la opción</p>
                          <p className="text-xs">ITM: In The Money (con valor)</p>
                          <p className="text-xs">ATM: At The Money (en el dinero)</p>
                          <p className="text-xs">OTM: Out of The Money (sin valor)</p>
                        </div>
                      } position="bottom" wide />
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700">Señal</th>
                </tr>
              </thead>
              <tbody>
                {data.top_unusual_moves.map((move: OptionsMove, idx: number) => {
                  const strikeVsPrice = data.price 
                    ? ((move.strike - data.price) / data.price * 100)
                    : null;
                  
                  const isITM = move.type === 'CALL' 
                    ? move.strike < (data.price || 0)
                    : move.strike > (data.price || 0);

                  const isATM = data.price 
                    ? Math.abs(move.strike - data.price) / data.price < 0.02 
                    : false;

                  const ratioNum = typeof move.ratio === 'number' ? move.ratio : parseFloat(String(move.ratio) || '0');

                  return (
                    <tr 
                      key={idx} 
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      {/* Tipo */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm ${
                          move.type === 'CALL' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {move.type === 'CALL' ? '📈' : '📉'} {move.type}
                        </span>
                      </td>
                      
                      {/* Strike */}
                      <td className="p-4 text-right">
                        <span className="font-bold text-gray-800 text-base">${move.strike}</span>
                      </td>
                      
                      {/* Volumen */}
                      <td className="p-4 text-right">
                        <span className="font-semibold text-gray-700">
                          {move.volume?.toLocaleString() || 'N/A'}
                        </span>
                      </td>
                      
                      {/* Open Interest */}
                      <td className="p-4 text-right text-gray-600">
                        {move.oi?.toLocaleString() || 'N/A'}
                      </td>
                      
                      {/* Vol/OI Ratio */}
                      <td className="p-4 text-right">
                        <span className={`font-bold px-2 py-1 rounded ${
                          ratioNum >= 3 
                            ? 'bg-orange-100 text-orange-700' 
                            : ratioNum >= 2 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ratioNum.toFixed(1)}x
                        </span>
                      </td>
                      
                      {/* vs Precio */}
                      <td className="p-4 text-center">
                        {strikeVsPrice !== null && (
                          <span className={`font-medium ${
                            strikeVsPrice > 0 ? 'text-green-600' : strikeVsPrice < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {strikeVsPrice > 0 ? '+' : ''}{strikeVsPrice.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      
                      {/* Estado ITM/OTM/ATM */}
                      <td className="p-4 text-center">
                        {isATM ? (
                          <Tooltip content={TOOLTIPS.atm} position="left" wide>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium cursor-help">
                              ATM
                            </span>
                          </Tooltip>
                        ) : isITM ? (
                          <Tooltip content={TOOLTIPS.itm} position="left" wide>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium cursor-help">
                              ITM
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip content={TOOLTIPS.otm} position="left" wide>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium cursor-help">
                              OTM
                            </span>
                          </Tooltip>
                        )}
                      </td>
                      
                      {/* Señal */}
                      <td className="p-4 text-center">
                        <SignalIndicator ratio={ratioNum} type={move.type} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Leyenda */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📖 Guía de interpretación
              <InfoTooltip content="Referencia rápida para entender los indicadores de la tabla de actividad inusual." />
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🔥🔥🔥</span>
                <span>Vol/OI &gt; 3x = Actividad muy inusual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">🔥🔥</span>
                <span>Vol/OI 2-3x = Actividad inusual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⚡</span>
                <span>Vol/OI &lt; 2x = Actividad moderada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">ITM</span>
                <span>In The Money (con valor intrínseco)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">ATM</span>
                <span>At The Money (en el precio actual)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">OTM</span>
                <span>Out of The Money (sin valor intrínseco)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ESTADO VACÍO ===================== */}
      {(!data.top_unusual_moves || data.top_unusual_moves.length === 0) && !data.error && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-6xl mb-4 block">😴</span>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin actividad inusual detectada</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No hay movimientos significativos en opciones para este ticker en este momento.
            Esto puede indicar un período de baja volatilidad o consolidación.
          </p>
        </div>
      )}
    </div>
  );
}

// ===================== COMPONENTE INDICADOR DE SEÑAL =====================
interface SignalIndicatorProps {
  ratio: number;
  type: 'CALL' | 'PUT';
}

function SignalIndicator({ ratio, type }: SignalIndicatorProps) {
  const getContent = () => {
    if (ratio >= 3) {
      return {
        icon: '🔥🔥🔥',
        label: 'Muy Alto',
        tooltip: `Actividad extremadamente inusual (${ratio.toFixed(1)}x). Posible señal de movimiento institucional significativo.`
      };
    }
    if (ratio >= 2) {
      return {
        icon: '🔥🔥',
        label: 'Alto',
        tooltip: `Actividad inusual (${ratio.toFixed(1)}x). Mayor interés del habitual en este strike.`
      };
    }
    if (ratio >= 1.5) {
      return {
        icon: '🔥',
        label: 'Elevado',
        tooltip: `Actividad moderadamente elevada (${ratio.toFixed(1)}x). Worth watching.`
      };
    }
    return {
      icon: '⚡',
      label: 'Normal',
      tooltip: `Actividad dentro de rangos normales (${ratio.toFixed(1)}x).`
    };
  };

  const content = getContent();

  return (
    <Tooltip content={content.tooltip} position="left">
      <div className="flex flex-col items-center cursor-help">
        <span className="text-xl">{content.icon}</span>
        <span className={`text-xs font-semibold mt-1 ${
          ratio >= 3 
            ? (type === 'CALL' ? 'text-green-600' : 'text-red-600')
            : ratio >= 2 
              ? 'text-yellow-600' 
              : ratio >= 1.5 
                ? 'text-orange-500' 
                : 'text-gray-500'
        }`}>
          {content.label}
        </span>
      </div>
    </Tooltip>
  );
}