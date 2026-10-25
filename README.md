<div align="center">

# 🌾 Sasya (ಸಸ್ಯ)
### *Spot the disease early. Farm together.*

**A Trilingual Crop Intelligence, Safe Agronomic AI & Rural Exchange Platform for Young Farmers**

[![Live Backend](https://img.shields.io/badge/Render-Backend%20Live-22c55e?logo=render&style=flat-square)](https://sasya-backend.onrender.com/api/health)
[![Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-646cff?logo=vite&style=flat-square)](http://localhost:5173/)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B2%95%E0%B2%A8%E0%B3%8D%E0%B2%A8%E0%B2%A1%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%80-emerald?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()

</div>

---

## 📖 Overview

**Sasya (ಸಸ್ಯ)** is built to solve the real challenges faced by young, isolated farmers and plantation growers across Coastal Karnataka, Malnad, and Northern agricultural belts. Young farmers often inherit land without an experienced peer group or direct access to certified agronomists, while traditional farming portals suffer from high typing friction, dense scientific jargon, and pesticide liability risks.

Sasya combines **Reddit-style crop communities**, **safe AI communication tools**, and **deep-learning leaf pathology diagnosis** into a lightweight, trilingual web application designed for mobile and rural connectivity.

---

## ✨ Key Capabilities

### 1. 👥 Crop-Specific Reddit Communities
Dedicated, focused discussion spaces tailored to each crop ecosystem:
* **`r/arecanut`** — Arecanut Plantation Growers (Koleroga alerts, palm climbers, bunch covers).
* **`r/paddy`** — Paddy & Rice Agronomy (Blast lesions, seedling nurseries, transplanting crews).
* **`r/tomato`** — Solanaceous & Vegetable Growers (Early & Late Blight, bamboo trellising).
* **`r/apple`** — High-Altitude Apple Orchards (Apple scab, post-harvest orchard hygiene).

**Features:**
* **Reddit Interaction Model**: Upvoting, downvoting, nested comment replies, saved bookmarks, and category flairs (`Labour Request`, `Equipment Rental`, `Disease Query`, `Weather Advisory`, `General Discussion`).
* **1-on-1 Reddit Private Chat (DMs)**: Message growers, equipment owners, and labour contractors directly without publishing private phone numbers.
* **Open Grower Network**: 1-click farmer following (`+ Follow`); followed growers are automatically prioritized at the top of feeds.
* **Live Cloud Sync**: Local-first offline persistence combined with automatic 6-second cloud synchronization with the Render backend.

---

### 2. 🤖 Sasya AI Feature Suite

The Sasya AI assistant functions as a communication bridge, helping farmers draft listings, understand diagnoses, and communicate across language barriers without liability:

* **🎙️ Voice & Text Listing Quick Draft**
  * Farmers speak or type naturally in Kannada, Hindi, or English (e.g., *"need 2 climbers Thursday, Venur"*, *"೨ ಜನ ಮರ ಹತ್ತುವವರು ಬೇಕು ಗುರುವಾರ ವೇಣೂರು"*, or *"गुरुवार को 2 मजदूर चाहिए वेणूर में"*).
  * Built-in **Web Speech API** dictation captures audio in real time.
  * The AI extracts the intent, worker count, timing, wage, and taluk/village to pre-fill the listing card in under 10 seconds.
* **🛡️ Automated Safety Nudges**
  * **Tree Climbing**: Automatically attaches safety checklists inspecting harnesses, waist straps, climbing rings, and forbidding climbing during continuous rain or lightning.
  * **Fungicide Spraying**: Automatically attaches PPE safety guidelines (respirator mask, rubber gloves, eye goggles, and downwind spraying buffers).
* **🌐 1-Tap Trilingual Translation**
  * 1-tap translation switcher (`[ಕನ್ನಡ] [हिंदी] [English]`) on post cards and comments.
  * Enables seamless communication between Karnataka growers and northern farmers with instant 1-click *"Show Original"* toggles.
* **🔬 "Explain My Scan" in Plain Words**
  * Translates raw neural network pathology predictions into plain words explaining the disease, what the severity percentage means, and cultural sanitation steps.
  * Includes audio read-aloud via Web Speech Synthesis.
  * **Strictly zero chemical dosages or commercial brand names**.
* **💬 "Suggest What to Ask the Expert"**
  * Pre-drafts a concise, respectful question including the leaf photo thumbnail, crop, stage, and village.
  * 1-click copy and 1-click transfer directly into 1-on-1 expert chat.

---

### 3. 🔬 Computer Vision Leaf Pathology Engine
* **Backbone**: Custom PyTorch `ResNet-18` multi-crop pathology classifier trained on Arecanut, Paddy, Tomato, and Apple.
* **Severity Grading**: Ordinal regression model (`CORN`) estimating percentage lesion damage and categorical damage levels.
* **Visual Attention (Grad-CAM)**: Generates spatial heatmaps showing exactly which leaf regions triggered the classification.
* **Out-of-Distribution (OOD) Guard**: Filters non-leaf photos, background clutter, and unsupported crops before inference.

---

### 4. 🌤️ Bioclimatic Weather Intelligence
* Integrates real-time hourly telemetry via **Open-Meteo API** (ambient temperature, relative humidity, wind speed, precipitation probability).
* Detects epidemiological microclimate triggers (e.g., $>90\%$ RH sustained over 14 hours triggering *Phytophthora meadii* zoospore release).

---

## 🔒 Safe Agronomy & Responsible AI Policy

To protect rural farmers from crop damage and eliminate liability, Sasya follows strict safety boundaries:

1. **Human-in-the-Loop Confirmation**: The AI only drafts and pre-fills forms. **Nothing is ever posted or sent automatically**. The user reviews, edits, and clicks *"Post"*.
2. **Zero Chemical Dosages**: The AI never generates chemical dosage formulas (e.g. grams per 100L) or proprietary fungicide brands. It recommends cultural sanitation, organic management (Jeevamrutha, neem cake), and directs the user to certified agronomists.
3. **No Text-Only Diagnosis**: Disease diagnosis requires an authentic leaf photo evaluated by the vision pipeline, never guessed from text prompts alone.
4. **Source Attribution**: All AI-assisted text is explicitly labelled: `✨ AI Draft by Sasya AI • Please review and edit before posting.`

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                        │
│       React 18 + Vite + Tailwind CSS + Lucide Icons         │
│  Web Speech Recognition (Voice) + Web Speech Synthesis (Audio)│
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Cloud Backend                    │
│             Uvicorn + Pydantic + SQLite Persistence         │
│       Hosted on Render (https://sasya-backend.onrender.com) │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────────┐       ┌──────────────────────┐
    │ PyTorch Vision Core  │       │   Open-Meteo API     │
    │ ResNet-18 + Grad-CAM │       │ Hyperlocal Telemetry │
    │ CORN Severity Model  │       │ Bioclimatic Risk     │
    └──────────────────────┘       └──────────────────────┘
```

* **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React icons, Web Speech API.
* **Backend**: FastAPI 0.110, Uvicorn 0.28, PyTorch 2.2, Torchvision 0.17, OpenCV, Pillow, Pydantic 2.6.
* **Localization**: Full trilingual dictionary across English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी).
* **Hosting**: Render cloud container for backend (`uvicorn app_api:app`), local/static frontend.

---

## 📁 Repository Structure

```
hackcache/
├── frontend/                     # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/           # Navbar, RedditChat, VisualExplainability
│   │   ├── context/              # AuthContext (Theme, Trilingual Switcher)
│   │   ├── data/                 # adminMockData
│   │   ├── locales/              # translations.js (EN, KN, HI)
│   │   ├── pages/                # Community, DetectResult, AIAssistant, Home, etc.
│   │   │   ├── Community.jsx     # Reddit replica with Voice Quick Draft & 1-Tap Translate
│   │   │   ├── DetectResult.jsx  # Plain-words diagnosis & Expert Question drafter
│   │   │   └── AIAssistant.jsx   # Safe cultural advice & Labour/Equipment planner
│   │   └── services/
│   │       ├── api.js            # Live Render backend API bindings
│   │       └── communityAi.js    # Natural language parser, safety nudges & translations
│   ├── package.json
│   └── vite.config.js
├── app_api.py                    # Production FastAPI backend
├── database.py                   # SQLite persistence for posts, comments & chat
├── engine.py                     # Unified CropVisionEngine (ResNet-18 + Grad-CAM)
├── weather_engine.py             # Open-Meteo bioclimatic risk analyzer
├── models/                       # PyTorch model checkpoints (.pth)
├── samples/                      # Sample leaf pathology imagery
├── requirements.txt              # Python dependencies
└── render.yaml                   # Render cloud deployment blueprint
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** >= 18.x
* **Python** >= 3.10
* **pip** and **npm**

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend Setup
```bash
# In the root directory:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app_api:app --host 0.0.0.0 --port 8000 --reload
```
API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Run Automated Tests
```bash
python3 test_engine.py
python3 test_weather.py
python3 test_app_api.py
```

---

## 👥 Authors & Acknowledgments

* **Sasya Team**
* Built with local-first open software for rural Indian agricultural communities.
