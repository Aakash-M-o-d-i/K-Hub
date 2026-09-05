# 🎓 KnowledgeHub — Full-Stack, Security & Deployment Master Interview Question Bank

This document is the **complete, end-to-end technical interview guide** for the **KnowledgeHub** platform. It covers **Frontend (React 19/Vite 7)**, **Backend (Flask 3/Python)**, **Database (MySQL/MariaDB & SQLAlchemy)**, **Security Auditing (OWASP Top 10 & Vulnerability Mitigation)**, and **Production Deployment & DevOps Infrastructure**.

---

## 📑 Table of Contents
1. [🏗️ Project Architecture & Tech Stack Overview](#1-project-architecture--tech-stack-overview)
2. [🟢 Section 1: Frontend & React 19 Interview Questions](#2-section-1-frontend--react-19-interview-questions)
3. [🐍 Section 2: Backend, REST API & Flask Questions](#3-section-2-backend-rest-api--flask-questions)
4. [🗄️ Section 3: Database Design, SQL & ORM Questions](#4-section-3-database-design-sql--orm-questions)
5. [🛡️ Section 4: Security Audit, OWASP & Vulnerability Fixes](#5-section-4-security-audit-owasp--vulnerability-fixes)
6. [🚀 Section 5: Production Deployment, DevOps & Infrastructure](#6-section-5-production-deployment-devops--infrastructure)
7. [⚡ Section 6: Real-World Engineering Difficulties & Solutions](#7-section-6-real-world-engineering-difficulties--solutions)

---

## 🏗️ 1. Project Architecture & Tech Stack Overview

When asked *"Describe the high-level architecture of KnowledgeHub"*, answer with this breakdown:

```
                      ┌─────────────────────────────────────────┐
                      │          React 19 SPA Client            │
                      │  Vite 7 | Tailwind v4 | PDF.js | Axios  │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS (JSON + Bearer JWT)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │         Nginx Reverse Proxy             │
                      │  SSL/TLS Termination | Static Assets    │
                      └────────────────────┬────────────────────┘
                                           │ Unix Socket / HTTP
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │        Flask 3 WSGI (Gunicorn)          │
                      │  JWT Auth | Flask-Limiter | Security    │
                      └──────────────┬───────────┬──────────────┘
                                     │           │
                     ┌───────────────┘           └──────────────┐
                     ▼                                          ▼
      ┌─────────────────────────────┐            ┌─────────────────────────────┐
      │     MySQL / MariaDB DB      │            │     Disk Storage / Redis    │
      │  SQLAlchemy ORM Data Layer  │            │  Approved & Pending PDFs    │
      └─────────────────────────────┘            └─────────────────────────────┘
```

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router v7, Axios, PDF.js, Tailwind v4 | SPA User interface, responsive PDF rendering, client-side route authorization. |
| **API Gateway** | Nginx, Gunicorn WSGI | SSL termination, reverse proxy, static asset delivery, load balancing. |
| **Backend Service** | Flask 3.0, Flask-JWT-Extended, Flask-Bcrypt, Flask-Limiter | RESTful APIs, JWT token lifecycle, rate-limiting, paper approval workflows. |
| **Data Layer** | MySQL 8 / MariaDB, Flask-SQLAlchemy 3.1 | Relational storage, database indexes, ACID transaction isolation. |
| **Security Scanning** | `python-magic`, `sib-api-v3-sdk` (Brevo OTP), custom security middleware | Multi-layer file validation, brute-force protection, audit logging. |

---

## 🟢 2. Section 1: Frontend & React 19 Interview Questions

### Q1: What libraries did you use in the React frontend and why?
**Answer:**
- **React 19 + Vite 7**: Chosen for ultra-fast HMR and minimal runtime footprint.
- **React Router DOM v7**: Used for declarative SPA routing, nested layouts (`AppLayout`), and HOC authentication route guards (`PrivateRoute`, `AdminRoute`).
- **Axios**: Selected over `fetch` due to its powerful Request/Response Interceptors, allowing global injection of JWT tokens and centralized `401 Unauthorized` token expiry handling.
- **PDF.js (`pdfjs-dist` v4)**: Integrated to render PDF files directly onto HTML5 `<canvas>` elements for mobile browser compatibility.
- **Tailwind CSS v4 + `@tailwindcss/vite`**: Utility-first CSS engine used for dark/light themes, glassmorphic UI (`backdrop-blur`), and dynamic theme accent color variables (`--color-primary`).

---

### Q2: How did you implement mobile-friendly PDF viewing without relying on `<iframe>` tags?
**Answer:**
Mobile browsers (especially iOS Safari) fail to render PDFs reliably inside `<iframe>` tags, often forcing downloads. We built a custom `<canvas>` renderer in `MobilePdfViewer.jsx` using `pdfjs-dist`:
```javascript
pdfjsLib.getDocument({ url, withCredentials: true }).promise.then(async (doc) => {
    const page = await doc.getPage(pageNum);
    const containerWidth = containerRef.current.clientWidth - 16;
    const unscaledViewport = page.getViewport({ scale: 1 });
    const fitScale = containerWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale: fitScale * scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = page.render({ canvasContext: ctx, viewport });
    await task.promise;
});
```

---

### Q3: How do you prevent PDF.js `CanvasIsBusy` exceptions during rapid re-renders?
**Answer:**
Calling `page.render()` while a previous rendering task is in progress throws a `RenderingCancelledException` or corrupts the canvas. We used `useRef` to track and cancel in-flight render tasks:
```javascript
const renderTaskRef = useRef(null);

const renderPage = useCallback(async (pageNum) => {
    if (renderTaskRef.current) {
        renderTaskRef.current.cancel(); // Cancel active render task
        renderTaskRef.current = null;
    }
    const page = await pdfDoc.getPage(pageNum);
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
        await task.promise;
    } catch (err) {
        if (err?.name !== 'RenderingCancelledException') console.error(err);
    }
}, [pdfDoc, scale]);
```

---

### Q4: How is code splitting configured to optimize FCP (First Contentful Paint)?
**Answer:**
We implemented route-level code splitting using `React.lazy` and `Suspense` inside `App.jsx`:
```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
             <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
```
In addition, `pdf.worker.min.mjs` was offloaded to a CDN (`cdnjs.cloudflare.com`) to keep the primary Vite bundle lightweight.

---

## 🐍 3. Section 2: Backend, REST API & Flask Questions

### Q1: How is the Flask backend structured for modularity and scalability?
**Answer:**
We used Flask **Blueprints** to organize domain logic into distinct routes:
- `auth_bp` (`/api/auth`): Registration, login, Google OAuth, password reset, OTPs.
- `papers_bp` (`/api/papers`): PYQ paper searching, uploading, downloading, bookmarking, and rating.
- `admin_bp` (`/api/admin`): Admin management, paper approvals, system setting updates.
- `leaderboard_bp` (`/api/leaderboard`): Departmental points calculation and contributor rankings.

Factory pattern initialization (`create_app()`) is used in `app.py` to enable flexible environment configurations and automated testing.

---

### Q2: How does authentication and token management work on the backend?
**Answer:**
1. **Password Hashing**: Uses `Flask-Bcrypt` with salted password hashing.
2. **JWT Issuance**: On successful authentication via `/api/auth/login`, Flask issues a JWT signed with `JWT_SECRET_KEY` containing `user_id` and unique `jti` (JWT ID).
3. **Session Revocation**: A `sessions` table tracks active `jti` tokens. Middleware checks if `jti` exists and is valid. If a user logs out or changes their password, old `jti` tokens are revoked in the database.

---

### Q3: How is rate limiting implemented to prevent Brute-Force and DoS attacks?
**Answer:**
We configured `Flask-Limiter` in `utils/security.py`:
- Sensitive auth endpoints (`/login`, `/register`): **10 requests per minute**.
- OTP request endpoints (`/forgot-password`): **3 requests per 10 minutes**.
- General API endpoints: **100 requests per minute**.

Account lockouts trigger automatically after 5 consecutive failed login attempts, locking the account for 15 minutes.

---

## 🗄️ 4. Section 3: Database Design, SQL & ORM Questions

### Q1: Describe the schema design and relationships in KnowledgeHub.
**Answer:**
- `users`: Stores core credentials, role (`student`, `admin`, `super_admin`), department foreign key, points, and preferences.
- `papers`: Contains metadata (title, subject_code, semester, exam_type, year, file_path, status [`pending`, `approved`, `rejected`]), linked to `users` (uploader) and `departments`.
- `ratings`: Composite key `(user_id, paper_id)` with `CHECK (score BETWEEN 1 AND 5)` constraint to prevent duplicate ratings.
- `bookmarks`: Unique composite key `(user_id, paper_id)` for saved user papers.
- `downloads`: Tracks download logs for analytics and leaderboard calculations.
- `sessions`: Stores active JWT `jti` strings linked to `user_id` for instant revocation.

---

### Q2: What indexing strategies were used to optimize query performance?
**Answer:**
1. **Paper Search & Filtering Index**: Multi-column indexes on `papers(status, department_id, semester, year)` to ensure instantaneous filtering on the main dashboard.
2. **Ratings & Bookmarks Lookup**: Composite unique index `(user_id, paper_id)` on `ratings` and `bookmarks` for fast $O(1)$ verification of user interactions.
3. **User Lookups**: Index on `users(email)` for fast authentication query resolution.

---

### Q3: How did you fix race conditions during paper rating calculations?
**Answer:**
**Issue**: Calculating average rating in Python (`new_avg = old_avg + (score - old_score) / count`) without database locks can lead to lost updates under high concurrency.
**Solution**: Applied database row-level locking with `db.session.begin_nested()` and `with_for_update()`:
```python
paper = Paper.query.filter_by(id=paper_id).with_for_update().first()
# Update paper rating within atomic transaction
db.session.commit()
```

---

## 🛡️ 5. Section 4: Security Audit, OWASP & Vulnerability Fixes

Based on the **KnowledgeHub Security Audit Report**, answer these security questions:

### Q1: How does KnowledgeHub protect against File Upload Vulnerabilities?
**Answer:**
We implemented a **Multi-Layer Defense Strategy** in `utils/security.py`:
1. **Extension Whitelist**: Rejects files not in `['pdf', 'jpg', 'jpeg', 'png', 'docx', 'zip', 'txt']` and detects double-extension attacks (e.g., `shell.php.jpg`).
2. **Magic Bytes Validation**: Uses `python-magic` to inspect actual binary header signatures, blocking executable files (`EXE`, `ELF`, `Mach-O`, shell scripts) even if renamed to `.pdf`.
3. **Randomized Filenames**: Saves files using 32-character random tokens (`EncryptionUtils.generate_secure_token(16)`), preventing path traversal and execution prediction.
4. **File Storage Isolation**: Uploaded files are stored outside the web root (`/backend/uploads/pending` and `/backend/uploads/approved`).

---

### Q2: What critical security vulnerabilities were identified in the audit and how were they fixed?
**Answer:**
1. **Predictable Secret Keys (Critical)**:
   - *Issue*: `.env` used hardcoded strings (`pyq-super-secret-key-...`).
   - *Fix*: Generated cryptographically secure 64-byte random keys via `secrets.token_urlsafe(64)`.
2. **Wildcard Allowed Extensions (High)**:
   - *Issue*: Database system settings contained `"*"` in allowed extensions list, bypassing extension whitelists.
   - *Fix*: Removed `"*"` from `system_settings` table and added strict server-side validation rejecting wildcard characters.
3. **JWT Token in `localStorage` (High Risk)**:
   - *Issue*: Storing JWTs in `localStorage` makes them vulnerable to XSS token theft.
   - *Fix Recommendation*: Transition to `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
4. **In-Memory Rate Limiting (High)**:
   - *Issue*: Rate limits stored in memory (`memory://`) reset upon server restart.
   - *Fix*: Configured Redis (`redis://localhost:6379`) as the storage backend for `Flask-Limiter`.

---

### Q3: How are SQL Injection and Cross-Site Scripting (XSS) mitigated?
**Answer:**
- **SQL Injection**: Prevented globally by using **SQLAlchemy ORM** parameterized queries. Search string wildcards (`%` and `_`) are explicitly sanitized.
- **XSS (Stored & Reflected)**: User inputs undergo tag-stripping via `InputValidator.sanitize_text()`. React automatically escapes text content rendered in JSX elements, avoiding dangerous functions like `dangerouslySetInnerHTML`.

---

## 🚀 6. Section 5: Production Deployment, DevOps & Infrastructure

### Q1: How do you prepare and build the React frontend for production deployment?
**Answer:**
1. **Environment Variables**: Configure `.env.production` containing production API gateway URLs (`VITE_API_BASE_URL=https://api.knowledgehub.com`).
2. **Production Build**: Run `npm run build` which invokes `vite build`.
   - Vite compiles JSX, performs tree-shaking, minifies JS/CSS chunks, and outputs static assets into the `/dist` directory.
3. **Static File Serving**: Host `/dist` files using Nginx or an S3/CDN bucket configured with fallback to `index.html` for client-side SPA routing (`try_files $uri $uri/ /index.html`).

---

### Q2: How is the Flask backend served in production? (Gunicorn WSGI + Nginx)
**Answer:**
Never run `flask run` in production. We deploy using **Gunicorn** behind **Nginx**:
- **Gunicorn Command**:
  ```bash
  gunicorn --workers 4 --bind 127.0.0.1:5000 --access-logfile - --error-logfile - "app:create_app()"
  ```
  *(Formula for workers: $(2 \times \text{CPU cores}) + 1$)*.
- **Nginx Configuration**:
  Nginx acts as a reverse proxy, handling SSL termination, rate-limiting static downloads, and forwarding API traffic to Gunicorn over HTTP or Unix Sockets.

#### Sample Nginx Configuration File (`/etc/nginx/sites-available/knowledgehub`):
```nginx
server {
    listen 80;
    server_name knowledgehub.com www.knowledgehub.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name knowledgehub.com www.knowledgehub.com;

    ssl_certificate /etc/letsencrypt/live/knowledgehub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/knowledgehub.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Serve Frontend SPA
    location / {
        root /var/www/knowledgehub/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy Flask API Requests
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 128M; # Allow PDF uploads up to 128MB
    }
}
```

---

### Q3: How do you containerize the KnowledgeHub application using Docker & Docker Compose?
**Answer:**
We use a multi-container Docker setup managed by `docker-compose.yml`:
1. **Frontend Container**: Multi-stage build (Stage 1: Node 20 `npm run build`; Stage 2: Nginx alpine serving static assets).
2. **Backend Container**: Python 3.11 slim image running Gunicorn.
3. **Database Container**: MySQL 8.0 with persistent volumes.
4. **Cache Container**: Redis for rate limiting and session locking.

#### Sample `docker-compose.yml`:
```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: knowledgehub_db
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build: ./backend
    restart: always
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=mysql+pymysql://root:${DB_ROOT_PASSWORD}@database/knowledgehub_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - database
      - redis
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

### Q4: How are Database Migrations and Environment Secrets managed in production?
**Answer:**
- **Database Migrations**: We manage database schema changes using `Flask-Migrate` (Alembic). Before deploying new backend code, we execute:
  ```bash
  flask db upgrade
  ```
- **Secrets Management**: Live production credentials (`JWT_SECRET_KEY`, `DB_PASSWORD`, `BREVO_API_KEY`) are injected via system environment variables or Vault / AWS Secrets Manager—**never committed to Git repositories**. `.env` is explicitly declared in `.gitignore`.

---

## ⚡ 7. Section 6: Real-World Engineering Difficulties & Solutions

### Case Study 1: High-DPI (Retina) Mobile PDF Blurring
- **Issue**: PDF text painted on `<canvas>` elements looked pixelated on High-DPI smartphones (e.g., iPhones, OLED displays).
- **Solution**: Multiplied canvas width/height by `window.devicePixelRatio` while fixing CSS dimensions to match layout size:
  ```javascript
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;
  page.render({ canvasContext: ctx, viewport, transform });
  ```

---

### Case Study 2: Preventing Memory Leaks from Unbounded File Uploads
- **Issue**: Concurrent large file uploads (up to 128MB each) risked overwhelming server RAM if buffered entirely in memory.
- **Solution**: Configured stream chunks using `request.files['file'].save(destination_path)` to write incoming streams directly to local disk storage (`uploads/pending`) without buffering the entire payload into RAM.

---

### Case Study 3: Rate Limiting in Multi-Process Gunicorn Environments
- **Issue**: In-memory rate limiting (`memory://`) allowed clients to bypass rate limits by hitting different Gunicorn worker processes on subsequent requests.
- **Solution**: Transitioned `Flask-Limiter` storage URI to a centralized **Redis** instance (`storage_uri="redis://redis:6379"`), sharing rate-limit counters across all backend workers.

---

## 🎯 Summary Interview Cheat Sheet

When summarizing your work on **KnowledgeHub** in an interview:
1. **Frontend**: Emphasize **React 19, Vite 7, PDF.js canvas rendering, and Axios interceptors**.
2. **Backend**: Highlight **Flask 3 Blueprints, Flask-Bcrypt, JWT revocation, and multi-layer file upload validation**.
3. **Database**: Detail **SQLAlchemy ORM, multi-column indexes, atomic locks (`FOR UPDATE`), and schema relationships**.
4. **Security**: Reference the **Security Audit Findings**—mitigating file upload risks (`python-magic`), fixing rate-limiting with Redis, and sanitizing inputs.
5. **Deployment**: Explain **Gunicorn + Nginx reverse proxy, Docker Compose multi-container setup, SSL/TLS, and CI/CD static builds**.
