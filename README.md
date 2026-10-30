# GreenPulse — Sustainability Intelligence Platform

A hackathon-ready full-stack starter that brings five sustainability workflows into one dashboard:

1. **Carbon tracking** — estimate Scope 1, 2 and 3 emissions from activity data and supplier inputs.
2. **Green-claim review** — organize evidence and flag claims that need verification (not an automated fraud verdict).
3. **Waste-to-resource matching** — match industrial by-products with potential users by material and location.
4. **Energy optimization** — a transparent solar/wind/storage/load balancing demo.
5. **Food-waste reduction** — estimate surplus and connect it with redistribution partners.

It also includes:
- **Global place search** via a TinyFish integration adapter (server-side; configure after checking your TinyFish account's current API docs).
- **City AQI lookup** using OpenWeather Air Pollution API and geocoding.
- A React frontend and a FastAPI backend.

> Demo note: The sample calculations and matching rules are explainable prototypes, not audited carbon accounting, legal verification, grid dispatch, or food-safety advice. Verify all inputs and claims before using them in real decisions.

## Project structure

```text
greenpulse/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── style.css
├── docs/
│   ├── API_INTEGRATION.md
│   └── RENDER_DEPLOY.md
├── render.yaml
├── .gitignore
└── README.md
```

## Run locally

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2) Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually http://localhost:5173). The frontend uses `/api` and Vite proxies it to the backend.

## Deploy to Render

See [docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md). The included `render.yaml` defines a backend web service and a static frontend site. Set secrets in Render's Environment settings; never commit `.env`.

## API documentation

Once the backend is running, open `http://localhost:8000/docs`.

## GitHub

Create an empty GitHub repository, then from this project directory:

```bash
git init
git add .
git commit -m "Initial GreenPulse sustainability platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Environment variables

- `OPENWEATHER_API_KEY` — optional; enables geocoding + AQI.
- `TINYFISH_API_KEY` — optional; enables the TinyFish adapter when configured.
- `TINYFISH_API_URL` — set to the API endpoint documented for your TinyFish account. This starter intentionally does not guess a vendor endpoint or request schema.
- `TINYFISH_AUTH_HEADER` — optional header name if your account documentation requires something other than `Authorization`.
- `TINYFISH_AUTH_PREFIX` — usually `Bearer ` if required by the account docs.
- `FRONTEND_ORIGIN` — optional CORS origin; Render deployment can use `*` for this demo.

No API keys are required to explore the built-in demo features. AQI and global search show a setup message until configured.
