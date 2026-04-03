"""
ats_matcher.py
--------------
ATS Resume vs Job Description analyzer.
Accepts multipart/form-data: resume file + job_description text.

Add to main.py:
    from ats_matcher import router as ats_router
    app.include_router(ats_router)

FREE AI: Uses Groq (llama3-8b-8192) — 100% free tier
    1. Sign up at https://console.groq.com
    2. Get your free API key
    3. Add to .env.local:  GROQ_API_KEY=your_key_here
    4. pip install groq
"""

import re
import os
import json
import shutil
import uuid
from collections import defaultdict
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

# ── CHANGED: Groq instead of Anthropic ───────────────────────────────────────
from groq import Groq

# Reuse your existing resume parser
from resume_parser import parse_resume

router = APIRouter()

# ── CHANGED: Groq client (reads GROQ_API_KEY from .env.local) ────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ─── Keyword Categories ───────────────────────────────────────────────────────
KEYWORD_CATEGORIES = {
    "programming_languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go",
        "rust", "kotlin", "swift", "php", "ruby", "scala", "r", "bash"
    ],
    "frameworks_libraries": [
        "react", "angular", "vue", "next.js", "node.js", "express", "django",
        "flask", "fastapi", "spring", "tensorflow", "pytorch", "keras",
        "scikit-learn", "pandas", "numpy", "tailwind", "bootstrap", "socket.io"
    ],
    "databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "cassandra", "dynamodb", "sqlite", "oracle", "firebase"
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "ci/cd", "github actions", "linux", "bash", "nginx", "ubuntu"
    ],
    "soft_skills": [
        "communication", "leadership", "teamwork", "problem solving", "agile",
        "scrum", "collaboration", "mentoring", "project management", "analytical"
    ],
    "ai_ml": [
        "machine learning", "deep learning", "nlp", "computer vision", "llm",
        "generative ai", "langchain", "openai", "transformers", "neural network",
        "data science", "hugging face"
    ],
    "tools": [
        "git", "jira", "confluence", "figma", "postman", "graphql", "rest api",
        "microservices", "kafka", "spark", "airflow", "tableau", "power bi", "github"
    ],
}

ALL_KEYWORDS = {}
for category, keywords in KEYWORD_CATEGORIES.items():
    for kw in keywords:
        ALL_KEYWORDS[kw] = category


# ─── Helpers ──────────────────────────────────────────────────────────────────
def extract_keywords_from_text(text: str) -> set:
    text_lower = text.lower()
    found = set()
    for keyword in ALL_KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found.add(keyword)
    return found


def keywords_from_skills(skills_list: list) -> set:
    """Convert parsed resume skills to lowercase keyword set."""
    normalized = set()
    for skill in skills_list:
        s = skill.lower().strip()
        normalized.add(s)
        for kw in ALL_KEYWORDS:
            if kw in s or s in kw:
                normalized.add(kw)
    return normalized


def extract_bullets(parsed: dict) -> list:
    """
    Pull clean bullet points from parsed resume experience & projects.
    Uses structured data from resume_parser — no messy raw text.
    """
    bullets = []

    for exp in parsed.get("experience", []):
        role = exp.get("role", "")
        company = exp.get("company", "")
        duration = exp.get("duration", "")
        if role and company:
            bullets.append(f"{role} at {company} ({duration})")

    for cert in parsed.get("certifications", [])[:4]:
        if len(cert) > 20:
            bullets.append(cert)

    for proj in parsed.get("projects", [])[:4]:
        if isinstance(proj, str) and len(proj) > 10:
            bullets.append(f"Built {proj}")

    return bullets[:8]


def calculate_score(matched: int, total_jd: int, resume_skills: list) -> int:
    if total_jd == 0:
        return 50
    keyword_score = (matched / total_jd) * 65
    depth_bonus = min(len(resume_skills) / 30 * 20, 20)
    format_bonus = 10
    return min(int(keyword_score + depth_bonus + format_bonus), 99)


def get_grade_verdict(score: int):
    if score >= 85: return "A", "🟢 Excellent ATS Match — Ready to Apply!"
    if score >= 70: return "B", "🟡 Good Match — Minor tweaks recommended"
    if score >= 55: return "C", "🟠 Average Match — Needs keyword optimization"
    if score >= 40: return "D", "🔴 Weak Match — Significant gaps found"
    return "F", "❌ Poor Match — Major rewrite needed"


def quick_wins(missing_by_cat: dict, score: int) -> list:
    wins = []
    flat_missing = [kw for kws in missing_by_cat.values() for kw in kws]
    if flat_missing:
        wins.append(f"Add these keywords to your Skills section: {', '.join(flat_missing[:4])}")
    if score < 70:
        wins.append("Add quantifiable metrics to at least 3 bullets (e.g. 'Improved performance by 40%')")
    if "soft_skills" in missing_by_cat and missing_by_cat["soft_skills"]:
        wins.append(f"Mention '{missing_by_cat['soft_skills'][0]}' in your summary or experience")
    else:
        wins.append("Tailor your professional summary to mirror the job description language")
    return wins[:3]


# ─── CHANGED: Groq Bullet Rewriter (free) ────────────────────────────────────
def rewrite_bullets(bullets: list, missing_keywords: list, target_role: str, jd_snippet: str) -> list:
    if not bullets:
        return []

    missing_top = missing_keywords[:10]

    # Build one bullet per line for the prompt
    bullets_text = ""
    for i, b in enumerate(bullets):
        bullets_text += f"{i+1}. {b}\n"

    missing_str = ", ".join(missing_top) if missing_top else "agile, communication, analytical"

    prompt = f"""You are an ATS resume expert. Your job is to REWRITE resume bullets to include missing keywords.

ROLE: {target_role or "Software Engineer"}
KEYWORDS TO ADD: {missing_str}

BULLETS TO REWRITE:
{bullets_text}

RULES:
- You MUST rewrite every single bullet — do not copy them as-is
- Each rewritten bullet MUST include at least one keyword from the list above
- Add numbers/metrics where possible (e.g. "improved by 30%", "reduced by 40%")
- Start each bullet with a strong action verb (Developed, Built, Engineered, Led, Optimized, etc.)
- Do NOT invent fake jobs or companies — only enhance existing content

Output ONLY valid JSON, no explanation, no markdown fences:
[
  {{"original": "bullet text here", "rewritten": "improved bullet here", "keywords_added": ["keyword1"]}},
  {{"original": "bullet text here", "rewritten": "improved bullet here", "keywords_added": ["keyword2"]}}
]"""

    try:
        # Use llama-3.3-70b — smarter free model on Groq, handles JSON much better
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a resume expert. Always respond with valid JSON only. No markdown, no explanation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=3000,
            temperature=0.4,
        )
        text = response.choices[0].message.content.strip()

        # Strip any accidental markdown fences
        text = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"```$", "", text, flags=re.MULTILINE)
        text = text.strip()

        parsed_result = json.loads(text)

        # Safety check: if model returned identical bullets, force-flag them
        final = []
        for item in parsed_result:
            orig = item.get("original", "")
            rew  = item.get("rewritten", "")
            if rew.strip() == orig.strip() or not rew.strip():
                # Fallback: manually prepend a keyword
                kw = missing_top[0] if missing_top else "effectively"
                rew = f"Leveraged {kw} skills — {orig}"
            final.append({
                "original": orig,
                "rewritten": rew,
                "keywords_added": item.get("keywords_added", [])
            })
        return final

    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parse failed: {e} | Raw: {text[:200]}")
        # Fallback: return bullets with keyword prepended
        return [
            {
                "original": b,
                "rewritten": f"Demonstrated {missing_top[0] if missing_top else 'strong'} expertise — {b}",
                "keywords_added": missing_top[:1]
            }
            for b in bullets
        ]
    except Exception as e:
        print(f"⚠️ Bullet rewrite failed: {e}")
        return [{"original": b, "rewritten": b, "keywords_added": []} for b in bullets]


# ─── Endpoint ─────────────────────────────────────────────────────────────────
@router.post("/ats-match")
async def ats_match(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    target_role: str = Form(""),
):
    """
    ATS analysis pipeline:
    1. Parse resume using existing resume_parser
    2. Extract JD keywords
    3. Compare against resume skills
    4. Score ATS compatibility
    5. AI rewrite bullets (via Groq - free)
    """
    # Validate file
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in {".pdf", ".docx"}:
        raise HTTPException(400, f"Only PDF/DOCX supported, got '{file_ext}'")

    if len(job_description.strip()) < 50:
        raise HTTPException(400, "Job description too short (min 50 characters)")

    # Save temp file
    temp_path = UPLOAD_DIR / f"ats_{uuid.uuid4().hex}{file_ext}"
    try:
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception as e:
        raise HTTPException(500, f"File save failed: {e}")

    # Parse resume using existing parser
    try:
        parsed = parse_resume(str(temp_path))
    except Exception as e:
        temp_path.unlink(missing_ok=True)
        raise HTTPException(500, f"Resume parsing failed: {e}")
    finally:
        temp_path.unlink(missing_ok=True)

    # Get skills from parsed resume
    resume_skills = parsed.get("skills", {}).get("all", [])

    # Build keyword sets
    resume_kw_set = keywords_from_skills(resume_skills)
    jd_kw_set     = extract_keywords_from_text(job_description)

    # Find matches and gaps
    matched = jd_kw_set & resume_kw_set
    missing = jd_kw_set - resume_kw_set

    # Categorize
    matched_by_cat = defaultdict(list)
    missing_by_cat = defaultdict(list)

    for kw in matched:
        matched_by_cat[ALL_KEYWORDS.get(kw, "other")].append(kw)
    for kw in missing:
        missing_by_cat[ALL_KEYWORDS.get(kw, "other")].append(kw)

    # Score
    score = calculate_score(len(matched), len(jd_kw_set), resume_skills)
    grade, verdict = get_grade_verdict(score)

    # Extract bullets from structured parsed data
    bullets = extract_bullets(parsed)
    missing_flat = [kw for kws in missing_by_cat.values() for kw in kws]

    # AI rewrite (Groq - free)
    rewritten = rewrite_bullets(bullets, missing_flat, target_role, job_description)

    return {
        "success": True,
        "candidate_name": parsed.get("name", ""),
        "ats_score": score,
        "grade": grade,
        "verdict": verdict,
        "matched_keywords": dict(matched_by_cat),
        "missing_keywords": dict(missing_by_cat),
        "total_jd_keywords": len(jd_kw_set),
        "total_matched": len(matched),
        "rewritten_bullets": rewritten,
        "quick_wins": quick_wins(dict(missing_by_cat), score),
    }