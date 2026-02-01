from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'klevercal-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Google OAuth Settings
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

# Gemini Settings
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="KleverCal API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    brand_color: str = "#7c3aed"
    timezone: str = "UTC"
    created_at: datetime

class BookingTypeCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    duration: int = 30  # minutes
    color: str = "#7c3aed"
    is_active: bool = True
    buffer_before: int = 0  # minutes
    buffer_after: int = 15  # minutes
    min_notice: int = 60  # minutes
    max_bookings_per_day: Optional[int] = None
    questions: List[Dict[str, Any]] = []

class BookingTypeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_type_id: str
    user_id: str
    title: str
    description: str
    duration: int
    color: str
    is_active: bool
    buffer_before: int
    buffer_after: int
    min_notice: int
    max_bookings_per_day: Optional[int]
    questions: List[Dict[str, Any]]
    slug: str
    created_at: datetime

class AvailabilitySlot(BaseModel):
    day: int  # 0=Monday, 6=Sunday
    start_time: str  # "09:00"
    end_time: str  # "17:00"

class AvailabilityCreate(BaseModel):
    slots: List[AvailabilitySlot]

class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    availability_id: str
    user_id: str
    slots: List[Dict[str, Any]]
    updated_at: datetime

class AppointmentCreate(BaseModel):
    booking_type_id: str
    host_user_id: str
    guest_name: str
    guest_email: EmailStr
    start_time: datetime
    notes: Optional[str] = ""
    answers: List[Dict[str, Any]] = []

class AppointmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    appointment_id: str
    booking_type_id: str
    host_user_id: str
    guest_name: str
    guest_email: str
    start_time: datetime
    end_time: datetime
    status: str
    notes: str
    answers: List[Dict[str, Any]]
    lead_score: Optional[int] = None
    created_at: datetime

class NLPScheduleRequest(BaseModel):
    text: str  # "Let's meet next Tuesday morning"
    booking_type_id: Optional[str] = None

class NLPScheduleResponse(BaseModel):
    suggested_date: Optional[str] = None
    suggested_time: Optional[str] = None
    confidence: float = 0.0
    interpretation: str = ""

class LeadScoreRequest(BaseModel):
    guest_name: str
    guest_email: str
    answers: List[Dict[str, Any]]
    booking_type_title: str

class LeadScoreResponse(BaseModel):
    score: int  # 0-100
    reasoning: str
    priority: str  # "high", "medium", "low"

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Then check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif session_token:
        token = session_token
    else:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session token (from Google OAuth)
    session = await db.user_sessions.find_one(
        {"session_token": token},
        {"_id": 0}
    )
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one(
            {"user_id": session["user_id"]},
            {"_id": 0}
        )
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    # Otherwise try JWT
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one(
            {"user_id": payload["user_id"]},
            {"_id": 0}
        )
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "brand_color": "#7c3aed",
        "timezone": "UTC",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default availability (Mon-Fri 9-5)
    default_slots = []
    for day in range(5):  # Monday to Friday
        default_slots.append({
            "day": day,
            "start_time": "09:00",
            "end_time": "17:00"
        })
    
    availability_doc = {
        "availability_id": f"avail_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "slots": default_slots,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.availability.insert_one(availability_doc)
    
    token = create_jwt_token(user_id, user_data.email)
    return {"token": token, "user_id": user_id, "email": user_data.email, "name": user_data.name}

@api_router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"], user["email"])
    return {"token": token, "user_id": user["user_id"], "email": user["email"], "name": user["name"]}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        brand_color=user.get("brand_color", "#7c3aed"),
        timezone=user.get("timezone", "UTC"),
        created_at=created_at
    )

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Exchange session_id for user data
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        auth_data = resp.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "password_hash": "",
            "brand_color": "#7c3aed",
            "timezone": "UTC",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create default availability
        default_slots = []
        for day in range(5):
            default_slots.append({
                "day": day,
                "start_time": "09:00",
                "end_time": "17:00"
            })
        
        availability_doc = {
            "availability_id": f"avail_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "slots": default_slots,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.availability.insert_one(availability_doc)
    
    # Create session
    session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture")
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== BOOKING TYPES ROUTES ====================

def create_slug(title: str, user_id: str) -> str:
    slug = title.lower().replace(" ", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    return f"{slug}-{uuid.uuid4().hex[:6]}"

@api_router.post("/booking-types", response_model=BookingTypeResponse)
async def create_booking_type(data: BookingTypeCreate, user: dict = Depends(get_current_user)):
    booking_type_id = f"bt_{uuid.uuid4().hex[:12]}"
    slug = create_slug(data.title, user["user_id"])
    
    doc = {
        "booking_type_id": booking_type_id,
        "user_id": user["user_id"],
        "title": data.title,
        "description": data.description or "",
        "duration": data.duration,
        "color": data.color,
        "is_active": data.is_active,
        "buffer_before": data.buffer_before,
        "buffer_after": data.buffer_after,
        "min_notice": data.min_notice,
        "max_bookings_per_day": data.max_bookings_per_day,
        "questions": data.questions,
        "slug": slug,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.booking_types.insert_one(doc)
    
    created_at = datetime.fromisoformat(doc["created_at"])
    return BookingTypeResponse(**{**doc, "created_at": created_at})

@api_router.get("/booking-types", response_model=List[BookingTypeResponse])
async def get_booking_types(user: dict = Depends(get_current_user)):
    types = await db.booking_types.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    for t in types:
        created_at = t.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        result.append(BookingTypeResponse(**{**t, "created_at": created_at}))
    return result

@api_router.get("/booking-types/{booking_type_id}", response_model=BookingTypeResponse)
async def get_booking_type(booking_type_id: str, user: dict = Depends(get_current_user)):
    bt = await db.booking_types.find_one(
        {"booking_type_id": booking_type_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    created_at = bt.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return BookingTypeResponse(**{**bt, "created_at": created_at})

@api_router.put("/booking-types/{booking_type_id}", response_model=BookingTypeResponse)
async def update_booking_type(booking_type_id: str, data: BookingTypeCreate, user: dict = Depends(get_current_user)):
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.booking_types.update_one(
        {"booking_type_id": booking_type_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    bt = await db.booking_types.find_one(
        {"booking_type_id": booking_type_id},
        {"_id": 0}
    )
    created_at = bt.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return BookingTypeResponse(**{**bt, "created_at": created_at})

@api_router.delete("/booking-types/{booking_type_id}")
async def delete_booking_type(booking_type_id: str, user: dict = Depends(get_current_user)):
    result = await db.booking_types.delete_one(
        {"booking_type_id": booking_type_id, "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking type not found")
    return {"message": "Deleted successfully"}

# ==================== AVAILABILITY ROUTES ====================

@api_router.get("/availability", response_model=AvailabilityResponse)
async def get_availability(user: dict = Depends(get_current_user)):
    avail = await db.availability.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    if not avail:
        # Create default
        default_slots = []
        for day in range(5):
            default_slots.append({
                "day": day,
                "start_time": "09:00",
                "end_time": "17:00"
            })
        avail = {
            "availability_id": f"avail_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "slots": default_slots,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.availability.insert_one(avail)
    
    updated_at = avail.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return AvailabilityResponse(**{**avail, "updated_at": updated_at})

@api_router.put("/availability", response_model=AvailabilityResponse)
async def update_availability(data: AvailabilityCreate, user: dict = Depends(get_current_user)):
    slots = [s.model_dump() for s in data.slots]
    
    await db.availability.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "slots": slots,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    avail = await db.availability.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    updated_at = avail.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return AvailabilityResponse(**{**avail, "updated_at": updated_at})

# ==================== PUBLIC BOOKING ROUTES ====================

@api_router.get("/public/user/{user_id}")
async def get_public_user(user_id: str):
    user = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "picture": user.get("picture"),
        "brand_color": user.get("brand_color", "#7c3aed")
    }

@api_router.get("/public/booking-types/{user_id}")
async def get_public_booking_types(user_id: str):
    types = await db.booking_types.find(
        {"user_id": user_id, "is_active": True},
        {"_id": 0}
    ).to_list(100)
    return types

@api_router.get("/public/booking-type/{slug}")
async def get_public_booking_type_by_slug(slug: str):
    bt = await db.booking_types.find_one(
        {"slug": slug, "is_active": True},
        {"_id": 0}
    )
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    user = await db.users.find_one(
        {"user_id": bt["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    return {
        "booking_type": bt,
        "host": {
            "user_id": user["user_id"],
            "name": user["name"],
            "picture": user.get("picture"),
            "brand_color": user.get("brand_color", "#7c3aed")
        }
    }

@api_router.get("/public/availability/{user_id}")
async def get_public_availability(user_id: str):
    avail = await db.availability.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    if not avail:
        return {"slots": []}
    return {"slots": avail.get("slots", [])}

@api_router.get("/public/slots/{user_id}/{booking_type_id}")
async def get_available_slots(user_id: str, booking_type_id: str, date: str):
    """Get available time slots for a specific date"""
    # Parse the date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get booking type
    bt = await db.booking_types.find_one(
        {"booking_type_id": booking_type_id, "user_id": user_id},
        {"_id": 0}
    )
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    # Get availability
    avail = await db.availability.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    if not avail:
        return {"slots": []}
    
    # Get day of week (0=Monday)
    day_of_week = target_date.weekday()
    
    # Find availability for this day
    day_slots = [s for s in avail.get("slots", []) if s["day"] == day_of_week]
    if not day_slots:
        return {"slots": []}
    
    # Get existing appointments for this date
    start_of_day = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_of_day = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)
    
    existing = await db.appointments.find({
        "host_user_id": user_id,
        "status": {"$ne": "cancelled"},
        "start_time": {"$gte": start_of_day.isoformat(), "$lt": end_of_day.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    # Generate available slots
    duration = bt["duration"]
    buffer_before = bt.get("buffer_before", 0)
    buffer_after = bt.get("buffer_after", 15)
    min_notice = bt.get("min_notice", 60)
    
    available_slots = []
    now = datetime.now(timezone.utc)
    
    for day_slot in day_slots:
        start_hour, start_min = map(int, day_slot["start_time"].split(":"))
        end_hour, end_min = map(int, day_slot["end_time"].split(":"))
        
        slot_start = datetime.combine(target_date, datetime.min.time()).replace(
            hour=start_hour, minute=start_min, tzinfo=timezone.utc
        )
        slot_end = datetime.combine(target_date, datetime.min.time()).replace(
            hour=end_hour, minute=end_min, tzinfo=timezone.utc
        )
        
        current = slot_start
        while current + timedelta(minutes=duration) <= slot_end:
            # Check min notice
            if current < now + timedelta(minutes=min_notice):
                current += timedelta(minutes=30)
                continue
            
            # Check for conflicts
            slot_with_buffer_start = current - timedelta(minutes=buffer_before)
            slot_with_buffer_end = current + timedelta(minutes=duration + buffer_after)
            
            is_available = True
            for appt in existing:
                appt_start = datetime.fromisoformat(appt["start_time"].replace("Z", "+00:00"))
                appt_end = datetime.fromisoformat(appt["end_time"].replace("Z", "+00:00"))
                
                # Check overlap
                if not (slot_with_buffer_end <= appt_start or slot_with_buffer_start >= appt_end):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append({
                    "start": current.isoformat(),
                    "end": (current + timedelta(minutes=duration)).isoformat(),
                    "display": current.strftime("%H:%M")
                })
            
            current += timedelta(minutes=30)
    
    return {"slots": available_slots}

# ==================== APPOINTMENTS ROUTES ====================

@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(data: AppointmentCreate):
    """Public endpoint to create an appointment (booking)"""
    # Verify booking type exists
    bt = await db.booking_types.find_one(
        {"booking_type_id": data.booking_type_id},
        {"_id": 0}
    )
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    # Calculate end time
    end_time = data.start_time + timedelta(minutes=bt["duration"])
    
    appointment_id = f"appt_{uuid.uuid4().hex[:12]}"
    doc = {
        "appointment_id": appointment_id,
        "booking_type_id": data.booking_type_id,
        "host_user_id": data.host_user_id,
        "guest_name": data.guest_name,
        "guest_email": data.guest_email,
        "start_time": data.start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "status": "confirmed",
        "notes": data.notes or "",
        "answers": data.answers,
        "lead_score": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(doc)
    
    return AppointmentResponse(**{
        **doc,
        "start_time": data.start_time,
        "end_time": end_time,
        "created_at": datetime.now(timezone.utc)
    })

@api_router.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {"host_user_id": user["user_id"]}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(100)
    
    result = []
    for appt in appointments:
        start_time = appt.get("start_time")
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        end_time = appt.get("end_time")
        if isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
        created_at = appt.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        result.append(AppointmentResponse(**{
            **appt,
            "start_time": start_time,
            "end_time": end_time,
            "created_at": created_at
        }))
    
    return sorted(result, key=lambda x: x.start_time, reverse=True)

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: str,
    user: dict = Depends(get_current_user)
):
    if status not in ["confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id, "host_user_id": user["user_id"]},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Status updated"}

# ==================== AI ROUTES ====================

@api_router.post("/ai/parse-schedule", response_model=NLPScheduleResponse)
async def parse_natural_language_schedule(data: NLPScheduleRequest, user: dict = Depends(get_current_user)):
    """Parse natural language scheduling request using Gemini"""
    if not EMERGENT_LLM_KEY:
        return NLPScheduleResponse(
            interpretation="AI features require API key configuration",
            confidence=0.0
        )
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nlp_{uuid.uuid4().hex[:8]}",
            system_message="""You are a scheduling assistant. Parse the user's natural language request and extract:
1. The suggested date (in YYYY-MM-DD format)
2. The suggested time (in HH:MM format, 24-hour)
3. Your confidence level (0.0 to 1.0)

Today's date is """ + datetime.now().strftime("%Y-%m-%d") + """.

Respond ONLY in this JSON format:
{"date": "YYYY-MM-DD", "time": "HH:MM", "confidence": 0.9, "interpretation": "brief explanation"}"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await chat.send_message(UserMessage(text=data.text))
        
        # Parse JSON response
        import json
        try:
            result = json.loads(response.strip())
            return NLPScheduleResponse(
                suggested_date=result.get("date"),
                suggested_time=result.get("time"),
                confidence=result.get("confidence", 0.0),
                interpretation=result.get("interpretation", "")
            )
        except json.JSONDecodeError:
            return NLPScheduleResponse(
                interpretation=response,
                confidence=0.5
            )
    except Exception as e:
        logger.error(f"AI parse error: {e}")
        return NLPScheduleResponse(
            interpretation=f"Could not parse: {str(e)}",
            confidence=0.0
        )

@api_router.post("/ai/lead-score", response_model=LeadScoreResponse)
async def calculate_lead_score(data: LeadScoreRequest, user: dict = Depends(get_current_user)):
    """Calculate lead score based on booking form responses using Gemini"""
    if not EMERGENT_LLM_KEY:
        return LeadScoreResponse(
            score=50,
            reasoning="AI features require API key configuration",
            priority="medium"
        )
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lead_{uuid.uuid4().hex[:8]}",
            system_message="""You are a lead qualification assistant. Analyze the booking form responses and provide:
1. A lead score from 0-100 (higher = more qualified)
2. Brief reasoning for the score
3. Priority level: "high", "medium", or "low"

Consider factors like:
- Email domain (company vs personal)
- Quality and detail of responses
- Relevance to the meeting type
- Engagement signals

Respond ONLY in this JSON format:
{"score": 75, "reasoning": "brief explanation", "priority": "high"}"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        message = f"""Booking Type: {data.booking_type_title}
Guest Name: {data.guest_name}
Guest Email: {data.guest_email}
Form Responses: {data.answers}"""
        
        response = await chat.send_message(UserMessage(text=message))
        
        import json
        try:
            result = json.loads(response.strip())
            return LeadScoreResponse(
                score=result.get("score", 50),
                reasoning=result.get("reasoning", ""),
                priority=result.get("priority", "medium")
            )
        except json.JSONDecodeError:
            return LeadScoreResponse(
                score=50,
                reasoning=response,
                priority="medium"
            )
    except Exception as e:
        logger.error(f"Lead score error: {e}")
        return LeadScoreResponse(
            score=50,
            reasoning=f"Could not calculate: {str(e)}",
            priority="medium"
        )

# ==================== USER PROFILE ROUTES ====================

@api_router.put("/profile")
async def update_profile(
    request: Request,
    user: dict = Depends(get_current_user)
):
    body = await request.json()
    allowed_fields = ["name", "brand_color", "timezone", "picture"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    if update_data:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
    
    updated = await db.users.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    return updated

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    
    # Total appointments
    total = await db.appointments.count_documents({"host_user_id": user["user_id"]})
    
    # Upcoming appointments
    upcoming = await db.appointments.count_documents({
        "host_user_id": user["user_id"],
        "status": "confirmed",
        "start_time": {"$gte": now.isoformat()}
    })
    
    # This week's appointments
    week_start = now - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=7)
    this_week = await db.appointments.count_documents({
        "host_user_id": user["user_id"],
        "start_time": {"$gte": week_start.isoformat(), "$lt": week_end.isoformat()}
    })
    
    # Active booking types
    active_types = await db.booking_types.count_documents({
        "user_id": user["user_id"],
        "is_active": True
    })
    
    return {
        "total_appointments": total,
        "upcoming_appointments": upcoming,
        "this_week_appointments": this_week,
        "active_booking_types": active_types
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "KleverCal API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
