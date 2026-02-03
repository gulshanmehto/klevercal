import httpx
import json

async def test_email_api():
    base_url = "https://www.deemeet.in/api"
    login_url = f"{base_url}/auth/login"
    test_email_url = f"{base_url}/test/email"
    
    credentials = {
        "email": "gulshanmehto@gmail.com",
        "password": "Santre@850"
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Login
        print(f"Attempting login for {credentials['email']}...")
        login_resp = await client.post(login_url, json=credentials)
        
        if login_resp.status_code != 200:
            print(f"Login failed: {login_resp.status_code}")
            print(login_resp.text)
            return
        
        login_data = login_resp.json()
        token = login_data.get("token")
        if not token:
            print("No access token found in response")
            return
        
        print("Login successful context obtained.")
        
        # 2. Call test email endpoint
        headers = {"Authorization": f"Bearer {token}"}
        print("Triggering test email...")
        test_resp = await client.post(test_email_url, headers=headers)
        
        print(f"Test Email Response Status: {test_resp.status_code}")
        print(f"Response Body: {test_resp.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_email_api())
