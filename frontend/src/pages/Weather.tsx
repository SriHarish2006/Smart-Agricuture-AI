import { FormEvent, useState } from "react";
import { CloudSun, Thermometer, Droplets, CloudRain, Wind, Cloud, Sprout } from "lucide-react";
import { api, ApiError } from "../services/api";
import type { WeatherResponse } from "../types";
import { CROPS } from "../data/crops";
import ErrorBanner from "../components/ErrorBanner";
import LoadingState from "../components/LoadingState";

export default function Weather() {
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState(CROPS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.analyzeWeather(location.trim(), crop);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to retrieve weather information. Please check the location and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 flex items-center gap-2">
          <CloudSun className="text-canopy-600" /> Weather Analysis
        </h1>
        <p className="text-canopy-700 mt-1">Get current conditions and an AI-generated farming recommendation for your crop.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-canopy-200 bg-white p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-canopy-900">Location</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city / location"
              className="mt-1 w-full rounded-xl border border-canopy-300 px-3.5 py-2.5 text-sm focus:border-canopy-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-canopy-900">Crop</span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="mt-1 w-full rounded-xl border border-canopy-300 px-3.5 py-2.5 text-sm focus:border-canopy-500 outline-none bg-white"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-canopy-600 hover:bg-canopy-700 disabled:opacity-60 text-cream font-medium px-5 py-2.5 text-sm transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze Weather"}
        </button>
      </form>

      {loading && <LoadingState label="⏳ Analyzing weather..." />}
      {error && !loading && <ErrorBanner message={error} />}

      {result && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Thermometer size={18} />} label="Temperature" value={`${result.temperature}°C`} sub={`Feels like ${result.feels_like}°C`} />
            <StatCard icon={<Droplets size={18} />} label="Humidity" value={`${result.humidity}%`} />
            <StatCard icon={<CloudRain size={18} />} label="Rainfall" value={`${result.rainfall} mm`} sub={result.rain_probability != null ? `${result.rain_probability}% chance` : undefined} />
            <StatCard icon={<Wind size={18} />} label="Wind Speed" value={`${result.wind_speed} km/h`} />
          </div>

          <div className="rounded-2xl border border-canopy-200 bg-white p-5 flex items-center gap-3">
            <Cloud className="text-canopy-600" />
            <div>
              <p className="text-sm text-canopy-700">Condition in {result.location}</p>
              <p className="font-display font-semibold text-canopy-950">{result.condition}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-canopy-300 bg-canopy-50 p-5 space-y-3">
            <h2 className="font-display font-semibold text-canopy-950 flex items-center gap-2">
              <Sprout size={18} className="text-canopy-700" /> AI Farming Recommendation
            </h2>
            <p className="text-sm text-canopy-900">{result.recommendation.summary}</p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-white border border-canopy-200 p-3">
                <p className="text-xs font-semibold text-canopy-600 uppercase tracking-wide mb-1">Irrigation</p>
                <p className="text-sm text-canopy-900">{result.recommendation.irrigation_advice}</p>
              </div>
              <div className="rounded-xl bg-white border border-canopy-200 p-3">
                <p className="text-xs font-semibold text-canopy-600 uppercase tracking-wide mb-1">Spraying</p>
                <p className="text-sm text-canopy-900">{result.recommendation.spraying_advice}</p>
              </div>
            </div>
            <p className="text-xs text-canopy-600 pt-1">{result.recommendation.general_advice}</p>
          </div>

          {result.forecast.length > 0 && (
            <div className="rounded-2xl border border-canopy-200 bg-white p-5">
              <h2 className="font-display font-semibold text-canopy-950 mb-3">5-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {result.forecast.map((day) => (
                  <div key={day.date} className="rounded-xl border border-canopy-100 bg-canopy-50/60 p-3 text-center">
                    <p className="text-xs text-canopy-600">{day.date.slice(5)}</p>
                    <p className="text-sm font-medium text-canopy-950 mt-1">{day.condition}</p>
                    <p className="font-mono text-xs text-canopy-700 mt-1">{day.min_temp}° / {day.max_temp}°</p>
                    {day.rain_probability != null && (
                      <p className="text-[11px] text-canopy-600 mt-0.5">{day.rain_probability}% rain</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-canopy-200 bg-white p-4">
      <div className="text-canopy-600">{icon}</div>
      <p className="text-xs text-canopy-600 mt-2">{label}</p>
      <p className="font-mono text-lg font-semibold text-canopy-950">{value}</p>
      {sub && <p className="text-[11px] text-canopy-600 mt-0.5">{sub}</p>}
    </div>
  );
}
