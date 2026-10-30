import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="GreenPulse API", version="1.0.0",
              description="Hackathon demo APIs for sustainability intelligence.")
origin = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"] if origin == "*" else [origin],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

class CarbonInput(BaseModel):
    electricity_kwh: float = Field(ge=0)
    fuel_litres: float = Field(default=0, ge=0)
    travel_km: float = Field(default=0, ge=0)
    supplier_emissions_kg: float = Field(default=0, ge=0)

class ClaimInput(BaseModel):
    claim: str
    evidence: List[str] = []

class WasteInput(BaseModel):
    material: str
    quantity_kg: float = Field(gt=0)
    city: str = ""
    notes: str = ""

class FoodInput(BaseModel):
    food_type: str
    quantity_kg: float = Field(gt=0)
    available_hours: int = Field(default=12, ge=1, le=72)
    city: str = ""

class EnergyInput(BaseModel):
    solar_kw: float = Field(ge=0)
    wind_kw: float = Field(ge=0)
    demand_kw: float = Field(gt=0)
    storage_kwh: float = Field(default=0, ge=0)

@app.get("/")
def root():
    return {"name": "GreenPulse API", "status": "ok", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.post("/api/carbon/estimate")
def carbon_estimate(data: CarbonInput):
    # Clearly labelled illustrative factors; replace with region/year-specific verified factors.
    factors = {"electricity_kg_per_kwh": 0.70, "fuel_kg_per_litre": 2.31,
               "travel_kg_per_km": 0.12}
    scope2 = data.electricity_kwh * factors["electricity_kg_per_kwh"]
    scope1 = data.fuel_litres * factors["fuel_kg_per_litre"]
    scope3_travel = data.travel_km * factors["travel_kg_per_km"]
    scope3_supplier = data.supplier_emissions_kg
    total = scope1 + scope2 + scope3_travel + scope3_supplier
    return {
        "unit": "kg CO2e (illustrative)",
        "scope1_kg": round(scope1, 2), "scope2_kg": round(scope2, 2),
        "scope3_kg": round(scope3_travel + scope3_supplier, 2),
        "scope3_travel_kg": round(scope3_travel, 2),
        "scope3_supplier_kg": round(scope3_supplier, 2),
        "total_kg": round(total, 2),
        "method_note": "Demo emission factors only. Replace with verified local factors and supplier-specific primary data."
    }

@app.post("/api/claims/review")
def claims_review(data: ClaimInput):
    # Evidence triage, not a truth detector. Never label a company as fraudulent from this score.
    evidence_count = len([x for x in data.evidence if x.strip()])
    keywords = ["net zero", "carbon neutral", "100% sustainable", "zero impact", "green"]
    broad_claim = any(k in data.claim.lower() for k in keywords)
    checks = [
        {"check": "Specific boundary and time period stated", "status": "review_required"},
        {"check": "Third-party assurance attached", "status": "provided" if evidence_count >= 2 else "missing"},
        {"check": "Quantified baseline and methodology", "status": "provided" if evidence_count >= 1 else "missing"},
        {"check": "Potentially broad environmental wording", "status": "review_required" if broad_claim else "not_flagged"}
    ]
    return {"claim": data.claim, "evidence_items": evidence_count, "checks": checks,
            "assessment": "Needs human verification" if broad_claim or evidence_count < 2 else "Evidence submitted — independent review still required",
            "disclaimer": "This tool organizes evidence and review questions. It does not verify truth, detect fraud, or replace an auditor."}

WASTE_CATALOG = [
    {"material": "wood offcuts", "industry": "Furniture / panel board makers", "use": "Particleboard or craft feedstock"},
    {"material": "spent grain", "industry": "Animal feed processors", "use": "Feed ingredient after safety checks"},
    {"material": "plastic scrap", "industry": "Recyclers / plastic moulders", "use": "Sorted recycled polymer feedstock"},
    {"material": "waste heat", "industry": "Nearby process industries", "use": "Preheating or low-temperature process heat"},
    {"material": "fly ash", "industry": "Cement / construction materials", "use": "Cement replacement where standards permit"},
    {"material": "food scraps", "industry": "Composting / biogas operators", "use": "Compost or anaerobic digestion"}
]
@app.post("/api/waste/match")
def waste_match(data: WasteInput):
    key = data.material.lower().strip()
    matches = [x for x in WASTE_CATALOG if key in x["material"] or x["material"] in key]
    if not matches:
        matches = [x for x in WASTE_CATALOG if any(w in key for w in x["material"].split())]
    return {"input": data.model_dump(), "matches": matches,
            "next_steps": ["Confirm material composition and contamination limits.",
                           "Check local regulations and transport distance.",
                           "Agree quality specification and conduct a small trial."]}

@app.post("/api/energy/optimize")
def energy_optimize(data: EnergyInput):
    renewable = data.solar_kw + data.wind_kw
    surplus = max(0.0, renewable - data.demand_kw)
    deficit = max(0.0, data.demand_kw - renewable)
    storage_discharge = min(deficit, data.storage_kwh)  # simplified one-hour demo
    remaining_deficit = max(0.0, deficit - storage_discharge)
    return {"renewable_generation_kw": round(renewable, 2),
            "demand_kw": round(data.demand_kw, 2),
            "surplus_kw": round(surplus, 2),
            "storage_discharge_kw": round(storage_discharge, 2),
            "grid_or_backup_needed_kw": round(remaining_deficit, 2),
            "suggestion": "Charge storage or export surplus" if surplus > 0 else
                          ("Use stored energy first; shift flexible loads if needed" if deficit > 0 else "Generation matches demand"),
            "note": "Simplified planning example, not a real-time grid dispatch controller."}

@app.post("/api/food/surplus")
def food_surplus(data: FoodInput):
    return {"food_type": data.food_type, "quantity_kg": data.quantity_kg,
            "city": data.city, "available_hours": data.available_hours,
            "priority": "urgent" if data.available_hours <= 6 else "normal",
            "suggested_actions": ["Contact a verified local food redistribution partner.",
                                  "Confirm food safety, storage temperature, allergens and pickup time.",
                                  "Record quantity collected to measure avoided waste."],
            "note": "Demo listing only; no real food donation or pickup is arranged."}

async def geocode_city(city: str):
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="AQI is not configured. Add OPENWEATHER_API_KEY in Render environment variables.")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get("https://api.openweathermap.org/geo/1.0/direct",
                                    params={"q": city, "limit": 1, "appid": key})
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="City geocoding service returned an error.")
        rows = response.json()
        if not rows:
            raise HTTPException(status_code=404, detail="City not found. Try 'City, Country'.")
        return rows[0]

@app.get("/api/aqi")
async def aqi(city: str):
    place = await geocode_city(city)
    key = os.getenv("OPENWEATHER_API_KEY")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get("https://api.openweathermap.org/data/2.5/air_pollution",
            params={"lat": place["lat"], "lon": place["lon"], "appid": key})
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Air pollution service returned an error.")
        payload = response.json()
    item = payload["list"][0]
    components = item.get("components", {})
    aqi_scale = {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very poor"}
    return {"city": place.get("name"), "country": place.get("country"),
            "coordinates": {"lat": place["lat"], "lon": place["lon"]},
            "aqi_index_1_to_5": item["main"]["aqi"],
            "aqi_label": aqi_scale.get(item["main"]["aqi"], "Unknown"),
            "pollutants_ug_m3": components,
            "timestamp_utc": item.get("dt"),
            "source": "OpenWeather Air Pollution API",
            "note": "OpenWeather's 1–5 index is not the same as India's CPCB AQI scale."}

@app.get("/api/global-search")
async def global_search(q: str):
    api_key = os.getenv("TINYFISH_API_KEY")
    endpoint = os.getenv("TINYFISH_API_URL")
    if not api_key or not endpoint:
        raise HTTPException(status_code=503, detail="Global search is not configured. Add TINYFISH_API_KEY and the exact TINYFISH_API_URL from your TinyFish account documentation.")
    # TinyFish API request schema varies by product/version. This adapter deliberately
    # avoids guessing a payload. Configure the endpoint and adapt this request to the
    # request schema shown in your TinyFish dashboard/docs before enabling.
    header_name = os.getenv("TINYFISH_AUTH_HEADER", "Authorization")
    prefix = os.getenv("TINYFISH_AUTH_PREFIX", "Bearer ")
    raise HTTPException(status_code=501, detail=f"TinyFish credentials detected, but the request adapter needs your documented endpoint and request schema. Expected auth header setting: {header_name}; configure the adapter in backend/main.py. Search: {q}")
