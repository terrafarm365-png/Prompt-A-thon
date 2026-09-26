"""
Vercel Serverless Function Entrypoint for Vault Control Plane Backend (FastAPI).

This file exposes the ASGI `app` instance from `backend/app/main.py`.
When deployed to Vercel, requests to `/api/*` are handled by this serverless function.
"""
import os
import sys

# Ensure the backend directory is in the Python module search path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Ensure serverless defaults
os.environ.setdefault("APP_ENV", "production")
os.environ.setdefault("DEBUG", "false")
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/vault_dev.db"

# Import the FastAPI ASGI application instance
from app.main import app
