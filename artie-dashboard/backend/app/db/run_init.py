"""
Database initialization script
Run this to create tables in your Neon or Supabase PostgreSQL database

Usage:
    python -m app.db.run_init
"""
import os
import sys
from pathlib import Path
import psycopg2
from psycopg2 import sql

def run_init():
    # Get DATABASE_URL from environment
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        print("\nSet it with:")
        print('  export DATABASE_URL="postgresql://user:pass@host:5432/dbname"')
        print('  # or on Windows:')
        print('  $env:DATABASE_URL="postgresql://user:pass@host:5432/dbname"')
        sys.exit(1)
    
    # Read SQL file
    sql_file = Path(__file__).parent / "init.sql"
    if not sql_file.exists():
        print(f"❌ ERROR: SQL file not found: {sql_file}")
        sys.exit(1)
    
    with open(sql_file, 'r') as f:
        sql_content = f.read()
    
    print(f"📦 Connecting to database...")
    print(f"   URL: {database_url[:30]}...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Connected!")
        print("\n🔧 Running init.sql...")
        
        # Execute SQL
        cursor.execute(sql_content)
        
        print("✅ Tables created successfully!")
        
        # Verify tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print("\n📊 Tables in database:")
        for table in tables:
            print(f"   ✓ {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Database initialization complete!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_init()
