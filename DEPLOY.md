# Deployment Guide for KleverCal

This guide details how to deploy your KleverCal application live. We will deploy the **Backend** to **Render** (or any Python host) and the **Frontend** to **Vercel**.

## Prerequisites
- A GitHub repository with this code pushed to it.
- Accounts on [Render.com](https://render.com) and [Vercel.com](https://vercel.com).
- Your MongoDB Atlas Connection String.

---

## Part 1: Deploy Backend (Render)

1.  **Log in to Render** and click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Settings:**
    *   **Name:** `klevercal-api` (or similar)
    *   **Root Directory:** `backend` (Important!)
    *   **Runtime:** Python 3
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables:**
    Scroll down to "Environment Variables" and add:
    *   `MONGO_URL`: Your MongoDB connection string (e.g., `mongodb+srv://...`)
    *   `DB_NAME`: `klevercal` (or your preferred DB name)
    *   `JWT_SECRET`: A long random string (e.g., generate one with `openssl rand -hex 32`).
    *   `GOOGLE_CLIENT_ID`: (If using Google Auth)
    *   `GOOGLE_CLIENT_SECRET`: (If using Google Auth)
    *   `GMAIL_ADDRESS`: (Optional, for emails)
    *   `GMAIL_APP_PASSWORD`: (Optional, for emails)
5.  Click **Create Web Service**.
6.  **Wait for deployment.** Once live, copy the **Service URL** (e.g., `https://klevercal-api.onrender.com`).

---

## Alternative Backend: Google Cloud Run (Lowest Cost)

If you want a generous free tier (2 million reqs/month free), use Google Cloud Run.

1.  **Install the Google Cloud CLI** (or use the Cloud Console UI).
2.  **Enable APIs:** Search for and enable "Cloud Run API" and "Artifact Registry API".
3.  **Deploy from Terminal:**
    Navigate to the `backend` folder and run:
    ```bash
    gcloud run deploy klevercal-api --source . --region us-central1 --allow-unauthenticated
    ```
4.  **Set Environment Variables:**
    Go to the Google Cloud Console -> Cloud Run -> klevercal-api -> **Edit & Deploy New Revision** -> **Variables**. Add your `MONGO_URL`, `JWT_SECRET`, etc., here.

---

## Part 2: Deploy Frontend (Vercel)

1.  **Log in to Vercel** and click **Add New** -> **Project**.
2.  Import your GitHub repository.
3.  **Configure Project:**
    *   **Framework Preset:** Create React App (should auto-detect).
    *   **Root Directory:** Click "Edit" and select `frontend`.
4.  **Environment Variables:**
    *   Name: `REACT_APP_BACKEND_URL`
    *   Value: Your Render Backend URL (e.g., `https://klevercal-api.onrender.com`). **Do not add a trailing slash `/`**.
5.  Click **Deploy**.

---

## Part 3: Final Integration

1.  Once the Frontend is deployed, visit the Vercel URL.
2.  Try logging in.
3.  If you have issues, check the `Console` in your browser's Developer Tools (F12) for errors.

### Troubleshooting
*   **CORS Errors:** Ensure your backend `server.py` has `allow_origins=["*"]` (which we have already configured).
*   **Database:** Ensure your MongoDB Atlas Network Access whitelist allows access from anywhere (`0.0.0.0/0`) or specifically from Render's IPs.
