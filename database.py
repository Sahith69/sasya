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
    """Populates realistic baseline entries for the Admin portal and Community Hub."""
    conn = get_db(db_path)
    cursor = conn.cursor()

    # Seed Experts if empty
    cursor.execute("SELECT COUNT(*) FROM experts")
    if cursor.fetchone()[0] == 0:
        experts_data = [
            ("exp_ka_01", "Dr. Manjunath Bhat", "Chief Pathologist", "ICAR - CPCRI Kasaragod & Vittal", "Arecanut", 142, 98.2, "Active"),
            ("exp_ka_02", "Dr. Roopa Gowda", "Senior Rice Entomologist", "UAS GKVK Bengaluru", "Paddy", 98, 97.4, "Active"),
            ("exp_ka_03", "Dr. Rajeshwar Sharma", "Horticulture Specialist", "Dr. YSP UHF Nauni Solan", "Apple", 85, 96.8, "Active"),
            ("exp_ka_04", "Dr. K. Srinivas Murthy", "Solanaceous Crop Virologist", "IIHR Hesaraghatta", "Tomato", 120, 99.1, "Active"),
        ]
        with conn:
            conn.executemany("""
                INSERT INTO experts (id, name, role, institution, assigned_crop, reviews_count, agreement_rate, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, experts_data)

    # Seed Farmers if empty
    cursor.execute("SELECT COUNT(*) FROM farmers")
    if cursor.fetchone()[0] == 0:
        farmers_data = [
            ("farmer_ka_101", "9845012345", "Ramesh Poojary", "Dakshina Kannada", "Belthangady", "Kashipatna", "Karnataka", "kn", 1, "2026-10-20T09:00:00", "2026-10-20T09:00:00"),
            ("farmer_ka_102", "9845098765", "Manjunatha Gowda", "Shivamogga", "Thirthahalli", "Agumbe", "Karnataka", "kn", 1, "2026-10-21T11:15:00", "2026-10-21T11:15:00"),
            ("farmer_ka_103", "9741023456", "Srinivas Reddy", "Kolar", "Kolar", "Huthur", "Karnataka", "kn", 1, "2026-10-22T08:30:00", "2026-10-22T08:30:00"),
            ("farmer_ka_104", "9448011223", "Sharanappa Patil", "Mandya", "Maddur", "Koppa", "Karnataka", "kn", 1, "2026-10-22T14:45:00", "2026-10-22T14:45:00"),
            ("farmer_hp_105", "9816055443", "Sunil Verma", "Shimla", "Kotkhai", "Kiari", "Himachal Pradesh", "hi", 1, "2026-10-23T10:00:00", "2026-10-23T10:00:00"),
        ]
        with conn:
            conn.executemany("""
                INSERT INTO farmers (id, phone, name, district, taluk, village, state, preferred_lang, consent_given, consent_timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, farmers_data)

    # Seed Contributions if empty
    cursor.execute("SELECT COUNT(*) FROM contributions")
    if cursor.fetchone()[0] == 0:
        samples_dir = os.path.join(PROJECT_ROOT, "samples")
        contributions_seed = [
            (
                "farmer_ka_101", "Arecanut", "yellow_leaf_disease", "Dakshina Kannada", "2026-10-24T08:30:00",
                "md5_areca_01", "phash_areca_01", "cluster_dk_01", 145.2,
                "yellow_leaf_disease", 0.981, 3, 1,
                "verified", 10.0, "Dr. Manjunath Bhat", "2026-10-24T09:15:00", "yellow_leaf_disease",
                "Characteristic foliar yellowing matching YLD phytoplasma pattern. Prophylactic nutrient management advised.",
                "Chief Pathologist", "ICAR-CPCRI", 1, 1,
                os.path.join(samples_dir, "sample_arecanut.jpg")
            ),
            (
                "farmer_ka_101", "Arecanut", "mahali_koleroga", "Dakshina Kannada", "2026-10-24T10:20:00",
                "md5_areca_02", "phash_areca_02", "cluster_dk_02", 98.4,
                "mahali_koleroga", 0.954, 2, 1,
                "pending", 10.0, None, None, None,
                None, None, None, None, None,
                os.path.join(samples_dir, "sample_arecanut.jpg")
            ),
            (
                "farmer_ka_104", "Paddy", "blast", "Mandya", "2026-10-24T11:05:00",
                "md5_paddy_01", "phash_paddy_01", "cluster_my_01", 168.0,
                "hispa", 0.999, 1, 0,
                "pending", 1.0, None, None, None,
                None, None, None, None, None,
                os.path.join(samples_dir, "sample_paddy.jpg")
            ),
            (
                "farmer_ka_103", "Tomato", "early_blight", "Kolar", "2026-10-24T12:00:00",
                "md5_tomato_01", "phash_tomato_01", "cluster_kl_01", 112.5,
                "bacterial_spot", 0.991, 2, 0,
                "verified", 1.0, "Dr. K. Srinivas Murthy", "2026-10-24T12:40:00", "early_blight",
                "Concentric target rings observed on lower foliar margins. Alternaria confirmed.",
                "Solanaceous Crop Virologist", "IIHR", 0, 1,
                os.path.join(samples_dir, "sample_tomato.jpg")
            ),
            (
                "farmer_hp_105", "Apple", "apple_scab", "Shimla", "2026-10-24T13:15:00",
                "md5_apple_01", "phash_apple_01", "cluster_sh_01", 188.7,
                "apple_scab", 0.971, 1, 1,
                "verified", 1.0, "Dr. Rajeshwar Sharma", "2026-10-24T14:10:00", "apple_scab",
                "Olive-green fungal lesions on leaf upper epidermis. Classic Mills period infection.",
                "Horticulture Specialist", "Dr. YSP UHF", 1, 1,
                os.path.join(samples_dir, "sample_apple.jpg")
            ),
            (
                "farmer_ka_102", "Arecanut", "stem_bleeding", "Shivamogga", "2026-10-24T14:30:00",
                "md5_areca_03", "phash_areca_03", "cluster_sm_01", 85.3,
                "stem_bleeding", 0.923, 2, 1,
                "pending", 10.0, None, None, None,
                None, None, None, None, None,
                os.path.join(samples_dir, "sample_arecanut.jpg")
            )
        ]
        with conn:
            conn.executemany("""
                INSERT INTO contributions (
                    farmer_id, crop, claimed_label, district, timestamp,
                    md5, phash, cluster_id, laplacian_var,
                    ai_predicted_label, ai_confidence, ai_severity_grade, ai_agreement,
                    status, reward, verified_by, verified_at, verified_label,
                    expert_notes, expert_role, expert_source, expert_ai_agreement, expert_farmer_agreement,
                    filename
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, contributions_seed)

    # Seed Community Posts if empty
    cursor.execute("SELECT COUNT(*) FROM community_posts")
    if cursor.fetchone()[0] == 0:
        posts_seed = [
            (
                "Arecanut", "farmer_ka_101", "Ramesh Poojary (ಬೆಳ್ತಂಗಡಿ)",
                "Severe Fruit Drop & Koleroga Spreading After Heavy Rain",
                "Continuous rain in Belthangady taluk has caused severe Koleroga fruit drop in our 5-acre plantation. We sprayed 1% Bordeaux mixture 4 days ago, but rain washed it off. What sticker is best recommended for coastal humidity?",
                "/audio/advisory_voice.mp3", 28, 4, "2026-10-24T09:30:00"
            ),
            (
                "Paddy", "farmer_ka_104", "Sharanappa Patil (ಮಂಡ್ಯ)",
                "Neck Blast Symptoms in Sona Masuri Nursery Beds",
                "Noticed grayish-brown lesions on the panicle node in our nursery beds. With relative humidity staying above 90% in Maddur, should we apply Tricyclazole immediately or wait for sunny hours tomorrow?",
                None, 19, 3, "2026-10-24T11:45:00"
            ),
            (
                "Tomato", "farmer_ka_103", "Srinivas Reddy (ಕೋಲಾರ)",
                "Target Spot or Early Blight? Need Agronomist Opinion",
                "Foliage showing concentric target rings on lower canopy. Uploaded leaf scan via Sasya AI - verified ₹1 reward in wallet. Recommended spraying Chlorothalonil before Saturday showers.",
                None, 34, 6, "2026-10-24T13:10:00"
            ),
            (
                "Apple", "farmer_hp_105", "Sunil Verma (कोटखाई)",
                "Pre-Harvest Scab Prevention in Shimla Orchards",
                "Post-petal fall spray schedule with Mancozeb has kept scab under 2% this season. Sharing experience on using 48-hour rain adhesion windows before western disturbances arrive.",
                None, 42, 8, "2026-10-24T14:20:00"
            )
        ]
        with conn:
            conn.executemany("""
                INSERT INTO community_posts (crop, author_id, author_name, title, content, audio_url, upvotes, comments_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, posts_seed)

    # Seed Initial Audit Log if empty
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    if cursor.fetchone()[0] == 0:
        audit_seed = [
            ("SYSTEM", "DATABASE_INITIALIZED", "SYSTEM", "sasya_db", "Initial schema created and verified", "2026-10-24T08:00:00"),
            ("Dr. Manjunath Bhat", "APPROVE_CONTRIBUTION", "SUBMISSION", "1", "Verified yellow_leaf_disease on Arecanut for farmer_ka_101", "2026-10-24T09:15:00"),
            ("Dr. K. Srinivas Murthy", "RELABEL_CONTRIBUTION", "SUBMISSION", "4", "Relabeled submission from bacterial_spot to early_blight", "2026-10-24T12:40:00"),
            ("Dr. Rajeshwar Sharma", "APPROVE_CONTRIBUTION", "SUBMISSION", "5", "Verified apple_scab for farmer_hp_105", "2026-10-24T14:10:00")
        ]
        with conn:
            conn.executemany("""
                INSERT INTO audit_logs (actor, action, target_type, target_id, details, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, audit_seed)

    # Seed Sample Parcels if empty
    cursor.execute("SELECT COUNT(*) FROM farmer_parcels")
    if cursor.fetchone()[0] == 0:
        from src.rtc_engine import register_farmer_rtc
        register_farmer_rtc('farmer_ka_101', 'Dakshina Kannada', 'Belthangady', 'Venur', 'Kashipatna', '42', '1', db_path=db_path)
        register_farmer_rtc('farmer_ka_102', 'Shivamogga', 'Thirthahalli', 'Agumbe', 'Agumbe', '104', '1A', db_path=db_path)

    conn.close()


# Initialize upon module import
init_all_tables(SASYA_DB_PATH)
