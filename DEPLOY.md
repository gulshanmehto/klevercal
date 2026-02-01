# Deployment Guide for KleverCal

This guide details how to deploy your KleverCal application live. We will deploy the **Backend** to **Google Cloud Run** and the **Frontend** to **Vercel**.

## Prerequisites
- A GitHub repository with this code pushed to it.
- A [Google Cloud Platform](https://console.cloud.google.com/) account.
- A [Vercel](https://vercel.com) account.
- Your MongoDB Atlas Connection String.

---

## Part 1: Deploy Backend (Google Cloud Run)

This is the most cost-effective option (2 million requests/month free).

### Option A: Via Terminal (Recommended)
1.  **Install the Google Cloud CLI** (or use the Cloud Shell in the browser console).
2.  **Login:** Run `gcloud auth login`.
3.  **Deploy:** Navigate to your project root in the terminal and run:
    ```bash
    cd backend
    gcloud run deploy klevercal-api --source . --region us-central1 --allow-unauthenticated
    ```
    *   *Note: If asked to enable APIs (Cloud Run, Artifact Registry), say yes.*

### Option B: Via Google Cloud Console UI
1.  Go to **[Google Cloud Console](https://console.cloud.google.com/)** -> **Cloud Run**.
2.  Click **Create Service**.
3.  Select **"Continuously deploy new revisions from a source repository"**.
4.  Connect your GitHub repo and select the `backend` folder as the source location.
5.  **Authentication:** Select "Allow unauthenticated invocations".
6.  Click **Create**.

### Configuration (Environment Variables)
Once created (via Terminal or UI), you MUST set your environment variables:
1.  Go to **Cloud Run** -> Select your service (`klevercal-api`).
2.  Click **Edit & Deploy New Revision**.
3.  Go to the **Variables & Secrets** tab.
4.  Add the following variables:
    *   `MONGO_URL`: Your MongoDB connection string.
    *   `DB_NAME`: `klevercal`
    *   `JWT_SECRET`: (Your random secret)
    *   *(Optional)* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`.
5.  Click **Deploy**.

**Copy your Backend URL:** It will look like `https://klevercal-api-xyz-uc.a.run.app`.

---

## Part 2: Deploy Frontend (Vercel)

1.  **Log in to Vercel** and click **Add New** -> **Project**.
2.  Import your GitHub repository.
3.  **Configure Project:**
    *   **Framework Preset:** Create React App (should auto-detect).
    *   **Root Directory:** Click "Edit" and select `frontend`.
4.  **Environment Variables:**
    *   Name: `REACT_APP_BACKEND_URL`
    *   Value: Your Google Cloud Run URL (e.g., `https://klevercal-api-xyz-uc.a.run.app`). **Do not add a trailing slash `/`**.
5.  Click **Deploy**.

---

## Part 3: Final Integration

1.  Once the Frontend is deployed, visit the Vercel URL.
2.  **Troubleshooting:**
    *   **CORS Errors:** If you see network errors, check your browser console. Ensure your Backend environment variables on Google Cloud are correctly saved.
    *   **MongoDB Network Access:** Ensure your MongoDB Atlas Whitelist allows access from anywhere (`0.0.0.0/0`) since Google Cloud IPs change dynamically.
