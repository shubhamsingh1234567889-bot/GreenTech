# API integration guide

## 1) OpenWeather city AQI

The AQI feature is already wired in the backend at `GET /api/aqi?city=Delhi`.

Flow:
1. User types a city in **City air quality**.
2. Backend calls OpenWeather Geocoding API (`https://api.openweathermap.org/geo/1.0/direct`) to resolve latitude/longitude.
3. Backend calls Air Pollution API (`https://api.openweathermap.org/data/2.5/air_pollution`) with those coordinates.
4. Frontend displays OpenWeather's 1–5 index and pollutant concentrations.

Add `OPENWEATHER_API_KEY` to Render's backend environment variables. Do not put this key in React/Vite code. The OpenWeather 1–5 index is not India's CPCB AQI scale; do not label it as CPCB AQI.

Test:
```bash
curl "http://localhost:8000/api/aqi?city=Delhi"
```

## 2) TinyFish global search

The UI is already present under **Global Explorer** and calls `GET /api/global-search?q=...`. The backend intentionally keeps the TinyFish integration behind an adapter because API URLs and request payloads can vary by TinyFish product and account/API version.

Before enabling:
1. Open the official TinyFish developer documentation for the product/API access you have.
2. Confirm the exact API base URL, endpoint path, HTTP method, authentication header, required JSON fields, and response format.
3. Add `TINYFISH_API_KEY` and `TINYFISH_API_URL` to the Render backend environment.
4. In `backend/main.py`, replace the `501` placeholder in `global_search()` with an `httpx` request matching the official schema.
5. Normalize the response into a small JSON object that the frontend can render.
6. Keep the key only on the backend. Never use `VITE_TINYFISH_API_KEY` or commit secrets.

Suggested integration location:
- Backend: `backend/main.py` → `global_search()` route.
- Frontend: `frontend/src/App.jsx` → `globalSearch()` and the `tab === 'global'` section.
- Configuration: `backend/.env.example` → TinyFish variables.

Example adapter shape (illustrative only; replace URL and body keys with the exact TinyFish documentation):
```python
async with httpx.AsyncClient(timeout=60) as client:
    response = await client.post(
        os.environ["TINYFISH_API_URL"],
        headers={os.getenv("TINYFISH_AUTH_HEADER", "Authorization"):
                 os.getenv("TINYFISH_AUTH_PREFIX", "Bearer ") + api_key},
        json=YOUR_DOCUMENTED_REQUEST_BODY
    )
    response.raise_for_status()
    return {"query": q, "results": response.json()}
```

Do not assume TinyFish returns map coordinates. If it returns verified place coordinates, the frontend can render map pins; otherwise display source links and text results. Add a map provider separately if you need an interactive world map.
