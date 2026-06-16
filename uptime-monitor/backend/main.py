from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
import sqlite3, requests, time, datetime, os

app = FastAPI(title="Uptime Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "/data/monitor.db"

def get_db():
    os.makedirs("/data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url_id INTEGER NOT NULL,
            status_code INTEGER,
            response_time_ms REAL,
            is_up INTEGER,
            checked_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (url_id) REFERENCES urls(id)
        )
    """)
    conn.commit()
    conn.close()

def ping_all_urls():
    conn = get_db()
    urls = conn.execute("SELECT * FROM urls").fetchall()
    for row in urls:
        url_id = row["id"]
        url = row["url"]
        try:
            start = time.time()
            resp = requests.get(url, timeout=10)
            elapsed = round((time.time() - start) * 1000, 2)
            status_code = resp.status_code
            is_up = 1 if resp.status_code < 400 else 0
        except Exception:
            elapsed = None
            status_code = None
            is_up = 0
        conn.execute(
            "INSERT INTO checks (url_id, status_code, response_time_ms, is_up) VALUES (?, ?, ?, ?)",
            (url_id, status_code, elapsed, is_up)
        )
    conn.commit()
    conn.close()

init_db()
scheduler = BackgroundScheduler()
scheduler.add_job(ping_all_urls, "interval", seconds=60)
scheduler.start()

class URLInput(BaseModel):
    url: str

@app.post("/urls", status_code=201)
def register_url(data: URLInput):
    conn = get_db()
    try:
        conn.execute("INSERT INTO urls (url) VALUES (?)", (data.url,))
        conn.commit()
        url_id = conn.execute("SELECT id FROM urls WHERE url=?", (data.url,)).fetchone()["id"]
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="URL already registered")
    conn.close()
    # Ping immediately after registration
    try:
        start = time.time()
        resp = requests.get(data.url, timeout=10)
        elapsed = round((time.time() - start) * 1000, 2)
        status_code = resp.status_code
        is_up = 1 if resp.status_code < 400 else 0
    except Exception:
        elapsed = None
        status_code = None
        is_up = 0
    conn = get_db()
    conn.execute(
        "INSERT INTO checks (url_id, status_code, response_time_ms, is_up) VALUES (?, ?, ?, ?)",
        (url_id, status_code, elapsed, is_up)
    )
    conn.commit()
    conn.close()
    return {"message": "URL registered and pinged", "url": data.url}

@app.get("/urls")
def list_urls():
    conn = get_db()
    urls = conn.execute("SELECT * FROM urls").fetchall()
    result = []
    for row in urls:
        latest = conn.execute(
            "SELECT * FROM checks WHERE url_id=? ORDER BY checked_at DESC LIMIT 1",
            (row["id"],)
        ).fetchone()
        result.append({
            "id": row["id"],
            "url": row["url"],
            "created_at": row["created_at"],
            "latest_check": dict(latest) if latest else None
        })
    conn.close()
    return result

@app.delete("/urls/{url_id}")
def delete_url(url_id: int):
    conn = get_db()
    conn.execute("DELETE FROM checks WHERE url_id=?", (url_id,))
    conn.execute("DELETE FROM urls WHERE id=?", (url_id,))
    conn.commit()
    conn.close()
    return {"message": "URL removed"}

@app.get("/urls/{url_id}/history")
def get_history(url_id: int, limit: int = 20):
    conn = get_db()
    checks = conn.execute(
        "SELECT * FROM checks WHERE url_id=? ORDER BY checked_at DESC LIMIT ?",
        (url_id, limit)
    ).fetchall()
    conn.close()
    return [dict(c) for c in checks]

@app.get("/health")
def health():
    return {"status": "ok"}
