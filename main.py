"""
main.py  — CareerAI FastAPI Backend (v5 — Final)
--------------------------------------------------
Full pipeline on /upload:
  1. Parse resume (NLP)
  2. Match careers (ML cosine similarity)
  3. Skill gap analysis
  4. Fetch real jobs (JSearch API)
  5. Generate AI learning roadmap text
  6. Generate roadmap PNG image
  7. Save everything to MongoDB

Endpoints:
  POST /upload                  → Full pipeline
  GET  /resume/{id}             → Fetch resume
  GET  /roadmap-image/{id}      → Download roadmap PNG
  GET  /skill-gap               → Skill gap for specific role
  POST /roadmap                 → Regenerate roadmap for different role
  GET  /jobs                    → Fresh job search
  GET  /resumes                 → List all resumes
  GET  /health                  → Health check

Run:
    uvicorn main:app --reload --port 8080
"""

import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
from typing import Optional

from resume_parser     import parse_resume
from career_matcher    import match_careers, get_skill_gap
from jobs_fetcher      import fetch_jobs, fetch_jobs_for_matches
from roadmap_generator import generate_roadmap_from_parsed
from roadmap_image     import generate_roadmap_image
from custom_roadmap    import generate_custom_roadmap, get_available_roles
from auth import (
    register_user, login_user, get_user_from_token,
    add_resume_to_user, get_user_resumes, setup_auth_indexes,
    UserRegister, UserLogin
)
# Load environment variables
import os
from dotenv import load_dotenv

# Load environment variables (works locally + on Render)
load_dotenv()

# ─── App ─────────────────────────────────────────────────────────
app = FastAPI(
    title="CareerAI API",
    description="AI-Powered Resume Parser & Career Recommendation Backend",
    version="5.0.0",
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MongoDB ─────────────────────────────────────────────────────

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DATABASE_NAME", "careerai")

if not MONGO_URI:
    raise Exception("MONGODB_URI not set in environment variables")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    db = client[DB_NAME]
    resumes_collection = db["resumes"]
    print("✅ MongoDB connected")

    # Setup auth indexes
    setup_auth_indexes()
except ConnectionFailure:
    print("❌ MongoDB connection failed")
    raise

UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def serialize_doc(doc: dict) -> dict:
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# Auth dependency
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user from token."""
    token = credentials.credentials
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(401, "Invalid or expired token")
    return user

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Optional auth - returns user if token present, None otherwise."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    return get_user_from_token(token)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status":    "ok",
        "message":   "CareerAI API is running",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ═══ Authentication Endpoints ═══════════════════════════════════════════════

@app.post("/auth/register")
def register(user_data: UserRegister):
    """Register a new user."""
    try:
        result = register_user(user_data)
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Registration failed: {e}")


@app.post("/auth/login")
def login(credentials: UserLogin):
    """Login user and return JWT token."""
    try:
        result = login_user(credentials)
        return result
    except ValueError as e:
        raise HTTPException(401, str(e))
    except Exception as e:
        raise HTTPException(500, f"Login failed: {e}")


@app.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info from token."""
    return current_user


@app.get("/auth/my-resumes")
def get_my_resumes(current_user: dict = Depends(get_current_user)):
    """Get all resumes for current user."""
    resume_ids = get_user_resumes(current_user["id"])
    resumes = []
    
    for resume_id in resume_ids:
        try:
            doc = resumes_collection.find_one({"_id": ObjectId(resume_id)})
            if doc:
                resumes.append({
                    "id": str(doc["_id"]),
                    "name": doc.get("name", "Unknown"),
                    "email": doc.get("email", ""),
                    "uploaded_at": doc.get("uploaded_at"),
                    "top_match": doc.get("career_matches", [{}])[0].get("title", "—")
                })
        except:
            continue
    
    return {"resumes": resumes}


# ═══ Main Endpoints ═════════════════════════════════════════════════════════

@app.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Full AI pipeline:
    Parse → Match → Skill Gap → Jobs → Roadmap Text → Roadmap Image → Save
    If user is authenticated, links resume to their account.
    """
    # Validate
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in {".pdf", ".docx"}:
        raise HTTPException(400, f"Only PDF/DOCX supported, got '{file_ext}'")

    # Save temp file
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{file_ext}"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception as e:
        raise HTTPException(500, f"File save failed: {e}")

    # 1. Parse resume
    try:
        parsed_data = parse_resume(str(temp_path))
    except Exception as e:
        temp_path.unlink(missing_ok=True)
        raise HTTPException(500, f"Parsing failed: {e}")
    finally:
        temp_path.unlink(missing_ok=True)

    # 2. Career matching
    all_skills     = parsed_data.get("skills", {}).get("all", [])
    career_matches = match_careers(all_skills)  # Returns top 10 by default
    parsed_data["career_matches"] = career_matches[:4]  # Take top 4 for display

    # 3. Skill gap
    skill_gap = {}
    if career_matches:
        skill_gap = get_skill_gap(all_skills, career_matches[0]["title"])
    parsed_data["skill_gap"] = skill_gap

    # 4. Fetch real jobs
    jobs = []
    if career_matches:
        jobs = fetch_jobs_for_matches(career_matches, location="India", jobs_per_role=3)
    parsed_data["jobs"] = jobs

    # 5. Generate roadmap text
    print("🧠 Generating roadmap text...")
    roadmap = generate_roadmap_from_parsed(parsed_data)
    parsed_data["roadmap"] = roadmap

    # 6. Generate roadmap image
    print("🖼️  Generating roadmap image...")
    image_filename = f"roadmap_{uuid.uuid4().hex}.png"
    try:
        image_path = generate_roadmap_image(roadmap, output_filename=image_filename)
        parsed_data["roadmap_image_file"] = image_filename
    except Exception as e:
        print(f"⚠️  Image generation failed: {e}")
        parsed_data["roadmap_image_file"] = None

    # 7. Save to MongoDB
    parsed_data["original_filename"] = file.filename
    parsed_data["uploaded_at"]       = datetime.utcnow().isoformat()
    
    # Link to user if authenticated
    if current_user:
        parsed_data["user_id"] = current_user["id"]

    try:
        result    = resumes_collection.insert_one(parsed_data)
        resume_id = str(result.inserted_id)
        
        # Link resume to user's account
        if current_user:
            add_resume_to_user(current_user["id"], resume_id)
            
    except Exception as e:
        raise HTTPException(500, f"DB save failed: {e}")

    # Add image URL to response
    parsed_data["roadmap_image_url"] = (
        f"http://localhost:8080/roadmap-image/{resume_id}"
        if parsed_data.get("roadmap_image_file") else None
    )

    return {
        "success":   True,
        "resume_id": resume_id,
        "message":   "Resume parsed, matched, roadmap generated with image!",
        "data":      serialize_doc(parsed_data),
    }


@app.get("/roadmap-image/{resume_id}")
def get_roadmap_image(resume_id: str):
    """
    Download the roadmap PNG image for a resume.
    Frontend can display this directly as <img src="...">
    """
    try:
        doc = resumes_collection.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        raise HTTPException(400, "Invalid resume ID")

    if not doc:
        raise HTTPException(404, "Resume not found")

    image_file = doc.get("roadmap_image_file")
    if not image_file:
        raise HTTPException(404, "No roadmap image for this resume")

    image_path = Path("roadmap_images") / image_file
    if not image_path.exists():
        raise HTTPException(404, "Image file not found on disk")

    return FileResponse(
        path=str(image_path),
        media_type="image/png",
        filename=f"roadmap_{doc.get('name', 'candidate').replace(' ', '_')}.png",
    )


@app.get("/resume/{resume_id}")
def get_resume(resume_id: str):
    """Fetch saved resume by MongoDB ID."""
    try:
        doc = resumes_collection.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        raise HTTPException(400, "Invalid ID format")
    if not doc:
        raise HTTPException(404, "Resume not found")
    return {"success": True, "data": serialize_doc(doc)}


@app.get("/skill-gap")
def skill_gap_endpoint(
    resume_id: str = Query(..., description="MongoDB resume ID"),
    role:      str = Query(..., description="Target role"),
):
    """Get skill gap when user picks a different role."""
    try:
        doc = resumes_collection.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        raise HTTPException(400, "Invalid resume ID")
    if not doc:
        raise HTTPException(404, "Resume not found")

    skills = doc.get("skills", {}).get("all", [])
    gap    = get_skill_gap(skills, role)
    if "error" in gap:
        raise HTTPException(404, gap["error"])
    return {"success": True, "data": gap}


@app.post("/roadmap")
def regenerate_roadmap(
    resume_id:   str = Query(..., description="MongoDB resume ID"),
    target_role: str = Query(None, description="Override target role"),
):
    """Regenerate roadmap + image for a different career role."""
    try:
        doc = resumes_collection.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        raise HTTPException(400, "Invalid resume ID")
    if not doc:
        raise HTTPException(404, "Resume not found")

    if target_role:
        skills    = doc.get("skills", {}).get("all", [])
        skill_gap = get_skill_gap(skills, target_role)
        if "error" in skill_gap:
            raise HTTPException(404, skill_gap["error"])
        doc["skill_gap"]      = skill_gap
        doc["career_matches"] = [{"title": target_role}] + doc.get("career_matches", [])

    # Regenerate text roadmap
    roadmap = generate_roadmap_from_parsed(doc)

    # Regenerate image
    image_filename = f"roadmap_{uuid.uuid4().hex}.png"
    try:
        generate_roadmap_image(roadmap, output_filename=image_filename)
    except Exception as e:
        print(f"⚠️ Image failed: {e}")
        image_filename = None

    # Update MongoDB
    resumes_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": {
            "roadmap":            roadmap,
            "roadmap_image_file": image_filename,
        }}
    )

    return {
        "success": True,
        "data":    roadmap,
        "roadmap_image_url": (
            f"http://localhost:8080/roadmap-image/{resume_id}"
            if image_filename else None
        ),
    }


@app.get("/jobs")
def get_jobs(
    role:     str = Query(..., description="Job role"),
    location: str = Query("India", description="Location"),
    limit:    int = Query(6, description="Max results"),
):
    """Fetch fresh real-time jobs."""
    jobs = fetch_jobs(role, location=location, max_results=limit)
    return {"success": True, "role": role, "count": len(jobs), "jobs": jobs}


@app.get("/resumes")
def list_resumes():
    """List all resumes — for testing."""
    docs = resumes_collection.find(
        {},
        {"name": 1, "email": 1, "uploaded_at": 1, "original_filename": 1}
    ).sort("uploaded_at", -1).limit(20)
    return {"success": True, "resumes": [serialize_doc(d) for d in docs]}


@app.post("/generate-roadmap")
def generate_custom_roadmap_endpoint(
    role:      str = Query(..., description="Any role e.g. 'data engineer', 'full stack', 'devops'"),
    name:      str = Query("You", description="Your name (optional)"),
    readiness: int = Query(50, description="How ready you are 0-100"),
):
    """
    Generate roadmap text + image for ANY user-typed role.
    No resume needed — just type a role name!

    Examples:
      ?role=data engineer
      ?role=full stack developer
      ?role=devops
      ?role=product manager
      ?role=cybersecurity
    """
    result = generate_custom_roadmap(
        role_input = role,
        name       = name,
        readiness  = readiness,
        save_image = True,
    )

    image_url = None
    if result.get("image_filename"):
        image_url = f"http://localhost:8080/custom-roadmap-image/{result['image_filename']}"

    return {
        "success":         True,
        "role":            result["role"],
        "roadmap":         result["roadmap"],
        "roadmap_image_url": image_url,
        "supported_roles": result["supported_roles"],
    }


@app.get("/custom-roadmap-image/{filename}")
def get_custom_roadmap_image(filename: str):
    """
    Serve a custom roadmap PNG image by filename.
    Used by the frontend to display <img src="...">
    """
    image_path = Path("roadmap_images") / filename
    if not image_path.exists():
        raise HTTPException(404, "Image not found")
    return FileResponse(
        path=str(image_path),
        media_type="image/png",
        filename=filename,
    )


@app.get("/roles")
def list_supported_roles():
    """List all supported role names for the custom roadmap generator."""
    return {
        "success": True,
        "roles":   get_available_roles(),
        "count":   len(get_available_roles()),
    }