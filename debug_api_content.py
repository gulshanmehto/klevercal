import httpx
import asyncio

async def debug_api():
    base_url = "https://www.deemeet.in/api"
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # 1. Try auth/login
        login_url = f"{base_url}/auth/login"
        print(f"Testing GET {login_url} ...")
        resp = await client.get(login_url)
        print(f"GET {login_url} Status: {resp.status_code}")
        print(f"Response URL: {resp.url}")
        print(f"Content-type: {resp.headers.get('content-type')}")
        # Print first 100 chars of content
        print(f"Content: {resp.text[:200]}")

if __name__ == "__main__":
    asyncio.run(debug_api())
