"""
custom_roadmap.py
------------------
Generates a roadmap text + PNG image when user types any role.

User types: "Data Engineer" → system generates 4-phase roadmap → draws PNG

Supported roles (type any of these or variations):
  Full Stack Developer, Frontend Developer, Backend Developer,
  Data Engineer, Machine Learning Engineer, Data Scientist,
  Data Analyst, DevOps Engineer, Cloud Engineer,
  AI / GenAI Engineer, NLP Engineer, Android Developer,
  Software Engineer, Product Manager, Cybersecurity Engineer

Standalone test:
    python custom_roadmap.py

Used by main.py via POST /generate-roadmap endpoint.
"""

from roadmap_generator import build_dynamic_roadmap, ROLE_TEMPLATES
from roadmap_image     import generate_roadmap_image
import uuid
from pathlib import Path

# ─── Extra Roles Not in Career Matcher ───────────────────────────────────────
# These are additional roles a user might type manually

EXTRA_ROLE_TEMPLATES = {

    "Data Engineer": [
        {
            "title": "SQL, Python & Data Fundamentals",
            "focus": "Master data querying, manipulation and pipeline scripting",
            "resource_tasks": [
                ("sql",         "Complete 'Mode SQL Tutorial' at mode.com — window functions, CTEs, optimization"),
                ("python",      "Complete 'Python for Data Engineering' on DataCamp — pandas, pyarrow, boto3"),
                ("default_1",   "Complete 'SQL for Data Engineers' on Udemy — partitioning, indexing, performance"),
                ("default_2",   "Build a data pipeline: CSV → PostgreSQL → transformed output using Python + SQL"),
            ],
        },
        {
            "title": "Apache Spark & Big Data Tools",
            "focus": "Process large-scale data with distributed computing",
            "resource_tasks": [
                ("default_1",   "Complete 'Apache Spark with Python - PySpark' on Udemy by Jose Portilla"),
                ("default_2",   "Complete 'Big Data Essentials: HDFS, MapReduce, Spark' on Coursera (audit free)"),
                ("default_3",   "Build a PySpark pipeline: ingest raw data → transform → write to Parquet"),
                ("default_4",   "Practice Spark SQL on Databricks Community Edition (free cloud notebook)"),
            ],
        },
        {
            "title": "Data Pipelines, Airflow & Cloud",
            "focus": "Build production ETL/ELT pipelines with orchestration",
            "resource_tasks": [
                ("default_1",   "Complete 'Apache Airflow: The Hands-On Guide' on Udemy — DAGs, operators, scheduling"),
                ("default_2",   "Build an end-to-end ETL pipeline with Airflow: API → S3 → Redshift/BigQuery"),
                ("aws",         "Complete AWS Data Analytics Specialty learning path on AWS Skill Builder (free)"),
                ("gcp",         "Complete 'Google Cloud Professional Data Engineer' prep on Cloud Skills Boost"),
                ("default_3",   "Study dbt (data build tool) — transform data in warehouse using dbt Core (free)"),
            ],
        },
        {
            "title": "Data Warehousing, Portfolio & Interview Prep",
            "focus": "Master cloud data warehouses and build portfolio projects",
            "resource_tasks": [
                ("default_1",   "Set up Snowflake free trial — load data, build transformations, write queries"),
                ("default_2",   "Build a full data engineering project: ingest → transform → warehouse → dashboard"),
                ("default_3",   "Practice data engineering interview questions at dataengineer.io (free resources)"),
                ("default_4",   "Publish pipeline project on GitHub with README, architecture diagram, and demo"),
            ],
        },
    ],

    "Product Manager": [
        {
            "title": "Product Fundamentals & Frameworks",
            "focus": "Learn core PM frameworks, metrics, and product thinking",
            "resource_tasks": [
                ("default_1",   "Complete 'Product Management Fundamentals' on Coursera by Duke (audit free)"),
                ("default_2",   "Read 'Inspired' by Marty Cagan — product discovery, OKRs, roadmapping"),
                ("default_3",   "Study AARRR metrics framework — acquisition, activation, retention, referral, revenue"),
                ("default_4",   "Complete 'Become a Product Manager' on Udemy — covers entire PM lifecycle"),
            ],
        },
        {
            "title": "User Research & Design Thinking",
            "focus": "Master user research and translate insights into features",
            "resource_tasks": [
                ("default_1",   "Complete 'Design Thinking' on IDEO U or Coursera by UVA (audit free)"),
                ("default_2",   "Conduct 5 user interviews and synthesize insights into a product requirements doc"),
                ("default_3",   "Complete 'UX Design' basics on Google UX Design Certificate on Coursera (audit)"),
                ("default_4",   "Build a wireframe with Figma (free) — design flows for a product feature"),
            ],
        },
        {
            "title": "Data, Analytics & Technical Skills",
            "focus": "Make data-driven decisions and collaborate with engineers",
            "resource_tasks": [
                ("sql",         "Complete SQL basics at sqlzoo.net — run product analytics queries yourself"),
                ("default_1",   "Complete 'Product Analytics' on Mixpanel or Amplitude free learning center"),
                ("default_2",   "Study A/B testing for PMs — design, run, and interpret experiments"),
                ("default_3",   "Complete 'Technical Product Management' on LinkedIn Learning — APIs, system design basics"),
            ],
        },
        {
            "title": "PM Portfolio, Case Studies & Interview Prep",
            "focus": "Build PM portfolio and crack product management interviews",
            "resource_tasks": [
                ("default_1",   "Complete 'Decode and Conquer' by Lewis Lin — master CIRCLES framework for PM interviews"),
                ("default_2",   "Write 3 product teardowns: analyze Swiggy, Notion, or Zepto with metrics + improvements"),
                ("default_3",   "Practice PM case interviews on Exponent.com — do 10 mock product cases"),
                ("default_4",   "Build a portfolio site with case studies showing problem → insight → solution → outcome"),
            ],
        },
    ],

    "Cybersecurity Engineer": [
        {
            "title": "Networking & Security Fundamentals",
            "focus": "Master networking protocols and core security concepts",
            "resource_tasks": [
                ("default_1",   "Complete 'CompTIA Security+' study guide — covers all security fundamentals"),
                ("default_2",   "Complete 'Computer Networking' on Coursera by Google (audit free) — TCP/IP, DNS, HTTP"),
                ("linux",       "Complete 'Linux Basics for Hackers' by OccupyTheWeb (free PDF available)"),
                ("default_3",   "Complete TryHackMe 'Pre-Security' learning path (free rooms available)"),
            ],
        },
        {
            "title": "Ethical Hacking & Penetration Testing",
            "focus": "Learn offensive security techniques and tools",
            "resource_tasks": [
                ("default_1",   "Complete 'Practical Ethical Hacking' by TCM Security on Udemy — full pentest course"),
                ("default_2",   "Complete TryHackMe 'Jr Penetration Tester' path (free + paid rooms)"),
                ("default_3",   "Practice on HackTheBox — solve 10 easy machines and document methodologies"),
                ("python",      "Learn Python for automation — write scripts for port scanning and exploitation"),
            ],
        },
        {
            "title": "Defensive Security & SOC Skills",
            "focus": "Learn threat detection, incident response, and SIEM tools",
            "resource_tasks": [
                ("default_1",   "Complete 'Blue Team Labs Online' free learning paths — log analysis, SIEM, IR"),
                ("default_2",   "Set up a home lab: Splunk + Kali Linux + vulnerable VMs for practice"),
                ("default_3",   "Complete 'SOC Analyst' learning path on TryHackMe (free tier available)"),
                ("default_4",   "Study MITRE ATT&CK framework at attack.mitre.org — learn TTPs of real attackers"),
            ],
        },
        {
            "title": "Certifications, Projects & Job Prep",
            "focus": "Earn certifications and build cybersecurity portfolio",
            "resource_tasks": [
                ("default_1",   "Earn CompTIA Security+ certification — most in-demand entry-level security cert"),
                ("default_2",   "Complete a bug bounty on HackerOne or Bugcrowd — document findings professionally"),
                ("default_3",   "Build a cybersecurity home lab writeup on GitHub — document all tools and techniques"),
                ("default_4",   "Practice cybersecurity interview questions at cybersecurityinterviewquestions.com"),
            ],
        },
    ],

    "UI/UX Designer": [
        {
            "title": "Design Fundamentals & Tools",
            "focus": "Learn core design principles and industry-standard tools",
            "resource_tasks": [
                ("default_1",   "Complete 'Google UX Design Certificate' on Coursera (audit free — 7 courses)"),
                ("default_2",   "Master Figma — complete Figma's official free 'Figma for Beginners' course"),
                ("default_3",   "Study design principles: typography, color theory, grid systems, visual hierarchy"),
                ("default_4",   "Complete 'Design for Non-Designers' by Robin Williams — fundamental design rules"),
            ],
        },
        {
            "title": "User Research & Wireframing",
            "focus": "Conduct user research and create wireframes and prototypes",
            "resource_tasks": [
                ("default_1",   "Conduct 5 user interviews — document findings in affinity maps and user journey maps"),
                ("default_2",   "Build low-fidelity wireframes for 3 apps using Figma or Balsamiq (free tier)"),
                ("default_3",   "Complete 'User Research Methods' on Nielsen Norman Group's free articles"),
                ("default_4",   "Create a complete user flow diagram for a mobile app from onboarding to key action"),
            ],
        },
        {
            "title": "High-Fidelity Design & Prototyping",
            "focus": "Build polished UI designs and interactive prototypes",
            "resource_tasks": [
                ("default_1",   "Design a complete mobile app UI in Figma — 10+ screens with a consistent design system"),
                ("default_2",   "Build an interactive prototype in Figma — test with 5 users and iterate"),
                ("default_3",   "Study 'Refactoring UI' by Adam Wathan — learn to make good-looking UIs"),
                ("default_4",   "Complete 'UI Design Fundamentals' on Scrimba (free) — spacing, color, type"),
            ],
        },
        {
            "title": "Portfolio & UX Interview Prep",
            "focus": "Build 3 case studies and crack UX design interviews",
            "resource_tasks": [
                ("default_1",   "Build UX portfolio on Behance or a personal site — 3 complete case studies"),
                ("default_2",   "Write case studies: problem → research → design → test → outcome with metrics"),
                ("default_3",   "Practice UX interview questions at uxdesignmastery.com (portfolio critique, whiteboard)"),
                ("default_4",   "Complete a design challenge from uxtools.co/challenges — publish on portfolio"),
            ],
        },
    ],
}

# Merge with main role templates
ALL_ROLE_TEMPLATES = {**ROLE_TEMPLATES, **EXTRA_ROLE_TEMPLATES}

# ─── Role Name Normalizer ─────────────────────────────────────────────────────
ROLE_ALIASES = {
    # Full Stack
    "full stack":           "Full Stack Developer",
    "full stack developer":  "Full Stack Developer",
    "fullstack":            "Full Stack Developer",
    "fullstack developer":  "Full Stack Developer",
    "full-stack":           "Full Stack Developer",
    # Frontend
    "frontend":             "Frontend Developer",
    "front end":            "Frontend Developer",
    "frontend developer":   "Frontend Developer",
    "react developer":      "Frontend Developer",
    "ui developer":         "Frontend Developer",
    # Backend
    "backend":              "Backend Developer",
    "back end":             "Backend Developer",
    "backend developer":    "Backend Developer",
    "api developer":        "Backend Developer",
    # Data Engineer
    "data engineer":        "Data Engineer",
    "data engineering":     "Data Engineer",
    "etl developer":        "Data Engineer",
    "pipeline engineer":    "Data Engineer",
    # ML Engineer
    "ml engineer":          "Machine Learning Engineer",
    "machine learning":     "Machine Learning Engineer",
    "machine learning engineer": "Machine Learning Engineer",
    "ml":                   "Machine Learning Engineer",
    # Data Scientist
    "data scientist":       "Data Scientist",
    "data science":         "Data Scientist",
    # Data Analyst
    "data analyst":         "Data Analyst",
    "analyst":              "Data Analyst",
    "business analyst":     "Data Analyst",
    # DevOps
    "devops":               "DevOps Engineer",
    "devops engineer":      "DevOps Engineer",
    "sre":                  "DevOps Engineer",
    "site reliability":     "DevOps Engineer",
    # Cloud
    "cloud":                "Cloud Engineer",
    "cloud engineer":       "Cloud Engineer",
    "aws engineer":         "Cloud Engineer",
    "cloud architect":      "Cloud Engineer",
    # AI / GenAI
    "ai engineer":          "AI / GenAI Engineer",
    "genai engineer":       "AI / GenAI Engineer",
    "generative ai":        "AI / GenAI Engineer",
    "ai/genai engineer":    "AI / GenAI Engineer",
    "llm engineer":         "AI / GenAI Engineer",
    # NLP
    "nlp engineer":         "NLP Engineer",
    "nlp":                  "NLP Engineer",
    "natural language":     "NLP Engineer",
    # Android
    "android":              "Android Developer",
    "android developer":    "Android Developer",
    "mobile developer":     "Android Developer",
    # Software Engineer
    "software engineer":    "Software Engineer",
    "sde":                  "Software Engineer",
    "software developer":   "Software Engineer",
    # Product Manager
    "product manager":      "Product Manager",
    "pm":                   "Product Manager",
    "product":              "Product Manager",
    # Cybersecurity
    "cybersecurity":        "Cybersecurity Engineer",
    "security engineer":    "Cybersecurity Engineer",
    "ethical hacker":       "Cybersecurity Engineer",
    "penetration tester":   "Cybersecurity Engineer",
    # UI/UX
    "ui/ux":                "UI/UX Designer",
    "ux designer":          "UI/UX Designer",
    "ui designer":          "UI/UX Designer",
    "designer":             "UI/UX Designer",
}


def normalize_role(user_input: str) -> str:
    """Convert user-typed role to canonical role name."""
    cleaned = user_input.strip().lower()
    # Direct alias match
    if cleaned in ROLE_ALIASES:
        return ROLE_ALIASES[cleaned]
    # Partial match
    for alias, canonical in ROLE_ALIASES.items():
        if alias in cleaned or cleaned in alias:
            return canonical
    # Title case fallback — return as-is
    return user_input.strip().title()


def get_available_roles() -> list:
    """Return all supported role names."""
    return sorted(set(ROLE_ALIASES.values()))


# ─── Main Generator ───────────────────────────────────────────────────────────
def generate_custom_roadmap(
    role_input:  str,
    name:        str  = "You",
    readiness:   int  = 50,
    missing:     list = None,
    save_image:  bool = True,
) -> dict:
    """
    Generate roadmap text + PNG image for any user-typed role.

    Args:
        role_input  : Raw user input e.g. "data engineer", "Full Stack"
        name        : Candidate name (default: "You")
        readiness   : How ready they are 0-100 (default 50%)
        missing     : Optional list of missing skills to personalize phases
        save_image  : Whether to generate PNG image

    Returns:
        {
          "role":         canonical role name,
          "roadmap":      roadmap dict with phases,
          "image_path":   path to PNG file (or None),
          "image_url":    API URL to fetch image
        }
    """
    if missing is None:
        missing = []

    # Normalize role name
    canonical_role = normalize_role(role_input)

    # Get templates — use extra roles first, then main, then Software Engineer default
    templates_source = ALL_ROLE_TEMPLATES
    if canonical_role not in templates_source:
        # Best effort: find closest match
        for key in templates_source:
            if canonical_role.lower() in key.lower() or key.lower() in canonical_role.lower():
                canonical_role = key
                break
        else:
            canonical_role = "Software Engineer"

    # Override templates temporarily for extra roles
    import roadmap_generator as rg
    original = rg.ROLE_TEMPLATES.copy()
    rg.ROLE_TEMPLATES.update(EXTRA_ROLE_TEMPLATES)

    roadmap = build_dynamic_roadmap(
        name             = name,
        target_role      = canonical_role,
        missing_required = missing,
        missing_preferred= [],
        readiness_pct    = readiness,
    )

    rg.ROLE_TEMPLATES = original  # restore

    # Generate image
    image_path = None
    image_filename = None
    if save_image:
        image_filename = f"custom_{canonical_role.replace(' ', '_').replace('/', '-').lower()}_{uuid.uuid4().hex[:8]}.png"
        try:
            image_path = generate_roadmap_image(roadmap, output_filename=image_filename)
        except Exception as e:
            print(f"⚠️  Image generation failed: {e}")

    return {
        "role":           canonical_role,
        "roadmap":        roadmap,
        "image_path":     image_path,
        "image_filename": image_filename,
        "supported_roles": get_available_roles(),
    }


# ─── Standalone Test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_inputs = [
        "data engineer",
        "full stack",
        "devops",
        "product manager",
        "cybersecurity",
        "ui/ux",
    ]

    for user_input in test_inputs:
        print(f"\n{'='*55}")
        print(f"User typed: '{user_input}'")
        result = generate_custom_roadmap(user_input, name="User", save_image=True)
        print(f"Role       : {result['role']}")
        print(f"Image      : {result['image_path']}")
        roadmap = result["roadmap"]
        for phase in roadmap["phases"]:
            print(f"  Phase {phase['phase_number']}: {phase['title']}")