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

# Google Calendar OAuth Settings
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

# Gmail SMTP Settings
GMAIL_ADDRESS = os.environ.get('GMAIL_ADDRESS', '')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')

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
    notes: str = ""
):
    """Send booking confirmation email via Gmail SMTP"""
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.warning("Gmail credentials not configured, skipping email")
        return False
    
    try:
        # Format date/time
        date_str = start_time.strftime("%A, %B %d, %Y")
        time_str = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
        
        # Create email content
        subject = f"Confirmed: {meeting_title} with {host_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }}
                .meeting-card {{ background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0; }}
                .detail-row {{ display: flex; margin: 12px 0; }}
                .detail-label {{ color: #64748b; width: 100px; }}
                .detail-value {{ color: #1e293b; font-weight: 500; }}
                .footer {{ text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }}
                .btn {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin-top: 15px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">✓ Meeting Confirmed!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your meeting has been scheduled</p>
                </div>
                <div class="content">
                    <p>Hi {guest_name},</p>
                    <p>Your meeting with <strong>{host_name}</strong> has been confirmed.</p>
                    
                    <div class="meeting-card">
                        <h2 style="margin: 0 0 20px 0; color: #7c3aed;">{meeting_title}</h2>
                        <div class="detail-row">
                            <span class="detail-label">📅 Date:</span>
                            <span class="detail-value">{date_str}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">🕐 Time:</span>
                            <span class="detail-value">{time_str}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">⏱️ Duration:</span>
                            <span class="detail-value">{duration} minutes</span>
                        </div>
                        {f'<div class="detail-row"><span class="detail-label">📝 Notes:</span><span class="detail-value">{notes}</span></div>' if notes else ''}
                    </div>
                    
                    <p>A calendar invite will be sent separately. Please add this to your calendar.</p>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        Need to reschedule or cancel? Reply to this email.
                    </p>
                </div>
                <div class="footer">
                    <p>Powered by DeeMeet - Smart Scheduling</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_content = f"""
Meeting Confirmed!

Hi {guest_name},

Your meeting with {host_name} has been confirmed.

Meeting: {meeting_title}
Date: {date_str}
Time: {time_str}
Duration: {duration} minutes
{f'Notes: {notes}' if notes else ''}

A calendar invite will be sent separately.

Need to reschedule or cancel? Reply to this email.

Powered by DeeMeet
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"DeeMeet <{GMAIL_ADDRESS}>"
        msg['To'] = to_email
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Confirmation email sent to {to_email}")
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
    notes: str = ""
):
    """Send notification email to host about new booking"""
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        return False
    
    try:
        date_str = start_time.strftime("%A, %B %d, %Y")
        time_str = f"{start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
        
        subject = f"New Booking: {meeting_title} with {guest_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }}
                .meeting-card {{ background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0; }}
                .footer {{ text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">📅 New Booking!</h1>
                </div>
                <div class="content">
                    <p>Hi {host_name},</p>
                    <p>You have a new meeting scheduled:</p>
                    
                    <div class="meeting-card">
                        <h2 style="margin: 0 0 20px 0; color: #7c3aed;">{meeting_title}</h2>
                        <p><strong>Guest:</strong> {guest_name} ({guest_email})</p>
                        <p><strong>Date:</strong> {date_str}</p>
                        <p><strong>Time:</strong> {time_str}</p>
                        {f'<p><strong>Notes:</strong> {notes}</p>' if notes else ''}
                    </div>
                </div>
                <div class="footer">
                    <p>Powered by DeeMeet</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"DeeMeet <{GMAIL_ADDRESS}>"
        msg['To'] = host_email
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Host notification sent to {host_email}")
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
    attendee_email: str
) -> Optional[str]:
    """Create a Google Calendar event and return the event ID"""
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
        
        event = service.events().insert(
            calendarId='primary',
            body=event,
            sendUpdates='all'
        ).execute()
        
        logger.info(f"Created Google Calendar event: {event.get('id')}")
        return event.get('id')
        
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
        "slug": user_data.name.lower().replace(" ", "-") + "-" + uuid.uuid4().hex[:4],
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
        google_calendar_connected=user.get("google_calendar_connected", False),
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
    # Get the frontend URL from the request origin
    origin = request.headers.get("origin", "")
    if not origin:
        referer = request.headers.get("referer", "")
        if referer:
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            origin = f"{parsed.scheme}://{parsed.netloc}"
    
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
        origin = redirect_uri.replace("/api/calendar/google/callback", "")
        return RedirectResponse(url=f"{origin}/profile?calendar_connected=true")
        
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
        "slug": slug,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.booking_types.insert_one(doc)
    
    return BookingTypeResponse(**{**doc, "created_at": datetime.fromisoformat(doc["created_at"])})

@api_router.get("/booking-types", response_model=List[BookingTypeResponse])
async def get_booking_types(user: dict = Depends(get_current_user)):
    types = await db.booking_types.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return [BookingTypeResponse(**{**t, "created_at": datetime.fromisoformat(t["created_at"]) if isinstance(t["created_at"], str) else t["created_at"]}) for t in types]

@api_router.get("/booking-types/{booking_type_id}", response_model=BookingTypeResponse)
async def get_booking_type(booking_type_id: str, user: dict = Depends(get_current_user)):
    bt = await db.booking_types.find_one({"booking_type_id": booking_type_id, "user_id": user["user_id"]}, {"_id": 0})
    if not bt:
        raise HTTPException(status_code=404, detail="Booking type not found")
    return BookingTypeResponse(**{**bt, "created_at": datetime.fromisoformat(bt["created_at"]) if isinstance(bt["created_at"], str) else bt["created_at"]})

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
    if host.get("google_calendar_connected"):
        google_event_id = await create_google_calendar_event(
            user_id=data.host_user_id,
            summary=f"{bt['title']} with {data.guest_name}",
            description=f"Guest: {data.guest_name}\nEmail: {data.guest_email}\nNotes: {data.notes or 'None'}",
            start_time=data.start_time,
            end_time=end_time,
            attendee_email=data.guest_email
        )
    
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
        "google_event_id": google_event_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(doc)
    
    # Send confirmation emails
    send_booking_confirmation_email(
        to_email=data.guest_email,
        guest_name=data.guest_name,
        host_name=host["name"],
        meeting_title=bt["title"],
        start_time=data.start_time,
        end_time=end_time,
        duration=bt["duration"],
        notes=data.notes or ""
    )
    
    send_host_notification_email(
        host_email=host["email"],
        host_name=host["name"],
        guest_name=data.guest_name,
        guest_email=data.guest_email,
        meeting_title=bt["title"],
        start_time=data.start_time,
        end_time=end_time,
        notes=data.notes or ""
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
        "name", "brand_color", "timezone", "picture", 
        "welcome_message", "language", "date_format", 
        "time_format", "country", "use_branding", "slug"
    ]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    if "slug" in update_data:
        # Check if slug is unique
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

# Mount uploads directory to serve images
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = f"uploads/{unique_filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the full URL
        # For production (Vercel/Cloud Run), you'd upload to S3/GCS. 
        # For this setup, we return a relative path or full domain path if needed.
        # Since frontend expects a URL, we can return relative path which works if on same domain,
        # or construct full URL if backend is separate.
        # Assuming backend is proxied or CORS allows, let's return absolute path or relative from root.
        
        # NOTE: In production (Vercel), local filesystem is ephemeral.
        # Images will disappear on redeploy.
        # For permanent storage, users should use AWS S3, Google Cloud Storage, or Cloudinary.
        # Since we are sticking to "simple", we warn about this or implement basic local serving 
        # which works for a persistent VPS but not serverless.
        # Request context can give us base URL.
        
        return {"url": f"/uploads/{unique_filename}"}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

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

@api_router.get("/")
async def root():
    return {"message": "DeeMeet API", "version": "1.1.0", "features": ["calendar_sync", "email_notifications"]}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
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
