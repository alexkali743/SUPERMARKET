import os
from dotenv import load_dotenv

load_dotenv()

GRAPHDB_BASE = os.getenv("GRAPHDB_BASE", "http://127.0.0.1:7201")
GRAPHDB_REPO = os.getenv("GRAPHDB_REPO", "supermarket")

GRAPHDB_ENDPOINT = f"{GRAPHDB_BASE}/repositories/{GRAPHDB_REPO}"
GRAPHDB_UPDATE_ENDPOINT = f"{GRAPHDB_BASE}/repositories/{GRAPHDB_REPO}/statements"

GRAPHDB_USER = os.getenv("GRAPHDB_USER", "")
GRAPHDB_PASS = os.getenv("GRAPHDB_PASS", "")
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "10"))
