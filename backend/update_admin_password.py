#!/usr/bin/env python3
"""
Update admin user password
"""

import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_admin_password():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Admin credentials
    email = "gulshan@klevermarketing.in"
    new_password = "Santre@850"
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email})
    if not existing_user:
        print(f"❌ User {email} not found!")
        client.close()
        return
    
    # Hash the new password
    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Update password
    result = await db.users.update_one(
        {"email": email},
        {"$set": {
            "password_hash": password_hash,
            "plan": "premium",  # Ensure premium plan
            "slug": existing_user.get("slug") or "gulshanadmin"  # Ensure slug exists
        }}
    )
    
    if result.modified_count > 0:
        print("\n✅ Admin password updated successfully!")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {new_password}")
        print(f"👤 User ID: {existing_user['user_id']}")
        print(f"🏆 Plan: premium")
        print(f"\n🚀 Login at: http://localhost:3000/administrator-login")
    else:
        print("⚠️  No changes made (password might already be set)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_admin_password())
