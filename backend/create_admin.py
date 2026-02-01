#!/usr/bin/env python3
"""
Create admin user: gulshan@klevermarketing.in
"""

import asyncio
import bcrypt
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Admin credentials
    email = "gulshan@klevermarketing.in"
    password = "Santre@850"
    name = "Gulshan Admin"
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        print(f"✅ User {email} already exists!")
        print(f"User ID: {existing_user['user_id']}")
        client.close()
        return
    
    # Hash the password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user document
    user_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "slug": "gulshanadmin",  # Set slug so they can skip onboarding
        "bio": "DeeMeet Administrator",
        "plan": "premium",  # Give admin premium plan
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "timezone": "Asia/Kolkata",
        "language": "en",
        "country": "IN"
    }
    
    # Insert user
    await db.users.insert_one(user_doc)
    
    print("\n✅ Admin user created successfully!")
    print(f"📧 Email: {email}")
    print(f"🔑 Password: {password}")
    print(f"👤 User ID: {user_doc['user_id']}")
    print(f"🏆 Plan: {user_doc['plan']}")
    print(f"\n🚀 Login at: http://localhost:3000/administrator-login")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
