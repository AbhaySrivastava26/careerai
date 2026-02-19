"""
jobs_fetcher.py
----------------
Fetches real job listings from JSearch API (RapidAPI)
based on candidate's top career match and location.

Used internally by main.py after career matching.

Standalone test:
    python jobs_fetcher.py
"""

import requests
import os

# ─── Config ───────────────────────────────────────────────────────────────────
RAPIDAPI_KEY  = "c83717935amshad85da7556a5c2fp183dbejsndcad5206dbde"
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
BASE_URL      = "https://jsearch.p.rapidapi.com/search"

HEADERS = {
    "X-RapidAPI-Key":  RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}


# ─── Fetch Jobs ───────────────────────────────────────────────────────────────
def fetch_jobs(
    role: str,
    location: str = "India",
    num_pages: int = 1,
    max_results: int = 6,
) -> list[dict]:
    """
    Fetch real job listings for a given role and location.

    Args:
        role        : Job title to search e.g. "Full Stack Developer"
        location    : Location string e.g. "India", "Hyderabad", "Remote"
        num_pages   : Pages to fetch (1 page ≈ 10 results)
        max_results : Max jobs to return

    Returns:
        List of cleaned job dicts
    """
    query = f"{role} jobs in {location}"

    params = {
        "query":       query,
        "page":        "1",
        "num_pages":   str(num_pages),
        "date_posted": "month",   # Jobs posted in last month
        "remote_jobs_only": "false",
    }

    try:
        response = requests.get(BASE_URL, headers=HEADERS, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout:
        print("⚠️  JSearch API timeout")
        return []
    except requests.exceptions.RequestException as e:
        print(f"⚠️  JSearch API error: {e}")
        return []

    raw_jobs = data.get("data", [])
    if not raw_jobs:
        return []

    # ── Clean and format each job ──
    cleaned = []
    for job in raw_jobs[:max_results]:
        # Salary — JSearch provides min/max or a string
        salary = _format_salary(job)

        cleaned.append({
            "title":        job.get("job_title", "N/A"),
            "company":      job.get("employer_name", "N/A"),
            "location":     _format_location(job),
            "type":         _format_job_type(job),
            "salary":       salary,
            "posted":       job.get("job_posted_at_datetime_utc", "")[:10] or "Recent",
            "apply_link":   job.get("job_apply_link", "#"),
            "description":  job.get("job_description", "")[:300] + "..." if job.get("job_description") else "",
            "company_logo": job.get("employer_logo", None),
            "is_remote":    job.get("job_is_remote", False),
            "highlights":   job.get("job_highlights", {}),
        })

    return cleaned


def _format_location(job: dict) -> str:
    city    = job.get("job_city", "")
    state   = job.get("job_state", "")
    country = job.get("job_country", "")
    if job.get("job_is_remote"):
        return "Remote"
    parts = [p for p in [city, state, country] if p]
    return ", ".join(parts) if parts else "N/A"


def _format_job_type(job: dict) -> str:
    emp_type = job.get("job_employment_type", "")
    type_map = {
        "FULLTIME":  "Full-time",
        "PARTTIME":  "Part-time",
        "CONTRACTOR":"Contract",
        "INTERN":    "Internship",
    }
    return type_map.get(emp_type, emp_type or "Full-time")


def _format_salary(job: dict) -> str:
    min_sal = job.get("job_min_salary")
    max_sal = job.get("job_max_salary")
    period  = job.get("job_salary_period", "YEAR")

    if min_sal and max_sal:
        if period == "YEAR":
            return f"${int(min_sal):,}–${int(max_sal):,}/yr"
        elif period == "MONTH":
            return f"${int(min_sal):,}–${int(max_sal):,}/mo"
        else:
            return f"${int(min_sal):,}–${int(max_sal):,}"
    elif min_sal:
        return f"From ${int(min_sal):,}"
    else:
        return "Not disclosed"


def fetch_jobs_for_matches(
    career_matches: list[dict],
    location: str = "India",
    jobs_per_role: int = 3,
) -> list[dict]:
    """
    Fetch jobs for top 2 career matches combined.
    Avoids duplicate job titles.

    Args:
        career_matches : output from career_matcher.match_careers()
        location       : search location
        jobs_per_role  : jobs to fetch per role

    Returns:
        Combined list of jobs from top matches
    """
    all_jobs  = []
    seen_titles = set()
    top_roles = career_matches[:2]  # Only top 2 to save API calls

    for match in top_roles:
        role  = match["title"]
        jobs  = fetch_jobs(role, location=location, max_results=jobs_per_role)
        for job in jobs:
            key = f"{job['title'].lower()}_{job['company'].lower()}"
            if key not in seen_titles:
                seen_titles.add(key)
                job["matched_role"] = role  # Tag which role this came from
                all_jobs.append(job)

    return all_jobs


# ─── Standalone Test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    import json

    print("\n" + "=" * 55)
    print("💼 FETCHING REAL JOBS — Full Stack Developer in India")
    print("=" * 55)

    jobs = fetch_jobs("Full Stack Developer", location="India", max_results=5)

    if not jobs:
        print("No jobs returned — check your API key or internet connection")
    else:
        for i, job in enumerate(jobs, 1):
            print(f"\n{i}. {job['title']}")
            print(f"   🏢 {job['company']}")
            print(f"   📍 {job['location']}")
            print(f"   💰 {job['salary']}")
            print(f"   🕐 {job['type']}")
            print(f"   📅 {job['posted']}")
            print(f"   🔗 {job['apply_link'][:60]}...")