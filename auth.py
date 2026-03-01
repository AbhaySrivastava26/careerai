"""
auth.py - JWT Authentication System
------------------------------------
Handles user registration, login, and token-based authentication.
Uses bcrypt for password hashing and PyJWT for tokens.
"""

from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["careerai"]
users_collection = db["users"]

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production-2024"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# ─── Password Hashing ─────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

# ─── JWT Token Functions ──────────────────────────────────────────────────────
def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": user_id,
        "email": email,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# ─── User Operations ──────────────────────────────────────────────────────────
def register_user(user_data: UserRegister) -> dict:
    """Register a new user."""
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise ValueError("User with this email already exists")
    
    # Create user document
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "created_at": datetime.utcnow(),
        "resumes": []  # Will store array of resume IDs
    }
    
    # Insert into database
    result = users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create access token
    token = create_access_token(user_id, user_data.email)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email
        }
    }

def login_user(credentials: UserLogin) -> dict:
    """Login user and return token."""
    # Find user
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        raise ValueError("Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise ValueError("Invalid email or password")
    
    # Create access token
    user_id = str(user["_id"])
    token = create_access_token(user_id, user["email"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"]
        }
    }

def get_user_from_token(token: str) -> Optional[dict]:
    """Get user data from JWT token."""
    payload = verify_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    try:
        from bson import ObjectId
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"]
            }
    except:
        pass
    
    return None

def add_resume_to_user(user_id: str, resume_id: str):
    """Add a resume ID to user's resume list."""
    from bson import ObjectId
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$push": {"resumes": resume_id},
            "$set": {"last_resume_upload": datetime.utcnow()}
        }
    )

def get_user_resumes(user_id: str) -> list:
    """Get all resumes for a user."""
    from bson import ObjectId
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return user.get("resumes", [])
    return []

# ─── Create Index ─────────────────────────────────────────────────────────────
def setup_auth_indexes():
    """Create indexes for authentication."""
    users_collection.create_index("email", unique=True)
    print(" Auth indexes created")

if __name__ == "__main__":
    # Test authentication
    setup_auth_indexes()
    
    print("\n" + "="*60)
    print("Authentication System Test")
    print("="*60)
    
    # Test registration
    try:
        test_user = UserRegister(
            name="Test User",
            email="test@example.com",
            password="testpass123"
        )
        result = register_user(test_user)
        print(f"User registered: {result['user']['email']}")
        print(f"  Token: {result['access_token'][:50]}...")
        
        # Test token verification
        user_data = get_user_from_token(result['access_token'])
        print(f"Token verified: {user_data['name']}")
        
        # Clean up test user
        users_collection.delete_one({"email": "test@example.com"})
        print(" Test user cleaned up")
        
    except Exception as e:
        print(f" Error: {e}")