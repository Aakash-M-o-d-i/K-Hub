# Knowledge Hub - README

A comprehensive knowledge management and paper sharing platform for researchers and academics.

## Project Structure

```
├── backend/              # Flask API backend
│   ├── app.py           # Main Flask application
│   ├── config.py        # Configuration & environment setup
│   ├── requirements.txt  # Python dependencies
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication & security
│   ├── utils/           # Helper utilities
│   └── uploads/         # File storage
│
├── frontend/            # React + Vite frontend
│   ├── package.json     # Node dependencies
│   ├── vite.config.js   # Vite configuration
│   ├── index.html       # Entry point
│   ├── src/            # React components & pages
│   └── dist/           # Production build output
│
└── DEPLOYMENT.md        # Production deployment guide
```

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Setup

Copy `.env.production.example` to `.env.production` and configure:

```bash
cp backend/.env.production.example backend/.env.production
```

Edit with your database credentials, API keys, and domain settings.

## Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Backend
# Use gunicorn with the app
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## Key Features

- User authentication with JWT
- Research paper submission and review
- Admin dashboard
- Real-time notifications
- Leaderboard system
- Rate limiting & security headers
- Audit logging

## Security

- HTTPS-only cookies in production
- CORS restricted to origin
- Rate limiting on all endpoints
- Input validation & sanitization
- SQL injection protection via ORM
- CSRF protection

## API Health

Check API status: `GET /api/health`

## For more details, see `DEPLOYMENT.md`
