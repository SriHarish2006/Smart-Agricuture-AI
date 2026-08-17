export interface ForecastDay {
  date: string;
  min_temp: number;
  max_temp: number;
  condition: string;
  rain_probability: number | null;
}

export interface FarmingRecommendation {
  summary: string;
  irrigation_advice: string;
  spraying_advice: string;
  general_advice: string;
}

export interface WeatherResponse {
  location: string;
  crop: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  condition: string;
  cloud_coverage: number | null;
  rain_probability: number | null;
  forecast: ForecastDay[];
  recommendation: FarmingRecommendation;
}

export interface WeatherHistoryItem {
  id: number;
  location: string;
  crop: string;
  temperature: number;
  weather_condition: string;
  recommendation: string;
  created_at: string;
}

export interface DiseasePrediction {
  crop: string;
  disease: string;
  confidence: number;
  is_low_confidence: boolean;
  symptoms: string;
  recommended_actions: string[];
}

export interface DiseaseHistoryItem {
  id: number;
  crop: string;
  disease: string;
  confidence: number;
  image_name: string;
  created_at: string;
}

export interface ChatQuestion {
  id: number;
  crop: string;
  category: string;
  question: string;
}

export interface ChatAskResponse {
  question: string;
  answer: string;
  matched: boolean;
  crop?: string | null;
}

export interface ChatHistoryItem {
  id: number;
  crop?: string | null;
  question: string;
  answer: string;
  created_at: string;
}

export interface ApiErrorShape {
  detail: string;
}
