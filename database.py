"""
database.py - Centralized SQLite Database & Persistence Layer for Sasya AI
AgriTrust AI / hackcache

Manages data/sasya.db with unified schemas for:
- Farmer Profiles, Auth & DPDP Consent
- Contributions, AI Triangulations & Bounties (integrated with src.bounty_engine)
- Bhoomi Land Parcels & Survey Records (integrated with src.rtc_engine)
- Young Farmer Community Posts, Comments & Audio Advisories
- Moderation Queue & Flagged Items
- Simulated Agronomist Experts
- Immutable Audit Logs
"""

import os
import sqlite3
import datetime
import uuid
import json
from typing import Dict, Any, List, Optional

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
SASYA_DB_PATH = os.path.join(DATA_DIR, "sasya.db")
POOL_DIR = os.path.join(DATA_DIR, "contributed_pool")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(POOL_DIR, exist_ok=True)


def get_db(db_path: str = SASYA_DB_PATH) -> sqlite3.Connection:
    """Returns a SQLite connection with Row factory enabled."""
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_all_tables(db_path: str = SASYA_DB_PATH) -> None:
    """Initializes all database tables and seeds demo records if empty."""
    from src.bounty_engine import init_contrib_db
    from src.rtc_engine import init_rtc_db

    # 1. Initialize contributions and parcels tables
    init_contrib_db(db_path)
    init_rtc_db(db_path)

    # 2. Initialize remaining core tables
    conn = get_db(db_path)
    with conn:
        cursor = conn.cursor()

        # Farmer Profiles & Auth
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS farmers (
                id TEXT PRIMARY KEY,
                phone TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                district TEXT NOT NULL,
                taluk TEXT,
                village TEXT,
                state TEXT DEFAULT 'Karnataka',
                preferred_lang TEXT DEFAULT 'kn',
                consent_given INTEGER DEFAULT 1,
                consent_timestamp TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # Community Discussions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop TEXT NOT NULL,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                audio_url TEXT,
                upvotes INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );
        """)

        # Community Comments
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
            );
        """)

        # Moderation Reports
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS moderation_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER,
                reported_by TEXT NOT NULL,
                reason TEXT NOT NULL,
                details TEXT,
                status TEXT DEFAULT 'pending', -- 'pending', 'dismissed', 'removed'
                created_at TEXT NOT NULL
            );
        """)

        # Simulated Agronomist Experts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS experts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                institution TEXT NOT NULL,
                assigned_crop TEXT NOT NULL,
                reviews_count INTEGER DEFAULT 0,
                agreement_rate REAL DEFAULT 96.5,
                status TEXT DEFAULT 'Active'
            );
        """)

        # Audit Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            );
        """)

        # Payout Requests
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id TEXT NOT NULL,
                upi_id TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'Completed', -- 'Pending', 'Completed'
                timestamp TEXT NOT NULL
            );
        """)

        # Farmer 1-on-1 Chat Messages
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                recipient TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

    conn.close()

    # 3. Seed initial baseline records
    seed_initial_data(db_path)


def log_audit(actor: str, action: str, target_type: str, target_id: str, details: str = "", db_path: str = SASYA_DB_PATH):
    """Appends an immutable audit event to the log table."""
    conn = get_db(db_path)
    now_ts = datetime.datetime.now().isoformat()
    with conn:
        conn.execute("""
            INSERT INTO audit_logs (actor, action, target_type, target_id, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (actor, action, target_type, str(target_id), details, now_ts))
    conn.close()


def seed_initial_data(db_path: str = SASYA_DB_PATH) -> None:
    """Populates realistic baseline entries matching exact user specification."""
    conn = get_db(db_path)
    cursor = conn.cursor()

    # 1. Seed Experts (Modest, realistic counts, strictly no surnames)
    cursor.execute("SELECT COUNT(*) FROM experts")
    if cursor.fetchone()[0] == 0:
        experts_data = [
            ("exp_01", "Dr. Subrahmanya K", "Chief Pathologist", "Regional Agronomy Research Station, Vittal", "Arecanut", 12, 98.0, "Active"),
            ("exp_02", "Dr. Roopa M", "Senior Rice Entomologist", "Agricultural Research Station, Gangavathi", "Paddy", 9, 97.5, "Active"),
            ("exp_03", "Dr. Srinivas M", "Solanaceous Crop Specialist", "Horticultural Experiment Station, Kolar", "Tomato", 11, 98.5, "Active"),
            ("exp_04", "Dr. Rajeshwar T", "Horticulture Specialist", "Regional Horticultural Research Station, Shimla", "Apple", 8, 96.0, "Active")
        ]
        with conn:
            conn.executemany("""
                INSERT INTO experts (id, name, role, institution, assigned_crop, reviews_count, agreement_rate, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, experts_data)

    # 2. Seed Farmers (5 users: 3 Arecanut [2 also Paddy], 1 Tomato, 1 Apple)
    cursor.execute("SELECT COUNT(*) FROM farmers")
    if cursor.fetchone()[0] == 0:
        farmers_data = [
            ("farmer_ka_101", "9845110101", "Ramesh K", "Dakshina Kannada", "Belthangady", "Venur", "Karnataka", "en", 1, "2026-10-24T08:00:00", "2026-10-24T08:00:00"),
            ("farmer_ka_102", "9845098765", "Manjunath S", "Shivamogga", "Thirthahalli", "Agumbe", "Karnataka", "en", 1, "2026-10-24T08:30:00", "2026-10-24T08:30:00"),
            ("farmer_ka_103", "9845233445", "Suresh P", "Dakshina Kannada", "Sullia", "Sullia", "Karnataka", "en", 1, "2026-10-24T09:00:00", "2026-10-24T09:00:00"),
            ("farmer_ka_104", "9741023456", "Anand M", "Kolar", "Kolar", "Huthur", "Karnataka", "en", 1, "2026-10-24T09:30:00", "2026-10-24T09:30:00"),
            ("farmer_hp_105", "9816055443", "Sunil T", "Shimla", "Kotkhai", "Theog", "Himachal Pradesh", "hi", 1, "2026-10-24T10:00:00", "2026-10-24T10:00:00"),
        ]
        with conn:
            conn.executemany("""
                INSERT INTO farmers (id, phone, name, district, taluk, village, state, preferred_lang, consent_given, consent_timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, farmers_data)

    # 3. Seed 10 Community Posts (4 in Arecanut, 2 in each of Paddy, Tomato, Apple)
    cursor.execute("SELECT COUNT(*) FROM community_posts")
    if cursor.fetchone()[0] == 0:
        posts_data = [
            # Arecanut (4 posts)
            ("Arecanut", "farmer_ka_101", "Ramesh K (Venur)", "👥 Urgent: Need 2 Experienced Palm Climbers for Bordeaux Spraying (Venur)", "Looking for 2 skilled palm climbers for 1% Bordeaux mixture spraying across 4 acres in Venur before continuous monsoon showers resume. Work scheduled for Thursday & Friday morning.", None, 3, 0, "2026-10-25T09:30:00"),
            ("Arecanut", "farmer_ka_102", "Manjunath S (Agumbe)", "🚜 50ft High-Pressure Power Sprayer Available for Rent (Thirthahalli basin)", "Ground-level 50ft multi-jet power sprayer with 100m pressure hose and brass atomizing nozzle. Ready for preventive fungicide spraying before the upcoming rain spell.", None, 2, 0, "2026-10-25T10:15:00"),
            ("Arecanut", "farmer_ka_103", "Suresh P (Sullia)", "🔍 Dark water-soaked lesions on nut calyx after 2 days of continuous mist", "Noticed premature nut drop on north-facing slope palms. Calyx attachment points appear softened and blackened. Is standard neutral 1% Bordeaux spray with rosin sticker sufficient to halt spread?", None, 4, 0, "2026-10-25T11:00:00"),
            ("Arecanut", "farmer_ka_101", "Ramesh K (Venur)", "🌧️ Monsoon Defense: Tying polyethene hoods (kotte) over developing bunches", "With sustained humidity predicted above 92% this fortnight, we completed tying polyethene protective hoods over vulnerable bunches. Prevention is significantly more cost-effective than managing severe Koleroga drop later.", None, 5, 0, "2026-10-25T11:45:00"),

            # Paddy (2 posts)
            ("Paddy", "farmer_ka_101", "Ramesh K (Belthangady)", "🔍 Eye-shaped spindle blast lesions on nursery seedlings (variety Jyothi)", "Seedlings are 22 days old in wet nursery beds. Lesions have grayish centers with dark margins. Seeking agronomist recommendation on water drainage and safe bio-control timing.", None, 3, 0, "2026-10-25T12:15:00"),
            ("Paddy", "farmer_ka_102", "Manjunath S (Thirthahalli)", "👥 Paddy Transplanting Crew (6-8 Workers) Needed for 2 Days", "25-day nursery seedlings ready for field transplanting across 3.5 acres. Looking for an experienced local crew for 2 days. Direct pickup arranged from village junction.", None, 2, 0, "2026-10-25T12:45:00"),

            # Tomato (2 posts)
            ("Tomato", "farmer_ka_104", "Anand M (Huthur)", "🍅 Concentric target rings on lower foliage after two foggy nights", "Noticed dark brown concentric rings with chlorotic yellow halos on lower tomato leaves. Is removing lower leaves touching wet soil sufficient, or should Trichoderma foliar spray be applied?", None, 3, 0, "2026-10-25T13:10:00"),
            ("Tomato", "farmer_ka_104", "Anand M (Huthur)", "👥 4 Skilled Workers Needed for Bamboo Staking & Trellising Tomato Field", "Need 4 workers experienced in bamboo staking, trellis wiring, and nylon twine tying for semi-determinate tomato crop. Starting tomorrow 8:00 AM.", None, 2, 0, "2026-10-25T13:30:00"),

            # Apple (2 posts)
            ("Apple", "farmer_hp_105", "Sunil T (Theog)", "🍏 Bioclimatic Alert: Post-harvest orchard floor sanitation & scab management", "Western disturbance forecasted in 48 hours. Reminder to complete 5% urea foliar spray on fallen orchard leaves to accelerate natural decomposition and eliminate overwintering spores.", None, 4, 0, "2026-10-25T13:50:00"),
            ("Apple", "farmer_hp_105", "Sunil T (Theog)", "🔍 Premature leaf yellowing & brown margins in higher elevation block", "Observed localized foliar yellowing in north-slope block at 7,200ft elevation. Scanned leaf via Sasya AI to check for Alternaria leaf blotch vs nutrient stress. Seeking recommendations on post-harvest zinc-boron spray.", None, 1, 0, "2026-10-25T14:10:00")
        ]
        with conn:
            conn.executemany("""
                INSERT INTO community_posts (crop, author_id, author_name, title, content, audio_url, upvotes, comments_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, posts_data)

    conn.close()


# Initialize upon module import
init_all_tables(SASYA_DB_PATH)
