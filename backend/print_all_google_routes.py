import os

with open("backend/server.py", "r") as f:
    for line in f:
        if "@api_router.get" in line and "calendar" in line:
            print(line.strip())
