import { ChangeEvent, useRef, useState } from "react";
import { Leaf, UploadCloud, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "../services/api";
import type { DiseasePrediction } from "../types";
import { CROPS } from "../data/crops";
import ErrorBanner from "../components/ErrorBanner";
import LoadingState from "../components/LoadingState";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024;

export default function Disease() {
  const [crop, setCrop] = useState(CROPS[1]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiseasePrediction | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(selected: File | undefined) {
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("Image is too large. Please upload an image smaller than 8 MB.");
      return;
    }
    setError(null);
    setResult(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!file) {
      setError("Please choose a leaf image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.predictDisease(crop, file);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to analyze the image. Please try again with a clear leaf photo.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 flex items-center gap-2">
          <Leaf className="text-canopy-600" /> AI Leaf Disease Detection
        </h1>
        <p className="text-canopy-700 mt-1">Upload a clear leaf photo to get an AI-based diagnosis and recommended actions.</p>
      </div>

      <div className="rounded-2xl border border-canopy-200 bg-white p-5 space-y-4">
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-canopy-900">Select Crop</span>
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

        {!previewUrl ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors ${
              dragActive ? "border-canopy-500 bg-canopy-50" : "border-canopy-300 hover:border-canopy-400"
            }`}
          >
            <UploadCloud size={32} className="text-canopy-500" />
            <p className="font-medium text-canopy-900">Drag &amp; Drop Image or Click to Upload</p>
            <p className="text-xs text-canopy-600">JPG, JPEG, PNG, or WEBP · up to 8 MB</p>
            <span className="mt-2 rounded-full bg-canopy-600 text-cream text-sm font-medium px-4 py-2">Choose Image</span>
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onInputChange} className="hidden" />
          </div>
        ) : (
          <div className="space-y-3">
            <img src={previewUrl} alt="Leaf preview" className="max-h-72 w-full object-contain rounded-xl border border-canopy-200 bg-canopy-50" />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={analyze}
                disabled={loading}
                className="rounded-full bg-canopy-600 hover:bg-canopy-700 disabled:opacity-60 text-cream font-medium px-5 py-2.5 text-sm transition-colors"
              >
                {loading ? "Analyzing..." : "Analyze Leaf"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-full border border-canopy-300 hover:bg-canopy-50 text-canopy-800 font-medium px-4 py-2.5 text-sm transition-colors"
              >
                <RotateCcw size={15} /> Upload Another Leaf
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <LoadingState label="🔬 AI is analyzing your leaf..." />}
      {error && !loading && <ErrorBanner message={error} />}

      {result && !loading && (
        <div className="rounded-2xl border border-canopy-200 bg-white p-5 space-y-4">
          <h2 className="font-display font-semibold text-canopy-950">🔬 AI Analysis Result</h2>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-canopy-600 text-xs">Crop</p>
              <p className="font-medium text-canopy-950">{result.crop}</p>
            </div>
            <div>
              <p className="text-canopy-600 text-xs">Detected Condition</p>
              <p className="font-medium text-canopy-950">{result.disease}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-canopy-700">Confidence</span>
              <span className="font-mono font-semibold text-canopy-950">{result.confidence}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-canopy-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${result.is_low_confidence ? "bg-harvest-500" : "bg-canopy-600"}`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {result.is_low_confidence ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-harvest-500/40 bg-harvest-400/10 px-4 py-3 text-sm text-soil-700">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-harvest-600" />
              <div>
                <p className="font-medium">⚠️ Low Confidence</p>
                <p>The AI is not sufficiently confident in this prediction. Please upload a clearer image showing the complete leaf.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-canopy-300 bg-canopy-50 px-4 py-3 text-sm text-canopy-900">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-canopy-600" />
              <p>This prediction meets the confidence threshold, but always confirm with a local expert for critical decisions.</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-canopy-600 uppercase tracking-wide mb-1">Symptoms</p>
            <p className="text-sm text-canopy-900">{result.symptoms}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-canopy-600 uppercase tracking-wide mb-1">Recommended Actions</p>
            <ul className="text-sm text-canopy-900 space-y-1 list-disc list-inside">
              {result.recommended_actions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-full border border-canopy-300 hover:bg-canopy-50 text-canopy-800 font-medium px-4 py-2.5 text-sm transition-colors"
          >
            <RotateCcw size={15} /> Upload Another Leaf
          </button>
        </div>
      )}
    </div>
  );
}
