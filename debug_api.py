import httpx
import asyncio

async def debug_api():
    base_url = "https://www.deemeet.in/api"
    
    async with httpx.AsyncClient() as client:
        # 1. Try root
        print(f"Testing {base_url} ...")
        resp = await client.get(base_url)
        print(f"GET {base_url} Status: {resp.status_code}")
        
        # 2. Try auth/login with GET to see if it's there (should be 405 if POST only)
        login_url = f"{base_url}/auth/login"
        print(f"Testing GET {login_url} ...")
        resp = await client.get(login_url)
        print(f"GET {login_url} Status: {resp.status_code}")

if __name__ == "__main__":
    asyncio.run(debug_api())
