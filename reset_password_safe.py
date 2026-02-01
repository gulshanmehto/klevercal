from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

mongo_url = os.environ['MONGO_URL']
client = MongoClient(mongo_url)
db = client[os.environ['DB_NAME']]

email = "gulshan@klevermarketing.in"
password = "Santre@850"
hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

try:
    # Using 'EOF' with single quotes above prevents shell variable expansion
    # so $set will be preserved literally
    result = db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hashed_password}}
    )
    
    if result.matched_count > 0:
        print(f"Success: Password updated for {email}")
    else:
        print(f"User not found: {email}")

except Exception as e:
    print(f"Error: {e}")

client.close()
