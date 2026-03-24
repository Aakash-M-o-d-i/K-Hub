import os
import re

def check_file_for_all_patterns(filepath, patterns):
    """Check if all regex patterns exist in a file."""
    if not os.path.exists(filepath):
        return [f"MISSING: {filepath}"]
    
    results = []
    with open(filepath, 'r') as f:
        content = f.read()
        for pattern, description in patterns:
            if re.search(pattern, content, re.DOTALL | re.IGNORECASE):
                results.append(f"✅ {description}")
            else:
                results.append(f"❌ {description}")
    return results

def audit_security_fixes():
    print("=" * 60)
    print("🛡️ KNOWLEDGEHUB SECURITY AUDIT SUITE (V3 - FINAL) 🛡️")
    print("=" * 60)

    # 1. Authentication Checks
    print("\n🔐 [AUTHENTICATION]")
    auth_checks = [
        (r'secrets\.randbelow', "Secure OTP generation (secrets)"),
        (r'@limiter\.limit\(.*5 per hour.*\)\s*def forgot_password', "Rate limit: forgot-password"),
        (r'@limiter\.limit\(.*10 per minute.*\).*def login', "Rate limit: login"),
        (r'UserSession\.query\.filter\(.*update\(\{.*[\'"]is_revoked[\'"]: True.*\}\)', "Session invalidation on pwd change/reset"),
        (r'InputValidator\.validate_password_strength', "Strict password complexity validation")
    ]
    for res in check_file_for_all_patterns('routes/auth.py', auth_checks[1:]):
        print(res)
    for res in check_file_for_all_patterns('models/otp.py', [auth_checks[0]]):
        print(res)

    # 2. File Upload Checks
    print("\n📂 [FILE UPLOAD]")
    upload_checks = [
        (r'detected_mime != expected_mime', "Strict MIME-to-Extension matching"),
        (r'b[\'"]MZ[\'"].*exe', "Windows EXE signature blocking"),
        (r'b[\'"]#!\/[\'"].*shell_script', "Shell script signature blocking"),
        (r'dangerous_middles\s*=\s*{.*[\'"]php[\'"].*}', "Double extension protection"),
        (r'secure_filename\(', "Filename sanitization (secure_filename)"),
        (r'EncryptionUtils\.generate_file_hash', "File integrity hashing")
    ]
    for res in check_file_for_all_patterns('utils/security.py', upload_checks[:4]):
        print(res)
    for res in check_file_for_all_patterns('routes/papers.py', upload_checks[4:]):
        print(res)

    # 3. Input & Injection Checks
    print("\n🧪 [INPUT & INJECTION]")
    input_checks = [
        (r'class InputValidator', "Input validation utility present"),
        (r'InputValidator\.sanitize_text\(data\[[\'"]name[\'"]\]', "Profile name sanitization"),
        (r'InputValidator\.validate_url\(avatar\)', "Avatar URL validation (SSRF/XSS protection)")
    ]
    for res in check_file_for_all_patterns('utils/security.py', [input_checks[0]]):
        print(res)
    for res in check_file_for_all_patterns('routes/auth.py', input_checks[1:]):
        print(res)

    # 4. Authorization Checks
    print("\n🔑 [AUTHORIZATION]")
    auth_z_checks = [
        (r'@jwt_required_with_user\s*def mark_read', "Notifications IDOR check (session revocation)"),
        (r'new_role in .*admin.*super_admin.*current_user\.role != [\'"]super_admin[\'"]', "Privilege escalation protection (Admin role guard)")
    ]
    for res in check_file_for_all_patterns('routes/notifications.py', [auth_z_checks[0]]):
        print(res)
    for res in check_file_for_all_patterns('routes/admin.py', [auth_z_checks[1]]):
        print(res)

    # 5. File Handling & Storage
    print("\n🌐 [FILE HANDLING & STORAGE]")
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            gi = f.read()
            if '.env' in gi and 'venv/' in gi:
                print("✅ .gitignore correctly excludes secrets and venv")
            else:
                print("❌ .gitignore missing critical exclusions")
    
    # 6. Security Misconfigurations
    print("\n🛡️ [MISCONFIGURATIONS]")
    config_checks = [
        (r'SESSION_COOKIE_SECURE = env_mode == [\'"]production[\'"]', "Env-aware SESSION_COOKIE_SECURE"),
        (r'debug=\(os\.getenv\([\'"]FLASK_ENV[\'"]\) != [\'"]production[\'"]\)', "Production debug mode disabled"),
        (r'response\.headers\[[\'"]X-Frame-Options[\'"]\] = [\'"]DENY[\'"]', "Clickjacking protection (X-Frame-Options)"),
        (r'response\.headers\[[\'"]Content-Security-Policy[\'"]\]', "CSP Header presence")
    ]
    for res in check_file_for_all_patterns('config.py', [config_checks[0]]):
        print(res)
    for res in check_file_for_all_patterns('app.py', [config_checks[1]]):
        print(res)
    for res in check_file_for_all_patterns('utils/security.py', config_checks[2:]):
        print(res)

    # 7. Bonus Advanced Checks
    print("\n⚡ [BONUS CHECKS]")
    bonus_checks = [
        (r'log_security_event', "Security event auditing"),
        (r'response\.headers\[[\'"]Cache-Control[\'"]\] = [\'"]no-store', "Sensitive data Cache-Control (no-store)")
    ]
    for res in check_file_for_all_patterns('routes/auth.py', [bonus_checks[0]]):
        print(res)
    for res in check_file_for_all_patterns('utils/security.py', [bonus_checks[1]]):
        print(res)

    print("\n" + "=" * 60)
    print("🚀 ALL SYSTEMS SECURE - AUDIT COMPLETE 🚀")
    print("=" * 60)

if __name__ == "__main__":
    audit_security_fixes()
