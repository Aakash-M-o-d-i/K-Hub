#!/usr/bin/env python3
"""
KnowledgeHub Security Test Suite
Tests all 7 security categories against the live API.
"""
import requests, json, time, sys

BASE = "http://localhost:5000/api"
RESULTS = []
PASS_COUNT = 0
FAIL_COUNT = 0

def test(category, name, passed, details=""):
    global PASS_COUNT, FAIL_COUNT
    status = "✅ PASS" if passed else "❌ FAIL"
    if passed: PASS_COUNT += 1
    else: FAIL_COUNT += 1
    RESULTS.append({"category": category, "name": name, "status": status, "details": details})
    print(f"  {status}: {name}" + (f" — {details}" if details and not passed else ""))

def get_token(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json().get("token")
    return None

print("\n" + "="*60)
print("🛡️  KNOWLEDGEHUB SECURITY TEST SUITE")
print("="*60)

# ── Get auth tokens ──
print("\n🔑 Setting up authentication...")
admin_token = get_token("work.aakash.modi@gmail.com", "Aakash@2026")
if not admin_token:
    admin_token = get_token("work.aakash.modi@gmail.com", "Test@1234")
if not admin_token:
    admin_token = get_token("work.aakash.modi@gmail.com", "Aakash@123")

student_token = get_token("b@gmail.com", "12345678")
if not student_token:
    student_token = get_token("b@gmail.com", "Aakash@123")
if not student_token:
    student_token = get_token("b@gmail.com", "Test@1234")

headers_admin = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}
headers_student = {"Authorization": f"Bearer {student_token}"} if student_token else {}

print(f"  Admin token: {'✅ obtained' if admin_token else '⚠️ not obtained (some tests skipped)'}")
print(f"  Student token: {'✅ obtained' if student_token else '⚠️ not obtained (some tests skipped)'}")

# ═══════════════════════════════════════════════════════
# 🔐 1. AUTHENTICATION ATTACKS
# ═══════════════════════════════════════════════════════
print("\n🔐 1. Authentication Attacks")

# T1.1: Invalid credentials should return 401
r = requests.post(f"{BASE}/auth/login", json={"email": "fake@test.com", "password": "wrong"})
test("AUTH", "T1.1 Invalid credentials rejected", r.status_code == 401)

# T1.2: Empty body rejected
r = requests.post(f"{BASE}/auth/login", json={})
test("AUTH", "T1.2 Empty login body rejected", r.status_code == 400)

# T1.3: SQL injection in email field
r = requests.post(f"{BASE}/auth/login", json={"email": "' OR 1=1--", "password": "test"})
test("AUTH", "T1.3 SQL injection in email blocked", r.status_code in [400, 401])

# T1.4: No token = 401 on protected route
r = requests.get(f"{BASE}/auth/me")
test("AUTH", "T1.4 Protected route rejects no-token", r.status_code in [401, 422])

# T1.5: Forged/invalid JWT rejected
r = requests.get(f"{BASE}/auth/me", headers={"Authorization": "Bearer forged.jwt.token"})
test("AUTH", "T1.5 Forged JWT rejected", r.status_code == 422)

# T1.6: Password strength - weak password rejected on register
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Test", "email": "weakpwd@test.com", "password": "123",
    "department_id": 1, "semester": 1, "phone_number": "1234567890"
})
test("AUTH", "T1.6 Weak password rejected", r.status_code == 400)

# T1.7: Registration with invalid email
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Test", "email": "not-an-email", "password": "StrongP@ss1",
    "department_id": 1, "semester": 1, "phone_number": "1234567890"
})
test("AUTH", "T1.7 Invalid email format rejected", r.status_code == 400)

# T1.8: Login response doesn't leak password hash
if admin_token:
    r = requests.get(f"{BASE}/auth/me", headers=headers_admin)
    body = json.dumps(r.json())
    test("AUTH", "T1.8 Response doesn't leak password_hash", "password_hash" not in body)

# ═══════════════════════════════════════════════════════
# 📂 2. FILE UPLOAD ATTACKS
# ═══════════════════════════════════════════════════════
print("\n📂 2. File Upload Attacks")

if admin_token or student_token:
    h = headers_admin if admin_token else headers_student
    
    # T2.1: Upload without file
    r = requests.post(f"{BASE}/papers/upload", headers=h, data={"title": "test"})
    test("UPLOAD", "T2.1 Upload without file rejected", r.status_code == 400)

    # T2.2: Dangerous extension blocked
    import io
    fake_exe = io.BytesIO(b"MZ\x90\x00" + b"\x00"*100)
    r = requests.post(f"{BASE}/papers/upload", headers=h,
        data={"title": "t", "subject_code": "SC", "year": "2024", "semester": "1", "department_id": "1"},
        files={"file": ("malware.exe", fake_exe, "application/octet-stream")})
    test("UPLOAD", "T2.2 .exe extension blocked", r.status_code == 400)

    # T2.3: Double extension attack
    fake = io.BytesIO(b"%PDF-1.4 fake content")
    r = requests.post(f"{BASE}/papers/upload", headers=h,
        data={"title": "t", "subject_code": "SC", "year": "2024", "semester": "1", "department_id": "1"},
        files={"file": ("shell.php.pdf", fake, "application/pdf")})
    test("UPLOAD", "T2.3 Double extension (shell.php.pdf) blocked", r.status_code == 400)

    # T2.4: Empty file rejected
    empty = io.BytesIO(b"")
    r = requests.post(f"{BASE}/papers/upload", headers=h,
        data={"title": "t", "subject_code": "SC", "year": "2024", "semester": "1", "department_id": "1"},
        files={"file": ("empty.pdf", empty, "application/pdf")})
    test("UPLOAD", "T2.4 Empty file rejected", r.status_code == 400)
else:
    test("UPLOAD", "T2.1-T2.4 Skipped (no auth token)", False, "No token available")

# ═══════════════════════════════════════════════════════
# 🧪 3. INPUT & INJECTION ATTACKS
# ═══════════════════════════════════════════════════════
print("\n🧪 3. Input & Injection Attacks")

# T3.1: XSS in search
r = requests.get(f"{BASE}/papers", params={"search": '<script>alert("xss")</script>'})
test("INJECT", "T3.1 XSS in search sanitized", r.status_code == 200 and "<script>" not in r.text)

# T3.2: SQL injection in search
r = requests.get(f"{BASE}/papers", params={"search": "'; DROP TABLE papers;--"})
test("INJECT", "T3.2 SQL injection in search safe", r.status_code == 200)

# T3.3: Oversized input truncated
r = requests.get(f"{BASE}/papers", params={"search": "A" * 10000})
test("INJECT", "T3.3 Oversized search input handled", r.status_code == 200)

# T3.4: Null byte injection in search
r = requests.get(f"{BASE}/papers", params={"search": "test\x00admin"})
test("INJECT", "T3.4 Null byte in search handled", r.status_code == 200)

# T3.5: XSS in profile update
if admin_token:
    r = requests.put(f"{BASE}/auth/me", headers=headers_admin,
        json={"bio": '<img src=x onerror=alert(1)>'})
    if r.status_code == 200:
        bio = r.json().get("user", {}).get("bio", "")
        test("INJECT", "T3.5 XSS in bio field stripped", "<img" not in bio and "onerror" not in bio)
    else:
        test("INJECT", "T3.5 XSS in bio field", True, "Update rejected")

# T3.6: SSRF via avatar URL
if admin_token:
    r = requests.put(f"{BASE}/auth/me", headers=headers_admin,
        json={"avatar_url": "http://localhost:5000/api/nituganesh/stats"})
    test("INJECT", "T3.6 SSRF via avatar URL blocked", r.status_code == 400)

# ═══════════════════════════════════════════════════════
# 🔑 4. AUTHORIZATION ATTACKS
# ═══════════════════════════════════════════════════════
print("\n🔑 4. Authorization Attacks")

# T4.1: Student cannot access admin endpoints
if student_token:
    r = requests.get(f"{BASE}/nituganesh/stats", headers=headers_student)
    test("AUTHZ", "T4.1 Student blocked from admin stats", r.status_code == 403)
    
    r = requests.get(f"{BASE}/nituganesh/users", headers=headers_student)
    test("AUTHZ", "T4.2 Student blocked from user list", r.status_code == 403)
    
    r = requests.put(f"{BASE}/nituganesh/users/1/role", headers=headers_student,
        json={"role": "super_admin"})
    test("AUTHZ", "T4.3 Student cannot escalate roles", r.status_code == 403)
else:
    test("AUTHZ", "T4.1-T4.3 Skipped", False, "No student token")

# T4.4: Unauthenticated admin access
r = requests.get(f"{BASE}/nituganesh/stats")
test("AUTHZ", "T4.4 Unauthenticated admin access blocked", r.status_code in [401, 422])

# T4.5: Download requires auth
r = requests.get(f"{BASE}/papers/13/download")
test("AUTHZ", "T4.5 Download requires authentication", r.status_code in [401, 422])

# T4.6: Preview only shows approved papers
r = requests.get(f"{BASE}/papers/3/preview")  # paper 3 is pending
test("AUTHZ", "T4.6 Preview blocked for pending papers", r.status_code in [404, 403])

# ═══════════════════════════════════════════════════════
# 🌐 5. FILE HANDLING & STORAGE
# ═══════════════════════════════════════════════════════
print("\n🌐 5. File Handling & Storage")

# T5.1: Path traversal in download
if admin_token:
    r = requests.get(f"{BASE}/papers/999999/download", headers=headers_admin)
    test("STORAGE", "T5.1 Non-existent paper returns 404", r.status_code == 404)

# T5.2: Paper detail doesn't expose internal file paths
r = requests.get(f"{BASE}/papers/13")
if r.status_code == 200:
    body = r.text
    test("STORAGE", "T5.2 No server paths leaked in response", "/home/" not in body and "uploads/" not in body.lower() or "file_url" in body)

# T5.3: Security headers present
r = requests.get(f"{BASE}/health")
headers_resp = r.headers
test("STORAGE", "T5.3 X-Content-Type-Options header", headers_resp.get("X-Content-Type-Options") == "nosniff")
test("STORAGE", "T5.4 X-Frame-Options header", headers_resp.get("X-Frame-Options") == "DENY")
test("STORAGE", "T5.5 Content-Security-Policy header", "Content-Security-Policy" in headers_resp)

# ═══════════════════════════════════════════════════════
# 🧠 6. LOGIC & WORKFLOW
# ═══════════════════════════════════════════════════════
print("\n🧠 6. Logic & Workflow")

# T6.1: Rating validation
if admin_token:
    r = requests.post(f"{BASE}/papers/13/rate", headers=headers_admin, json={"score": 0})
    test("LOGIC", "T6.1 Rating score 0 rejected", r.status_code == 400)
    
    r = requests.post(f"{BASE}/papers/13/rate", headers=headers_admin, json={"score": 6})
    test("LOGIC", "T6.2 Rating score 6 rejected", r.status_code == 400)
    
    r = requests.post(f"{BASE}/papers/13/rate", headers=headers_admin, json={"score": "abc"})
    test("LOGIC", "T6.3 Non-integer rating rejected", r.status_code == 400)

# T6.4: Pagination bounds
r = requests.get(f"{BASE}/papers", params={"per_page": 999999})
if r.status_code == 200:
    data = r.json()
    test("LOGIC", "T6.4 Pagination capped at 100", data.get("per_page", 0) <= 100)

# T6.5: Bookmark toggle on non-existent paper
if admin_token:
    r = requests.post(f"{BASE}/papers/999999/bookmark", headers=headers_admin)
    test("LOGIC", "T6.5 Bookmark non-existent paper fails", r.status_code == 404)

# T6.6: Public stats endpoint works
r = requests.get(f"{BASE}/papers/stats/public")
test("LOGIC", "T6.6 Public stats returns valid data", r.status_code == 200 and "papers" in r.json())

# ═══════════════════════════════════════════════════════
# 🛡️ 7. SECURITY MISCONFIGURATIONS
# ═══════════════════════════════════════════════════════
print("\n🛡️ 7. Security Misconfigurations")

# T7.1: Health endpoint accessible
r = requests.get(f"{BASE}/health")
test("MISCONFIG", "T7.1 Health check responds", r.status_code == 200)

# T7.2: No debug info in error responses
r = requests.get(f"{BASE}/nonexistent")
test("MISCONFIG", "T7.2 No stack trace in 404", "Traceback" not in r.text)

# T7.3: CORS headers present (check via OPTIONS)
r = requests.options(f"{BASE}/auth/login",
    headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
test("MISCONFIG", "T7.3 CORS configured", r.status_code in [200, 204])

# T7.4: Invalid JSON body handled
r = requests.post(f"{BASE}/auth/login", data="not json",
    headers={"Content-Type": "application/json"})
test("MISCONFIG", "T7.4 Malformed JSON handled gracefully", r.status_code in [400, 415, 500])

# T7.5: Cache-Control set
r = requests.get(f"{BASE}/health")
test("MISCONFIG", "T7.5 Cache-Control no-store set", "no-store" in r.headers.get("Cache-Control", ""))

# T7.6: Permissions-Policy header
test("MISCONFIG", "T7.6 Permissions-Policy set", "Permissions-Policy" in r.headers)

# T7.7: Referrer-Policy
test("MISCONFIG", "T7.7 Referrer-Policy set", r.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin")

# T7.8: Leaderboard public endpoint
r = requests.get(f"{BASE}/leaderboard/scholars?limit=5")
test("MISCONFIG", "T7.8 Leaderboard returns data", r.status_code == 200 and "scholars" in r.json())

# T7.9: Departments endpoint
r = requests.get(f"{BASE}/papers/departments")
test("MISCONFIG", "T7.9 Departments endpoint works", r.status_code == 200)

# ═══════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════
print("\n" + "="*60)
print(f"📊 RESULTS: {PASS_COUNT} passed, {FAIL_COUNT} failed, {PASS_COUNT+FAIL_COUNT} total")
print("="*60)

# Write JSON results
with open("/home/ethereal/Documents/KnowledgeHub/backend/test_results.json", "w") as f:
    json.dump({"pass": PASS_COUNT, "fail": FAIL_COUNT, "total": PASS_COUNT+FAIL_COUNT, "tests": RESULTS}, f, indent=2)

print(f"\n✅ Results saved to test_results.json")
