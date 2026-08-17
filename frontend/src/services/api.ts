/**
 * Centralized API service. All HTTP calls to the backend live here so
 * components never construct URLs or call axios directly.
 */
import axios, { AxiosError } from "axios";
import type {
  ChatAskResponse,
  ChatHistoryItem,
  ChatQuestion,
  DiseaseHistoryItem,
  DiseasePrediction,
  WeatherHistoryItem,
  WeatherResponse,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({ baseURL: API_URL, timeout: 20000 });

export class ApiError extends Error {}

function extractMessage(error: unknown, fallback: string): string {
  const axiosErr = error as AxiosError<{ detail?: string }>;
  if (axiosErr?.response?.data?.detail) return axiosErr.response.data.detail;
  if (axiosErr?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (axiosErr?.message === "Network Error") return "Unable to reach the server. Please check that the backend is running.";
  return fallback;
}

async function call<T>(promise: Promise<{ data: T }>, fallback: string): Promise<T> {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    throw new ApiError(extractMessage(err, fallback));
  }
}

export const api = {
  health: () => call<{ status: string }>(client.get("/api/health"), "Backend is unavailable."),

  analyzeWeather: (location: string, crop: string) =>
    call<WeatherResponse>(
      client.post("/api/weather/analyze", { location, crop }),
      "Unable to retrieve weather information. Please check the location and try again."
    ),

  predictDisease: (crop: string, file: File) => {
    const form = new FormData();
    form.append("crop", crop);
    form.append("file", file);
    return call<DiseasePrediction>(
      client.post("/api/disease/predict", form, { headers: { "Content-Type": "multipart/form-data" } }),
      "Unable to analyze the image. Please try again."
    );
  },

  getChatQuestions: (crop?: string) =>
    call<ChatQuestion[]>(client.get("/api/chatbot/questions", { params: crop ? { crop } : {} }), "Unable to load questions."),

  getChatCrops: () => call<string[]>(client.get("/api/chatbot/crops"), "Unable to load crop list."),

  askChatbot: (question: string, crop?: string) =>
    call<ChatAskResponse>(client.post("/api/chatbot/ask", { question, crop }), "Unable to get an answer right now."),

  getWeatherHistory: () => call<WeatherHistoryItem[]>(client.get("/api/history/weather"), "Unable to load weather history."),
  getDiseaseHistory: () => call<DiseaseHistoryItem[]>(client.get("/api/history/disease"), "Unable to load disease history."),
  getChatHistory: () => call<ChatHistoryItem[]>(client.get("/api/history/chat"), "Unable to load chat history."),

  clearHistory: () => call<{ status: string }>(client.delete("/api/history/clear"), "Unable to clear history."),
};
