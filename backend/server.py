from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo
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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request as GoogleRequest
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, File, UploadFile
import shutil
import json
from email_templates import get_guest_confirmation_template, get_host_notification_template

ROOT_DIR = Path(__file__).parent
# Load .env if it exists (local dev), otherwise use system env (production)
if (ROOT_DIR / '.env').exists():
    load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - using get() to avoid KeyError crash
MONGO_URL = os.environ.get('MONGO_URL', '')
DB_NAME = os.environ.get('DB_NAME', 'klevercal')

if not MONGO_URL:
    logger.error("❌ MONGO_URL not found in environment variables!")

client = AsyncIOMotorClient(MONGO_URL) if MONGO_URL else None
db = client[DB_NAME] if client else None

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'klevercal-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Google Calendar OAuth Settings
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

# Zoom OAuth Settings
ZOOM_CLIENT_ID = os.environ.get('ZOOM_CLIENT_ID', '')
ZOOM_CLIENT_SECRET = os.environ.get('ZOOM_CLIENT_SECRET', '')

# Microsoft Teams OAuth Settings
TEAMS_CLIENT_ID = os.environ.get('TEAMS_CLIENT_ID', '')
TEAMS_CLIENT_SECRET = os.environ.get('TEAMS_CLIENT_SECRET', '')
TEAMS_TENANT_ID = os.environ.get('TEAMS_TENANT_ID', 'common')

# SMTP Email Settings
SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587')) # Standard port fallback for safety
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', '')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'DeeMeet')

# Gemini Settings
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="DeeMeet API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info("🚀 DEEMEET BACKEND STARTING - VERSION: SMTP_PRO_V1")

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
    welcome_message: Optional[str] = ""
    language: str = "English"
    date_format: str = "DD/MM/YYYY"
    time_format: str = "12h"
    country: str = "India"
    logo_url: Optional[str] = None
    use_branding: bool = True
    slug: Optional[str] = None
    google_calendar_connected: bool = False
    outlook_calendar_connected: bool = False
    apple_calendar_connected: bool = False
    zoom_connected: bool = False
    teams_connected: bool = False
    created_at: datetime

class BookingTypeCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    duration: int = 30
    color: str = "#7c3aed"
    is_active: bool = True
    buffer_before: int = 0
    buffer_after: int = 15
    min_notice: int = 60
    max_bookings_per_day: Optional[int] = None
    questions: List[Dict[str, Any]] = []
    location_type: str = "google_meet"  # google_meet, zoom, teams, custom
    location_details: Optional[str] = ""

class BookingTypeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_type_id: str
    user_id: str
    title: str
    description: Optional[str] = ""
    duration: int
    color: str
    is_active: bool
    buffer_before: int
    buffer_after: int
    min_notice: int
    max_bookings_per_day: Optional[int] = None
    questions: List[Dict[str, Any]] = []
    location_type: Optional[str] = "google_meet"
    location_details: Optional[str] = ""
    slug: str
    created_at: datetime

class AvailabilitySlot(BaseModel):
    day: int
    start_time: str
    end_time: str

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
    guest_phone: Optional[str] = None
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
    guest_phone: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str
    notes: str
    answers: List[Dict[str, Any]]
    lead_score: Optional[int] = None
    google_event_id: Optional[str] = None
    created_at: datetime

class NLPScheduleRequest(BaseModel):
    text: str
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
    score: int
    reasoning: str
    priority: str

# ==================== EMAIL SERVICE ====================

def send_booking_confirmation_email(
    to_email: str,
    guest_name: str,
    host_name: str,
    meeting_title: str,
    start_time: datetime,
    end_time: datetime,
    duration: int,
    notes: str = "",
    location: str = "Google Meet",
    meeting_link: Optional[str] = None,
    host_email: str = "",
    reschedule_link: str = "",
    cancel_link: str = ""
):
    """Send booking confirmation email to guest using professional template"""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        logger.warning(f"SMTP configuration incomplete (Host: {bool(SMTP_HOST)}, User: {bool(SMTP_USER)}, Pass: {bool(SMTP_PASSWORD)}, From: {bool(SMTP_FROM_EMAIL)}), skipping email")
        return False
    
    try:
        # Format date/time
        date_str = start_time.strftime("%A, %B %d, %Y")
        time_str = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
        
        # Create email subject
        subject = f"Confirmed: {meeting_title} with {host_name}"
        
        # Get professional HTML template
        html_content = get_guest_confirmation_template(
            guest_name=guest_name,
            host_name=host_name,
            meeting_title=meeting_title,
            date_str=date_str,
            time_str=time_str,
            duration=duration,
            location=location,
            meeting_link=meeting_link,
            notes=notes,
            host_email=host_email,
            reschedule_link=reschedule_link,
            cancel_link=cancel_link
        )
        
        # Plain text fallback
        text_content = f"""
You're scheduled!

Hi {guest_name},

A new event has been scheduled.

Event: {meeting_title}
Host: {host_name}
When: {time_str} - {date_str}
Where: {location}
{f'Meeting Link: {meeting_link}' if meeting_link else ''}
{f'Description: {notes}' if notes else ''}

A calendar invitation has been sent to your email address.

Need to make changes? Please use the reschedule or cancel options, or reply to this email.

Powered by DeeMeet - Smart scheduling made simple
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email using configured SMTP
        if SMTP_PORT == 465:
            # Use SSL
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            # Use TLS (typically port 587)
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        
        logger.info(f"Confirmation email sent to {to_email} from {SMTP_FROM_EMAIL}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def send_host_notification_email(
    host_email: str,
    host_name: str,
    guest_name: str,
    guest_email: str,
    meeting_title: str,
    start_time: datetime,
    end_time: datetime,
    duration: int,
    notes: str = "",
    guest_phone: Optional[str] = None,
    location: str = "Google Meet",
    meeting_link: Optional[str] = None,
    manage_link: str = ""
):
    """Send notification email to host about new booking using professional template"""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        logger.warning(f"SMTP configuration incomplete (Host: {bool(SMTP_HOST)}, User: {bool(SMTP_USER)}, Pass: {bool(SMTP_PASSWORD)}, From: {bool(SMTP_FROM_EMAIL)}), skipping email")
        return False
    
    try:
        date_str = start_time.strftime("%A, %B %d, %Y")
        time_str = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
        
        subject = f"New Booking: {meeting_title} with {guest_name}"
        
        # Get professional HTML template
        html_content = get_host_notification_template(
            host_name=host_name,
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone or "",
            meeting_title=meeting_title,
            date_str=date_str,
            time_str=time_str,
            duration=duration,
            location=location,
            meeting_link=meeting_link,
            notes=notes,
            manage_link=manage_link
        )
        
        # Plain text fallback
        text_content = f"""
New Event Scheduled

Hi {host_name},

A new event has been scheduled.

Event: {meeting_title}
Invitee: {guest_name}
Email: {guest_email}
{f'Phone: {guest_phone}' if guest_phone else ''}
When: {time_str} - {date_str}
Duration: {duration} min
Where: {location}
{f'Meeting Link: {meeting_link}' if meeting_link else ''}
{f'Description: {notes}' if notes else ''}

Let's see how we can collaborate for success!

Powered by DeeMeet - Smart scheduling made simple
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = host_email
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email using configured SMTP
        if SMTP_PORT == 465:
            # Use SSL
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            # Use TLS (typically port 587)
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        
        logger.info(f"Host notification sent to {host_email} from {SMTP_FROM_EMAIL}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send host notification: {e}")
        return False

# ==================== GOOGLE CALENDAR SERVICE ====================

def get_google_oauth_flow(redirect_uri: str):
    """Create Google OAuth flow"""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=redirect_uri
    )

async def get_google_credentials(user_id: str) -> Optional[Credentials]:
    """Get Google credentials for a user, refreshing if needed"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("google_tokens"):
        return None
    
    tokens = user["google_tokens"]
    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=GOOGLE_SCOPES
    )
    
    # Refresh if expired
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())
            # Update stored tokens
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "google_tokens.access_token": creds.token,
                    "google_tokens.expiry": creds.expiry.isoformat() if creds.expiry else None
                }}
            )
        except Exception as e:
            logger.error(f"Failed to refresh Google token: {e}")
            return None
    
    return creds

async def create_google_calendar_event(
    user_id: str,
    summary: str,
    description: str,
    start_time: datetime,
    end_time: datetime,
    attendee_email: str,
    location_type: str = "google_meet"
) -> Optional[Dict[str, str]]:
    """Create a Google Calendar event and return the event ID and meeting link"""
    creds = await get_google_credentials(user_id)
    if not creds:
        return None
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'attendees': [
                {'email': attendee_email},
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 60},
                    {'method': 'popup', 'minutes': 15},
                ],
            },
        }

        # Add logic for Google Meet
        if location_type == "google_meet":
            event['conferenceData'] = {
                'createRequest': {
                    'requestId': f"req-{uuid.uuid4().hex}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            }
        
        event = service.events().insert(
            calendarId='primary',
            body=event,
            sendUpdates='all',
            conferenceDataVersion=1
        ).execute()
        
        event_id = event.get('id')
        hangout_link = event.get('hangoutLink')
        
        logger.info(f"Created Google Calendar event: {event_id}, Link: {hangout_link}")
        
        return {
            "id": event_id,
            "meeting_link": hangout_link
        }
        
    except Exception as e:
        logger.error(f"Failed to create Google Calendar event: {e}")
        return None

async def get_google_calendar_busy_times(
    user_id: str,
    start_date: datetime,
    end_date: datetime
) -> List[Dict[str, datetime]]:
    """Get busy times from Google Calendar"""
    creds = await get_google_credentials(user_id)
    if not creds:
        return []
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Get freebusy information
        body = {
            "timeMin": start_date.isoformat() + 'Z',
            "timeMax": end_date.isoformat() + 'Z',
            "items": [{"id": "primary"}]
        }
        
        freebusy = service.freebusy().query(body=body).execute()
        busy_times = []
        
        for busy in freebusy.get('calendars', {}).get('primary', {}).get('busy', []):
            busy_times.append({
                'start': datetime.fromisoformat(busy['start'].replace('Z', '+00:00')),
                'end': datetime.fromisoformat(busy['end'].replace('Z', '+00:00'))
            })
        
        return busy_times
        
    except Exception as e:
        logger.error(f"Failed to get Google Calendar busy times: {e}")
        return []

async def delete_google_calendar_event(user_id: str, event_id: str) -> bool:
    """Delete a Google Calendar event"""
    creds = await get_google_credentials(user_id)
    if not creds:
        return False
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        logger.info(f"Deleted Google Calendar event: {event_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete Google Calendar event: {e}")
        return False

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

async def create_zoom_meeting(user_id: str, topic: str, start_time: datetime, duration_min: int, description: str) -> Optional[str]:
    """Create a Zoom meeting and return the join URL"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("zoom_tokens"):
        return None
    
    tokens = user["zoom_tokens"]
    access_token = tokens.get("access_token")
    
    # Check if token needs refresh (Zoom tokens last 1h) - simplified: try request, if 401, refresh
    # For robust implementation: store expiry and refresh before call.
    # Here we'll try to refresh if basic call fails or just use what we have.
    
    async with httpx.AsyncClient() as client:
        # Create Meeting
        resp = await client.post(
            "https://api.zoom.us/v2/users/me/meetings",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "topic": topic,
                "type": 2, # Scheduled meeting
                "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"), # Zoom expects UTC in this format or Z
                "duration": duration_min,
                "agenda": description,
                "settings": {
                    "host_video": True,
                    "participant_video": True,
                    "join_before_host": False,
                    "mute_upon_entry": True,
                    "waiting_room": False
                }
            }
        )
        
        if resp.status_code == 401:
            # Token expired, refresh it
            refresh_token = tokens.get("refresh_token")
            if not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
                return None
                
            from base64 import b64encode
            auth_str = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}"
            b64_auth = b64encode(auth_str.encode()).decode()
            
            refresh_resp = await client.post(
                "https://zoom.us/oauth/token",
                params={"grant_type": "refresh_token", "refresh_token": refresh_token},
                headers={"Authorization": f"Basic {b64_auth}"}
            )
            
            if refresh_resp.status_code == 200:
                new_tokens = refresh_resp.json()
                access_token = new_tokens["access_token"]
                # Update DB
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "zoom_tokens.access_token": access_token,
                        "zoom_tokens.refresh_token": new_tokens.get("refresh_token", refresh_token),
                         # Zoom returns new refresh token, always rotate!
                    }}
                )
                
                # Retry creation
                resp = await client.post(
                    "https://api.zoom.us/v2/users/me/meetings",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json={
                        "topic": topic,
                        "type": 2,
                        "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "duration": duration_min,
                        "agenda": description
                    }
                )

        if resp.status_code == 201:
            data = resp.json()
            return data.get("join_url")
        else:
            logger.error(f"Zoom meeting creation failed: {resp.text}")
            return None

async def create_teams_meeting(user_id: str, subject: str, start_time: datetime, end_time: datetime) -> Optional[str]:
    """Create Microsoft Teams meeting"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("teams_tokens"):
        return None
        
    tokens = user["teams_tokens"]
    access_token = tokens.get("access_token")
    
    async with httpx.AsyncClient() as client:
        # Create Online Meeting
        resp = await client.post(
            "https://graph.microsoft.com/v1.0/me/onlineMeetings",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={
                "startDateTime": start_time.isoformat(),
                "endDateTime": end_time.isoformat(),
                "subject": subject
            }
        )
        
        # Add basic refresh logic similar to Zoom if 401 (omitted for brevity, assume valid for test)
        
        if resp.status_code == 201:
            data = resp.json()
            return data.get("joinWebUrl") # This is the meeting link
        else:
            logger.error(f"Teams meeting creation failed: {resp.text}")
            return None

async def get_current_user(request: Request) -> dict:
    session_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization")
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif session_token:
        token = session_token
    else:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
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
        "welcome_message": "Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.",
        "language": "English",
        "date_format": "DD/MM/YYYY",
        "time_format": "12h",
        "country": "India",
        "use_branding": True,
        "google_calendar_connected": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default availability
    default_slots = [{"day": day, "start_time": "09:00", "end_time": "17:00"} for day in range(5)]
    await db.availability.insert_one({
        "availability_id": f"avail_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "slots": default_slots,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
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
        welcome_message=user.get("welcome_message", ""),
        language=user.get("language", "English"),
        date_format=user.get("date_format", "DD/MM/YYYY"),
        time_format=user.get("time_format", "12h"),
        country=user.get("country", "India"),
        logo_url=user.get("logo_url"),
        use_branding=user.get("use_branding", True),
        slug=user.get("slug"),
        google_calendar_connected=user.get("google_calendar_connected", False),
        outlook_calendar_connected=user.get("outlook_calendar_connected", False),
        apple_calendar_connected=user.get("apple_calendar_connected", False),
        zoom_connected=user.get("zoom_connected", False),
        teams_connected=user.get("teams_connected", False),
        created_at=created_at
    )



@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== GOOGLE CALENDAR OAUTH ROUTES ====================

@api_router.get("/calendar/google/connect")
async def google_calendar_connect(request: Request, user: dict = Depends(get_current_user)):
    """Initiate Google Calendar OAuth flow"""
    origin = request.headers.get("origin", "")
    if not origin:
        referer = request.headers.get("referer", "")
        if referer:
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            origin = f"{parsed.scheme}://{parsed.netloc}"
            
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=400, 
            detail="Google Calendar integration is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment."
        )
    
    redirect_uri = f"{origin}/api/calendar/google/callback"
    
    flow = get_google_oauth_flow(redirect_uri)
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    # Store state with user_id for callback
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": user["user_id"],
        "redirect_uri": redirect_uri,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"authorization_url": authorization_url}

@api_router.get("/calendar/google/callback")
async def google_calendar_callback(code: str, state: str, request: Request):
    """Handle Google Calendar OAuth callback"""
    # Find the state record
    state_record = await db.oauth_states.find_one({"state": state}, {"_id": 0})
    if not state_record:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    user_id = state_record["user_id"]
    redirect_uri = state_record["redirect_uri"]
    
    # Delete used state
    await db.oauth_states.delete_one({"state": state})
    
    try:
        # Exchange code for tokens using direct request (avoids scope mismatch issues)
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'redirect_uri': redirect_uri,
                    'grant_type': 'authorization_code'
                }
            )
            
            if token_resp.status_code != 200:
                logger.error(f"Token exchange failed: {token_resp.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
            
            tokens = token_resp.json()
        
        # Store tokens
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "google_tokens": {
                    "access_token": tokens.get("access_token"),
                    "refresh_token": tokens.get("refresh_token"),
                    "token_type": tokens.get("token_type"),
                    "expiry": (datetime.now(timezone.utc) + timedelta(seconds=tokens.get("expires_in", 3600))).isoformat()
                },
                "google_calendar_connected": True
            }}
        )
        
        logger.info(f"Google Calendar connected for user {user_id}")
        
        # Redirect back to profile page
        return {
            "status": "success",
            "message": "Calendar connected successfully",
            "redirect_url": f"{origin}/profile?calendar_connected=true"
        }
        
    except Exception as e:
        logger.error(f"Google Calendar OAuth error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/calendar/google/disconnect")
async def google_calendar_disconnect(user: dict = Depends(get_current_user)):
    """Disconnect Google Calendar"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$unset": {"google_tokens": ""}, "$set": {"google_calendar_connected": False}}
    )
    return {"message": "Google Calendar disconnected"}

@api_router.get("/calendar/google/status")
async def google_calendar_status(user: dict = Depends(get_current_user)):
    """Check Google Calendar connection status"""
    return {
        "connected": user.get("google_calendar_connected", False),
        "has_tokens": bool(user.get("google_tokens"))
    }

@api_router.post("/calendar/outlook/connect")
async def outlook_calendar_connect(user: dict = Depends(get_current_user)):
    """Mock Outlook connection"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"outlook_calendar_connected": True}}
    )
    return {"message": "Outlook Calendar connected (mock)"}

@api_router.post("/calendar/outlook/disconnect")
async def outlook_calendar_disconnect(user: dict = Depends(get_current_user)):
    """Disconnect Outlook"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"outlook_calendar_connected": False}}
    )
    return {"message": "Outlook Calendar disconnected"}

@api_router.post("/calendar/apple/connect")
async def apple_calendar_connect(user: dict = Depends(get_current_user)):
    """Mock Apple connection"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"apple_calendar_connected": True}}
    )
    return {"message": "Apple Calendar connected (mock)"}

@api_router.post("/calendar/apple/disconnect")
async def apple_calendar_disconnect(user: dict = Depends(get_current_user)):
    """Disconnect Apple"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"apple_calendar_connected": False}}
    )
    return {"message": "Apple Calendar disconnected"}

@api_router.get("/calendar/zoom/connect")
async def zoom_connect(request: Request, user: dict = Depends(get_current_user)):
    """Initiate Zoom OAuth flow"""
    # Get frontend origin for final redirect
    frontend_origin = request.headers.get("origin", "")
    if not frontend_origin:
        referer = request.headers.get("referer", "")
        if referer:
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            frontend_origin = f"{parsed.scheme}://{parsed.netloc}"
    
    # Default to production frontend if not found
    if not frontend_origin or "localhost" not in frontend_origin:
        frontend_origin = "https://deemeet.in"
            
    if not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
         # Fallback to mock if credentials not set
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"zoom_connected": True}}
        )
        return {"authorization_url": None, "message": "Zoom connected (mock - no credentials)"}

    # IMPORTANT: redirect_uri must be the BACKEND API URL, not frontend
    # Zoom will callback to the backend, then backend redirects to frontend
    backend_url = "https://api.deemeet.in"
    redirect_uri = f"{backend_url}/api/calendar/zoom/callback"
    
    # Zoom OAuth URL construction
    params = {
        "response_type": "code",
        "client_id": ZOOM_CLIENT_ID,
        "redirect_uri": redirect_uri
    }
    from urllib.parse import urlencode
    authorization_url = f"https://zoom.us/oauth/authorize?{urlencode(params)}"
    
    # Generate state for security
    state = uuid.uuid4().hex
    authorization_url += f"&state={state}"

    # Store state with user_id and frontend_origin for callback
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": user["user_id"],
        "redirect_uri": redirect_uri,
        "frontend_origin": frontend_origin,  # Store frontend URL for final redirect
        "provider": "zoom",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"authorization_url": authorization_url}

@api_router.get("/calendar/zoom/callback")
async def zoom_callback(code: str, request: Request, state: Optional[str] = None):
    """Handle Zoom OAuth callback"""
    logger.info(f"Zoom callback received. Code: {code[:10]}..., State: {state}")
    
    if not state:
        logger.warning("Zoom callback missing state parameter")
        # Redirect to frontend with error
        return RedirectResponse(url="https://deemeet.in/integrations?error=missing_state")

    state_record = await db.oauth_states.find_one({"state": state, "provider": "zoom"}, {"_id": 0})
    
    # Validation
    if not state_record:
         logger.warning(f"Zoom callback: invalid state {state}")
         return RedirectResponse(url="https://deemeet.in/integrations?error=invalid_state")

    user_id = state_record["user_id"]
    redirect_uri = state_record["redirect_uri"]
    frontend_origin = state_record.get("frontend_origin", "https://deemeet.in")
    await db.oauth_states.delete_one({"state": state})

    try:
        async with httpx.AsyncClient() as client:
            from base64 import b64encode
            # Zoom require Basic Auth with ClientID:ClientSecret
            auth_str = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}"
            b64_auth = b64encode(auth_str.encode()).decode()
            
            token_resp = await client.post(
                "https://zoom.us/oauth/token",
                params={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri
                },
                headers={
                    "Authorization": f"Basic {b64_auth}"
                }
            )
            
            if token_resp.status_code != 200:
                logger.error(f"Zoom Token exchange failed: {token_resp.text}")
                return RedirectResponse(url=f"{frontend_origin}/integrations?error=token_exchange_failed")
            
            tokens = token_resp.json()
            
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "zoom_tokens": {
                    "access_token": tokens.get("access_token"),
                    "refresh_token": tokens.get("refresh_token"),
                    "expires_in": tokens.get("expires_in"),
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                "zoom_connected": True
            }}
        )
        
        logger.info(f"Zoom connected successfully for user {user_id}")
        
        # Redirect to frontend integrations page with success indicator
        return RedirectResponse(url=f"{frontend_origin}/integrations?zoom=connected")

    except Exception as e:
        logger.error(f"Zoom OAuth error: {e}")
        return RedirectResponse(url=f"{frontend_origin}/integrations?error=oauth_failed")

@api_router.post("/calendar/zoom/disconnect")
async def zoom_disconnect(user: dict = Depends(get_current_user)):
    """Disconnect Zoom"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$unset": {"zoom_tokens": ""}, "$set": {"zoom_connected": False}}
    )
    return {"message": "Zoom disconnected"}

@api_router.get("/calendar/teams/connect")
async def teams_connect(request: Request, user: dict = Depends(get_current_user)):
    """Initiate MS Teams OAuth flow"""
    # Get frontend origin for final redirect
    frontend_origin = request.headers.get("origin", "")
    if not frontend_origin:
        referer = request.headers.get("referer", "")
        if referer:
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            frontend_origin = f"{parsed.scheme}://{parsed.netloc}"
    
    # Default to production frontend if not found
    if not frontend_origin or "localhost" not in frontend_origin:
        frontend_origin = "https://deemeet.in"

    if not TEAMS_CLIENT_ID or not TEAMS_CLIENT_SECRET:
        # Mock fallback
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"teams_connected": True}}
        )
        return {"authorization_url": None, "message": "Teams connected (mock - no credentials)"}

    # IMPORTANT: redirect_uri must be the BACKEND API URL
    backend_url = "https://api.deemeet.in"
    redirect_uri = f"{backend_url}/api/calendar/teams/callback"
    
    # MS Identity Platform (v2.0)
    # Scopes: OnlineMeetings.ReadWrite, User.Read, offline_access
    scope = "OnlineMeetings.ReadWrite User.Read offline_access"
    
    state = uuid.uuid4().hex
    params = {
        "client_id": TEAMS_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "response_mode": "query",
        "scope": scope,
        "state": state
    }
    from urllib.parse import urlencode
    authorization_url = f"https://login.microsoftonline.com/{TEAMS_TENANT_ID}/oauth2/v2.0/authorize?{urlencode(params)}"
    
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": user["user_id"],
        "redirect_uri": redirect_uri,
        "frontend_origin": frontend_origin,
        "provider": "teams",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"authorization_url": authorization_url}

@api_router.get("/calendar/teams/callback")
async def teams_callback(code: str, state: str, request: Request):
    """Handle Teams OAuth callback"""
    state_record = await db.oauth_states.find_one({"state": state, "provider": "teams"}, {"_id": 0})
    if not state_record:
         return RedirectResponse(url="https://deemeet.in/integrations?error=invalid_state")

    user_id = state_record["user_id"]
    redirect_uri = state_record["redirect_uri"]
    frontend_origin = state_record.get("frontend_origin", "https://deemeet.in")
    await db.oauth_states.delete_one({"state": state})
    
    try:
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                f"https://login.microsoftonline.com/{TEAMS_TENANT_ID}/oauth2/v2.0/token",
                data={
                    "client_id": TEAMS_CLIENT_ID,
                    "scope": "OnlineMeetings.ReadWrite User.Read offline_access",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "client_secret": TEAMS_CLIENT_SECRET
                }
            )
            
            if token_resp.status_code != 200:
                logger.error(f"Teams Token exchange failed: {token_resp.text}")
                return RedirectResponse(url=f"{frontend_origin}/integrations?error=token_exchange_failed")
            
            tokens = token_resp.json()
            
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "teams_tokens": {
                    "access_token": tokens.get("access_token"),
                    "refresh_token": tokens.get("refresh_token"),
                    "expires_in": tokens.get("expires_in"),
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                "teams_connected": True
            }}
        )
        
        logger.info(f"Microsoft Teams connected successfully for user {user_id}")
        return RedirectResponse(url=f"{frontend_origin}/integrations?teams=connected")

    except Exception as e:
        logger.error(f"Teams OAuth error: {e}")
        return RedirectResponse(url=f"{frontend_origin}/integrations?error=oauth_failed")

@api_router.post("/calendar/teams/disconnect")
async def teams_disconnect(user: dict = Depends(get_current_user)):
    """Disconnect Microsoft Teams"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$unset": {"teams_tokens": ""}, "$set": {"teams_connected": False}}
    )
    return {"message": "Microsoft Teams disconnected"}

@api_router.get("/calendar/google/events")
async def get_google_calendar_events(
    start_date: str,
    end_date: str,
    user: dict = Depends(get_current_user)
):
    """Get events from Google Calendar"""
    creds = await get_google_credentials(user["user_id"])
    if not creds:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        events_result = service.events().list(
            calendarId='primary',
            timeMin=f"{start_date}T00:00:00Z",
            timeMax=f"{end_date}T23:59:59Z",
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = []
        for event in events_result.get('items', []):
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            events.append({
                'id': event['id'],
                'summary': event.get('summary', 'No title'),
                'start': start,
                'end': end,
                'description': event.get('description', '')
            })
        
        return {"events": events}
        
    except Exception as e:
        logger.error(f"Failed to get Google Calendar events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/calendar/google/busy")
async def get_google_calendar_busy(
    start_date: str,
    end_date: str,
    user: dict = Depends(get_current_user)
):
    """Get busy times from Google Calendar"""
    start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    busy_times = await get_google_calendar_busy_times(user["user_id"], start, end)
    
    return {"busy_times": [
        {"start": bt["start"].isoformat(), "end": bt["end"].isoformat()}
        for bt in busy_times
    ]}

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
        "location_type": data.location_type,
        "location_details": data.location_details,
        "slug": slug,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.booking_types.insert_one(doc)
    
    return BookingTypeResponse(**{**doc, "created_at": datetime.fromisoformat(doc["created_at"])})

@api_router.get("/booking-types", response_model=List[BookingTypeResponse])
async def get_booking_types(user: dict = Depends(get_current_user)):
    try:
        types = await db.booking_types.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
        
        # Safe date parsing
        formatted_types = []
        for t in types:
            created_at = t.get("created_at")
            if isinstance(created_at, str):
                try:
                    # Remove 'Z' and try to parse
                    clean_date = created_at.replace('Z', '+00:00')
                    t["created_at"] = datetime.fromisoformat(clean_date)
                except Exception:
                    t["created_at"] = datetime.now(timezone.utc)
            elif not created_at:
                t["created_at"] = datetime.now(timezone.utc)
            
            formatted_types.append(BookingTypeResponse(**t))
            
        return formatted_types
    except Exception as e:
        logger.error(f"Error loading booking types: {str(e)}")
        # Return empty list instead of crashing the page
        return []

@api_router.get("/booking-types/{booking_type_id}", response_model=BookingTypeResponse)
async def get_booking_type(booking_type_id: str, user: dict = Depends(get_current_user)):
    bt = await db.booking_types.find_one({"booking_type_id": booking_type_id, "user_id": user["user_id"]}, {"_id": 0})
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    return BookingTypeResponse(**{**bt, "created_at": datetime.fromisoformat(bt["created_at"]) if isinstance(bt["created_at"], str) else bt["created_at"]})

@api_router.put("/booking-types/{booking_type_id}", response_model=BookingTypeResponse)
async def update_booking_type(booking_type_id: str, data: BookingTypeCreate, user: dict = Depends(get_current_user)):
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.booking_types.update_one(
        {"booking_type_id": booking_type_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    bt = await db.booking_types.find_one({"booking_type_id": booking_type_id}, {"_id": 0})
    return BookingTypeResponse(**{**bt, "created_at": datetime.fromisoformat(bt["created_at"]) if isinstance(bt["created_at"], str) else bt["created_at"]})

@api_router.delete("/booking-types/{booking_type_id}")
async def delete_booking_type(booking_type_id: str, user: dict = Depends(get_current_user)):
    result = await db.booking_types.delete_one({"booking_type_id": booking_type_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking type not found")
    return {"message": "Deleted successfully"}

# ==================== AVAILABILITY ROUTES ====================

@api_router.get("/availability", response_model=AvailabilityResponse)
async def get_availability(user: dict = Depends(get_current_user)):
    avail = await db.availability.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not avail:
        default_slots = [{"day": day, "start_time": "09:00", "end_time": "17:00"} for day in range(5)]
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
        {"$set": {"slots": slots, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    avail = await db.availability.find_one({"user_id": user["user_id"]}, {"_id": 0})
    updated_at = avail.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return AvailabilityResponse(**{**avail, "updated_at": updated_at})

# ==================== PUBLIC BOOKING ROUTES ====================

@api_router.get("/public/user/{user_id}")
async def get_public_user(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0, "google_tokens": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user["user_id"], 
        "name": user["name"], 
        "picture": user.get("picture"), 
        "brand_color": user.get("brand_color", "#7c3aed"),
        "welcome_message": user.get("welcome_message"),
        "logo_url": user.get("logo_url"),
        "use_branding": user.get("use_branding", True),
        "slug": user.get("slug")
    }

@api_router.get("/public/profile/{slug}")
async def get_public_profile_by_slug(slug: str):
    """Get public profile (user info + booking types) by slug"""
    user = await db.users.find_one({"slug": slug}, {"_id": 0, "password_hash": 0, "google_tokens": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get active booking types
    booking_types = await db.booking_types.find({"user_id": user["user_id"], "is_active": True}, {"_id": 0}).to_list(100)
    
    return {
        "user": {
            "user_id": user["user_id"], 
            "name": user["name"], 
            "picture": user.get("picture"), 
            "brand_color": user.get("brand_color", "#7c3aed"),
            "welcome_message": user.get("welcome_message"),
            "logo_url": user.get("logo_url"),
            "use_branding": user.get("use_branding", True),
            "slug": user.get("slug")
        },
        "booking_types": booking_types
    }

@api_router.get("/public/booking-types/{user_id}")
async def get_public_booking_types(user_id: str):
    types = await db.booking_types.find({"user_id": user_id, "is_active": True}, {"_id": 0}).to_list(100)
    return types

@api_router.get("/public/booking-type/{slug}")
async def get_public_booking_type_by_slug(slug: str):
    bt = await db.booking_types.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    user = await db.users.find_one({"user_id": bt["user_id"]}, {"_id": 0, "password_hash": 0, "google_tokens": 0})
    return {
        "booking_type": bt,
        "host": {
            "user_id": user["user_id"], 
            "name": user["name"], 
            "picture": user.get("picture"), 
            "brand_color": user.get("brand_color", "#7c3aed"),
            "welcome_message": user.get("welcome_message"),
            "logo_url": user.get("logo_url"),
            "use_branding": user.get("use_branding", True),
            "slug": user.get("slug")
        }
    }

@api_router.get("/public/availability/{user_id}")
async def get_public_availability(user_id: str):
    avail = await db.availability.find_one({"user_id": user_id}, {"_id": 0})
    return {"slots": avail.get("slots", []) if avail else []}

@api_router.get("/public/slots/{user_id}/{booking_type_id}")
async def get_available_slots(user_id: str, booking_type_id: str, date: str):
    """Get available time slots for a specific date, considering Google Calendar busy times"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    bt = await db.booking_types.find_one({"booking_type_id": booking_type_id, "user_id": user_id}, {"_id": 0})
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    avail = await db.availability.find_one({"user_id": user_id}, {"_id": 0})
    if not avail:
        return {"slots": []}
    
    day_of_week = target_date.weekday()
    day_slots = [s for s in avail.get("slots", []) if s["day"] == day_of_week]
    if not day_slots:
        return {"slots": []}
    
    # Get existing DeeMeet appointments
    start_of_day = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_of_day = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)
    
    existing = await db.appointments.find({
        "host_user_id": user_id,
        "status": {"$ne": "cancelled"},
        "start_time": {"$gte": start_of_day.isoformat(), "$lt": end_of_day.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    # Get Google Calendar busy times
    google_busy = await get_google_calendar_busy_times(user_id, start_of_day, end_of_day)
    
    # Combine all busy times
    all_busy = []
    for appt in existing:
        appt_start = datetime.fromisoformat(appt["start_time"].replace("Z", "+00:00"))
        appt_end = datetime.fromisoformat(appt["end_time"].replace("Z", "+00:00"))
        all_busy.append({"start": appt_start, "end": appt_end})
    
    all_busy.extend(google_busy)
    
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
            if current < now + timedelta(minutes=min_notice):
                current += timedelta(minutes=30)
                continue
            
            slot_with_buffer_start = current - timedelta(minutes=buffer_before)
            slot_with_buffer_end = current + timedelta(minutes=duration + buffer_after)
            
            is_available = True
            for busy in all_busy:
                if not (slot_with_buffer_end <= busy["start"] or slot_with_buffer_start >= busy["end"]):
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
    """Public endpoint to create an appointment with email confirmation and Google Calendar sync"""
    bt = await db.booking_types.find_one({"booking_type_id": data.booking_type_id}, {"_id": 0})
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    
    host = await db.users.find_one({"user_id": data.host_user_id}, {"_id": 0, "password_hash": 0})
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")
    
    end_time = data.start_time + timedelta(minutes=bt["duration"])
    
    appointment_id = f"appt_{uuid.uuid4().hex[:12]}"
    
    # Create Google Calendar event if connected
    google_event_id = None
    meeting_link = None
    
    # Get location details
    location_type = bt.get("location_type", "google_meet")
    location_label = "Google Meet"
    if location_type == "zoom":
        location_label = "Zoom"
    elif location_type == "teams":
        location_label = "Microsoft Teams"
    elif location_type == "custom":
        location_label = bt.get("location_details", "Custom Location")

    if location_type == "google_meet" and host.get("google_calendar_connected"):
        google_data = await create_google_calendar_event(
            user_id=data.host_user_id,
            summary=f"{bt['title']} with {data.guest_name}",
            description=f"Guest: {data.guest_name}\nEmail: {data.guest_email}\nPhone: {data.guest_phone or 'N/A'}\nNotes: {data.notes or 'None'}",
            start_time=data.start_time,
            end_time=end_time,
            attendee_email=data.guest_email,
            location_type=location_type
        )
        if google_data:
            google_event_id = google_data.get("id")
            meeting_link = google_data.get("meeting_link")

    elif location_type == "zoom" and host.get("zoom_connected"):
        zoom_link = await create_zoom_meeting(
             user_id=data.host_user_id,
             topic=f"{bt['title']} with {data.guest_name}",
             start_time=data.start_time,
             duration_min=bt["duration"],
             description=f"Guest: {data.guest_name}\nEmail: {data.guest_email}"
        )
        if zoom_link:
            meeting_link = zoom_link

    elif location_type == "teams" and host.get("teams_connected"):
        teams_link = await create_teams_meeting(
            user_id=data.host_user_id,
            subject=f"{bt['title']} with {data.guest_name}",
            start_time=data.start_time,
            end_time=end_time
        )
        if teams_link:
            meeting_link = teams_link

    # Also sync to Google Calendar if connected (for blocking time), even if location is not Google Meet
    if host.get("google_calendar_connected") and location_type != "google_meet":
        # Create GCal event but without GMeet link, putting the other link in description
        desc = f"Guest: {data.guest_name}\nEmail: {data.guest_email}\nNotes: {data.notes or 'None'}\n\nMeeting Link: {meeting_link if meeting_link else 'N/A'}"
        await create_google_calendar_event(
            user_id=data.host_user_id,
            summary=f"{bt['title']} with {data.guest_name}",
            description=desc,
            start_time=data.start_time,
            end_time=end_time,
            attendee_email=data.guest_email,
            location_type="none" # Don't add GMeet
        )
    
    doc = {
        "appointment_id": appointment_id,
        "booking_type_id": data.booking_type_id,
        "host_user_id": data.host_user_id,
        "guest_name": data.guest_name,
        "guest_email": data.guest_email,
        "guest_phone": data.guest_phone,
        "start_time": data.start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "status": "confirmed",
        "notes": data.notes or "",
        "answers": data.answers,
        "lead_score": None,
        "google_event_id": google_event_id,
        "meeting_link": meeting_link,
        "location": location_label,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(doc)
    
    # Send confirmation emails
    logger.info("📧 ATTEMPTING EMAIL SEND - VERSION: SMTP_PRO_V1")
    send_booking_confirmation_email(
        to_email=data.guest_email,
        guest_name=data.guest_name,
        host_name=host["name"],
        meeting_title=bt["title"],
        start_time=data.start_time,
        end_time=end_time,
        duration=bt["duration"],
        notes=data.notes or "",
        location=location_label,
        meeting_link=meeting_link
    )
    
    send_host_notification_email(
        host_email=host["email"],
        host_name=host["name"],
        guest_name=data.guest_name,
        guest_email=data.guest_email,
        guest_phone=data.guest_phone,
        meeting_title=bt["title"],
        start_time=data.start_time,
        end_time=end_time,
        duration=bt["duration"],
        notes=data.notes or "",
        location=location_label,
        meeting_link=meeting_link
    )
    
    return AppointmentResponse(**{
        **doc,
        "start_time": data.start_time,
        "end_time": end_time,
        "created_at": datetime.now(timezone.utc)
    })

@api_router.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(status: Optional[str] = None, user: dict = Depends(get_current_user)):
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
async def update_appointment_status(appointment_id: str, status: str, user: dict = Depends(get_current_user)):
    if status not in ["confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    appt = await db.appointments.find_one(
        {"appointment_id": appointment_id, "host_user_id": user["user_id"]},
        {"_id": 0}
    )
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Delete Google Calendar event if cancelling
    if status == "cancelled" and appt.get("google_event_id"):
        await delete_google_calendar_event(user["user_id"], appt["google_event_id"])
    
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Status updated"}

# ==================== AI ROUTES ====================

@api_router.post("/ai/parse-schedule", response_model=NLPScheduleResponse)
async def parse_natural_language_schedule(data: NLPScheduleRequest, user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        return NLPScheduleResponse(interpretation="AI features require API key configuration", confidence=0.0)
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nlp_{uuid.uuid4().hex[:8]}",
            system_message=f"""You are a scheduling assistant. Parse the user's natural language request and extract:
1. The suggested date (in YYYY-MM-DD format)
2. The suggested time (in HH:MM format, 24-hour)
3. Your confidence level (0.0 to 1.0)

Today's date is {datetime.now().strftime("%Y-%m-%d")}.

Respond ONLY in this JSON format:
{{"date": "YYYY-MM-DD", "time": "HH:MM", "confidence": 0.9, "interpretation": "brief explanation"}}"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        response = await chat.send_message(UserMessage(text=data.text))
        
        try:
            result = json.loads(response.strip())
            return NLPScheduleResponse(
                suggested_date=result.get("date"),
                suggested_time=result.get("time"),
                confidence=result.get("confidence", 0.0),
                interpretation=result.get("interpretation", "")
            )
        except json.JSONDecodeError:
            return NLPScheduleResponse(interpretation=response, confidence=0.5)
    except Exception as e:
        logger.error(f"AI parse error: {e}")
        return NLPScheduleResponse(interpretation=f"Could not parse: {str(e)}", confidence=0.0)

@api_router.post("/ai/lead-score", response_model=LeadScoreResponse)
async def calculate_lead_score(data: LeadScoreRequest, user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        return LeadScoreResponse(score=50, reasoning="AI features require API key configuration", priority="medium")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lead_{uuid.uuid4().hex[:8]}",
            system_message="""You are a lead qualification assistant. Analyze the booking form responses and provide:
1. A lead score from 0-100 (higher = more qualified)
2. Brief reasoning for the score
3. Priority level: "high", "medium", or "low"

Respond ONLY in this JSON format:
{"score": 75, "reasoning": "brief explanation", "priority": "high"}"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        message = f"""Booking Type: {data.booking_type_title}
Guest Name: {data.guest_name}
Guest Email: {data.guest_email}
Form Responses: {data.answers}"""
        
        response = await chat.send_message(UserMessage(text=message))
        
        try:
            result = json.loads(response.strip())
            return LeadScoreResponse(
                score=result.get("score", 50),
                reasoning=result.get("reasoning", ""),
                priority=result.get("priority", "medium")
            )
        except json.JSONDecodeError:
            return LeadScoreResponse(score=50, reasoning=response, priority="medium")
    except Exception as e:
        logger.error(f"Lead score error: {e}")
        return LeadScoreResponse(score=50, reasoning=f"Could not calculate: {str(e)}", priority="medium")

# ==================== USER PROFILE ROUTES ====================

@api_router.put("/profile")
async def update_profile(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    allowed_fields = [
        "name", "brand_color", "timezone", "picture", "logo_url",
        "welcome_message", "language", "date_format", 
        "time_format", "country", "use_branding", "slug"
    ]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    if "slug" in update_data:
        # Only check if slug is unique if it's being changed
        if update_data["slug"] != user.get("slug"):
            existing = await db.users.find_one({
                "slug": update_data["slug"], 
                "user_id": {"$ne": user["user_id"]}
            })
            if existing:
                raise HTTPException(status_code=400, detail="This link is already taken. Please try another one.")
    
    if update_data:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0, "google_tokens": 0})
    return updated


# ==================== UPLOAD ROUTES ====================

# ImgBB API Key (get free key from https://api.imgbb.com/*)
IMGBB_API_KEY = os.environ.get('IMGBB_API_KEY', '')

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload image to ImgBB (free cloud storage)"""
    try:
        if not IMGBB_API_KEY:
            raise HTTPException(status_code=500, detail="Image upload not configured. Please set IMGBB_API_KEY environment variable.")
        
        # Read file content
        file_content = await file.read()
        
        # Convert to base64 for ImgBB API
        import base64
        encoded_image = base64.b64encode(file_content).decode('utf-8')
        
        # Upload to ImgBB
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.imgbb.com/1/upload",
                data={
                    "key": IMGBB_API_KEY,
                    "image": encoded_image,
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                image_url = result['data']['url']
                return {"url": image_url}
            else:
                logger.error(f"ImgBB upload failed: {response.text}")
                raise HTTPException(status_code=500, detail="Image upload failed")
                
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    
    total = await db.appointments.count_documents({"host_user_id": user["user_id"]})
    upcoming = await db.appointments.count_documents({
        "host_user_id": user["user_id"],
        "status": "confirmed",
        "start_time": {"$gte": now.isoformat()}
    })
    
    week_start = now - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=7)
    this_week = await db.appointments.count_documents({
        "host_user_id": user["user_id"],
        "start_time": {"$gte": week_start.isoformat(), "$lt": week_end.isoformat()}
    })
    
    active_types = await db.booking_types.count_documents({"user_id": user["user_id"], "is_active": True})
    
    return {
        "total_appointments": total,
        "upcoming_appointments": upcoming,
        "this_week_appointments": this_week,
        "active_booking_types": active_types
    }

# ==================== EMAIL TEST ROUTE ====================

@api_router.post("/test/email")
async def test_email(user: dict = Depends(get_current_user)):
    """Test email sending"""
    success = send_booking_confirmation_email(
        to_email=user["email"],
        guest_name="Test User",
        host_name=user["name"],
        meeting_title="Test Meeting",
        start_time=datetime.now(timezone.utc) + timedelta(hours=24),
        end_time=datetime.now(timezone.utc) + timedelta(hours=24, minutes=30),
        duration=30,
        notes="This is a test email"
    )
    return {"success": success, "message": "Test email sent" if success else "Failed to send email"}

# ==================== ROOT ====================

@app.get("/ZOOM_verify_54e574a646e24cfab666a61e79315ae8.html")
async def zoom_verification():
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content="ZOOM_verify_54e574a646e24cfab666a61e79315ae8", status_code=200)

@api_router.get("/")
async def root():
    return {"message": "DeeMeet API", "version": "1.1.0", "features": ["calendar_sync", "email_notifications"]}



# =====================
# ADMIN PANEL ENDPOINTS
# =====================

# Admin authentication helper
ADMIN_EMAILS = os.environ.get('ADMIN_EMAILS', 'admin@deemeet.com').split(',')

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get('email') not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/stats", response_model=dict)
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get comprehensive admin dashboard statistics"""
    try:
        # Total users
        total_users = await db.users.count_documents({})
        
        # Users with completed onboarding (have slug)
        onboarded_users = await db.users.count_documents({"slug": {"$ne": None, "$exists": True}})
        
        # Users by plan
        free_plan = await db.users.count_documents({"plan": {"$in": [None, "free"]}})
        pro_plan = await db.users.count_documents({"plan": "pro"})
        premium_plan = await db.users.count_documents({"plan": "premium"})
        
        # Total bookings
        total_bookings = await db.appointments.count_documents({})
        
        # Bookings this month
        now = datetime.now(timezone.utc)
        first_day_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        bookings_this_month = await db.appointments.count_documents({
            "created_at": {"$gte": first_day_of_month.isoformat()}
        })
        
        # Active booking types
        active_booking_types = await db.booking_types.count_documents({})
        
        # Revenue (if you add subscription tracking)
        total_revenue = pro_plan * 10 + premium_plan * 20  # Example calculation
        
        # New users this week
        week_ago = now - timedelta(days=7)
        new_users_this_week = await db.users.count_documents({
            "created_at": {"$gte": week_ago.isoformat()}
        })
        
        return {
            "total_users": total_users,
            "onboarded_users": onboarded_users,
            "pending_onboarding": total_users - onboarded_users,
            "plans": {
                "free": free_plan,
                "pro": pro_plan,
                "premium": premium_plan
            },
            "bookings": {
                "total": total_bookings,
                "this_month": bookings_this_month
            },
            "active_booking_types": active_booking_types,
            "revenue": {
                "estimated_monthly": total_revenue,
                "currency": "USD"
            },
            "growth": {
                "new_users_this_week": new_users_this_week
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/users", response_model=dict)
async def get_admin_users(
    admin: dict = Depends(get_admin_user),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
):
    """Get paginated list of all users with their details"""
    try:
        query = {}
        if search:
            query = {
                "$or": [
                    {"email": {"$regex": search, "$options": "i"}},
                    {"name": {"$regex": search, "$options": "i"}},
                    {"slug": {"$regex": search, "$options": "i"}}
                ]
            }
        
        total = await db.users.count_documents(query)
        users = await db.users.find(query, {"password_hash": 0, "_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Add booking count for each user
        for user in users:
            user["booking_count"] = await db.appointments.count_documents({"host_user_id": user["user_id"]})
            user["booking_types_count"] = await db.booking_types.count_documents({"user_id": user["user_id"]})
        
        return {
            "total": total,
            "users": users,
            "page": skip // limit + 1,
            "per_page": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/analytics/demographics", response_model=dict)
async def get_demographics(admin: dict = Depends(get_admin_user)):
    """Get user demographics"""
    try:
        # Users by country
        country_pipeline = [
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        countries = await db.users.aggregate(country_pipeline).to_list(length=10)
        
        # Users by timezone
        timezone_pipeline = [
            {"$group": {"_id": "$timezone", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        timezones = await db.users.aggregate(timezone_pipeline).to_list(length=10)
        
        # Users by language
        language_pipeline = [
            {"$group": {"_id": "$language", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        languages = await db.users.aggregate(language_pipeline).to_list(length=10)
        
        return {
            "countries": [{"country": item["_id"], "count": item["count"]} for item in countries],
            "timezones": [{"timezone": item["_id"], "count": item["count"]} for item in timezones],
            "languages": [{"language": item["_id"], "count": item["count"]} for item in languages]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/analytics/growth", response_model=dict)
async def get_growth_analytics(admin: dict = Depends(get_admin_user)):
    """Get user growth over time"""
    try:
        # Get user signups by day for last 30 days
        now = datetime.now(timezone.utc)
        days_ago_30 = now - timedelta(days=30)
        
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": days_ago_30.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "$dateFromString": {"dateString": "$created_at"},
                            "format": "%Y-%m-%d"
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        daily_signups = await db.users.aggregate(pipeline).to_list(length=30)
        
        return {
            "daily_signups": [{"date": item["_id"], "count": item["count"]} for item in daily_signups]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/coupons", response_model=dict)
async def create_coupon(
    code: str,
    discount_percent: int,
    max_uses: Optional[int] = None,
    expires_at: Optional[str] = None,
    plan_restriction: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Create a new coupon code"""
    try:
        existing = await db.coupons.find_one({"code": code.upper()})
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        coupon_doc = {
            "coupon_id": f"coupon_{uuid.uuid4().hex[:12]}",
            "code": code.upper(),
            "discount_percent": discount_percent,
            "max_uses": max_uses,
            "current_uses": 0,
            "expires_at": expires_at,
            "plan_restriction": plan_restriction,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": admin["user_id"]
        }
        
        await db.coupons.insert_one(coupon_doc)
        return {"message": "Coupon created successfully", "coupon": coupon_doc}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/coupons", response_model=dict)
async def get_coupons(admin: dict = Depends(get_admin_user)):
    """Get all coupons"""
    try:
        coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
        return {"coupons": coupons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: dict = Depends(get_admin_user)):
    """Delete a coupon"""
    try:
        result = await db.coupons.delete_one({"coupon_id": coupon_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Coupon not found")
        return {"message": "Coupon deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    plan: str,
    admin: dict = Depends(get_admin_user)
):
    """Update a user's plan"""
    try:
        result = await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"plan": plan, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User plan updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include router after all routes are defined
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.deemeet.in",
        "https://deemeet.in",
        "https://klevercal.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(pymongo.errors.ServerSelectionTimeoutError)
async def mongo_connection_handler(request: Request, exc: pymongo.errors.ServerSelectionTimeoutError):
    return Response(
        content=json.dumps({"detail": "Database connection failed. Please ensure MongoDB is running."}),
        status_code=503,
        media_type="application/json"
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
