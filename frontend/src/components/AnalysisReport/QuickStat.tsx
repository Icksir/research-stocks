interface QuickStatProps {
  label: string;
  value?: string | number | null;
  subValue?: string;
}

export function QuickStat({ label, value, subValue }: QuickStatProps) {
  return (
    <div className="text-center">
      <p className="text-blue-200 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold text-lg">{value ?? 'N/A'}</p>
      {subValue && <p className="text-blue-300 text-xs">{subValue}</p>}
    </div>
  );
}