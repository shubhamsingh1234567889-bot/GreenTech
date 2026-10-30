# Deploy GreenPulse on Render

## Recommended: Blueprint

1. Push this project to a new GitHub repository.
2. Sign in to Render and choose **New → Blueprint**.
3. Connect the repository and select its `render.yaml`.
4. Render creates:
   - `greenpulse-api` — Python FastAPI web service.
   - `greenpulse-web` — static Vite frontend.
5. After deployment, open the backend service and copy its public URL.
6. Open the static site service → Environment and set `VITE_API_URL` to the backend URL, e.g. `https://greenpulse-api.onrender.com`.
7. Trigger a new frontend deploy after setting `VITE_API_URL`.
8. In the backend service's Environment tab, add `OPENWEATHER_API_KEY`. Add TinyFish variables only after you confirm its API endpoint and schema from your account documentation.
9. In the backend service, set `FRONTEND_ORIGIN` to your Render frontend URL if you want to restrict CORS.

## Manual deploy

### Backend
- New → Web Service → select the repository.
- Root Directory: `backend`
- Runtime: Python
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add environment variables from `backend/.env.example`.

### Frontend
- New → Static Site → select the repository.
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com`
- Deploy.

Note: Render free instances may sleep when inactive and the first request can take longer. Check the current Render plan limits before your event.
