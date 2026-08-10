# 🛰️ Satelle-Eye

**Satelle-Eye** is a satellite-imaging mission-control web app that combines a React + TypeScript frontend with a local Python (Flask) AI service.

You can explore satellite positions, view environmental events around the world, check weather information, and upload satellite images for AI-based land-cover analysis — all running locally on your machine.



## ✨ What Satelle-Eye Can Do

### 🌍 Mission Dashboard

The dashboard has three main sections:

* **Satellites** — View sample satellite telemetry on an interactive orbital map. You can search for satellites and inspect details such as altitude, speed, latitude/longitude, purpose, and imaging band.
* **Global Detection** — Explore environmental events such as wildfires, floods, droughts, deforestation, volcanoes, and severe storms using the included sample dataset.
* **AI Analysis** — Upload a satellite image and let the local Python backend analyze it for different land-cover types.

###  AI Image Analysis

The AI analysis system can:

* Read GPS coordinates from image EXIF metadata when available.
* Run a trained multi-class U-Net model when a model is available in `model/`.
* Fall back to an RGB-based heuristic classifier when no trained model is installed.
* Provide confidence scores for each detected class.
* Generate environmental indicators and recommendations.

The system **never invents GPS coordinates**. If the uploaded image doesn't contain location information, no location is returned.

### 🌦️ Weather

Satelle-Eye also includes a searchable weather section. It currently uses bundled sample data, so the application can run without depending on an external weather API.

### 🌐 Multiple Languages

The interface supports:

* English
* German
* French
* Hindi
* Japanese
* Russian

Language handling is managed through `LanguageContext`.

### 🔐 No API Keys Required for Language

The project is designed to work locally without external API keys.

The `.env.example` file contains the available configuration options. Any private `.env` file should remain ignored by Git.

---

## 🛠️ Tech Stack

**Frontend**

* React 18
* TypeScript
* Vite 6
* Tailwind CSS 4
* Framer Motion
* lucide-react

**Backend**

* Python
* Flask
* Flask-CORS
* Pillow
* NumPy
* TensorFlow/Keras *(optional, required only for actual model inference)*

---

##  Project Structure

```text
satellite_clean/
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── model/
│   ├── improved_relu_unet.py
│   ├── landcover_multiclass.py
│   ├── train_landcover.py
│   └── README.md
│
├── data/
│   ├── images/
│   ├── masks/
│   └── README.md
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── context/
│   │   └── data/
│   ├── styles/
│   └── main.tsx
│
├── index.html
├── vite.config.ts
└── .env.example
```

---

##  Getting Started

### Requirements

Before starting, make sure you have:

* Node.js and npm *(or pnpm)*
* Python 3.10+

### 1. Start the Python Backend

From the project directory:

```bash
cd satellite_clean

python -m venv .venv
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

pip install -r backend/requirements.txt

python backend/app.py
```

The backend will start at:

`http://127.0.0.1:8000`

You can check whether it's running through:

```text
GET /api/health
```

### 2. Start the Frontend

Open another terminal:

```bash
cd satellite_clean
npm install
npm run dev
```

Vite automatically proxies `/api` requests to the Flask backend, so the frontend and backend can communicate without additional setup.

---

## ⚙️ Optional Configuration

If you need custom settings, create a `.env` file from `.env.example`.

Example:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
SATELLE_EYE_LANDCOVER_MODEL=model/landcover_multiclass_64.keras
SATELLE_EYE_MODEL=model/relu_unet_turahalli_64.keras
```

Keep `.env` out of Git. Never commit API keys, credentials, or private machine paths.

---

## 🧠 Land-Cover AI Model

The included multi-class U-Net is designed to identify six different land-cover categories:

| ID | Class                 |
| -: | --------------------- |
|  0 | Background / Unknown  |
|  1 | River / Water Body    |
|  2 | Vegetation / Forest   |
|  3 | Urban / Built-up Area |
|  4 | Bare Land / Soil      |
|  5 | Cloud / Haze          |

### Training Your Own Model

Place your satellite images and their corresponding masks inside:

```text
data/
├── images/
│   └── tile_001.jpg
└── masks/
    └── tile_001.png
```

Each mask should be a single-channel PNG where the pixel values correspond to the class IDs listed above.

Then train the model with:

```bash
python model/train_landcover.py \
  --images data/images \
  --masks data/masks \
  --output model/landcover_multiclass_64.keras
```

Once training finishes, place the `.keras` model inside the `model/` directory.

The backend will automatically use it when analyzing the next image.

### What Happens Without a Model?

If no trained model is available, Satell-Eye uses an RGB-based heuristic classifier instead.

This is useful for demonstrating the application, but it **is not a trained AI model** and shouldn't be treated as scientifically accurate land-cover classification.

The older binary change-detection U-Net (`relu_unet_turahalli_64.keras`) is also supported for backward compatibility.

---

## 🔌 API

### `GET /api/health`

Checks whether the AI model files are available.

### `POST /api/analyze`

Upload an image for analysis.

The response can include:

* Detected land-cover class
* Overall confidence
* Per-class confidence scores
* GPS coordinates, when available in EXIF metadata
* Environmental indicators
* Recommendations

---

##  Important Notes

Satelle-Eye currently uses **local sample data** for satellite tracking, global environmental events, and weather. These aren't live feeds.

The project is intentionally designed to work offline and without external API dependencies.

For reliable land-cover classification, train the included U-Net using properly labelled satellite imagery and evaluate it using a separate test dataset.

UI components use **shadcn/ui** under the MIT license, and some visuals are sourced from Unsplash. See `src/app/Attributions.md` for details.

---

##  The Goal

Satelle-Eye is built as a foundation for a larger satellite intelligence platform — combining **Earth observation, AI-powered image analysis, environmental monitoring, and mission-control visualization** in one interface.
