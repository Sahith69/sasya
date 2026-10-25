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
    """Leaves all database tables clean for authentic user creation."""
    pass


# Initialize upon module import
init_all_tables(SASYA_DB_PATH)
