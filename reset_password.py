from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

mongo_url = os.environ['MONGO_URL']
client = MongoClient(mongo_url)
db = client[os.environ['DB_NAME']]

# The previous error "update only works with $ operators" suggests the pymongo version might be 
# treating the inputs differently or there's a weird character issue.
# However, the syntax {"": ...} is definitely correct for update_one.
# Let's try a very direct approach and print the object first to debug.

email = "gulshan@klevermarketing.in"
password = "Santre@850"
hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

print(f"Attempting to update user: {email}")

# Using a standard dictionary for the update operator
update_doc = {
    "$set": {
        "password_hash": hashed_password
    }
}
# Note: In the shell script 'cat' command, $ might be escaped. 
# We need to be careful with the heredoc. 
# Let's try avoiding the heredoc escape issue by using a python string.

try:
    # Explicitly using the dict syntax
    result = db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hashed_password}} 
    )
    # Wait, the error 'update only works with $ operators' usually means the key doesn't start with $.
    # If I'm running this via 'cat', the $ might be interpreted as a shell variable.
    
    if result.matched_count > 0:
        print(f"Success: Password updated for {email}")
    else:
        print(f"User not found: {email}")

except Exception as e:
    print(f"Error: {e}")

client.close()
