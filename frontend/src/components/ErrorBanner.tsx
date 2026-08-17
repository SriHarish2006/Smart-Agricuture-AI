import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rust-500/30 bg-rust-500/10 px-4 py-3 text-sm text-rust-500">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
}
