"""
src/bounty_engine.py - Community Contribution Store, Expert Verification & AI Triangulation
AgriTrust AI / hackcache

Integrates:
1. Farmer field photo submission with automated quality gating (Consent, Daily Quota, Blur, pHash).
2. Automated CropVisionEngine AI diagnostic execution upon submission.
3. Agronomist / Expert verification desk (Approve, Relabel, Reject).
4. Direct AI-vs-Farmer-vs-Expert cross-verification and agreement matrix.
5. Farmer digital bounty wallet (Pending vs Verified balance, ₹50 payout milestone).
6. Administrator analytics & epidemiological outbreak aggregation.
"""

import os
import io
import time
import uuid
import sqlite3
import hashlib
import datetime
from typing import Dict, Any, List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image
import imagehash

import config

DB_PATH_DEFAULT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "contributions.db")
POOL_DIR_DEFAULT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "contributed_pool")

BLUR_HARD_THRESHOLD = 12.0
BLUR_OPTIMAL_THRESHOLD = 30.0
DAILY_UPLOAD_CAP = 10
PAYOUT_THRESHOLD = 50.0
REWARD_STANDARD = 1.0
REWARD_RARE_BONUS = 10.0

RARE_CLASSES = {
    "mahali_koleroga",
    "bud_borer",
    "stem_cracking",
    "cedar_apple_rust",
    "bacterial_leaf_streak",
    "yellow_leaf_curl_virus"
}


# ── Database Initialization ──────────────────────────────────────────────────
def init_contrib_db(db_path: str = DB_PATH_DEFAULT) -> None:
    """Initializes SQLite database with full AI-vs-Expert triangulation schema."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    with conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contributions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id TEXT NOT NULL,
                crop TEXT NOT NULL,
                claimed_label TEXT NOT NULL,
                district TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                md5 TEXT NOT NULL,
                phash TEXT NOT NULL,
                cluster_id TEXT NOT NULL,
                laplacian_var REAL NOT NULL,
                
                -- AI Diagnostic Predictions
                ai_predicted_label TEXT,
                ai_confidence REAL,
                ai_severity_grade INTEGER,
                ai_agreement INTEGER, -- 1 if claimed == ai_predicted else 0
                
                -- Verification & Bounty Escrow
                status TEXT NOT NULL, -- 'pending', 'verified', 'rejected'
                reward REAL NOT NULL,
                verified_by TEXT,
                verified_at TEXT,
                verified_label TEXT,
                expert_notes TEXT,
                expert_role TEXT,
                expert_source TEXT,
                expert_ai_agreement INTEGER, -- 1 if verified_label == ai_predicted else 0
                expert_farmer_agreement INTEGER, -- 1 if verified_label == claimed_label else 0
                
                filename TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_contrib_farmer ON contributions(farmer_id, timestamp);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_contrib_md5 ON contributions(md5);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_contrib_status ON contributions(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_contrib_crop ON contributions(crop, status);")
    conn.close()


def get_contrib_db(db_path: str = DB_PATH_DEFAULT) -> sqlite3.Connection:
    init_contrib_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


# ── Image Quality & Perceptual Hashing Utilities ──────────────────────────────
def compute_laplacian_variance(img_bytes: bytes) -> float:
    """Computes the variance of the Laplacian to evaluate image edge sharpness."""
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return 0.0
    return float(cv2.Laplacian(img, cv2.CV_64F).var())


def compute_image_signatures(img_bytes: bytes) -> Dict[str, Any]:
    """Computes MD5 hash and multi-orientation perceptual hashes."""
    md5_hash = hashlib.md5(img_bytes).hexdigest()
    with Image.open(io.BytesIO(img_bytes)) as pil_img:
        pil_rgb = pil_img.convert("RGB")
        h_orig = imagehash.phash(pil_rgb)
    return {
        "md5": md5_hash,
        "phash_hex": str(h_orig),
        "phash_u64": np.uint64(int(str(h_orig), 16))
    }


# ── Submission & Gating Pipeline ──────────────────────────────────────────────
def submit_contribution(
    farmer_id: str,
    crop: str,
    district: str,
    claimed_label: str,
    consent_given: bool,
    img_bytes: bytes,
    filename: str,
    db_path: str = DB_PATH_DEFAULT,
    pool_dir: str = POOL_DIR_DEFAULT,
    engine_instance = None
) -> Dict[str, Any]:
    """
    Submits a farmer field photo through the 5-stage automated quality gates:
    1. Consent Verification
    2. 24h Daily Upload Quota
    3. Optical Clarity (Laplacian variance)
    4. Perceptual Deduplication
    5. Real-time CropVisionEngine Diagnostic Triangulation
    """
    init_contrib_db(db_path)

    # 1. Mandatory Location Consent
    if not consent_given:
        return {
            "valid": False,
            "error": "Consent required: You must consent to district-level data aggregation for regional outbreak mapping."
        }

    # 2. Daily Rate Limiting (<= 10 uploads in rolling 24 hours)
    conn = get_contrib_db(db_path)
    now_dt = datetime.datetime.now()
    since_dt = (now_dt - datetime.timedelta(hours=24)).isoformat()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM contributions WHERE farmer_id = ? AND timestamp >= ?",
        (farmer_id, since_dt)
    )
    daily_count = cursor.fetchone()[0]
    if daily_count >= DAILY_UPLOAD_CAP:
        conn.close()
        return {
            "valid": False,
            "error": f"Daily upload limit reached: Maximum {DAILY_UPLOAD_CAP} uploads per 24 hours allowed."
        }

    # 3. Blur Detection
    lap_var = compute_laplacian_variance(img_bytes)
    if lap_var < BLUR_HARD_THRESHOLD:
        conn.close()
        return {
            "valid": False,
            "error": f"Image rejected for blur: Laplacian focus score is {lap_var:.1f} (minimum required: {BLUR_HARD_THRESHOLD:.1f}). Please capture a well-focused photo in ambient daylight."
        }

    # 4. Deduplication against Contribution Pool
    img_sig = compute_image_signatures(img_bytes)
    cursor.execute("SELECT id, md5, phash, cluster_id FROM contributions")
    existing_rows = cursor.fetchall()
    conn.close()

    matched_cluster = None
    for row in existing_rows:
        if row["md5"] == img_sig["md5"]:
            return {
                "valid": False,
                "error": f"Duplicate photo: Matches existing contribution #{row['id']} by exact MD5 hash."
            }
        try:
            ex_u64 = np.uint64(int(row["phash"], 16))
            dist = int(np.bitwise_count(ex_u64 ^ img_sig["phash_u64"]))
            if dist <= 8:
                return {
                    "valid": False,
                    "error": f"Duplicate photo: Perceptual hash matches existing contribution #{row['id']} (distance {dist} <= 8)."
                }
            elif dist <= 16 and matched_cluster is None:
                matched_cluster = row["cluster_id"]
        except Exception:
            pass

    cluster_id = matched_cluster if matched_cluster else f"cluster_{uuid.uuid4().hex[:8]}"

    # 5. Run Automated AI Diagnosis with CropVisionEngine
    ai_pred_label = "unknown"
    ai_confidence = 0.0
    ai_severity = 0
    ai_valid_crop = True

    try:
        from engine import CropVisionEngine
        active_engine = engine_instance or CropVisionEngine()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        diag_res = active_engine.diagnose(pil_img, crop_hint=crop)

        if diag_res.get("success"):
            ai_pred_label = diag_res.get("disease", "unknown")
            ai_confidence = float(diag_res.get("confidence", 0.0))
            ai_severity = int(diag_res.get("severity", {}).get("grade", 0))
            ai_valid_crop = diag_res.get("valid_crop", True)
        else:
            ai_valid_crop = False
            ai_pred_label = diag_res.get("disease", "Out of Distribution / Rejected")
    except Exception as e:
        ai_pred_label = f"diag_error: {str(e)[:30]}"

    # Compare Farmer Claimed Label vs AI Diagnosis
    clean_claimed = claimed_label.strip().lower().replace(" ", "_")
    clean_ai = ai_pred_label.strip().lower().replace(" ", "_")
    ai_agreement = 1 if (clean_claimed == clean_ai) else 0

    # Determine Reserved Bounty (Placed in Escrow / Pending)
    bounty_amount = REWARD_RARE_BONUS if clean_claimed in RARE_CLASSES else REWARD_STANDARD

    # Save image strictly inside data/contributed_pool/<crop>/
    crop_dir = os.path.join(pool_dir, crop.lower())
    os.makedirs(crop_dir, exist_ok=True)
    safe_name = f"{int(time.time())}_{uuid.uuid4().hex[:6]}_{os.path.basename(filename)}"
    save_path = os.path.join(crop_dir, safe_name)
    with open(save_path, "wb") as f:
        f.write(img_bytes)

    # Insert into Database
    conn = get_contrib_db(db_path)
    now_ts = datetime.datetime.now().isoformat()
    with conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contributions (
                farmer_id, crop, claimed_label, district, timestamp,
                md5, phash, cluster_id, laplacian_var,
                ai_predicted_label, ai_confidence, ai_severity_grade, ai_agreement,
                status, reward, verified_by, verified_at, verified_label,
                expert_notes, expert_role, expert_source, expert_ai_agreement, expert_farmer_agreement,
                filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            farmer_id, crop, clean_claimed, district, now_ts,
            img_sig["md5"], img_sig["phash_hex"], cluster_id, lap_var,
            clean_ai, ai_confidence, ai_severity, ai_agreement,
            "pending", bounty_amount, None, None, None,
            None, None, None, None, None,
            save_path
        ))
        record_id = cursor.lastrowid
    conn.close()

    return {
        "valid": True,
        "id": record_id,
        "farmer_id": farmer_id,
        "crop": crop,
        "claimed_label": clean_claimed,
        "district": district,
        "timestamp": now_ts,
        "status": "pending",
        "reserved_bounty": bounty_amount,
        "cluster_id": cluster_id,
        "focus_score": lap_var,
        "ai_diagnosis": {
            "predicted_label": clean_ai,
            "confidence": ai_confidence,
            "severity_grade": ai_severity,
            "matches_farmer_claim": bool(ai_agreement),
            "valid_crop": ai_valid_crop
        },
        "saved_path": save_path
    }


# ── Agronomist / Expert Verification Desk ────────────────────────────────────
def verify_contribution(
    contrib_id: int,
    verified_by: str,
    action: str = "approve",  # 'approve', 'relabel', 'reject'
    corrected_label: Optional[str] = None,
    expert_notes: Optional[str] = None,
    expert_role: str = "Senior Plant Pathologist",
    expert_source: str = "ICAR - CPCRI Field Advisory Guidelines",
    db_path: str = DB_PATH_DEFAULT
) -> Dict[str, Any]:
    """
    Executes expert review, verifies against AI and farmer claims, and updates wallet:
    - 'approve': Confirms claimed label -> Status: verified, Bounty credited.
    - 'relabel': Corrects diagnosis -> Status: verified with corrected_label, Bounty credited.
    - 'reject': Marks non-pathology/fraud -> Status: rejected, Bounty set to 0.0.
    """
    init_contrib_db(db_path)
    conn = get_contrib_db(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contributions WHERE id = ?", (contrib_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return {"success": False, "error": f"Contribution #{contrib_id} not found."}

    rec = dict(row)
    now_ts = datetime.datetime.now().isoformat()
    claimed = rec["claimed_label"]
    ai_pred = rec["ai_predicted_label"]

    if action == "reject":
        new_status = "rejected"
        final_label = "REJECTED"
        final_reward = 0.0
        exp_ai_agree = 0
        exp_farm_agree = 0
    elif action == "relabel" and corrected_label:
        new_status = "verified"
        final_label = corrected_label.strip().lower().replace(" ", "_")
        final_reward = REWARD_STANDARD
        exp_ai_agree = 1 if (final_label == ai_pred) else 0
        exp_farm_agree = 1 if (final_label == claimed) else 0
    else:  # approve
        new_status = "verified"
        final_label = claimed
        final_reward = rec["reward"]  # keeps reserved bounty
        exp_ai_agree = 1 if (final_label == ai_pred) else 0
        exp_farm_agree = 1

    with conn:
        cursor.execute("""
            UPDATE contributions
            SET status = ?,
                reward = ?,
                verified_by = ?,
                verified_at = ?,
                verified_label = ?,
                expert_notes = ?,
                expert_role = ?,
                expert_source = ?,
                expert_ai_agreement = ?,
                expert_farmer_agreement = ?
            WHERE id = ?
        """, (
            new_status,
            final_reward,
            verified_by,
            now_ts,
            final_label,
            expert_notes or f"Diagnosed and certified by {verified_by}",
            expert_role,
            expert_source,
            exp_ai_agree,
            exp_farm_agree,
            contrib_id
        ))
    conn.close()

    return {
        "success": True,
        "id": contrib_id,
        "action": action,
        "new_status": new_status,
        "credited_reward": final_reward,
        "verified_label": final_label,
        "ai_predicted_label": ai_pred,
        "triangulation": {
            "farmer_claim": claimed,
            "ai_prediction": ai_pred,
            "expert_verdict": final_label,
            "expert_matches_ai": bool(exp_ai_agree),
            "expert_matches_farmer": bool(exp_farm_agree)
        },
        "verified_by": verified_by,
        "verified_at": now_ts
    }


# ── Farmer Wallet & Ledger ───────────────────────────────────────────────────
def get_farmer_wallet(farmer_id: str, db_path: str = DB_PATH_DEFAULT) -> Dict[str, Any]:
    """Retrieves farmer's verified spendable balance, pending review balance, and payout status."""
    init_contrib_db(db_path)
    conn = get_contrib_db(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            COALESCE(SUM(CASE WHEN status = 'verified' THEN reward ELSE 0.0 END), 0.0) as verified_balance,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN reward ELSE 0.0 END), 0.0) as pending_balance,
            COUNT(CASE WHEN status = 'verified' THEN 1 END) as count_verified,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as count_pending,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as count_rejected,
            COUNT(*) as count_total
        FROM contributions
        WHERE farmer_id = ?
    """, (farmer_id,))
    row = cursor.fetchone()
    conn.close()

    v_bal = float(row["verified_balance"])
    p_bal = float(row["pending_balance"])

    return {
        "farmer_id": farmer_id,
        "verified_balance": v_bal,
        "pending_balance": p_bal,
        "count_verified": int(row["count_verified"]),
        "count_pending": int(row["count_pending"]),
        "count_rejected": int(row["count_rejected"]),
        "count_total": int(row["count_total"]),
        "payout_threshold": PAYOUT_THRESHOLD,
        "payout_eligible": (v_bal >= PAYOUT_THRESHOLD)
    }


def get_farmer_history(farmer_id: str, db_path: str = DB_PATH_DEFAULT) -> List[Dict[str, Any]]:
    """Retrieves complete itemized activity ledger for a farmer."""
    init_contrib_db(db_path)
    conn = get_contrib_db(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, crop, claimed_label, ai_predicted_label, verified_label,
               district, timestamp, status, reward, verified_by, verified_at, expert_notes
        FROM contributions
        WHERE farmer_id = ?
        ORDER BY id DESC
    """, (farmer_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_pending_queue(db_path: str = DB_PATH_DEFAULT) -> List[Dict[str, Any]]:
    """Returns submissions awaiting expert review."""
    init_contrib_db(db_path)
    conn = get_contrib_db(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, farmer_id, crop, claimed_label, ai_predicted_label, ai_confidence,
               ai_severity_grade, district, timestamp, cluster_id, laplacian_var,
               reward, filename
        FROM contributions
        WHERE status = 'pending'
        ORDER BY id ASC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


# ── Administrator Analytics & Model Evaluation ────────────────────────────────
def get_admin_analytics(db_path: str = DB_PATH_DEFAULT) -> Dict[str, Any]:
    """
    Computes system-level analytics:
    1. Verification throughput and spend.
    2. AI-vs-Expert Agreement Rate (Accuracy of AI against Agronomist ground-truth).
    3. Farmer-vs-Expert Agreement Rate.
    4. Confusion matrix counts.
    """
    init_contrib_db(db_path)
    conn = get_contrib_db(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) as total_submissions,
            COUNT(CASE WHEN status = 'verified' THEN 1 END) as total_verified,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as total_pending,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as total_rejected,
            COALESCE(SUM(CASE WHEN status = 'verified' THEN reward ELSE 0.0 END), 0.0) as total_bounties_paid,
            SUM(CASE WHEN status = 'verified' AND expert_ai_agreement = 1 THEN 1 ELSE 0 END) as ai_expert_agreements,
            SUM(CASE WHEN status = 'verified' AND expert_farmer_agreement = 1 THEN 1 ELSE 0 END) as farmer_expert_agreements
        FROM contributions
    """)
    stats = dict(cursor.fetchone())

    # Calculate agreement rates
    verified_n = stats["total_verified"]
    ai_acc = (stats["ai_expert_agreements"] / verified_n * 100.0) if verified_n > 0 else 0.0
    farmer_acc = (stats["farmer_expert_agreements"] / verified_n * 100.0) if verified_n > 0 else 0.0

    # Crop-wise counts
    cursor.execute("""
        SELECT crop, COUNT(*) as count,
               COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count
        FROM contributions
        GROUP BY crop
    """)
    crop_stats = [dict(r) for r in cursor.fetchall()]

    # Confusion matrix data: (Expert Verified Label vs AI Predicted Label)
    cursor.execute("""
        SELECT crop, verified_label as expert_label, ai_predicted_label as ai_label, COUNT(*) as count
        FROM contributions
        WHERE status = 'verified'
        GROUP BY crop, verified_label, ai_predicted_label
    """)
    confusion_pairs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "overview": stats,
        "ai_accuracy_against_expert": round(ai_acc, 2),
        "farmer_accuracy_against_expert": round(farmer_acc, 2),
        "crops": crop_stats,
        "confusion_matrix": confusion_pairs
    }
