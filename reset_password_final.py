from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

mongo_url = os.environ['MONGO_URL']
client = MongoClient(mongo_url)
db = client[os.environ['DB_NAME']]

# User details
email = "gulshan@klevermarketing.in"
password = "Santre@850"

# Hash password
hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

print(f"Resetting password for: {email}")

try:
    # Use standard python dictionary
    result = db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hashed_password}}
    )

    if result.matched_count > 0:
        print(f"Success: Password updated.")
    else:
        print(f"Error: User not found.")

except Exception as e:
    print(f"An error occurred: {e}")

client.close()
