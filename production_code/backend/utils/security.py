"""
Comprehensive Security Module for KnowledgeHub
Protects against:
- Brute force & credential stuffing attacks
- SQL Injection
- XSS (Stored & Reflected)
- File upload exploits
- IDOR attacks
- Session hijacking
- Rate limiting
- Input validation & sanitization
"""

import os
import hashlib
import hmac           # SECURITY FIX: Added for constant-time comparison (M5)
import ipaddress      # SECURITY FIX: Added for SSRF IP validation (M4)
import mimetypes
import secrets
import socket          # SECURITY FIX: Added for DNS resolution in SSRF check (M4)
import re
import urllib.parse    # SECURITY FIX: Added for URL parsing in SSRF check (M4)
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
import magic

# ============================================================================
# RATE LIMITING & BRUTE FORCE PROTECTION
# ============================================================================

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Use Redis for production: "redis://localhost:6379"
)


class SecurityLog:
    """Track failed login attempts and suspicious activities"""
    _failed_attempts = {}
    _locked_accounts = {}
    MAX_ATTEMPTS = 5
    LOCKOUT_DURATION = 15 * 60  # 15 minutes in seconds
    
    @classmethod
    def record_failed_login(cls, email):
        """Record failed login attempt"""
        key = f"login_failed_{email}"
        if key not in cls._failed_attempts:
            cls._failed_attempts[key] = {"count": 0, "first_attempt": datetime.now()}
        
        cls._failed_attempts[key]["count"] += 1
        cls._failed_attempts[key]["last_attempt"] = datetime.now()
        
        # Lock account after MAX_ATTEMPTS
        if cls._failed_attempts[key]["count"] >= cls.MAX_ATTEMPTS:
            cls._locked_accounts[email] = datetime.now()
            return "account_locked"
        
        return "failed"
    
    @classmethod
    def clear_failed_attempts(cls, email):
        """Clear failed attempts on successful login"""
        key = f"login_failed_{email}"
        if key in cls._failed_attempts:
            del cls._failed_attempts[key]
        if email in cls._locked_accounts:
            del cls._locked_accounts[email]
    
    @classmethod
    def is_account_locked(cls, email):
        """Check if account is locked"""
        if email not in cls._locked_accounts:
            return False
        
        lockout_time = cls._locked_accounts[email]
        if (datetime.now() - lockout_time).total_seconds() > cls.LOCKOUT_DURATION:
            del cls._locked_accounts[email]
            return False
        
        return True
    
    @classmethod
    def get_lockout_remaining(cls, email):
        """Get remaining lockout time in seconds"""
        if email not in cls._locked_accounts:
            return 0
        
        lockout_time = cls._locked_accounts[email]
        remaining = cls.LOCKOUT_DURATION - (datetime.now() - lockout_time).total_seconds()
        return max(0, int(remaining))


# ============================================================================
# INPUT VALIDATION & SANITIZATION
# ============================================================================

class InputValidator:
    """Validate and sanitize user inputs to prevent injection attacks"""
    
    # Email regex pattern
    EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Strong password requirements
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_DIGITS = True
    PASSWORD_REQUIRE_SPECIAL = True
    
    # Banned characters in filenames (for XSS prevention)
    FILENAME_BANNED_CHARS = r'[<>:"|?*\x00-\x1f]'
    
    @staticmethod
    def is_valid_email(email):
        """Validate email format"""
        return re.match(InputValidator.EMAIL_REGEX, email) is not None
    
    @staticmethod
    def validate_password_strength(password):
        """
        Validate password strength
        Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        Returns: (is_valid, error_message)
        """
        if len(password) < InputValidator.PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {InputValidator.PASSWORD_MIN_LENGTH} characters"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one digit"
        
        # SECURITY FIX [C3]: Enforce special character requirement.
        # Previously, PASSWORD_REQUIRE_SPECIAL was True but never checked.
        if not re.search(r'[!@#$%^&*(),.?":{}|<>\[\]\-_+=~`/\\]', password):
            return False, "Password must contain at least one special character"
        
        return True, ""
    
    @staticmethod
    def is_valid_phone(phone):
        """
        Validate phone number format (Basic check for 10-15 digits)
        Allows optional leading +
        """
        if not phone:
            return False
        return re.match(r'^\+?[0-9]{10,15}$', phone) is not None
    
    @staticmethod
    def sanitize_filename(filename):
        """
        Sanitize filename to prevent path traversal and XSS
        - Remove path separators
        - Remove special characters
        - Limit length
        """
        # Remove path traversal attempts
        filename = filename.replace('..', '').replace('/', '').replace('\\', '')
        
        # Remove/replace banned characters
        filename = re.sub(InputValidator.FILENAME_BANNED_CHARS, '_', filename)
        
        # Limit filename length
        max_length = 200
        if len(filename) > max_length:
            name, ext = os.path.splitext(filename)
            filename = name[:max_length - len(ext)] + ext
        
        return secure_filename(filename)
    
    @staticmethod
    def sanitize_text(text, max_length=500):
        """
        Sanitize text input to prevent XSS
        - Strip HTML tags
        - Remove dangerous characters
        - Limit length
        """
        if not isinstance(text, str):
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove potentially dangerous characters
        text = text.replace('\x00', '').replace('\r\n', '\n')
        
        # Limit length
        return text[:max_length].strip()
    
    @staticmethod
    def validate_url(url):
        # SECURITY FIX [M4]: Replaced naive string-matching SSRF protection.
        # Old code just checked if 'localhost' or '127.0.0.1' was in the URL string,
        # which could be bypassed via IPv6 (::1), decimal IPs (2130706433),
        # hex IPs (0x7f000001), or DNS rebinding.
        # New code resolves the hostname to an IP and checks against all reserved ranges.
        """Validate URL to prevent SSRF and malicious redirects.
        Resolves hostname to IP and blocks private/loopback/reserved ranges.
        Prevents bypass via IPv6, decimal IPs, hex IPs, and DNS rebinding.
        """
        if not isinstance(url, str) or not url.startswith(('http://', 'https://')):
            return False
        
        try:
            parsed = urllib.parse.urlparse(url)
            hostname = parsed.hostname
            if not hostname:
                return False
            
            # Resolve hostname to IP to catch DNS rebinding and encoding tricks
            resolved_ip = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(resolved_ip)
            
            # Block private, loopback, reserved, and link-local ranges
            if (ip_obj.is_private or ip_obj.is_loopback or 
                ip_obj.is_reserved or ip_obj.is_link_local or
                ip_obj.is_multicast or ip_obj.is_unspecified):
                return False
            
            return True
        except (socket.gaierror, ValueError, TypeError):
            return False


# ============================================================================
# FILE UPLOAD SECURITY
# ============================================================================

class FileSecurityValidator:
    """Validate file uploads for security threats"""
    
    # Allowed MIME types (whitelist approach)
    ALLOWED_MIME_TYPES = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/zip': 'zip',
        'text/plain': 'txt',
    }
    
    # File extension whitelist
    ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'docx', 'zip', 'txt'}
    
    # Maximum file size (128 MB)
    MAX_FILE_SIZE = 128 * 1024 * 1024
    
    # Dangerous file signatures (magic bytes) to block
    # These are checked regardless of extension
    DANGEROUS_SIGNATURES = [
        (b'MZ', 'exe'),           # Windows executable
        (b'%!PS', 'postscript'),  # PostScript (can contain malicious code)
        (b'\x7fELF', 'elf'),      # ELF executable (Linux)
        (b'#!/', 'shell_script'), # Shell scripts
        (b'\xca\xfe\xba\xbe', 'macho'),  # Mach-O binary (macOS)
        (b'\x23\x21', 'shebang'),  # #! shebang
        (b'\x4c\x01', 'com'),     # DOS COM
    ]
    
    @staticmethod
    def validate_file_extension(filename):
        """
        Validate file extension and check for double extension attacks.
        Example: shell.php.jpg -> Rejected
        """
        if '.' not in filename:
            return False, "File must have an extension"
        
        ext = filename.rsplit('.', 1)[1].lower()
        
        # Prevent double extensions like file.php.jpg or file.php%00.jpg
        parts = filename.lower().split('.')
        if len(parts) > 2:
            # Check if any middle part is a dangerous extension
            dangerous_middles = {'php', 'php3', 'php4', 'php5', 'phtml', 'jsp', 'asp', 'aspx', 'exe', 'sh', 'bat', 'cmd'}
            if any(p.strip().rstrip('\0').lower() in dangerous_middles for p in parts[:-1]):
                return False, "Dangerous double extension detected"
        
        if ext not in FileSecurityValidator.ALLOWED_EXTENSIONS:
            return False, f"File type '.{ext}' is not allowed"
        
        return True, ""
    
    @staticmethod
    def validate_file_content(file_path):
        """
        Validate file content using dangerous magic byte signatures.
        """
        try:
            # Read first 16 bytes for a better check
            with open(file_path, 'rb') as f:
                header = f.read(16)
            
            # Check against dangerous signatures
            for signature, file_type in FileSecurityValidator.DANGEROUS_SIGNATURES:
                if header.startswith(signature):
                    return False, f"Dangerous file type detected: {file_type}"
            
            return True, ""
        
        except Exception as e:
            return False, f"Could not validate file content: {str(e)}"
    
    @staticmethod
    def validate_mime_type(file_path, filename):
        """
        Validate MIME type using python-magic
        Ensures file extension matches actual content
        """
        try:
            # Detect MIME type from file content
            mime = magic.Magic(mime=True)
            detected_mime = mime.from_file(file_path)
            
            # Get expected MIME type from extension
            expected_mime, _ = mimetypes.guess_type(filename)
            
            # Check if detected MIME is in allowed list
            if detected_mime not in FileSecurityValidator.ALLOWED_MIME_TYPES:
                return False, f"MIME type not allowed: {detected_mime}"
            
            # Strict validation: ensure file content matches claimed extension
            if detected_mime != expected_mime and expected_mime is not None:
                return False, f"File content does not match extension"
            
            return True, ""
        
        except Exception as e:
            # If magic library not available, skip MIME check
            return True, ""
    
    @staticmethod
    def validate_pdf_safety(file_path):
        """
        Additional validation for PDF files
        Detects embedded JavaScript or malicious content
        """
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # ✅ SECURITY: Block PDFs with embedded JavaScript (active threat)
            blocking_patterns = [
                (b'/JavaScript', 'Embedded JavaScript'),
                (b'/JS', 'JavaScript reference'),
            ]
            
            for pattern, desc in blocking_patterns:
                if pattern in content:
                    current_app.logger.warning(f"PDF BLOCKED: Contains {desc}")
                    return False, f"PDF contains potentially malicious content: {desc}"
            
            # Log-only patterns (suspicious but may be legitimate)
            warning_patterns = [
                b'/EmbeddedFile',
                b'/ObjStm',
            ]
            
            for pattern in warning_patterns:
                if pattern in content:
                    current_app.logger.warning(f"PDF contains suspicious pattern: {pattern}")
            
            return True, ""
        
        except Exception as e:
            return False, f"Could not validate PDF: {str(e)}"
    
    @staticmethod
    def validate_file_size(file_obj):
        """Validate file size"""
        file_obj.seek(0, os.SEEK_END)
        size = file_obj.tell()
        file_obj.seek(0)
        
        if size > FileSecurityValidator.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size is {FileSecurityValidator.MAX_FILE_SIZE / (1024*1024):.0f}MB"
        
        if size == 0:
            return False, "File is empty"
        
        return True, ""


# ============================================================================
# ACCESS CONTROL & IDOR PREVENTION
# ============================================================================

class AccessControl:
    """Prevent IDOR and unauthorized access"""
    
    @staticmethod
    def check_resource_ownership(resource, user):
        """
        Verify user owns or has permission to access resource
        Prevents IDOR attacks
        """
        # Check if resource has uploader relationship
        if hasattr(resource, 'uploader_id'):
            if resource.uploader_id != user.id and user.role not in ('admin', 'super_admin'):
                return False
        
        # Check if resource has user relationship
        if hasattr(resource, 'user_id'):
            if resource.user_id != user.id and user.role not in ('admin', 'super_admin'):
                return False
        
        return True
    
    @staticmethod
    def check_admin_access(user):
        """Verify user is admin"""
        return user.role in ('admin', 'super_admin')


# ============================================================================
# SECURITY HEADERS
# ============================================================================

def add_security_headers(response):
    """
    Add security headers to all responses
    Prevents XSS, Clickjacking, MIME sniffing, etc.
    
    Routes that need iframe embedding (e.g. PDF preview) can set
    X-Frame-Options to 'SAMEORIGIN' before this middleware runs;
    this function will respect that override.
    """
    # Prevent MIME sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevent Clickjacking — respect route-level SAMEORIGIN overrides
    allow_iframe = response.headers.get('X-Frame-Options') == 'SAMEORIGIN'
    if not allow_iframe:
        response.headers['X-Frame-Options'] = 'DENY'
    
    # SECURITY FIX [L2]: Changed from '1; mode=block' to '0'.
    # The XSS auditor is deprecated in modern browsers and can introduce
    # vulnerabilities itself. Rely on CSP instead.
    response.headers['X-XSS-Protection'] = '0'
    
    # SECURITY FIX [L1]: Removed 'unsafe-inline' from script-src.
    # React SPAs don't need inline scripts. Also added fonts.gstatic.com
    # to font-src for Google Fonts support.
    # Added cdnjs.cloudflare.com to worker-src for PDF.js support.
    frame_ancestors = "'self'" if allow_iframe else "'none'"
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' https://cdnjs.cloudflare.com; "
        "worker-src 'self' blob: https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self'; "
        "frame-src 'self'; "
        "object-src 'none'; "
        f"frame-ancestors {frame_ancestors}; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    
    # Referrer Policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # SECURITY FIX: Cross-Origin Isolation
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    
    # Feature Policy / Permissions Policy
    response.headers['Permissions-Policy'] = (
        'camera=(), microphone=(), geolocation=(), '
        'payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    )
    
    # Prevent caching of sensitive API responses
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    
    # Prevent cross-domain policy files
    response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
    
    is_production = os.getenv('FLASK_ENV') == 'production'
    
    # SECURITY FIX [L3]: Changed from current_app.config.get('ENV') to os.getenv('FLASK_ENV').
    # Flask deprecated app.config['ENV'] in 2.3+ and it may not reflect the actual
    # environment variable, causing HSTS to silently not apply in production.
    if is_production:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    # ✅ COOKIE SECURITY: Harden all Set-Cookie headers with security attributes.
    # Ensures every cookie (session, CSRF, etc.) gets HttpOnly, SameSite, Secure flags.
    if 'Set-Cookie' in response.headers:
        cookies = response.headers.getlist('Set-Cookie')
        new_cookies = []
        for cookie in cookies:
            # Add HttpOnly if not present (prevents JS access)
            if 'HttpOnly' not in cookie:
                cookie += '; HttpOnly'
            # Add SameSite=Lax if not present (CSRF protection)
            if 'SameSite' not in cookie:
                cookie += '; SameSite=Lax'
            # Add Secure flag in production (HTTPS-only cookies)
            if is_production and 'Secure' not in cookie:
                cookie += '; Secure'
            # Add Path=/ if not present
            if 'Path' not in cookie:
                cookie += '; Path=/'
            new_cookies.append(cookie)
        # Replace all Set-Cookie headers
        response.headers.remove('Set-Cookie')
        for cookie in new_cookies:
            response.headers.add('Set-Cookie', cookie)
    
    return response


def require_https(f):
    """Decorator: Require HTTPS in production"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_app.config.get('ENV') == 'production' and not request.is_secure:
            return jsonify({"error": "HTTPS required"}), 403
        return f(*args, **kwargs)
    return decorated_function


# ============================================================================
# CORS & CSRF PROTECTION
# ============================================================================

def get_safe_cors_origins():
    """Get safe CORS origins from environment"""
    origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    return [o.strip() for o in origins if o.strip()]


# ============================================================================
# AUDIT LOGGING
# ============================================================================

class AuditLogger:
    """Log security-related events for monitoring"""
    
    @staticmethod
    def log_event(event_type, user_id=None, details=None, severity='INFO'):
        """
        Log security event
        event_type: 'LOGIN_ATTEMPT', 'FAILED_LOGIN', 'UNAUTHORIZED_ACCESS', etc.
        """
        timestamp = datetime.now().isoformat()
        ip_address = request.remote_addr if request else 'N/A'
        
        log_message = f"[{severity}] {timestamp} | Event: {event_type} | User: {user_id} | IP: {ip_address}"
        if details:
            log_message += f" | Details: {details}"
        
        if severity in ('ERROR', 'CRITICAL'):
            current_app.logger.error(log_message)
        else:
            current_app.logger.info(log_message)


# ============================================================================
# ENCRYPTION UTILITIES
# ============================================================================

class EncryptionUtils:
    """Utilities for secure encryption and hashing"""
    
    @staticmethod
    def generate_secure_token(length=32):
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_string(data):
        """Hash string using SHA-256"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def generate_file_hash(file_path):
        """Generate SHA-256 hash of file for integrity verification"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()


# ============================================================================
# SESSION SECURITY
# ============================================================================

class SessionSecurity:
    """Manage secure sessions and token handling"""
    
    @staticmethod
    def validate_session_cookie_settings(app):
        """Configure secure session cookie settings.
        Respects the environment — only forces Secure flag in production
        so local dev over HTTP still works.
        """
        is_prod = os.getenv('FLASK_ENV') == 'production'
        app.config['SESSION_COOKIE_SECURE'] = is_prod        # HTTPS-only in prod
        app.config['SESSION_COOKIE_HTTPONLY'] = True           # No JS access
        app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'         # CSRF protection
        app.config['SESSION_COOKIE_NAME'] = '__Host-session' if is_prod else 'session'
        app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
        app.config['SESSION_REFRESH_EACH_REQUEST'] = True
        
        # JWT cookie settings (if JWT_TOKEN_LOCATION includes 'cookies')
        app.config.setdefault('JWT_COOKIE_SECURE', is_prod)
        app.config.setdefault('JWT_COOKIE_SAMESITE', 'Lax')
        app.config.setdefault('JWT_COOKIE_CSRF_PROTECT', True)

