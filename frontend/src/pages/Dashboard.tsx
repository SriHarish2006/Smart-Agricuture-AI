import { Link } from "react-router-dom";
import { CloudSun, Leaf, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { DiseaseHistoryItem, WeatherHistoryItem } from "../types";

const cards = [
  {
    to: "/weather",
    icon: CloudSun,
    title: "Weather Analysis",
    subtitle: "Current weather and a farming recommendation for your crop",
  },
  {
    to: "/disease",
    icon: Leaf,
    title: "Leaf Disease",
    subtitle: "Upload a leaf image for AI-based disease analysis",
  },
  {
    to: "/chatbot",
    icon: MessageCircleQuestion,
    title: "Agriculture Assistant",
    subtitle: "Get answers to common farming questions",
  },
];

export default function Dashboard() {
  const [weatherHistory, setWeatherHistory] = useState<WeatherHistoryItem[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<DiseaseHistoryItem[]>([]);

  useEffect(() => {
    api.getWeatherHistory().then(setWeatherHistory).catch(() => {});
    api.getDiseaseHistory().then(setDiseaseHistory).catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-canopy-900 text-cream px-6 py-12 sm:px-10 sm:py-16 bg-furrow">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-harvest-400 mb-3">
            Field-ready intelligence
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
            🌱 AI Smart Agriculture
          </h1>
          <p className="mt-3 text-canopy-100 text-base sm:text-lg">
            Intelligent Farming Assistant for Weather, Plant Disease Detection &amp; Agricultural Guidance
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/weather" className="rounded-full bg-harvest-500 hover:bg-harvest-400 text-canopy-950 font-medium px-5 py-2.5 text-sm transition-colors">
              Check today's weather
            </Link>
            <Link to="/disease" className="rounded-full border border-cream/40 hover:bg-cream/10 px-5 py-2.5 text-sm transition-colors">
              Analyze a leaf photo
            </Link>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {cards.map(({ to, icon: Icon, title, subtitle }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-canopy-200 bg-white p-5 hover:border-canopy-400 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-canopy-100 text-canopy-700 flex items-center justify-center mb-3 group-hover:bg-canopy-600 group-hover:text-cream transition-colors">
              <Icon size={20} />
            </div>
            <p className="font-display font-semibold text-canopy-950">{title}</p>
            <p className="text-sm text-canopy-700 mt-1">{subtitle}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-canopy-600 font-medium">
              Open <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-canopy-200 bg-white p-5">
          <h2 className="font-display font-semibold text-canopy-950 mb-3">Recent Weather Analysis</h2>
          {weatherHistory.length === 0 ? (
            <p className="text-sm text-canopy-600">No weather analyses yet. Run one from the Weather Analysis page.</p>
          ) : (
            <ul className="space-y-2">
              {weatherHistory.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm border-b border-canopy-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-canopy-900">{item.location} · {item.crop}</span>
                  <span className="font-mono text-canopy-700">{item.temperature}°C</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-canopy-200 bg-white p-5">
          <h2 className="font-display font-semibold text-canopy-950 mb-3">Recent Disease Analysis</h2>
          {diseaseHistory.length === 0 ? (
            <p className="text-sm text-canopy-600">No leaf analyses yet. Upload a photo from the Leaf Disease Detection page.</p>
          ) : (
            <ul className="space-y-2">
              {diseaseHistory.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm border-b border-canopy-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-canopy-900">{item.crop} · {item.disease}</span>
                  <span className="font-mono text-canopy-700">{item.confidence}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
