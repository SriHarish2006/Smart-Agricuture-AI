import { ReactNode } from "react";

export default function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 rounded-2xl border border-dashed border-canopy-300 bg-canopy-50/60 px-6 py-12">
      <div className="text-canopy-500">{icon}</div>
      <p className="font-medium text-canopy-900">{title}</p>
      {subtitle && <p className="text-sm text-canopy-700 max-w-sm">{subtitle}</p>}
    </div>
  );
}
