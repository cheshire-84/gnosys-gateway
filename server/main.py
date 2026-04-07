import sqlite3
import json
import jwt
import datetime
import hashlib
import secrets
import httpx
import psutil
import threading
import time
import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Setup File Logging
logging.basicConfig(
    filename='gateway.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

SECRET_KEY = "GNOSYS_ROOT_ACCESS_KEY" 
ALGORITHM = "HS256"

app = FastAPI(title="Gnosys Gateway API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    username: str
    password: str

class ServiceCreate(BaseModel):
    name: str
    tag: str
    url: str
    description: Optional[str] = ""

def get_db_conn():
    return sqlite3.connect("gnosys.db", check_same_thread=False)

def get_db():
    conn = get_db_conn()
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# --- SECURITY HELPERS ---
def hash_password(password: str):
    salt = secrets.token_hex(8)
    return f"{hashlib.sha256((password + salt).encode()).hexdigest()}${salt}"

def verify_password(password: str, stored_val: str):
    try:
        h_part, salt = stored_val.split("$")
        return hashlib.sha256((password + salt).encode()).hexdigest() == h_part
    except: return False

# --- BACKGROUND MONITORING ---
# --- UPDATED BACKGROUND MONITORING ---
def run_monitor():
    """Background thread to ping services with SSL bypass and Browser Headers."""
    while True:
        try:
            conn = get_db_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT id, url, ping_history, name FROM services")
            services = cursor.fetchall()
            
            # Use a single client for efficiency
            with httpx.Client(verify=False, timeout=5.0) as client:
                for s_id, url, history_json, name in services:
                    history = json.loads(history_json) if history_json else [0]*10
                    start = time.time()
                    try:
                        # Adding User-Agent to prevent 403 blocks
                        headers = {'User-Agent': 'GnosysGateway/2.5 (Terminal Monitoring)'}
                        response = client.get(url, headers=headers)
                        
                        latency = int((time.time() - start) * 1000)
                        # Any status under 400 is considered "OPERATIONAL"
                        new_status = "OPERATIONAL" if response.status_code < 400 else "DEGRADED"
                    except Exception as e:
                        latency = 0
                        new_status = "OFFLINE"
                        # Log the specific error to gateway.log for debugging
                        logging.warning(f"Monitor Failure for {name}: {str(e)}")
                    
                    history.pop(0)
                    history.append(latency)
                    
                    cursor.execute(
                        "UPDATE services SET status=?, ping_history=? WHERE id=?",
                        (new_status, json.dumps(history), s_id)
                    )
            conn.commit()
            conn.close()
        except Exception as e:
            logging.error(f"Monitor Loop Error: {str(e)}")
        
        time.sleep(30) # Pulse every 30 seconds

# Start the thread as before
monitor_thread = threading.Thread(target=run_monitor, daemon=True)
monitor_thread.start()

# --- AUTHENTICATION & USER MANAGEMENT ---

@app.get("/api/auth/status")
async def auth_status(db: sqlite3.Connection = Depends(get_db)):
    count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    return {"setupRequired": count == 0}

@app.post("/api/auth/setup")
async def auth_setup(req: AuthRequest, db: sqlite3.Connection = Depends(get_db)):
    if db.execute("SELECT COUNT(*) FROM users").fetchone()[0] > 0:
        raise HTTPException(status_code=400, detail="Setup already completed")
    db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (req.username, hash_password(req.password)))
    db.commit()
    logging.info(f"System: Root authority established for {req.username}")
    return {"message": "Root authority established"}

@app.post("/api/auth/login")
async def auth_login(req: AuthRequest, db: sqlite3.Connection = Depends(get_db)):
    user = db.execute("SELECT * FROM users WHERE username = ?", (req.username,)).fetchone()
    if not user or not verify_password(req.password, user["password_hash"]):
        logging.warning(f"Security: Failed login attempt for {req.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({
        "sub": user["username"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm=ALGORITHM)
    logging.info(f"Security: {req.username} authenticated")
    return {"token": token, "username": user["username"]}

# NEW: Fetch all administrators for SettingsPanel
@app.get("/api/auth/users")
async def get_users(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT id, username FROM users").fetchall()
    return [dict(row) for row in rows]

# NEW: Provision a new administrator
@app.post("/api/auth/users")
async def create_user(req: AuthRequest, db: sqlite3.Connection = Depends(get_db)):
    try:
        db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (req.username, hash_password(req.password)))
        db.commit()
        logging.info(f"Security: New admin provisioned - {req.username}")
        return {"status": "success"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Identifier already exists")

# NEW: Revoke administrator access
@app.delete("/api/auth/users/{user_id}")
async def delete_user(user_id: int, db: sqlite3.Connection = Depends(get_db)):
    # Prevent deleting the last admin to avoid lock-out
    count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count <= 1:
        raise HTTPException(status_code=400, detail="Cannot revoke final root authority")
    
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    db.commit()
    logging.info(f"Security: Access revoked for User ID {user_id}")
    return {"status": "revoked"}

# --- SERVICE REGISTRY ENDPOINTS ---

@app.get("/api/services")
async def get_services(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM services").fetchall()
    services = []
    for row in rows:
        s = dict(row)
        s['pingHistory'] = json.loads(s['ping_history']) if s.get('ping_history') else [0]*10
        services.append(s)
    return services

@app.post("/api/services")
async def add_service(service: ServiceCreate, db: sqlite3.Connection = Depends(get_db)):
    db.execute(
        "INSERT INTO services (name, tag, url, description, ping_history) VALUES (?, ?, ?, ?, ?)",
        (service.name, service.tag, service.url, service.description, json.dumps([0]*10))
    )
    db.commit()
    logging.info(f"Asset Created: {service.name}")
    return {"status": "success"}

@app.delete("/api/services/{service_id}")
async def delete_service(service_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("DELETE FROM services WHERE id = ?", (service_id,))
    db.commit()
    logging.info(f"Asset Purged: ID {service_id}")
    return {"status": "purged"}

@app.get("/api/stats")
async def get_stats():
    return {
        "cpu": int(psutil.cpu_percent()),
        "mem": int(psutil.virtual_memory().percent),
        "disk": int(psutil.disk_usage('/').percent),
        "uptime": int((time.time() - psutil.boot_time()) // 3600)
    }

@app.get("/api/weather")
async def get_weather():
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get("https://api.open-meteo.com/v1/forecast?latitude=28.0128&longitude=-82.1284&current_weather=true&temperature_unit=fahrenheit")
            return {"temperature_2m": r.json()["current_weather"]["temperature"]}
        except: return {"temperature_2m": "N/A"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)