"""
career_matcher.py (v3 — Expanded Roles + Smart Matching)
---------------------------------------------------------
Matches candidate skills to 25+ career roles with improved
AI/ML detection, QA/Testing roles, and smarter scoring.

Key improvements:
- 25+ roles covering all major tech domains
- Separate AI/ML Engineer, ML Engineer, Data Scientist
- QA Engineer, Test Automation Engineer, SDET roles
- Better keyword matching (tensorflow → AI/ML Engineer)
- Weighted scoring: required skills >> preferred skills
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ─── Expanded Career Roles Database ──────────────────────────────────────────
CAREER_ROLES = [
    # ═══ AI & ML Roles ═══
    {
        "title": "AI / ML Engineer",
        "required":  ["python", "machine learning", "tensorflow", "keras", "deep learning", "ai"],
        "preferred": ["pytorch", "scikit-learn", "computer vision", "nlp", "aws", "docker"],
        "description": "Build and deploy AI/ML models using TensorFlow, Keras, and deep learning frameworks.",
        "salary_range": "₹12–40 LPA",
        "demand": "Extremely High",
        "icon": "🤖",
        "keywords": ["ai", "ml", "tensorflow", "keras", "deep learning", "neural network", "cnn", "rnn"],
    },
    {
        "title": "GenAI Engineer",
        "required":  ["python", "generative ai", "llm", "langchain", "openai"],
        "preferred": ["hugging face", "transformers", "gpt", "claude", "fastapi", "vector db"],
        "description": "Build applications with LLMs, RAG systems, and generative AI technologies.",
        "salary_range": "₹18–50 LPA",
        "demand": "Extremely High",
        "icon": "🧠",
        "keywords": ["genai", "llm", "gpt", "langchain", "openai", "rag", "prompt engineering"],
    },
    {
        "title": "NLP Engineer",
        "required":  ["python", "nlp", "transformers", "hugging face", "spacy"],
        "preferred": ["bert", "gpt", "pytorch", "nltk", "fastapi", "langchain"],
        "description": "Specialize in natural language processing, text analysis, and language models.",
        "salary_range": "₹15–42 LPA",
        "demand": "Very High",
        "icon": "💬",
        "keywords": ["nlp", "spacy", "nltk", "text", "language", "bert", "transformers"],
    },
    {
        "title": "Computer Vision Engineer",
        "required":  ["python", "computer vision", "opencv", "deep learning", "cnn"],
        "preferred": ["tensorflow", "pytorch", "yolo", "image processing", "cuda"],
        "description": "Develop image and video analysis systems using deep learning and CV techniques.",
        "salary_range": "₹14–38 LPA",
        "demand": "Very High",
        "icon": "👁️",
        "keywords": ["cv", "computer vision", "opencv", "image", "yolo", "cnn", "detection"],
    },
    {
        "title": "Data Scientist",
        "required":  ["python", "data analysis", "statistics", "pandas", "numpy", "sql"],
        "preferred": ["machine learning", "scikit-learn", "tableau", "r", "spark", "matplotlib"],
        "description": "Analyze data, build statistical models, and extract business insights.",
        "salary_range": "₹10–30 LPA",
        "demand": "Very High",
        "icon": "📊",
        "keywords": ["data science", "statistics", "analysis", "pandas", "visualization"],
    },
    {
        "title": "Data Analyst",
        "required":  ["sql", "excel", "data analysis", "python"],
        "preferred": ["tableau", "power bi", "pandas", "statistics", "data visualization"],
        "description": "Analyze datasets, create reports, and visualize data for business decisions.",
        "salary_range": "₹5–16 LPA",
        "demand": "High",
        "icon": "📈",
        "keywords": ["data analyst", "sql", "excel", "tableau", "power bi", "reporting"],
    },
    {
        "title": "Data Engineer",
        "required":  ["python", "sql", "spark", "etl", "data pipeline"],
        "preferred": ["airflow", "kafka", "aws", "snowflake", "dbt", "hadoop"],
        "description": "Build and maintain scalable data pipelines and ETL processes.",
        "salary_range": "₹12–35 LPA",
        "demand": "Very High",
        "icon": "🔄",
        "keywords": ["data engineer", "etl", "pipeline", "spark", "airflow", "kafka"],
    },

    # ═══ Testing & QA Roles ═══
    {
        "title": "QA Engineer",
        "required":  ["testing", "manual testing", "test cases", "bug tracking", "qa"],
        "preferred": ["selenium", "api testing", "jira", "postman", "agile", "automation"],
        "description": "Ensure software quality through manual and automated testing processes.",
        "salary_range": "₹4–14 LPA",
        "demand": "High",
        "icon": "✅",
        "keywords": ["qa", "testing", "test", "quality", "manual", "bug"],
    },
    {
        "title": "Test Automation Engineer",
        "required":  ["selenium", "automation testing", "java", "python", "test automation"],
        "preferred": ["cypress", "playwright", "jenkins", "rest api testing", "ci/cd"],
        "description": "Automate testing processes using Selenium, Cypress, and test frameworks.",
        "salary_range": "₹7–20 LPA",
        "demand": "Very High",
        "icon": "🔬",
        "keywords": ["automation", "selenium", "cypress", "automated testing", "test framework"],
    },
    {
        "title": "SDET (Software Development Engineer in Test)",
        "required":  ["java", "python", "test automation", "selenium", "rest api testing"],
        "preferred": ["ci/cd", "docker", "jenkins", "kubernetes", "testng", "junit"],
        "description": "Combine development and testing skills to build automated test frameworks.",
        "salary_range": "₹10–28 LPA",
        "demand": "Very High",
        "icon": "🧪",
        "keywords": ["sdet", "test framework", "automation", "ci/cd", "api testing"],
    },

    # ═══ Development Roles ═══
    {
        "title": "Full Stack Developer",
        "required":  ["javascript", "react", "node.js", "html", "css", "mongodb", "sql"],
        "preferred": ["typescript", "next.js", "express", "docker", "aws", "redux"],
        "description": "Build complete web applications with frontend and backend technologies.",
        "salary_range": "₹8–26 LPA",
        "demand": "Very High",
        "icon": "🌐",
        "keywords": ["full stack", "mern", "mean", "javascript", "react", "node"],
    },
    {
        "title": "Frontend Developer",
        "required":  ["javascript", "react", "html", "css", "redux"],
        "preferred": ["typescript", "next.js", "tailwind", "vue", "angular", "webpack"],
        "description": "Create responsive and interactive user interfaces for web applications.",
        "salary_range": "₹6–20 LPA",
        "demand": "High",
        "icon": "🎨",
        "keywords": ["frontend", "react", "vue", "angular", "javascript", "ui"],
    },
    {
        "title": "Backend Developer",
        "required":  ["python", "node.js", "rest api", "sql", "mongodb"],
        "preferred": ["fastapi", "django", "flask", "express", "postgresql", "docker", "redis"],
        "description": "Design and build scalable server-side applications and APIs.",
        "salary_range": "₹7–24 LPA",
        "demand": "High",
        "icon": "⚙️",
        "keywords": ["backend", "api", "server", "database", "fastapi", "django"],
    },
    {
        "title": "Mobile Developer (Android)",
        "required":  ["android", "kotlin", "java", "android studio"],
        "preferred": ["jetpack compose", "firebase", "retrofit", "room", "mvvm"],
        "description": "Build native Android applications using Kotlin and modern Android frameworks.",
        "salary_range": "₹6–22 LPA",
        "demand": "High",
        "icon": "📱",
        "keywords": ["android", "kotlin", "mobile", "app development"],
    },
    {
        "title": "Mobile Developer (iOS)",
        "required":  ["ios", "swift", "xcode", "objective-c"],
        "preferred": ["swiftui", "firebase", "cocoapods", "mvvm", "combine"],
        "description": "Develop native iOS applications using Swift and iOS frameworks.",
        "salary_range": "₹7–25 LPA",
        "demand": "High",
        "icon": "🍎",
        "keywords": ["ios", "swift", "iphone", "mobile", "apple"],
    },
    {
        "title": "React Native Developer",
        "required":  ["react native", "javascript", "mobile development"],
        "preferred": ["typescript", "redux", "firebase", "expo", "ios", "android"],
        "description": "Build cross-platform mobile apps using React Native framework.",
        "salary_range": "₹7–22 LPA",
        "demand": "High",
        "icon": "📲",
        "keywords": ["react native", "cross-platform", "mobile", "javascript"],
    },

    # ═══ DevOps & Cloud Roles ═══
    {
        "title": "DevOps Engineer",
        "required":  ["linux", "docker", "aws", "ci/cd", "bash"],
        "preferred": ["kubernetes", "terraform", "ansible", "jenkins", "python", "github actions"],
        "description": "Automate infrastructure, implement CI/CD, and manage cloud deployments.",
        "salary_range": "₹10–32 LPA",
        "demand": "Extremely High",
        "icon": "🔧",
        "keywords": ["devops", "ci/cd", "docker", "kubernetes", "automation"],
    },
    {
        "title": "Cloud Engineer",
        "required":  ["aws", "linux", "docker", "cloud computing"],
        "preferred": ["azure", "gcp", "kubernetes", "terraform", "networking", "security"],
        "description": "Design and manage scalable cloud infrastructure on AWS, Azure, or GCP.",
        "salary_range": "₹12–35 LPA",
        "demand": "Very High",
        "icon": "☁️",
        "keywords": ["cloud", "aws", "azure", "gcp", "infrastructure"],
    },
    {
        "title": "Site Reliability Engineer (SRE)",
        "required":  ["linux", "python", "monitoring", "kubernetes", "automation"],
        "preferred": ["prometheus", "grafana", "terraform", "incident management", "on-call"],
        "description": "Ensure system reliability, performance, and uptime through automation.",
        "salary_range": "₹14–38 LPA",
        "demand": "Very High",
        "icon": "🛡️",
        "keywords": ["sre", "reliability", "monitoring", "incident", "on-call"],
    },

    # ═══ Specialized Roles ═══
    {
        "title": "Cybersecurity Engineer",
        "required":  ["security", "networking", "linux", "penetration testing"],
        "preferred": ["ethical hacking", "firewall", "siem", "compliance", "vulnerability"],
        "description": "Protect systems and networks from cyber threats and vulnerabilities.",
        "salary_range": "₹10–30 LPA",
        "demand": "Very High",
        "icon": "🔐",
        "keywords": ["security", "cyber", "penetration", "hacking", "vulnerability"],
    },
    {
        "title": "Blockchain Developer",
        "required":  ["blockchain", "solidity", "smart contracts", "web3"],
        "preferred": ["ethereum", "hyperledger", "truffle", "rust", "cryptography"],
        "description": "Build decentralized applications and smart contracts on blockchain platforms.",
        "salary_range": "₹12–40 LPA",
        "demand": "High",
        "icon": "⛓️",
        "keywords": ["blockchain", "web3", "solidity", "crypto", "smart contract"],
    },
    {
        "title": "Game Developer",
        "required":  ["unity", "c#", "game development", "3d"],
        "preferred": ["unreal engine", "c++", "physics", "animation", "vr"],
        "description": "Create interactive games using Unity, Unreal Engine, and game frameworks.",
        "salary_range": "₹6–25 LPA",
        "demand": "Medium",
        "icon": "🎮",
        "keywords": ["game", "unity", "unreal", "gaming", "3d"],
    },
    {
        "title": "UI/UX Designer",
        "required":  ["ui design", "ux design", "figma", "wireframing"],
        "preferred": ["adobe xd", "sketch", "prototyping", "user research", "design systems"],
        "description": "Design user interfaces and experiences that are intuitive and beautiful.",
        "salary_range": "₹5–20 LPA",
        "demand": "High",
        "icon": "🎨",
        "keywords": ["ui", "ux", "design", "figma", "wireframe", "prototype"],
    },
    {
        "title": "Product Manager",
        "required":  ["product management", "agile", "roadmap", "stakeholder"],
        "preferred": ["sql", "analytics", "a/b testing", "jira", "user stories"],
        "description": "Define product vision, prioritize features, and lead cross-functional teams.",
        "salary_range": "₹12–45 LPA",
        "demand": "Very High",
        "icon": "📋",
        "keywords": ["product", "pm", "roadmap", "agile", "stakeholder"],
    },
    {
        "title": "Software Engineer",
        "required":  ["python", "java", "data structures", "algorithms"],
        "preferred": ["c++", "system design", "git", "sql", "problem solving"],
        "description": "General software development role requiring strong programming fundamentals.",
        "salary_range": "₹8–28 LPA",
        "demand": "Very High",
        "icon": "💻",
        "keywords": ["software", "programming", "coding", "development"],
    },
]


# ─── Smart Skill Matching ───────────────────────────────────────────────────
def normalize_skill(skill):
    """Normalize skill names for better matching."""
    skill_lower = skill.lower().strip()
    
    # Map variations to canonical names
    mappings = {
        "machine learning": ["ml", "machinelearning"],
        "deep learning": ["dl", "deeplearning"],
        "artificial intelligence": ["ai"],
        "natural language processing": ["nlp"],
        "computer vision": ["cv"],
        "quality assurance": ["qa"],
        "continuous integration": ["ci"],
        "continuous deployment": ["cd"],
        "rest api": ["restful", "rest"],
        "nosql": ["mongodb", "cassandra", "dynamodb"],
    }
    
    for canonical, variations in mappings.items():
        if skill_lower in variations or skill_lower == canonical:
            return canonical
    
    return skill_lower


def calculate_keyword_bonus(skills, role):
    """Give bonus points if resume has specific keywords for the role."""
    skills_text = " ".join(skills).lower()
    keywords = role.get("keywords", [])
    
    matches = sum(1 for kw in keywords if kw in skills_text)
    return min(matches * 5, 20)  # Max 20% bonus


def match_careers(resume_skills):
    """Match candidate to career roles using improved scoring."""
    # Normalize all skills
    normalized_skills = [normalize_skill(s) for s in resume_skills]
    skills_set = set(normalized_skills)
    
    matches = []
    
    for role in CAREER_ROLES:
        # Normalize role skills
        required_set = {normalize_skill(s) for s in role["required"]}
        preferred_set = {normalize_skill(s) for s in role["preferred"]}
        
        # Count matches
        required_matches = skills_set & required_set
        preferred_matches = skills_set & preferred_set
        
        # Calculate overlap ratios
        required_ratio = len(required_matches) / len(required_set) if required_set else 0
        preferred_ratio = len(preferred_matches) / len(preferred_set) if preferred_set else 0
        
        # Weighted scoring
        base_score = (required_ratio * 70) + (preferred_ratio * 25)
        
        # Keyword bonus
        keyword_bonus = calculate_keyword_bonus(normalized_skills, role)
        
        # Final score
        match_pct = min(int(base_score + keyword_bonus), 99)
        
        # Calculate missing skills
        missing_required = list(required_set - skills_set)
        missing_preferred = list(preferred_set - skills_set)
        
        matches.append({
            "title": role["title"],
            "match_percentage": match_pct,
            "matched_required": list(required_matches),
            "matched_preferred": list(preferred_matches),
            "missing_required": missing_required,
            "missing_preferred": missing_preferred,
            "description": role["description"],
            "salary_range": role["salary_range"],
            "demand": role["demand"],
            "icon": role["icon"],
        })
    
    # Sort by match percentage descending
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return matches[:10]  # Return top 10


def get_skill_gap(resume_skills, target_role_title):
    """Get detailed skill gap for a specific role."""
    role = next((r for r in CAREER_ROLES if r["title"] == target_role_title), None)
    if not role:
        return {"error": "Role not found"}
    
    normalized_skills = {normalize_skill(s) for s in resume_skills}
    required_set = {normalize_skill(s) for s in role["required"]}
    preferred_set = {normalize_skill(s) for s in role["preferred"]}
    
    matched_required = list(normalized_skills & required_set)
    matched_preferred = list(normalized_skills & preferred_set)
    missing_required = list(required_set - normalized_skills)
    missing_preferred = list(preferred_set - normalized_skills)
    
    total_required = len(required_set)
    readiness = int((len(matched_required) / total_required) * 100) if total_required else 0
    
    return {
        "role": target_role_title,
        "readiness_pct": readiness,
        "matched_required": matched_required,
        "matched_preferred": matched_preferred,
        "missing_required": missing_required,
        "missing_preferred": missing_preferred,
        "total_required": total_required,
    }


# ─── Standalone Test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Test with different skill sets
    
    print("\n" + "="*60)
    print("Test 1: AI/ML Engineer Skills")
    print("="*60)
    aiml_skills = ["python", "tensorflow", "keras", "deep learning", "machine learning", "numpy", "pandas"]
    matches = match_careers(aiml_skills)
    for i, m in enumerate(matches[:5], 1):
        print(f"{i}. {m['title']}: {m['match_percentage']}% (missing: {', '.join(m['missing_required'][:3])})")
    
    print("\n" + "="*60)
    print("Test 2: QA/Testing Skills")
    print("="*60)
    qa_skills = ["manual testing", "selenium", "test cases", "jira", "api testing", "automation testing"]
    matches = match_careers(qa_skills)
    for i, m in enumerate(matches[:5], 1):
        print(f"{i}. {m['title']}: {m['match_percentage']}% (missing: {', '.join(m['missing_required'][:3])})")
    
    print("\n" + "="*60)
    print("Test 3: Data Analyst Skills")
    print("="*60)
    da_skills = ["sql", "excel", "python", "tableau", "data analysis", "power bi"]
    matches = match_careers(da_skills)
    for i, m in enumerate(matches[:5], 1):
        print(f"{i}. {m['title']}: {m['match_percentage']}% (missing: {', '.join(m['missing_required'][:3])})")
    
    print("\n" + "="*60)
    print("Test 4: Full Stack Skills")
    print("="*60)
    fs_skills = ["javascript", "react", "node.js", "mongodb", "html", "css", "express", "rest api"]
    matches = match_careers(fs_skills)
    for i, m in enumerate(matches[:5], 1):
        print(f"{i}. {m['title']}: {m['match_percentage']}% (missing: {', '.join(m['missing_required'][:3])})")