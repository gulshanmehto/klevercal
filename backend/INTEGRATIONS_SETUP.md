# Zoom & Microsoft Teams Integration Guide

To make the Zoom and Microsoft Teams integrations live, you need to create "Apps" in their respective developer portals to get the **Client ID** and **Client Secret**.

## 1. Zoom Configuration

1.  Go to the [Zoom App Marketplace](https://marketplace.zoom.us/).
2.  Sign in and click **Develop** > **Build App**.
3.  Choose **OAuth** as the app type.
4.  **Create** the app:
    *   **App Name**: DeeMeet (or your app name)
    *   **App Type**: User-managed app
5.  **App Credentials**:
    *   Copy the **Client ID** and **Client Secret**.
    *   You will need to add these to your `.env` file later.
6.  **Redirect URL for OAuth**:
    *   Add this URL: `https://www.deemeet.in/api/calendar/zoom/callback` (for live)
    *   Add this URL: `http://localhost:8000/api/calendar/zoom/callback` (for local testing)
    *   *Note: Zoom usually requires https even for local, but sometimes allows http://localhost. Use ngrok if needed for local testing.*
7.  **Scopes** (Permissions):
    *   Go to the "Scopes" tab.
    *   Add the following scope: `meeting:write:meeting` (View and manage your meetings).
    *   Add `user:read:user` (View your user information).

## 2. Microsoft Teams (Azure) Configuration

1.  Go to the [Azure Portal](https://portal.azure.com/).
2.  Search for and select **App registrations**.
3.  Click **New registration**.
    *   **Name**: DeeMeet
    *   **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts (e.g., Skype, Xbox).
    *   **Redirect URI**: Select **Web** and enter:
        *   `https://www.deemeet.in/api/calendar/teams/callback` (for live)
        *   `http://localhost:8000/api/calendar/teams/callback` (for local)
4.  Click **Register**.
5.  **Certificates & secrets**:
    *   Go to "Certificates & secrets" in the left menu.
    *   Click **New client secret**.
    *   Add a description and expiry.
    *   **Copy the Value** (not the Secret ID) immediately. This is your **Client Secret**.
6.  **Overview**:
    *   Go back to "Overview".
    *   Copy the **Application (client) ID**.
7.  **API Permissions**:
    *   Go to "API permissions".
    *   Click **Add a permission** > **Microsoft Graph**.
    *   Select **Delegated permissions**.
    *   Search for and check:
        *   `OnlineMeetings.ReadWrite` (Read and create online meetings)
        *   `User.Read` (Sign in and read user profile)
        *   `Offline_access` (Maintain access to data via refresh tokens)
    *   Click **Add permissions**.

## 3. Update Environment Variables

Open your `backend/.env` file and add the credentials you just generated:

```env
# Zoom
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# Microsoft Teams
TEAMS_CLIENT_ID=your_teams_client_id
TEAMS_CLIENT_SECRET=your_teams_client_secret
TEAMS_TENANT_ID=common  # Use 'common' for multi-tenant apps
```
