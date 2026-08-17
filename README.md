# 🌱 Smart Agriculture AI

An intelligent AI-powered agriculture platform that helps farmers make informed decisions through **leaf disease detection, weather analysis, crop insights, and an AI assistant**. The application combines **Deep Learning, FastAPI, React, and TensorFlow** to provide a modern and user-friendly farming solution.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-FF6F00?style=for-the-badge&logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 Overview

Smart Agriculture AI is a full-stack web application designed to support precision agriculture using Artificial Intelligence.

The platform enables users to:

- 🌿 Detect plant diseases from leaf images
- ☀️ Analyze real-time weather conditions
- 🌾 View crop-specific recommendations
- 🤖 Interact with an AI agriculture assistant
- 📊 Monitor agricultural insights through a clean dashboard

---

## ✨ Features

### 🌿 AI Leaf Disease Detection

- Upload a crop leaf image
- CNN model built using TensorFlow (EfficientNetB0)
- Confidence score prediction
- Disease diagnosis
- Treatment recommendations

Supported Crops

- 🍅 Tomato
- 🥔 Potato
- 🫑 Bell Pepper

---

### 🌦 Weather Analysis

- Real-time weather information
- Temperature
- Humidity
- Wind Speed
- Rain Prediction
- Farming recommendations based on weather

Powered by OpenWeather API.

---

### 🤖 AI Agriculture Assistant

Chatbot capable of answering questions about:

- Crop diseases
- Fertilizers
- Irrigation
- Soil management
- Pest control
- Farming best practices

---

### 📊 Dashboard

Interactive dashboard displaying:

- Crop statistics
- Disease analysis
- Weather summary
- Prediction history

---

## 🏗 System Architecture

```text
                 React + TypeScript
                        │
                        ▼
                FastAPI REST API
         ┌──────────┼───────────┐
         ▼          ▼           ▼
   TensorFlow   OpenWeather   SQLite
      Model         API       Database
```

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- Uvicorn

## Machine Learning

- TensorFlow
- EfficientNetB0
- NumPy
- Scikit-learn
- Pillow

## Database

- SQLite

## APIs

- OpenWeather API

---

# 📂 Project Structure

```
Smart Agriculture AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── ml/
│   ├── models/
│   ├── requirements.txt
│   └── .env.example
│
├── PlantVillage/
│
└── README.md
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/smart-agriculture-ai.git
cd smart-agriculture-ai
```

---

## 2. Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create `.env`

```env
WEATHER_API_KEY=YOUR_API_KEY
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=sqlite:///./agriculture.db
DISEASE_CONFIDENCE_THRESHOLD=0.60
```

---

## 4. Train the AI Model

```bash
python ml/train_model.py --data-dir "/path/to/PlantVillage" --epochs 10
```

---

## 5. Start Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://localhost:8000
```

Swagger API:

```
http://localhost:8000/api/docs
```

---

## 6. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🧠 Machine Learning Model

Model Architecture:

- EfficientNetB0
- Transfer Learning
- TensorFlow 2.17
- Image Size: 224×224

Dataset:

**PlantVillage Dataset**

Supported Classes

- Tomato Early Blight
- Tomato Late Blight
- Tomato Leaf Mold
- Tomato Mosaic Virus
- Tomato Septoria Leaf Spot
- Tomato Target Spot
- Tomato Yellow Leaf Curl Virus
- Tomato Healthy
- Potato Early Blight
- Potato Late Blight
- Potato Healthy
- Pepper Bell Bacterial Spot
- Pepper Bell Healthy

---

# 📸 Screenshots

## Dashboard

> Add screenshot here

---

## Weather Analysis

> Add screenshot here

---

## Disease Detection

> Add screenshot here

---

## AI Chatbot

> Add screenshot here

---

# 🔮 Future Enhancements

- 🌍 Multi-language support
- 📱 Mobile Application
- ☁ Cloud Deployment
- 🌱 Soil Health Prediction
- 📈 Crop Yield Prediction
- 🌾 Fertilizer Recommendation System
- 🛰 Satellite Image Analysis

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```
git checkout -b feature-name
```

3. Commit changes

```
git commit -m "Add new feature"
```

4. Push

```
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Author

**Sri Harish**

📧 Email: harishsri632@gmail.com

💼 LinkedIn: https://www.linkedin.com/in/sri-harish-2b34a930a

💻 GitHub: https://github.com/SriHarish2006

---

# ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

It helps support the project and encourages future development.
