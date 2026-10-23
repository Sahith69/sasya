"""
test_bounty.py - Test Suite for Community Contribution, Expert Verification & AI Triangulation
AgriTrust AI / hackcache
"""

import sys
import os
import shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src.bounty_engine import (
    init_contrib_db,
    submit_contribution,
    verify_contribution,
    get_farmer_wallet,
    get_farmer_history,
    get_pending_queue,
    get_admin_analytics,
    DB_PATH_DEFAULT,
    POOL_DIR_DEFAULT
)
from engine import CropVisionEngine

def run_bounty_verification():
    print("=" * 70)
    print("👛 TESTING COMMUNITY CONTRIBUTIONS, EXPERT VERIFY & AI TRIANGULATION")
    print("=" * 70)

    # Use clean test database
    test_db = os.path.join(os.path.dirname(__file__), "data", "test_bounty.db")
    test_pool = os.path.join(os.path.dirname(__file__), "data", "test_pool")
    if os.path.exists(test_db):
        os.remove(test_db)
    if os.path.exists(test_pool):
        shutil.rmtree(test_pool)

    init_contrib_db(test_db)
    engine = CropVisionEngine()

    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    areca_path = os.path.join(samples_dir, "sample_arecanut.jpg")
    paddy_path = os.path.join(samples_dir, "sample_paddy.jpg")
    tomato_path = os.path.join(samples_dir, "sample_tomato.jpg")

    with open(areca_path, "rb") as f:
        areca_bytes = f.read()
    with open(paddy_path, "rb") as f:
        paddy_bytes = f.read()
    with open(tomato_path, "rb") as f:
        tomato_bytes = f.read()

    # ── TEST 1: Consent Enforcement ───────────────────────────────────────────
    print("\n[TEST 1] Consent Gate:")
    res_no_consent = submit_contribution(
        farmer_id="farmer_KA_101",
        crop="Arecanut",
        district="Dakshina Kannada",
        claimed_label="mahali_koleroga",
        consent_given=False,
        img_bytes=areca_bytes,
        filename="areca_leaf.jpg",
        db_path=test_db,
        pool_dir=test_pool,
        engine_instance=engine
    )
    print(f"  Consent=False -> Valid: {res_no_consent['valid']}, Error: {res_no_consent.get('error')}")
    assert res_no_consent["valid"] is False
    print("  ✅ Mandatory consent gate verified!")

    # ── TEST 2: Farmer Submissions & Automated AI Diagnosis ───────────────────
    print("\n[TEST 2] Farmer Submissions & Real-time AI Diagnosis:")
    # Submission A: Arecanut
    res_areca = submit_contribution(
        farmer_id="farmer_KA_101",
        crop="Arecanut",
        district="Dakshina Kannada",
        claimed_label="yellow_leaf_disease",
        consent_given=True,
        img_bytes=areca_bytes,
        filename="field_arecanut_01.jpg",
        db_path=test_db,
        pool_dir=test_pool,
        engine_instance=engine
    )
    print(f"  Submission #1 (Arecanut):")
    print(f"    - Claimed Label: {res_areca['claimed_label']}")
    print(f"    - AI Prediction: {res_areca['ai_diagnosis']['predicted_label']} ({res_areca['ai_diagnosis']['confidence']*100:.1f}%)")
    print(f"    - AI Matches Farmer: {res_areca['ai_diagnosis']['matches_farmer_claim']}")
    print(f"    - Reserved Bounty: ₹{res_areca['reserved_bounty']:.2f} (Status: {res_areca['status']})")
    assert res_areca["valid"] is True
    assert res_areca["status"] == "pending"

    # Submission B: Tomato
    res_tomato = submit_contribution(
        farmer_id="farmer_KA_101",
        crop="Tomato",
        district="Kolar",
        claimed_label="bacterial_spot",
        consent_given=True,
        img_bytes=tomato_bytes,
        filename="field_tomato_01.jpg",
        db_path=test_db,
        pool_dir=test_pool,
        engine_instance=engine
    )
    print(f"  Submission #2 (Tomato):")
    print(f"    - Claimed Label: {res_tomato['claimed_label']}")
    print(f"    - AI Prediction: {res_tomato['ai_diagnosis']['predicted_label']} ({res_tomato['ai_diagnosis']['confidence']*100:.1f}%)")
    print(f"    - Reserved Bounty: ₹{res_tomato['reserved_bounty']:.2f}")
    assert res_tomato["valid"] is True

    # ── TEST 3: Duplicate Rejection ───────────────────────────────────────────
    print("\n[TEST 3] Duplicate Rejection Gate:")
    res_dup = submit_contribution(
        farmer_id="farmer_KA_101",
        crop="Arecanut",
        district="Dakshina Kannada",
        claimed_label="yellow_leaf_disease",
        consent_given=True,
        img_bytes=areca_bytes,
        filename="another_name.jpg",
        db_path=test_db,
        pool_dir=test_pool,
        engine_instance=engine
    )
    print(f"  Duplicate Upload -> Valid: {res_dup['valid']}, Error: {res_dup.get('error')}")
    assert res_dup["valid"] is False
    assert "Duplicate photo" in res_dup["error"]
    print("  ✅ Perceptual deduplication verified!")

    # ── TEST 4: Initial Wallet Status (Pending Balance) ───────────────────────
    print("\n[TEST 4] Wallet Check Before Expert Verification:")
    w_initial = get_farmer_wallet("farmer_KA_101", db_path=test_db)
    print(f"  Farmer: {w_initial['farmer_id']}")
    print(f"  Verified (Spendable) Balance: ₹{w_initial['verified_balance']:.2f}")
    print(f"  Pending Escrow Balance:       ₹{w_initial['pending_balance']:.2f}")
    print(f"  Pending Submissions Count:    {w_initial['count_pending']}")
    assert w_initial["verified_balance"] == 0.0
    assert w_initial["pending_balance"] >= 2.0  # ₹1 each for tomato & arecanut
    print("  ✅ Escrow wallet logic verified!")

    # ── TEST 5: Expert Verification & AI Cross-Check ──────────────────────────
    print("\n[TEST 5] Expert Desk Verification & Cross-Checking:")
    pending_queue = get_pending_queue(db_path=test_db)
    print(f"  Pending Queue Count: {len(pending_queue)} item(s) awaiting review")

    # Action 1: Expert Approves Submission #1 (Arecanut)
    ver_areca = verify_contribution(
        contrib_id=res_areca["id"],
        verified_by="Dr. Subrahmanya Bhat (CPCRI Senior Pathologist)",
        action="approve",
        expert_notes="Classic yellow leaf disease symptoms matching field survey protocol.",
        db_path=test_db
    )
    print(f"  Verifying Item #{res_areca['id']} (Action: APPROVE):")
    print(f"    - Status: {ver_areca['new_status']}, Bounty Credited: ₹{ver_areca['credited_reward']:.2f}")
    print(f"    - Expert Verdict: {ver_areca['verified_label']}")
    print(f"    - Expert matches AI: {ver_areca['triangulation']['expert_matches_ai']}")
    print(f"    - Expert matches Farmer: {ver_areca['triangulation']['expert_matches_farmer']}")
    assert ver_areca["new_status"] == "verified"
    assert ver_areca["triangulation"]["expert_matches_ai"] is True

    # Action 2: Expert Relabels Submission #2 (Tomato)
    ver_tomato = verify_contribution(
        contrib_id=res_tomato["id"],
        verified_by="Dr. Manjunath (IIHR Tomato Specialist)",
        action="relabel",
        corrected_label="early_blight",
        expert_notes="Target-board concentric rings indicate early blight, corrected from bacterial spot.",
        db_path=test_db
    )
    print(f"  Verifying Item #{res_tomato['id']} (Action: RELABEL):")
    print(f"    - Status: {ver_tomato['new_status']}, Bounty Credited: ₹{ver_tomato['credited_reward']:.2f}")
    print(f"    - Corrected Label: {ver_tomato['verified_label']}")
    print(f"    - Expert matches AI: {ver_tomato['triangulation']['expert_matches_ai']}")
    print(f"    - Expert matches Farmer: {ver_tomato['triangulation']['expert_matches_farmer']}")
    assert ver_tomato["new_status"] == "verified"
    assert ver_tomato["verified_label"] == "early_blight"

    # ── TEST 6: Wallet Check After Verification ───────────────────────────────
    print("\n[TEST 6] Wallet Check After Expert Verification:")
    w_final = get_farmer_wallet("farmer_KA_101", db_path=test_db)
    print(f"  Verified (Spendable) Balance: ₹{w_final['verified_balance']:.2f}")
    print(f"  Pending Escrow Balance:       ₹{w_final['pending_balance']:.2f}")
    print(f"  Approved Count:               {w_final['count_verified']}")
    assert w_final["verified_balance"] >= 2.0
    assert w_final["pending_balance"] == 0.0
    print("  ✅ Wallet balances updated from pending to verified upon agronomist approval!")

    # ── TEST 7: Administrator Analytics & AI Agreement Matrix ─────────────────
    print("\n[TEST 7] Administrator Analytics & Model-vs-Expert Matrix:")
    analytics = get_admin_analytics(db_path=test_db)
    print(f"  Total Submissions:            {analytics['overview']['total_submissions']}")
    print(f"  Total Verified:               {analytics['overview']['total_verified']}")
    print(f"  Total Bounties Paid:          ₹{analytics['overview']['total_bounties_paid']:.2f}")
    print(f"  AI Accuracy vs Expert:        {analytics['ai_accuracy_against_expert']}%")
    print(f"  Farmer Accuracy vs Expert:    {analytics['farmer_accuracy_against_expert']}%")
    print(f"  Confusion Matrix Pairs:       {analytics['confusion_matrix']}")
    assert analytics['overview']['total_verified'] == 2
    print("  ✅ Admin analytics and agreement metrics verified!")

    print("\n" + "=" * 70)
    print("🎉 All Community Contribution, Expert Verification & Triangulation Tests Passed!")
    print("=" * 70)

if __name__ == "__main__":
    run_bounty_verification()
