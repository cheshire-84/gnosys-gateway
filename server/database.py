import sqlite3

DB_PATH = "gnosys.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        # Services Table: Matches your ServiceGrid requirements
        conn.execute("""
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                tag TEXT NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'OPERATIONAL',
                ping_history TEXT DEFAULT '[0,0,0,0,0,0,0,0,0,0]'
            )
        """)
        
        # Users Table: For Administrative access control
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        """)
    print("✓ Gnosys SQLite Database Initialized at /home/glabs/gnosys-gateway/server/gnosys.db")

if __name__ == "__main__":
    init_db()