<<<<<<< HEAD
# 🌱 AI Smart Agriculture

An AI-powered web application for farmers with three modules:

1. **🌦️ Weather Analysis** — real weather data plus a rule-based farming recommendation (irrigation / spraying advice) generated from that data.
2. **🌿 AI Leaf Disease Detection** — upload a leaf photo and get a prediction from a real, trained EfficientNetB0 image-classification model, with symptoms and recommended actions.
3. **🤖 Agriculture Chatbot** — predefined question-and-answer knowledge base (30+ Q&A) covering rice, tomato, potato, wheat, maize, and general agriculture topics, plus a free-text question box that only answers from the knowledge base.

Built as a final-year Computer Science engineering project / portfolio piece.

---

## Features

- Weather lookup by location + crop, with temperature, humidity, rainfall, wind, cloud cover, rain probability, and a 5-day forecast
- AI farming recommendations generated from actual weather data (not canned text) — irrigation and spraying guidance
- Leaf image upload (drag-and-drop or click), with crop selection, image preview, and re-upload flow
- Real CNN-based disease classification (EfficientNetB0 transfer learning) with a confidence score and a low-confidence warning when the model isn't sure
- Predefined agriculture chatbot with crop-specific question lists and category grouping, plus free-text Q&A matched against the same knowledge base
- History of weather analyses, leaf analyses, and chatbot interactions, stored in SQLite, with a "Clear History" action that requires confirmation
- Friendly error handling throughout — no raw stack traces or fake AI results are ever shown

## Technology Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts, lucide-react
**Backend:** Python, FastAPI, Pydantic, Uvicorn
**AI/ML:** TensorFlow/Keras (EfficientNetB0 transfer learning), Pillow, NumPy, scikit-learn
**Database:** SQLite via SQLAlchemy

## Architecture

```
Frontend (React/Vite, :5173)
        │  REST (JSON / multipart)
        ▼
Backend (FastAPI, :8000)
   ├── /api/weather   → weather_service.py → OpenWeatherMap
   ├── /api/disease    → disease_service.py → ml/disease_model.py (EfficientNetB0)
   ├── /api/chatbot    → chatbot_service.py → data/chatbot_qa.json
   └── /api/history     → SQLite (SQLAlchemy)
```

## Project Structure

```
ai-smart-agriculture/
├── frontend/            React + TypeScript + Vite + Tailwind app
├── backend/              FastAPI app, services, ML inference, training script
├── data/                  chatbot_qa.json, disease_classes.json
├── models/               trained model + class map (produced by training, not committed)
└── README.md
```

See `backend/app/main.py` for the FastAPI entrypoint and `frontend/src/App.tsx` for the React routes.

## Installation

### Backend Setup (Windows / VS Code)

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set your `WEATHER_API_KEY` (see below).

```
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000. API docs at http://localhost:8000/api/docs (Swagger) and http://localhost:8000/api/redoc.

### Frontend Setup

```
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at http://localhost:5173.

## Environment Variables

**backend/.env** (see `backend/.env.example`):

| Variable | Description |
|---|---|
| `WEATHER_API_KEY` | Your OpenWeatherMap API key (never hard-coded, never exposed to the frontend) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins (default `http://localhost:5173`) |
| `DATABASE_URL` | SQLite connection string |
| `DISEASE_CONFIDENCE_THRESHOLD` | Minimum confidence (0–1) before a prediction is flagged low-confidence |

**frontend/.env** (see `frontend/.env.example`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (default `http://localhost:8000`) |

## Weather API Setup

1. Create a free account at https://openweathermap.org/api
2. Generate an API key
3. Put it in `backend/.env` as `WEATHER_API_KEY=...`
4. Never commit `.env` — it's already in `.gitignore`

## Dataset & Model Training

The leaf disease model is **not included** in this repository (trained model
weights are large binary files and are excluded via `.gitignore`). To train it:

1. Obtain a labeled leaf-image dataset such as [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease), organized as one subfolder per class (see `backend/ml/train_model.py` for the expected layout).
2. Run (Windows example, matching a PlantVillage folder under `Downloads\Smart Agriculture AI\PlantVillage`):

   ```
   cd backend
   venv\Scripts\activate
   python ml\train_model.py --data-dir "%USERPROFILE%\Downloads\Smart Agriculture AI\PlantVillage" --epochs 10
   ```

   (macOS/Linux: `python ml/train_model.py --data-dir /path/to/PlantVillage --epochs 10`)

3. This produces `models/leaf_disease_model.keras`, `models/class_names.json`, and `models/training_metrics.json` (with the actual validation accuracy/loss achieved — nothing fabricated).

`data/disease_classes.json` already ships with metadata (crop, symptoms, recommended actions) for the standard 15-class PlantVillage subset — Tomato (10 classes), Potato (3 classes), and Pepper Bell (2 classes) — so if your dataset uses those exact folder names, no further edits are needed. If you use a different or larger dataset, add/update entries in `data/disease_classes.json` keyed by the exact class folder name.

**Until the model is trained, the `/api/disease/predict` endpoint returns a clear,
explicit "model not available" error with training instructions — it never
fabricates a disease name or confidence score.**

## Running the Application

Start the backend first, then the frontend (see Installation above). Open
http://localhost:5173 in your browser.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/weather/analyze` | Analyze weather + get a farming recommendation |
| POST | `/api/disease/predict` | Predict leaf disease from an uploaded image |
| GET | `/api/chatbot/questions` | List predefined questions (optional `?crop=`) |
| GET | `/api/chatbot/crops` | List crops with predefined questions |
| POST | `/api/chatbot/ask` | Ask a predefined or free-text agriculture question |
| GET | `/api/history/weather` | Weather analysis history |
| GET | `/api/history/disease` | Leaf disease analysis history |
| GET | `/api/history/chat` | Chatbot interaction history |
| DELETE | `/api/history/clear` | Clear all history |

Full interactive docs at `/api/docs` and `/api/redoc` once the backend is running.

## Limitations

- The leaf disease model must be trained by the user; a pre-trained model is not bundled with this repository.
- Weather forecasting accuracy depends entirely on the underlying weather API (OpenWeatherMap) and is not guaranteed.
- The chatbot only answers questions present in `data/chatbot_qa.json` — it does not use a general-purpose language model and will say so when it doesn't have a verified answer.
- No user authentication is implemented; history is stored per-server-instance in a local SQLite database rather than per-user account.
- Uploaded leaf images are processed in-memory and are not stored permanently.

## Future Improvements

- User accounts and per-user history
- Expand the trained model to more crops/diseases as labeled data becomes available
- Push notifications / alerts for adverse weather
- Offline-first support for low-connectivity rural areas
- Multi-language support for the chatbot and UI

---

Built following an "no fake AI results, no fabricated data" development discipline: every prediction, weather value, and chatbot answer shown to the user is either retrieved from a real API/model or comes from an explicit knowledge base — nothing is randomly generated or invented.
=======
# Smart-Agriculture-Ai
>>>>>>> 93668cd09c41e1605fc17c65e6e520b3aa2a81ba
