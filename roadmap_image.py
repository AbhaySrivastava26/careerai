"""
roadmap_image.py
-----------------
Generates a personalized roadmap PNG image from roadmap JSON data.
Uses Pillow — no AI API needed, 100% dynamic based on real skill gaps.

Install:
    pip install Pillow

Standalone test:
    python roadmap_image.py
"""

from PIL import Image, ImageDraw, ImageFont
import os
import textwrap
from pathlib import Path


OUTPUT_DIR = Path("roadmap_images")
OUTPUT_DIR.mkdir(exist_ok=True)


IMG_WIDTH   = 900
PADDING     = 40
BOX_RADIUS  = 18
ARROW_W     = 3


BG_COLOR      = (248, 250, 252)       # Light grey background
HEADER_BG     = (15,  23,  42)        # Dark navy header
HEADER_TEXT   = (255, 255, 255)       # White
SUBHEADER_CLR = (100, 116, 139)       # Slate grey

PHASE_COLORS = [
    {"bg": (239, 246, 255), "border": (37,  99,  235), "badge": (37,  99,  235)},   # Blue
    {"bg": (245, 243, 255), "border": (124, 58,  237), "badge": (124, 58,  237)},   # Purple
    {"bg": (240, 253, 244), "border": (22,  163, 74),  "badge": (22,  163, 74)},    # Green
    {"bg": (255, 251, 235), "border": (217, 119, 6),   "badge": (217, 119, 6)},     # Amber
]

ARROW_COLOR   = (148, 163, 184)
TASK_DOT      = (71,  85,  105)
TASK_TEXT_CLR = (51,  65,  85)
TITLE_CLR     = (15,  23,  42)
FOCUS_CLR     = (100, 116, 139)


def load_fonts():
    """
    Try to load nice fonts, fall back to Pillow default if not available.
    Works on Windows, Mac, Linux.
    """
    font_paths = {
        "windows": "C:/Windows/Fonts/",
        "linux":   "/usr/share/fonts/truetype/",
        "mac":     "/System/Library/Fonts/",
    }

    candidates = {
        "bold":   ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf", "LiberationSans-Bold.ttf"],
        "regular":["arial.ttf",   "Arial.ttf",      "DejaVuSans.ttf",      "LiberationSans-Regular.ttf"],
    }

    def try_load(name_list, size):
        for folder in font_paths.values():
            for name in name_list:
                try:
                    return ImageFont.truetype(os.path.join(folder, name), size)
                except Exception:
                    pass
        return ImageFont.load_default()

    return {
        "title":      try_load(candidates["bold"],    28),
        "subtitle":   try_load(candidates["regular"],  16),
        "phase_num":  try_load(candidates["bold"],    13),
        "phase_title":try_load(candidates["bold"],    17),
        "focus":      try_load(candidates["regular"],  13),
        "task":       try_load(candidates["regular"],  13),
        "badge":      try_load(candidates["bold"],    12),
        "footer":     try_load(candidates["regular"],  12),
    }



def draw_rounded_rect(draw, x1, y1, x2, y2, radius, fill, outline=None, width=2):
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


def draw_arrow(draw, x, y_start, y_end):
    """Draw a vertical arrow between two phase boxes."""
    cx = x
    draw.line([(cx, y_start), (cx, y_end - 10)], fill=ARROW_COLOR, width=ARROW_W)
    # Arrowhead
    draw.polygon([
        (cx,      y_end),
        (cx - 7,  y_end - 12),
        (cx + 7,  y_end - 12),
    ], fill=ARROW_COLOR)


def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


# ─── Main Generator ───────────────────────────────────────────────────────────
def generate_roadmap_image(roadmap: dict, output_filename: str = None) -> str:
    """
    Generate a personalized roadmap PNG image.

    Args:
        roadmap         : roadmap dict from roadmap_generator.py
        output_filename : optional filename, auto-generated if None

    Returns:
        Path to saved PNG file
    """
    fonts  = load_fonts()
    phases = roadmap.get("phases", [])
    name   = roadmap.get("candidate_name", "Candidate")
    role   = roadmap.get("target_role",    "Target Role")
    total  = roadmap.get("total_duration", "12 weeks")

    # ── Calculate total image height dynamically ──
    # Header: 120px
    # Per phase box: ~200px base + 22px per task line
    # Arrow between phases: 50px
    phase_heights = []
    for phase in phases:
        tasks     = phase.get("tasks", [])
        task_lines = sum(1 + len(t) // 55 for t in tasks)   # rough wrap estimate
        height    = 130 + (task_lines * 22)
        phase_heights.append(max(height, 150))

    total_height = (
        140                              # header
        + sum(phase_heights)             # all phase boxes
        + (len(phases) - 1) * 52        # arrows between boxes
        + 80                             # footer
        + PADDING * 2
    )

    # ── Create image ──
    img  = Image.new("RGB", (IMG_WIDTH, total_height), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # ── Header ──
    draw_rounded_rect(draw, 0, 0, IMG_WIDTH, 110, 0, HEADER_BG)

    # Name + role
    draw.text((PADDING, 22), f"📋 {name}", font=fonts["title"], fill=HEADER_TEXT)
    draw.text((PADDING, 60), f"🎯 Roadmap to become: {role}", font=fonts["subtitle"], fill=(148, 163, 184))
    draw.text((PADDING, 84), f"⏱  Total duration: {total}", font=fonts["footer"],   fill=(100, 116, 139))

    # ── Phase boxes ──
    y = 130

    for i, phase in enumerate(phases):
        if i >= 4:
            break

        color       = PHASE_COLORS[i % len(PHASE_COLORS)]
        phase_title = phase.get("title",        f"Phase {i+1}")
        phase_num   = phase.get("phase_number", i + 1)
        duration    = phase.get("duration",     "")
        focus       = phase.get("focus",        "")
        tasks       = phase.get("tasks",        [])
        box_h       = phase_heights[i]

        x1, x2 = PADDING, IMG_WIDTH - PADDING

        # Phase box background
        draw_rounded_rect(
            draw, x1, y, x2, y + box_h,
            BOX_RADIUS,
            fill=color["bg"],
            outline=color["border"],
            width=2,
        )

        # Phase number badge
        badge_x, badge_y = x1 + 16, y + 16
        draw_rounded_rect(draw, badge_x, badge_y, badge_x + 80, badge_y + 24, 12, color["badge"])
        draw.text((badge_x + 8, badge_y + 5), f"Phase {phase_num}", font=fonts["phase_num"], fill=(255, 255, 255))

        # Duration badge
        dur_bbox  = draw.textbbox((0, 0), duration, font=fonts["badge"])
        dur_w     = dur_bbox[2] - dur_bbox[0] + 20
        dur_x     = x2 - dur_w - 16
        draw_rounded_rect(draw, dur_x, badge_y, dur_x + dur_w, badge_y + 24, 12, (226, 232, 240))
        draw.text((dur_x + 10, badge_y + 5), duration, font=fonts["badge"], fill=(71, 85, 105))

        # Phase title
        draw.text((x1 + 16, y + 48), phase_title, font=fonts["phase_title"], fill=color["border"])

        
        if focus:
            draw.text((x1 + 16, y + 74), f"→ {focus}", font=fonts["focus"], fill=FOCUS_CLR)

        # Divider line
        draw.line([(x1 + 16, y + 94), (x2 - 16, y + 94)], fill=(226, 232, 240), width=1)

        # Tasks
        task_y = y + 104
        max_text_w = IMG_WIDTH - PADDING * 2 - 36

        for task in tasks[:4]:   # max 4 tasks per phase
            # Dot
            draw.ellipse([(x1 + 16, task_y + 5), (x1 + 23, task_y + 12)], fill=color["border"])
            # Task text with wrapping
            lines = wrap_text(task, fonts["task"], max_text_w - 20, draw)
            for line in lines:
                draw.text((x1 + 32, task_y), line, font=fonts["task"], fill=TASK_TEXT_CLR)
                task_y += 22
            task_y += 4

        # ── Arrow to next phase ──
        if i < len(phases) - 1:
            arrow_x     = IMG_WIDTH // 2
            arrow_start = y + box_h + 2
            arrow_end   = y + box_h + 50
            draw_arrow(draw, arrow_x, arrow_start, arrow_end)

        y += box_h + 52

    # ── Footer ──
    footer_text = "Generated by CareerAI • Personalized based on your resume & skill gaps"
    fb = draw.textbbox((0, 0), footer_text, font=fonts["footer"])
    fw = fb[2] - fb[0]
    draw.text(((IMG_WIDTH - fw) // 2, y + 10), footer_text, font=fonts["footer"], fill=FOCUS_CLR)

    # ── Save ──
    if not output_filename:
        safe_name = name.replace(" ", "_").lower()
        safe_role = role.replace(" ", "_").replace("/", "-").lower()
        output_filename = f"roadmap_{safe_name}_{safe_role}.png"

    output_path = OUTPUT_DIR / output_filename
    img.save(str(output_path), "PNG", quality=95)
    print(f"✅ Roadmap image saved: {output_path}")
    return str(output_path)


# ─── Standalone Test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Test with Abhay's actual roadmap data
    test_roadmap = {
        "candidate_name": "Abhay Srivastava",
        "target_role":    "NLP Engineer",
        "total_duration": "12 weeks",
        "overview":       "Focus on transformers and PyTorch to become job-ready.",
        "phases": [
            {
                "phase_number": 1,
                "title":    "Master Transformers & Hugging Face",
                "duration": "3 weeks",
                "focus":    "Learn transformer architecture and Hugging Face ecosystem",
                "tasks": [
                    "Study 'Attention Is All You Need' paper + Jay Alammar's illustrated transformer blog",
                    "Complete Hugging Face NLP course (free at huggingface.co/learn)",
                    "Build a text classification model using BERT with Hugging Face Transformers",
                ],
            },
            {
                "phase_number": 2,
                "title":    "spaCy & NLTK for Production NLP",
                "duration": "2 weeks",
                "focus":    "Learn industry-standard NLP libraries for real pipelines",
                "tasks": [
                    "Complete spaCy 101 course at spacy.io/usage/spacy-101",
                    "Build a Named Entity Recognition (NER) pipeline using spaCy",
                    "Practice text preprocessing with NLTK — tokenization, stemming, POS tagging",
                ],
            },
            {
                "phase_number": 3,
                "title":    "PyTorch for Deep Learning",
                "duration": "4 weeks",
                "focus":    "Train custom NLP models from scratch using PyTorch",
                "tasks": [
                    "Complete 'Deep Learning with PyTorch' on fast.ai (free course)",
                    "Implement an LSTM-based text classifier from scratch in PyTorch",
                    "Fine-tune DistilBERT on a custom dataset",
                ],
            },
            {
                "phase_number": 4,
                "title":    "Build & Deploy NLP Projects",
                "duration": "3 weeks",
                "focus":    "Build portfolio projects and prepare for NLP interviews",
                "tasks": [
                    "Build a sentiment analysis API using FastAPI + Hugging Face model",
                    "Create a document Q&A system using LangChain + vector embeddings",
                    "Deploy project on Hugging Face Spaces (free hosting for ML demos)",
                ],
            },
        ],
    }

    path = generate_roadmap_image(test_roadmap)
    print(f"\n🖼️  Open this file to see your roadmap image:")
    print(f"   {os.path.abspath(path)}")