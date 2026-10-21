-- AI Crime Analytics System Database Schema
-- Database: crime.db (SQLite)

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
    created_by_user_id TEXT,
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_crimes_district ON crimes(district);
CREATE INDEX IF NOT EXISTS idx_crimes_category ON crimes(category);
CREATE INDEX IF NOT EXISTS idx_crimes_date ON crimes(incident_date);
