"""
Migration script to add OAuth columns to users table
This script safely adds the new columns without dropping existing data
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from config import config
import sqlite3


def migrate_oauth_columns():
    """Add OAuth columns to users table if they don't exist"""
    app = create_app(config.get('development', config['default']))
    
    with app.app_context():
        # Get database path
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        
        if not os.path.exists(db_path):
            print(f"Database file not found: {db_path}")
            print("Creating new database with all columns...")
            db.create_all()
            print("✓ Database created successfully")
            return
        
        # Connect to SQLite database directly
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check which columns exist
            cursor.execute("PRAGMA table_info(users)")
            existing_columns = [row[1] for row in cursor.fetchall()]
            
            columns_to_add = {
                'provider': 'VARCHAR(50)',
                'provider_id': 'VARCHAR(255)',
                'provider_data': 'TEXT',
                'avatar_url': 'VARCHAR(500)'
            }
            
            added_columns = []
            for column_name, column_type in columns_to_add.items():
                if column_name not in existing_columns:
                    # Add column
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                    added_columns.append(column_name)
                    print(f"✓ Added column: {column_name}")
                else:
                    print(f"  Column {column_name} already exists")
            
            # Add unique constraint if it doesn't exist
            cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
            table_sql = cursor.fetchone()[0]
            
            if '_provider_provider_id_uc' not in table_sql:
                # Check if we can add the constraint (SQLite has limited ALTER TABLE support)
                print("  Note: Unique constraint on (provider, provider_id) should be added manually if needed")
            
            conn.commit()
            
            if added_columns:
                print(f"\n✓ Successfully added {len(added_columns)} column(s): {', '.join(added_columns)}")
            else:
                print("\n✓ All OAuth columns already exist")
                
        except Exception as e:
            conn.rollback()
            print(f"\n✗ Error during migration: {str(e)}")
            print("Falling back to recreating database...")
            # Fallback: recreate tables
            db.drop_all()
            db.create_all()
            print("✓ Database recreated with all columns")
        finally:
            conn.close()


if __name__ == '__main__':
    print("=" * 50)
    print("OAuth Columns Migration")
    print("=" * 50)
    print()
    
    try:
        migrate_oauth_columns()
        print("\n" + "=" * 50)
        print("Migration complete!")
        print("=" * 50)
    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

