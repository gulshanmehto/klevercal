# Deploying DeeMeet to deemeet.in

Since you have the domain **deemeet.in**, follow these steps to make your application live.

## 1. Frontend (Vercel)

1.  Go to your **Vercel Dashboard** and select your `klevercal` (or `deemeet`) project.
2.  Go to **Settings** > **Domains**.
3.  Enter `deemeet.in` and click **Add**.
4.  **Vercel will give you DNS records** (usually an A Record or CNAME) to add to your domain registrar (where you bought deemeet.in).
    *   **Type:** A
    *   **Name:** @
    *   **Value:** 76.76.21.21
    *   *(Or follow the specific instructions shown in Vercel)*
5.  Once added, wait for propagation (can take minutes to hours).

## 2. Backend (Server)

For your backend to work correctly with the new domain:

1.  **Deploy your backend** (using Google Cloud Run as per `DEPLOY.md` or any other provider).
2.  **Get your Backend URL** (e.g., `https://klevercal-api-xyz.run.app` or `https://api.deemeet.in` if you set that up too).
3.  Go to **Vercel** > **Settings** > **Environment Variables**.
4.  Add/Edit `REACT_APP_BACKEND_URL`:
    *   Value: Your Google Cloud Run URL (e.g., `https://klevercal-api...`).
    *   **Important:** Do NOT add a trailing slash `/`.
5.  **Redeploy** your frontend in Vercel for the changes to take effect.

## 3. Verify Connection

1.  Visit `https://deemeet.in`.
2.  Try logging in.
3.  If you see "Network Error" or nothing happens, check the **Console** (F12 > Console) to see if CORS or URL errors are appearing.
