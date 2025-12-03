interface MetricCardProps {
  label: string;
  value?: string | number | null;
  subLabel?: string;
  icon?: string;
  colorClass?: string;
  tooltip?: string;
}

export function MetricCard({ label, value, subLabel, icon, colorClass = 'text-gray-800', tooltip }: MetricCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors" title={tooltip}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`font-bold text-lg ${colorClass}`}>{value ?? 'N/A'}</p>
          {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
        </div>
        {icon && <span className="text-2xl ml-2">{icon}</span>}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value?: string | number | null;
  colorClass?: string;
}

export function MetricRow({ label, value, colorClass = 'text-gray-700' }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-medium ${colorClass}`}>{value ?? 'N/A'}</span>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, icon, children, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}