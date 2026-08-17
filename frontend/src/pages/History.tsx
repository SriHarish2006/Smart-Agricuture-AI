import { useEffect, useState } from "react";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { api, ApiError } from "../services/api";
import type { ChatHistoryItem, DiseaseHistoryItem, WeatherHistoryItem } from "../types";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function History() {
  const [weather, setWeather] = useState<WeatherHistoryItem[]>([]);
  const [disease, setDisease] = useState<DiseaseHistoryItem[]>([]);
  const [chat, setChat] = useState<ChatHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function load() {
    try {
      const [w, d, c] = await Promise.all([api.getWeatherHistory(), api.getDiseaseHistory(), api.getChatHistory()]);
      setWeather(w);
      setDisease(d);
      setChat(c);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load history.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function clearAll() {
    try {
      await api.clearHistory();
      setWeather([]);
      setDisease([]);
      setChat([]);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to clear history.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-canopy-950 flex items-center gap-2">
          <HistoryIcon className="text-canopy-600" /> History
        </h1>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 rounded-full border border-rust-500/40 text-rust-500 hover:bg-rust-500/10 font-medium px-4 py-2 text-sm transition-colors"
          >
            <Trash2 size={15} /> Clear History
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-canopy-800">Delete all history? This cannot be undone.</span>
            <button onClick={clearAll} className="rounded-full bg-rust-500 text-cream px-3.5 py-1.5 font-medium">Confirm</button>
            <button onClick={() => setConfirming(false)} className="rounded-full border border-canopy-300 px-3.5 py-1.5 font-medium text-canopy-800">Cancel</button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-canopy-950">Weather Analyses</h2>
        {weather.length === 0 ? (
          <EmptyState icon={<HistoryIcon size={24} />} title="No weather analyses yet" subtitle="Runs from the Weather Analysis page will appear here." />
        ) : (
          <div className="rounded-2xl border border-canopy-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-canopy-600 border-b border-canopy-100">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 font-medium">Crop</th>
                  <th className="px-4 py-2.5 font-medium">Temp</th>
                  <th className="px-4 py-2.5 font-medium">Condition</th>
                  <th className="px-4 py-2.5 font-medium">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {weather.map((w) => (
                  <tr key={w.id} className="border-b border-canopy-50 last:border-0">
                    <td className="px-4 py-2.5 text-canopy-700 whitespace-nowrap">{formatDate(w.created_at)}</td>
                    <td className="px-4 py-2.5 text-canopy-950">{w.location}</td>
                    <td className="px-4 py-2.5 text-canopy-950">{w.crop}</td>
                    <td className="px-4 py-2.5 font-mono text-canopy-950">{w.temperature}°C</td>
                    <td className="px-4 py-2.5 text-canopy-950">{w.weather_condition}</td>
                    <td className="px-4 py-2.5 text-canopy-700 max-w-xs truncate" title={w.recommendation}>{w.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-canopy-950">Leaf Analyses</h2>
        {disease.length === 0 ? (
          <EmptyState icon={<HistoryIcon size={24} />} title="No leaf analyses yet" subtitle="Uploads from the Leaf Disease Detection page will appear here." />
        ) : (
          <div className="rounded-2xl border border-canopy-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-canopy-600 border-b border-canopy-100">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Crop</th>
                  <th className="px-4 py-2.5 font-medium">Detected Disease</th>
                  <th className="px-4 py-2.5 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {disease.map((d) => (
                  <tr key={d.id} className="border-b border-canopy-50 last:border-0">
                    <td className="px-4 py-2.5 text-canopy-700 whitespace-nowrap">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-2.5 text-canopy-950">{d.crop}</td>
                    <td className="px-4 py-2.5 text-canopy-950">{d.disease}</td>
                    <td className="px-4 py-2.5 font-mono text-canopy-950">{d.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-canopy-950">Chatbot Interactions</h2>
        {chat.length === 0 ? (
          <EmptyState icon={<HistoryIcon size={24} />} title="No chatbot interactions yet" subtitle="Questions asked in the Agriculture Assistant will appear here." />
        ) : (
          <div className="rounded-2xl border border-canopy-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-canopy-600 border-b border-canopy-100">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Question</th>
                  <th className="px-4 py-2.5 font-medium">Answer</th>
                </tr>
              </thead>
              <tbody>
                {chat.map((c) => (
                  <tr key={c.id} className="border-b border-canopy-50 last:border-0">
                    <td className="px-4 py-2.5 text-canopy-700 whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-2.5 text-canopy-950 max-w-xs">{c.question}</td>
                    <td className="px-4 py-2.5 text-canopy-700 max-w-md truncate" title={c.answer}>{c.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
