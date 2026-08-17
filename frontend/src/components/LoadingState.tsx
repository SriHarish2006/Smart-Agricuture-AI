export default function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-canopy-200 bg-canopy-50 px-4 py-4 text-sm text-canopy-800">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-canopy-500 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-canopy-600"></span>
      </span>
      {label}
    </div>
  );
}
