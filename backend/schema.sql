-- =============================================================================
-- PortPilot AI — Enterprise Maritime Operations PostgreSQL Schema
-- Compatible with PostgreSQL 13, 14, 15, 16+
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('SHIPPING_AGENT', 'PORT_AUTHORITY', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vessel_status_enum AS ENUM ('INCOMING', 'AT_ANCHOR', 'AT_BERTH', 'DEPARTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM (
        'DRAFT', 'SENT', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED',
        'CHANGES_REQUESTED', 'BERTHED', 'COMPLETED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_status_enum AS ENUM (
        'AVAILABLE', 'INCOMING', 'IN_USE', 'OPTIMAL', 'NORMAL', 'WARNING', 'MAINTENANCE', 'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL DEFAULT 'SHIPPING_AGENT',
    company_name VARCHAR(160),
    phone VARCHAR(40),
    port_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. SHIPPING AGENTS TABLE
CREATE TABLE IF NOT EXISTS shipping_agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name VARCHAR(160) NOT NULL,
    license_number VARCHAR(80) UNIQUE,
    contact_person VARCHAR(120),
    phone VARCHAR(40),
    email VARCHAR(180),
    headquarters_country VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. VESSELS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS vessels (
    id SERIAL PRIMARY KEY,
    vessel_name VARCHAR(160) NOT NULL,
    imo_number VARCHAR(20) UNIQUE NOT NULL,
    call_sign VARCHAR(20),
    mmsi VARCHAR(20),
    vessel_type VARCHAR(80) NOT NULL DEFAULT 'Container Ship',
    flag VARCHAR(60),
    built_year INTEGER,
    deadweight_tonnage INTEGER,
    gross_tonnage INTEGER,
    vessel_length REAL NOT NULL,
    vessel_draft REAL NOT NULL,
    container_count INTEGER NOT NULL DEFAULT 0,
    status vessel_status_enum DEFAULT 'INCOMING',
    origin VARCHAR(120),
    destination VARCHAR(120),
    eta TIMESTAMPTZ,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo_number);

-- 5. PORT PHYSICAL RESOURCES: BERTHS
CREATE TABLE IF NOT EXISTS port_berths (
    id SERIAL PRIMARY KEY,
    berth_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    port_name VARCHAR(100) NOT NULL DEFAULT 'Rotterdam',
    status resource_status_enum NOT NULL DEFAULT 'AVAILABLE',
    depth_meters REAL NOT NULL,
    length_meters REAL NOT NULL,
    bollards INTEGER NOT NULL DEFAULT 20,
    cranes_allocated INTEGER NOT NULL DEFAULT 2,
    current_vessel_name VARCHAR(160),
    current_vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. PORT PHYSICAL RESOURCES: CRANES
CREATE TABLE IF NOT EXISTS port_cranes (
    id SERIAL PRIMARY KEY,
    crane_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    port_name VARCHAR(100) NOT NULL DEFAULT 'Rotterdam',
    crane_type VARCHAR(80) NOT NULL DEFAULT 'STS Super Post-Panamax',
    status resource_status_enum NOT NULL DEFAULT 'AVAILABLE',
    moves_per_hour INTEGER NOT NULL DEFAULT 32,
    max_reach_rows VARCHAR(40) NOT NULL DEFAULT '24 rows',
    safe_working_load_tons VARCHAR(40) NOT NULL DEFAULT '65 Ton',
    assigned_berth_code VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. PORT PHYSICAL RESOURCES: YARD BLOCKS
CREATE TABLE IF NOT EXISTS port_yard_blocks (
    id SERIAL PRIMARY KEY,
    block_code VARCHAR(30) UNIQUE NOT NULL,
    port_name VARCHAR(100) NOT NULL DEFAULT 'Rotterdam',
    cargo_type VARCHAR(80) NOT NULL DEFAULT 'Dry Containers 40ft',
    capacity_teu INTEGER NOT NULL DEFAULT 3000,
    current_occupancy_teu INTEGER NOT NULL DEFAULT 2100,
    density_percent REAL NOT NULL DEFAULT 70.0,
    status resource_status_enum NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. VESSEL ARRIVAL REPORTS
CREATE TABLE IF NOT EXISTS vessel_arrival_reports (
    id SERIAL PRIMARY KEY,
    report_number VARCHAR(30) UNIQUE NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_port VARCHAR(100) NOT NULL,
    status report_status_enum NOT NULL DEFAULT 'DRAFT',
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
    vessel_name VARCHAR(160) NOT NULL,
    imo_number VARCHAR(20) NOT NULL,
    vessel_type VARCHAR(80) NOT NULL,
    vessel_length REAL,
    vessel_draft REAL,
    flag VARCHAR(60),
    origin_port VARCHAR(120) NOT NULL,
    destination_port VARCHAR(120) NOT NULL,
    eta TIMESTAMPTZ NOT NULL,
    etd TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    total_containers INTEGER DEFAULT 0,
    import_containers INTEGER DEFAULT 0,
    export_containers INTEGER DEFAULT 0,
    reefer_containers INTEGER DEFAULT 0,
    hazardous_containers INTEGER DEFAULT 0,
    cargo_description TEXT,
    assigned_berth_code VARCHAR(30),
    predicted_wait_hours REAL,
    congestion_level VARCHAR(40),
    confidence_score REAL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_report_num ON vessel_arrival_reports(report_number);
CREATE INDEX IF NOT EXISTS idx_reports_receiver_port ON vessel_arrival_reports(receiver_port);
CREATE INDEX IF NOT EXISTS idx_reports_status ON vessel_arrival_reports(status);

-- 9. ML PREDICTION LOGS
CREATE TABLE IF NOT EXISTS ml_prediction_logs (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES vessel_arrival_reports(id) ON DELETE SET NULL,
    vessel_name VARCHAR(160) NOT NULL,
    imo_number VARCHAR(20),
    vessel_type VARCHAR(80) NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'XGBoost Regressor',
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.2-xgb-production',
    predicted_waiting_time_hours REAL NOT NULL,
    confidence_score_percent REAL NOT NULL,
    congestion_level VARCHAR(30) NOT NULL,
    recommended_berth VARCHAR(80),
    recommended_cranes INTEGER,
    features_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. REPORT STATUS HISTORY AUDIT LOG
CREATE TABLE IF NOT EXISTS report_status_history (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES vessel_arrival_reports(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_report ON report_status_history(report_id);
