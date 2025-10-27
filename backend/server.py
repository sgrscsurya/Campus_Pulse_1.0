from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import qrcode
import io
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # admin, organizer, student
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str  # Technical, Cultural, Sports, Workshop
    date: str
    time: str
    location: str
    capacity: int
    organizer_id: str
    organizer_emails: List[str] = []
    image_url: Optional[str] = None
    status: str = "upcoming"  # upcoming, ongoing, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventCreate(BaseModel):
    title: str
    description: str
    category: str
    date: str
    time: str
    location: str
    capacity: int
    organizer_emails: List[str] = []
    image_url: Optional[str] = None

class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    user_name: str
    user_email: str
    registered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ticket_qr_code: str
    status: str = "registered"  # registered, attended, cancelled
    attendance: bool = False

class RegistrationCreate(BaseModel):
    event_id: str

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FeedbackCreate(BaseModel):
    event_id: str
    rating: int
    comment: str

class OrganizerAdd(BaseModel):
    email: EmailStr

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    image_url: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

# Auth endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    user_doc = user.model_dump()
    user_doc["password"] = hashed_pw
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"user_id": user.id})
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_obj = User(**user)
    token = create_access_token({"user_id": user_obj.id})
    return Token(access_token=token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Event endpoints
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "organizer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    event = Event(**event_data.model_dump(), organizer_id=current_user.id)
    await db.events.insert_one(event.model_dump())
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    events = await db.events.find(query, {"_id": 0}).to_list(1000)
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventUpdate, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != "admin" and event["organizer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in event_data.model_dump().items() if v is not None}
    await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated_event = await db.events.find_one({"id": event_id}, {"_id": 0})
    return Event(**updated_event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != "admin" and event["organizer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.events.delete_one({"id": event_id})
    return {"message": "Event deleted successfully"}

# Registration endpoints
@api_router.post("/registrations/register", response_model=Registration)
async def register_for_event(reg_data: RegistrationCreate, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": reg_data.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    existing = await db.registrations.find_one({"event_id": reg_data.event_id, "user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    reg_count = await db.registrations.count_documents({"event_id": reg_data.event_id})
    if reg_count >= event["capacity"]:
        raise HTTPException(status_code=400, detail="Event is full")
    
    qr_data = f"event:{reg_data.event_id}|user:{current_user.id}|name:{current_user.name}"
    qr_code = generate_qr_code(qr_data)
    
    registration = Registration(
        event_id=reg_data.event_id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        ticket_qr_code=qr_code
    )
    
    await db.registrations.insert_one(registration.model_dump())
    return registration

@api_router.get("/registrations/my", response_model=List[Registration])
async def get_my_registrations(current_user: User = Depends(get_current_user)):
    registrations = await db.registrations.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    return registrations

@api_router.get("/registrations/event/{event_id}", response_model=List[Registration])
async def get_event_registrations(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != "admin" and event["organizer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    return registrations

@api_router.delete("/registrations/{registration_id}")
async def cancel_registration(registration_id: str, current_user: User = Depends(get_current_user)):
    registration = await db.registrations.find_one({"id": registration_id})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if registration["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.registrations.delete_one({"id": registration_id})
    return {"message": "Registration cancelled successfully"}

# Feedback endpoints
@api_router.post("/feedback", response_model=Feedback)
async def submit_feedback(feedback_data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": feedback_data.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    existing = await db.feedback.find_one({"event_id": feedback_data.event_id, "user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted")
    
    feedback = Feedback(
        event_id=feedback_data.event_id,
        user_id=current_user.id,
        user_name=current_user.name,
        rating=feedback_data.rating,
        comment=feedback_data.comment
    )
    
    await db.feedback.insert_one(feedback.model_dump())
    return feedback

@api_router.get("/feedback/event/{event_id}", response_model=List[Feedback])
async def get_event_feedback(event_id: str):
    feedback_list = await db.feedback.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    return feedback_list

# Analytics endpoints
@api_router.get("/analytics/event/{event_id}")
async def get_event_analytics(event_id: str, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != "admin" and event["organizer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    registrations = await db.registrations.count_documents({"event_id": event_id})
    attended = await db.registrations.count_documents({"event_id": event_id, "attendance": True})
    feedback_list = await db.feedback.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    
    avg_rating = sum(f["rating"] for f in feedback_list) / len(feedback_list) if feedback_list else 0
    
    return {
        "event_id": event_id,
        "total_capacity": event["capacity"],
        "total_registrations": registrations,
        "attendance": attended,
        "feedback_count": len(feedback_list),
        "average_rating": round(avg_rating, 2)
    }

@api_router.get("/analytics/overview")
async def get_overview_analytics(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        events = await db.events.count_documents({})
        users = await db.users.count_documents({})
        registrations = await db.registrations.count_documents({})
    elif current_user.role == "organizer":
        events = await db.events.count_documents({"organizer_id": current_user.id})
        registrations = await db.registrations.count_documents({"event_id": {"$in": [e["id"] for e in await db.events.find({"organizer_id": current_user.id}, {"_id": 0, "id": 1}).to_list(1000)]}})
        users = 0
    else:
        events = await db.events.count_documents({})
        registrations = await db.registrations.count_documents({"user_id": current_user.id})
        users = 0
    
    return {
        "total_events": events,
        "total_users": users,
        "total_registrations": registrations
    }

# Organizer endpoints
@api_router.post("/organizers/add")
async def add_organizer(org_data: OrganizerAdd, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can add organizers")
    
    user = await db.users.find_one({"email": org_data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one({"email": org_data.email}, {"$set": {"role": "organizer"}})
    return {"message": f"User {org_data.email} is now an organizer"}

@api_router.get("/events/my/organized", response_model=List[Event])
async def get_my_organized_events(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "organizer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    events = await db.events.find({"organizer_id": current_user.id}, {"_id": 0}).to_list(1000)
    return events

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()