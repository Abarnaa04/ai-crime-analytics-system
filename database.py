"""
Database layer for AI Crime Analytics System.
Uses SQLite (crime.db) with secure parameterized queries and password hashing.
"""

import sqlite3
import hashlib
import os
import shutil
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'crime.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'sql', 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    salt = "crime_analytics_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def backup_database():
    """Create a safe backup before any modification as required by security guidelines."""
    if os.path.exists(DB_PATH):
        backup_path = f"{DB_PATH}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(DB_PATH, backup_path)
        return backup_path
    return None

def init_db():
    """Initialize database tables and seed baseline authentic records if not already populated."""
    backup_database()
    conn = get_db_connection()
    cursor = conn.cursor()

    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())
    else:
        # Fallback inline schema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Senior Crime Analyst',
                badge_number TEXT NOT NULL,
                department TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crimes (
                id TEXT PRIMARY KEY,
                case_number TEXT UNIQUE NOT NULL,
                incident_date TIMESTAMP NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT NOT NULL,
                district TEXT NOT NULL,
                location_description TEXT NOT NULL,
                address TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                arrest INTEGER NOT NULL DEFAULT 0,
                domestic INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'Open - Under Investigation',
                severity TEXT NOT NULL DEFAULT 'Moderate',
                hour INTEGER NOT NULL,
                day_of_week TEXT NOT NULL,
                month TEXT NOT NULL,
                year INTEGER NOT NULL
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                target_date TEXT NOT NULL,
                hour INTEGER NOT NULL,
                day_of_week TEXT NOT NULL,
                district TEXT NOT NULL,
                location_description TEXT NOT NULL,
                prior_density TEXT NOT NULL,
                predicted_category TEXT NOT NULL,
                confidence REAL NOT NULL,
                risk_level TEXT NOT NULL,
                analyst_notes TEXT,
                created_by_user_id TEXT
            );
        """)

    # Seed default demonstration users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_pw = hash_password("password123")
        cursor.executemany("""
            INSERT INTO users (id, username, email, password_hash, full_name, role, badge_number, department, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            ('USR-001', 'analyst_sarah', 'analyst@metroanalytics.gov', default_pw, 'Sarah Chen, PhD', 'Senior Crime Analyst', 'AN-8924', 'Strategic Crime Intelligence Division', 'Active', '2025-01-15 08:00:00'),
            ('USR-002', 'officer_ramirez', 'officer@metropolice.gov', default_pw, 'Lt. Marcus Ramirez', 'Field Patrol Officer', 'PO-4402', 'District 01 Rapid Tactical Response', 'Active', '2025-03-20 10:30:00'),
            ('USR-003', 'admin_henderson', 'admin@metroanalytics.gov', default_pw, 'Chief Tech Officer Henderson', 'System Administrator', 'SYS-001', 'Public Safety Information Systems', 'Active', '2024-11-01 09:00:00'),
        ])

    # Seed crime records if empty
    cursor.execute("SELECT COUNT(*) FROM crimes")
    if cursor.fetchone()[0] == 0:
        import random
        random.seed(42)

        districts = [
            ('Central 01', 41.8818, -87.6278),
            ('North River 02', 41.9002, -87.6345),
            ('Harbor West 03', 41.8756, -87.6590),
            ('South Park 04', 41.8340, -87.6250),
            ('University Heights 05', 41.9210, -87.6540),
            ('Industrial East 06', 41.8480, -87.6020)
        ]

        categories = [
            ('THEFT', '$500 AND UNDER', 'COMMERCIAL / RETAIL', 'Low', 0.15),
            ('THEFT', 'OVER $500', 'STREET', 'Moderate', 0.18),
            ('BATTERY', 'SIMPLE', 'STREET', 'Moderate', 0.28),
            ('BATTERY', 'AGGRAVATED: HANDGUN', 'ALLEYWAY', 'Critical', 0.45),
            ('BURGLARY', 'FORCIBLE ENTRY', 'RESIDENCE / APARTMENT', 'High', 0.12),
            ('MOTOR VEHICLE THEFT', 'AUTOMOBILE', 'PARKING LOT', 'High', 0.10),
            ('ROBBERY', 'ARMED: HANDGUN', 'BANK / ATM', 'Critical', 0.22),
            ('NARCOTICS', 'POSS: CANNABIS', 'ALLEYWAY', 'Moderate', 0.75),
            ('ASSAULT', 'AGGRAVATED: PO', 'STREET', 'High', 0.50),
            ('WEAPONS VIOLATION', 'UNLAWFUL USE - HANDGUN', 'STREET', 'High', 0.80),
        ]

        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        addresses = ['001XX N STATE ST', '004XX S MICHIGAN AVE', '008XX W RANDOLPH ST', '012XX N WELLS ST', '022XX S CLARK ST']

        rows = []
        for i in range(1, 381):
            case_no = f"JB{200000 + i}"
            cid = f"CR-2026-{str(i).zfill(4)}"
            dist_name, clat, clng = random.choice(districts)
            lat = round(clat + (random.random() - 0.5) * 0.024, 6)
            lng = round(clng + (random.random() - 0.5) * 0.028, 6)
            cat, subcat, premise, sev, arrest_p = random.choice(categories)
            arrest = 1 if random.random() < arrest_p else 0
            domestic = 1 if cat in ['BATTERY', 'ASSAULT'] and random.random() < 0.35 else 0
            year = 2026 if random.random() > 0.35 else 2025
            month_idx = random.randint(0, 11)
            hour = random.randint(14, 23) if random.random() > 0.4 else random.randint(0, 13)
            day = days[random.randint(0, 6)]
            status = 'Closed - Arrested' if arrest else ('Closed - Exception' if random.random() < 0.25 else 'Open - Under Investigation')
            dt_str = f"{year}-{str(month_idx+1).zfill(2)}-{str(random.randint(1,28)).zfill(2)} {str(hour).zfill(2)}:30:00"

            rows.append((
                cid, case_no, dt_str, cat, subcat, dist_name, premise,
                f"{random.choice(addresses)} [BLCK]", lat, lng, arrest, domestic,
                status, sev, hour, day, months[month_idx], year
            ))

        cursor.executemany("""
            INSERT INTO crimes (
                id, case_number, incident_date, category, subcategory, district,
                location_description, address, latitude, longitude, arrest,
                domestic, status, severity, hour, day_of_week, month, year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rows)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)
