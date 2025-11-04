"""
Database initialization script
- Creates all tables from models
- Creates default admin user
"""
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, Dashboard, Widget, BusinessInfo
from app.auth import get_password_hash
import sys


def init_db():
    """Initialize database: create tables"""
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def create_default_admin(db: Session):
    """Create default admin user if not exists"""
    admin_email = "admin@elas-erp.com"
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"⚠️  Admin user already exists: {admin_email}")
        return existing_admin
    
    # Create admin user - use bcrypt directly to avoid passlib version issues
    import bcrypt
    password_bytes = "admin123".encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    admin = User(
        email=admin_email,
        username="admin",
        full_name="System Administrator",
        hashed_password=hashed_password,  # Change this in production!
        role="ceo",
        is_active=True,
        is_superuser=True,
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print(f"✅ Default admin user created!")
    print(f"   📧 Email: {admin_email}")
    print(f"   🔑 Password: admin123")
    print(f"   ⚠️  IMPORTANT: Change this password in production!")
    
    return admin


def main():
    """Run database initialization"""
    print("=" * 60)
    print("🚀 ELAS ERP - Database Initialization")
    print("=" * 60)
    
    try:
        # Create tables
        init_db()
        
        # Create admin user
        db = SessionLocal()
        try:
            create_default_admin(db)
        finally:
            db.close()
        
        print("\n" + "=" * 60)
        print("✅ Database initialization completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during database initialization:")
        print(f"   {str(e)}")
        print("\n💡 Make sure PostgreSQL is running and credentials are correct.")
        print("   Check DATABASE_URL in your .env file or backend/app/database.py")
        sys.exit(1)


if __name__ == "__main__":
    main()
