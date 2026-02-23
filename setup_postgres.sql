-- ============================================================
-- VIZPILOT - PostgreSQL Database Setup Script
-- ============================================================
-- Run this script as postgres superuser:
--   psql -U postgres -f setup_postgres.sql
-- OR copy-paste these commands in psql terminal
-- ============================================================

-- Create database
CREATE DATABASE elas_erp;

-- Create user with password
CREATE USER elas_user WITH PASSWORD 'elas_password';

-- Grant privileges on database
GRANT ALL PRIVILEGES ON DATABASE elas_erp TO elas_user;

-- Connect to the new database
\c elas_erp

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO elas_user;

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO elas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO elas_user;

-- Show success message
\echo '✅ Database setup complete!'
\echo '   Database: elas_erp'
\echo '   User: elas_user'
\echo '   Password: elas_password'
\echo ''
\echo '📝 Next step: Run python -m backend.app.init_db'
