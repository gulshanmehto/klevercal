import httpx
import asyncio

async def test_email_api():
    # Use the discovered backend URL
    base_url = "https://klevercal-api-721707771890.us-central1.run.app/api"
    test_email_url = f"{base_url}/test/email"
    
    # Use the token directly
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl9lZjk0NWJhMWI0MjgiLCJlbWFpbCI6Imd1bHNoYW5tZWh0b0BnbWFpbC5jb20iLCJleHAiOjE3NzA3MDcwNjR9.1RuypwPvriTEPbG20jultS10OKVyva_gnuIe1k4BVR8"
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        print(f"Triggering test email at {test_email_url}...")
        try:
            test_resp = await client.post(test_email_url, headers=headers)
            print(f"Test Email Response Status: {test_resp.status_code}")
            print(f"Response Body: {test_resp.text}")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_email_api())
