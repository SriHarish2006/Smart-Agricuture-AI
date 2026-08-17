"""
Weather retrieval (OpenWeatherMap) and rule-based farming recommendations.

No AI/paid text-generation API is used for recommendations - they are
generated from real weather data using deterministic agricultural rules.
"""
from typing import Any, Dict

import httpx

from app.config import get_settings
from app.schemas.weather import FarmingRecommendation, ForecastDay, WeatherResponse


class WeatherServiceError(Exception):
    """Raised for any user-facing weather retrieval failure."""


async def fetch_weather(location: str, crop: str) -> WeatherResponse:
    settings = get_settings()

    if not settings.weather_api_key:
        raise WeatherServiceError(
            "Weather service is not configured. Please set WEATHER_API_KEY in backend/.env."
        )

    if not location.strip():
        raise WeatherServiceError("Please enter a location.")

    params = {
        "q": location.strip(),
        "appid": settings.weather_api_key,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            current_resp = await client.get(f"{settings.weather_api_base_url}/weather", params=params)
            forecast_resp = await client.get(f"{settings.weather_api_base_url}/forecast", params=params)
    except httpx.RequestError:
        raise WeatherServiceError(
            "Unable to reach the weather service. Please check your internet connection and try again."
        )

    if current_resp.status_code == 401:
        raise WeatherServiceError("Weather service authentication failed. Please check the API key configuration.")
    if current_resp.status_code == 404:
        raise WeatherServiceError("Location not found. Please check the spelling and try again.")
    if current_resp.status_code != 200:
        raise WeatherServiceError("Unable to retrieve weather information. Please try again later.")

    current: Dict[str, Any] = current_resp.json()

    try:
        main = current["main"]
        weather_list = current.get("weather", [{}])
        condition = weather_list[0].get("main", "Unknown") if weather_list else "Unknown"
        wind_speed_kmh = current.get("wind", {}).get("speed", 0.0) * 3.6  # m/s -> km/h
        rainfall_mm = current.get("rain", {}).get("1h", 0.0)
        cloud_coverage = current.get("clouds", {}).get("all")
    except KeyError:
        raise WeatherServiceError("Weather information is incomplete for this location. Please try again.")

    forecast_days = []
    rain_probability = None
    if forecast_resp.status_code == 200:
        forecast_json = forecast_resp.json()
        by_day: Dict[str, Dict[str, Any]] = {}
        for entry in forecast_json.get("list", []):
            date = entry["dt_txt"].split(" ")[0]
            temp = entry["main"]["temp"]
            pop = entry.get("pop", 0.0) * 100
            cond = entry.get("weather", [{}])[0].get("main", "Unknown")
            day = by_day.setdefault(
                date,
                {"min_temp": temp, "max_temp": temp, "condition": cond, "pop": pop},
            )
            day["min_temp"] = min(day["min_temp"], temp)
            day["max_temp"] = max(day["max_temp"], temp)
            day["pop"] = max(day["pop"], pop)

        for date, day in list(by_day.items())[:5]:
            forecast_days.append(
                ForecastDay(
                    date=date,
                    min_temp=round(day["min_temp"], 1),
                    max_temp=round(day["max_temp"], 1),
                    condition=day["condition"],
                    rain_probability=round(day["pop"], 1),
                )
            )
        if forecast_days:
            rain_probability = forecast_days[0].rain_probability

    recommendation = _build_recommendation(
        crop=crop,
        temperature=main["temp"],
        humidity=main["humidity"],
        rainfall_mm=rainfall_mm,
        condition=condition,
        rain_probability=rain_probability,
    )

    return WeatherResponse(
        location=current.get("name", location),
        crop=crop,
        temperature=round(main["temp"], 1),
        feels_like=round(main.get("feels_like", main["temp"]), 1),
        humidity=main["humidity"],
        rainfall=round(rainfall_mm, 1),
        wind_speed=round(wind_speed_kmh, 1),
        condition=condition,
        cloud_coverage=cloud_coverage,
        rain_probability=rain_probability,
        forecast=forecast_days,
        recommendation=recommendation,
    )


def _build_recommendation(
    crop: str,
    temperature: float,
    humidity: float,
    rainfall_mm: float,
    condition: str,
    rain_probability,
) -> FarmingRecommendation:
    """
    Deterministic, rule-based recommendation derived from the actual weather
    values returned by the API. This is heuristic agricultural guidance, not
    a guarantee.
    """
    condition_lower = condition.lower()
    likely_rain = "rain" in condition_lower or "drizzle" in condition_lower or "thunderstorm" in condition_lower
    likely_rain = likely_rain or (rain_probability is not None and rain_probability >= 60)

    parts = []
    irrigation_parts = []
    spraying_parts = []

    if likely_rain:
        parts.append(f"Rain is expected or currently occurring for {crop} at this location.")
        irrigation_parts.append("Avoid unnecessary irrigation and monitor soil moisture before adding more water.")
        spraying_parts.append("Avoid spraying pesticides or fertilizers immediately before rainfall, as it may wash off.")
    else:
        parts.append(f"No significant rain is currently indicated for {crop} at this location.")
        spraying_parts.append("Conditions appear suitable for spraying if otherwise required; avoid spraying during high wind or peak heat.")

    if humidity >= 80:
        parts.append("Humidity is high, which can increase the risk of fungal diseases.")
        spraying_parts.append("Monitor closely for fungal symptoms in humid conditions.")
    elif humidity <= 30:
        parts.append("Humidity is low, which may increase crop water stress.")
        irrigation_parts.append("Consider more frequent monitoring of soil moisture due to low humidity.")

    if temperature >= 35:
        parts.append("Temperatures are high; heat stress is possible.")
        irrigation_parts.append("Irrigate during cooler parts of the day (early morning or evening) to reduce evaporation loss.")
    elif temperature <= 10:
        parts.append("Temperatures are low; growth may slow and some crops may be sensitive to cold.")

    if rainfall_mm and rainfall_mm > 5:
        irrigation_parts.append(f"Recent rainfall of {rainfall_mm:.1f} mm may reduce or remove the need for irrigation today.")

    if not irrigation_parts:
        irrigation_parts.append("Maintain your regular irrigation schedule based on soil moisture checks.")
    if not spraying_parts:
        spraying_parts.append("No specific spraying restrictions indicated by current weather.")

    return FarmingRecommendation(
        summary=" ".join(parts),
        irrigation_advice=" ".join(irrigation_parts),
        spraying_advice=" ".join(spraying_parts),
        general_advice=(
            "This recommendation is generated from current weather data and general agricultural "
            "principles. It is not a guarantee — always confirm with local agricultural extension "
            "guidance for your specific field conditions."
        ),
    )
