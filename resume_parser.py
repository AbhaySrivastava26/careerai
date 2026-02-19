"""
resume_parser.py  (v4 — final)
--------------------------------
Key fixes:
  - Experience: parses single-line format
      "Software Engineer Intern – Scadea Solutions  May 2025 – June 2025"
  - Projects: extracts title from bullet lines like
      "• Real-Time Video Calling Application: Live Demo § GitHub"
  - All previous fixes retained (summary cleanup, education, skills dedup, etc.)

Run:
    python resume_parser.py --file your_resume.pdf
"""

import re
import json
import argparse
import pdfplumber
import spacy
from docx import Document
from pathlib import Path

# ─── Load spaCy ──────────────────────────────────────────────────────────────
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise OSError("Run: python -m spacy download en_core_web_sm")


# ─── Skill Database ──────────────────────────────────────────────────────────
SKILLS_DB = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#",
        "ruby", "go", "rust", "kotlin", "swift", "r", "matlab", "scala",
        "php", "perl", "bash", "shell"
    ],
    "web_frontend": [
        "html", "css", "react", "vue", "angular", "next.js", "nuxt.js",
        "tailwind", "bootstrap", "sass", "less", "webpack", "vite",
        "redux", "jquery", "webrtc", "socket.io"
    ],
    "web_backend": [
        "node.js", "express", "fastapi", "django", "flask",
        "spring boot", "laravel", "graphql", "rest api", "restful"
    ],
    "databases": [
        "sql", "mysql", "postgresql", "mongodb", "sqlite", "redis",
        "cassandra", "firebase", "dynamodb", "oracle", "elasticsearch"
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
        "jenkins", "github actions", "ci/cd", "terraform", "linux",
        "nginx", "heroku", "vercel", "netlify"
    ],
    "ai_ml": [
        "machine learning", "deep learning", "nlp",
        "natural language processing", "computer vision",
        "tensorflow", "pytorch", "keras", "scikit-learn",
        "pandas", "numpy", "opencv", "hugging face", "transformers",
        "data science", "generative ai", "llm"
    ],
    "tools": [
        "git", "github", "gitlab", "postman", "figma",
        "jupyter", "vscode", "intellij", "jira"
    ],
    "soft_skills": [
        "communication", "leadership", "teamwork", "problem solving",
        "critical thinking", "time management", "agile", "scrum"
    ],
}

SKILL_ALIASES = {
    "react.js":   "react",
    "reactjs":    "react",
    "express.js": "express",
    "nodejs":     "node.js",
    "nextjs":     "next.js",
    "restful":    "rest api",
    "natural language processing": "nlp",
    "genai":      "generative ai",
    "gen ai":     "generative ai",
}

ALL_SKILLS = {}
for category, skills in SKILLS_DB.items():
    for skill in skills:
        ALL_SKILLS[skill.lower()] = category

DEGREE_PATTERNS = [
    (r"Bachelor of Technology|B\.Tech", "B.Tech"),
    (r"Bachelor of Engineering|B\.E\b",  "B.E"),
    (r"Bachelor of Science|B\.Sc\b",     "B.Sc"),
    (r"Bachelor of Computer Application|BCA|B\.C\.A", "BCA"),
    (r"Master of Technology|M\.Tech",    "M.Tech"),
    (r"Master of Engineering|M\.E\b",    "M.E"),
    (r"Master of Science|M\.Sc\b",       "M.Sc"),
    (r"Master of Computer Application|MCA|M\.C\.A", "MCA"),
    (r"MBA|Master of Business Administration", "MBA"),
    (r"Ph\.D|Doctor of Philosophy",      "PhD"),
    (r"Intermediate|HSC\b",              "Intermediate/12th"),
    (r"Matriculation|SSC\b|SSLC\b",      "10th/SSC"),
    (r"Diploma\b",                        "Diploma"),
]

SECTION_HEADERS = {
    "education":      ["education", "academic", "qualification"],
    "experience":     ["experience", "employment", "internship", "work history", "work experience"],
    "skills":         ["skills", "technical skills", "competencies", "technologies"],
    "projects":       ["projects", "project work", "personal projects", "academic projects"],
    "certifications": ["certification", "certifications", "achievements", "accomplishments", "awards"],
    "summary":        ["summary", "objective", "profile", "about me", "professional summary"],
}

STOP_SECTIONS = ["hobbies", "interests", "languages", "declaration", "references"]

FIX_CAPS = {
    "Node.Js": "Node.js", "React.Js": "React.js", "Next.Js": "Next.js",
    "Mongodb": "MongoDB", "Mysql": "MySQL", "Postgresql": "PostgreSQL",
    "Fastapi": "FastAPI", "Graphql": "GraphQL", "Github": "GitHub",
    "Gitlab": "GitLab", "Webrtc": "WebRTC", "Socket.Io": "Socket.io",
    "Tensorflow": "TensorFlow", "Pytorch": "PyTorch", "Opencv": "OpenCV",
    "Scikit-Learn": "scikit-learn", "Rest Api": "REST API", "Ci/Cd": "CI/CD",
    "Gcp": "GCP", "Aws": "AWS", "Nlp": "NLP", "Llm": "LLM",
    "Css": "CSS", "Html": "HTML", "Sql": "SQL", "Vscode": "VS Code",
    "Generative Ai": "Generative AI", "C++": "C++",
}


# ─── Text Extraction ─────────────────────────────────────────────────────────
def extract_text_from_pdf(filepath: str) -> str:
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text(x_tolerance=2, y_tolerance=2)
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_hyperlinks_from_pdf(filepath: str) -> dict:
    links = {"linkedin": None, "github": None}
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                if not page.annots:
                    continue
                for annot in page.annots:
                    uri = annot.get("uri", "") or ""
                    if not uri:
                        data = annot.get("data", {}) or {}
                        uri = data.get("URI", b"")
                        if isinstance(uri, bytes):
                            uri = uri.decode("utf-8", errors="ignore")
                    uri = str(uri).strip()
                    if "linkedin.com" in uri.lower() and not links["linkedin"]:
                        links["linkedin"] = uri
                    elif "github.com" in uri.lower() and not links["github"]:
                        links["github"] = uri
    except Exception:
        pass
    return links


def extract_text(filepath: str) -> str:
    path = Path(filepath)
    if path.suffix.lower() == ".pdf":
        return extract_text_from_pdf(filepath)
    elif path.suffix.lower() == ".docx":
        doc = Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs]).strip()
    else:
        raise ValueError(f"Unsupported: {path.suffix}")


# ─── Section Splitter ────────────────────────────────────────────────────────
def split_into_sections(text: str) -> dict:
    lines = text.split("\n")
    sections = {}
    current_section = "header"
    buffer = []

    for line in lines:
        stripped = line.strip()
        line_lower = stripped.lower()
        matched_section = None

        if 2 < len(stripped) < 50:
            for section, keywords in SECTION_HEADERS.items():
                if any(line_lower == kw or line_lower.startswith(kw) for kw in keywords):
                    matched_section = section
                    break

        if matched_section:
            sections[current_section] = "\n".join(buffer).strip()
            current_section = matched_section
            buffer = []
        else:
            buffer.append(line)

    sections[current_section] = "\n".join(buffer).strip()
    return sections


# ─── Contact Extractors ───────────────────────────────────────────────────────
def extract_email(text: str):
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str):
    match = re.search(
        r"(\+91[\s\-]?)?[6-9]\d{9}|(\+91[\s\-]?)?\(?\d{3,5}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}",
        text
    )
    return match.group(0).strip() if match else None


def extract_linkedin_from_text(text: str):
    match = re.search(r"linkedin\.com/in/[a-zA-Z0-9\-_]+", text, re.IGNORECASE)
    return "https://" + match.group(0) if match else None


def extract_github_from_text(text: str):
    match = re.search(r"github\.com/[a-zA-Z0-9\-_]+", text, re.IGNORECASE)
    return "https://" + match.group(0) if match else None


def extract_name(text: str):
    doc = nlp(text[:400])
    for ent in doc.ents:
        if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
            return ent.text.strip()
    for line in text.split("\n")[:6]:
        line = line.strip()
        if line and 3 < len(line) < 50 and re.match(r"^[A-Za-z\s\.]+$", line):
            return line
    return None


# ─── Summary Cleaner ─────────────────────────────────────────────────────────
def clean_summary(text: str) -> str:
    if not text:
        return text
    text = re.sub(r"\(cid:\d+\)", "", text)
    lines = text.split("\n")
    clean_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if re.search(r"@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", stripped):
            continue
        if re.search(r"LinkedIn|LeetCode|Portfolio|GitHub", stripped, re.IGNORECASE) and len(stripped) < 80:
            continue
        if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+$", stripped):
            continue
        alpha_ratio = sum(c.isalpha() or c.isspace() for c in stripped) / len(stripped)
        if alpha_ratio < 0.5 and len(stripped) < 60:
            continue
        clean_lines.append(stripped)
    return " ".join(clean_lines).strip()


# ─── Skills ──────────────────────────────────────────────────────────────────
def extract_skills(text: str) -> dict:
    text_lower = text.lower()
    found_canonical = {}

    for skill, category in ALL_SKILLS.items():
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            canonical = SKILL_ALIASES.get(skill, skill)
            if canonical not in found_canonical:
                found_canonical[canonical] = category

    for alias, canonical in SKILL_ALIASES.items():
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, text_lower):
            cat = ALL_SKILLS.get(canonical, found_canonical.get(canonical))
            if cat and canonical not in found_canonical:
                found_canonical[canonical] = cat

    categorized = {}
    for canonical, category in found_canonical.items():
        display = canonical.upper() if len(canonical) <= 3 else canonical.title()
        display = FIX_CAPS.get(display, display)
        if category not in categorized:
            categorized[category] = []
        if display not in categorized[category]:
            categorized[category].append(display)

    flat = [s for skills in categorized.values() for s in skills]
    return {"categorized": categorized, "all": flat}


# ─── Education ───────────────────────────────────────────────────────────────
def extract_education(text: str, sections: dict) -> list:
    edu_text = sections.get("education", text[:2000])
    entries = []
    seen = set()

    for pattern, label in DEGREE_PATTERNS:
        for match in re.finditer(pattern, edu_text, re.IGNORECASE):
            if label in seen:
                continue
            seen.add(label)

            start = max(0, match.start() - 50)
            end = min(len(edu_text), match.end() + 300)
            context = edu_text[start:end]

            doc = nlp(context)
            institution = None
            for ent in doc.ents:
                if ent.label_ == "ORG" and len(ent.text.strip()) > 4:
                    institution = ent.text.strip()
                    break

            year_match = re.search(
                r"((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|Present|Current)",
                context, re.IGNORECASE
            )
            year = year_match.group(0) if year_match else None

            grade_match = re.search(
                r"(?:CGPA|GPA|Percentage|Score)[:\s]*([0-9]+\.?[0-9]*\s*(?:/\s*[0-9.]+)?%?)",
                context, re.IGNORECASE
            )
            if not grade_match:
                grade_match = re.search(r"\b([0-9]{1,2}\.[0-9]+(?:/10)?|[0-9]{2,3}%)\b", context)
            grade = grade_match.group(1).strip() if grade_match else None

            entries.append({
                "degree":      label,
                "institution": institution,
                "year":        year,
                "grade":       grade,
            })

    return entries


# ─── Experience ───────────────────────────────────────────────────────────────
def extract_experience(text: str, sections: dict) -> list:
    """
    Handles single-line format:
    "Software Engineer Intern – Scadea Solutions  May 2025 – June 2025"
    
    Pattern: <Role Title> – <Company Name>  <Date Range>
    Also handles: <Role Title> at <Company>  <Date>
    """
    exp_text = sections.get("experience", "")
    if not exp_text:
        return []

    entries = []

    # Date range regex
    date_re = re.compile(
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}"
        r"\s*[-–—]\s*"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(?:\d{4}|Present|Current)"
        r"|(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|Present|Current)",
        re.IGNORECASE
    )

    for line in exp_text.split("\n"):
        # Strip leading bullet symbols
        stripped = re.sub(r"^[•◦∗\-\*·▪►▸]+\s*", "", line).strip()
        if not stripped:
            continue

        date_match = date_re.search(stripped)
        if not date_match:
            continue

        duration = date_match.group(0).strip()
        # Remove the date from the line to parse role + company
        before_date = stripped[:date_match.start()].strip()
        # Remove trailing spaces and dashes
        before_date = re.sub(r"[\s\-–—,]+$", "", before_date).strip()

        role = None
        company = None

        # Try: "Role – Company" or "Role — Company" or "Role - Company"
        split_match = re.split(r"\s*[-–—]\s*", before_date, maxsplit=1)
        if len(split_match) == 2:
            role    = split_match[0].strip()
            company = split_match[1].strip()
        # Try: "Role at Company"
        elif re.search(r"\bat\b", before_date, re.IGNORECASE):
            parts = re.split(r"\s+at\s+", before_date, maxsplit=1, flags=re.IGNORECASE)
            role    = parts[0].strip()
            company = parts[1].strip() if len(parts) > 1 else None
        else:
            # Can't split — put whole thing as role
            role = before_date or None

        # Clean up: remove any lingering bullet chars or PDF symbols
        if role:
            role = re.sub(r"[•◦∗§ï]+", "", role).strip()
        if company:
            company = re.sub(r"[•◦∗§ï]+", "", company).strip()

        entries.append({
            "company":  company if company else None,
            "role":     role if role else None,
            "duration": duration,
        })

    return entries


# ─── Projects ────────────────────────────────────────────────────────────────
def extract_projects(text: str, sections: dict) -> list:
    """
    Handles format:
    "• Real-Time Video Calling Application: Live Demo § GitHub"
    "• AI-Powered Career and Skill Recommendation System: § GitHub"

    Strategy:
    - Line starts with bullet
    - Extract everything before ": Live Demo", ": § GitHub", "Tech Stack" etc.
    - That's the project title
    """
    proj_text = sections.get("projects", "")
    if not proj_text:
        return []

    projects = []

    for line in proj_text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue

        # Only process bullet lines — these are project headers
        if not re.match(r"^[•◦∗▪►▸\-]", stripped):
            continue

        # Remove leading bullet
        content = re.sub(r"^[•◦∗▪►▸\-]+\s*", "", stripped).strip()

        # Skip pure tech stack lines
        if re.match(r"^(tech stack|technologies|tools)[:\s]", content.lower()):
            continue

        # Extract title — everything before ": Live Demo", ": § GitHub", "§", or end
        # Remove links/icons suffix like ": Live Demo § GitHub" or "§ GitHub"
        title = re.split(r":\s*(Live Demo|§|GitHub|Demo|Link)", content, flags=re.IGNORECASE)[0]
        title = re.sub(r"\s*[§ïÐ#]+.*$", "", title)   # strip icon chars and anything after
        title = re.sub(r"\s*:\s*$", "", title)          # strip trailing colon
        title = title.strip()

        if len(title) > 5:
            projects.append(title)

    return projects[:8]


# ─── Certifications ──────────────────────────────────────────────────────────
def extract_certifications(sections: dict) -> list:
    cert_text = sections.get("certifications", "")
    if not cert_text:
        return []

    certs = []
    for line in cert_text.split("\n"):
        stripped = line.strip()
        lower = stripped.lower()

        if any(stop in lower for stop in STOP_SECTIONS):
            break

        cleaned = re.sub(r"^[◦•∗\-\*·▪►▸]+\s*", "", stripped).strip()
        if len(cleaned) > 8:
            certs.append(cleaned)

    return certs[:10]


def extract_summary(sections: dict) -> str:
    raw = sections.get("summary") or sections.get("header") or ""
    return clean_summary(raw)


# ─── Main Parser ─────────────────────────────────────────────────────────────
def parse_resume(filepath: str) -> dict:
    print(f"\n📄 Reading: {filepath}")
    raw_text = extract_text(filepath)

    print("🔗 Extracting hyperlinks...")
    links = extract_hyperlinks_from_pdf(filepath) if filepath.lower().endswith(".pdf") else {}

    print("✂️  Splitting sections...")
    sections = split_into_sections(raw_text)

    print("🧠 Running NLP extraction...")
    result = {
        "name":           extract_name(raw_text),
        "email":          extract_email(raw_text),
        "phone":          extract_phone(raw_text),
        "linkedin":       links.get("linkedin") or extract_linkedin_from_text(raw_text),
        "github":         links.get("github") or extract_github_from_text(raw_text),
        "summary":        extract_summary(sections),
        "skills":         extract_skills(raw_text),
        "education":      extract_education(raw_text, sections),
        "experience":     extract_experience(raw_text, sections),
        "projects":       extract_projects(raw_text, sections),
        "certifications": extract_certifications(sections),
    }

    return result


# ─── Entry Point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Resume Parser v4")
    parser.add_argument("--file", required=True, help="Path to resume (.pdf or .docx)")
    parser.add_argument("--output", default="parsed_resume.json")
    args = parser.parse_args()

    result = parse_resume(args.file)

    print("\n" + "=" * 55)
    print("✅  EXTRACTED RESUME DATA")
    print("=" * 55)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    output_path = Path(args.file).parent / args.output
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Saved to: {output_path}")  