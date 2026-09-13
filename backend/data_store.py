"""
Data Store Utility for Saboot Netra backend.
Provides an easy-to-use interface to store, retrieve, update, and manage
relational and key-value data inside 'backend/data.db' (SQLite).
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Optional, List, Dict

DB_PATH = Path(__file__).resolve().parent / "data.db"


def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: Path = DB_PATH):
    """Initializes the database schema if tables do not exist."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        
        # General purpose structured data records
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                category TEXT DEFAULT 'general',
                value TEXT,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Fast simple key-value store
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_key ON data_records(key);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_records_category ON data_records(category);")
        conn.commit()


def store_data(
    key: str,
    value: Any,
    category: str = "general",
    metadata: Optional[Dict[str, Any]] = None,
    db_path: Path = DB_PATH
) -> int:
    """
    Stores or updates a data record.
    Supports strings, numbers, dicts, lists (serialized to JSON automatically).
    """
    init_db(db_path)
    
    val_str = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
    meta_str = json.dumps(metadata) if metadata else None
    now = datetime.now(timezone.utc).isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO data_records (key, category, value, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                category = excluded.category,
                value = excluded.value,
                metadata = excluded.metadata,
                updated_at = excluded.updated_at
        """, (key, category, val_str, meta_str, now, now))
        conn.commit()
        return cursor.lastrowid


def get_data(key: str, db_path: Path = DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves a single data record by key."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM data_records WHERE key = ?", (key,))
        row = cursor.fetchone()
        if not row:
            return None
        
        val = row["value"]
        try:
            val = json.loads(val)
        except (ValueError, TypeError):
            pass

        meta = row["metadata"]
        if meta:
            try:
                meta = json.loads(meta)
            except (ValueError, TypeError):
                pass

        return {
            "id": row["id"],
            "key": row["key"],
            "category": row["category"],
            "value": val,
            "metadata": meta,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }


def list_data(category: Optional[str] = None, limit: int = 100, db_path: Path = DB_PATH) -> List[Dict[str, Any]]:
    """Lists data records, optionally filtered by category."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        if category:
            cursor.execute(
                "SELECT * FROM data_records WHERE category = ? ORDER BY updated_at DESC LIMIT ?",
                (category, limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM data_records ORDER BY updated_at DESC LIMIT ?",
                (limit,)
            )
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            val = row["value"]
            try:
                val = json.loads(val)
            except (ValueError, TypeError):
                pass
            
            results.append({
                "id": row["id"],
                "key": row["key"],
                "category": row["category"],
                "value": val,
                "created_at": row["created_at"],
                "updated_at": row["updated_at"]
            })
        return results


def delete_data(key: str, db_path: Path = DB_PATH) -> bool:
    """Deletes a data record by key."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM data_records WHERE key = ?", (key,))
        conn.commit()
        return cursor.rowcount > 0


def execute_query(query: str, params: tuple = (), db_path: Path = DB_PATH) -> List[Dict[str, Any]]:
    """Executes a custom SQL query and returns rows as dictionaries."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER")):
            conn.commit()
            return [{"affected_rows": cursor.rowcount}]
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


# Simple CLI usage
if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Saboot Netra SQLite Data Store CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # init
    subparsers.add_parser("init", help="Initialize the database")

    # set
    set_cmd = subparsers.add_parser("set", help="Store or update a key-value record")
    set_cmd.add_argument("key", help="Key name")
    set_cmd.add_argument("value", help="Value (string or JSON)")
    set_cmd.add_argument("--category", default="general", help="Category name")

    # get
    get_cmd = subparsers.add_parser("get", help="Get a record by key")
    get_cmd.add_argument("key", help="Key name")

    # list
    list_cmd = subparsers.add_parser("list", help="List stored records")
    list_cmd.add_argument("--category", default=None, help="Filter by category")
    list_cmd.add_argument("--limit", type=int, default=50, help="Maximum number of records")

    # delete
    del_cmd = subparsers.add_parser("delete", help="Delete a record by key")
    del_cmd.add_argument("key", help="Key name")

    # query
    query_cmd = subparsers.add_parser("query", help="Execute raw SQL query")
    query_cmd.add_argument("sql", help="SQL query string")

    args = parser.parse_args()

    if args.command == "init" or not args.command:
        init_db()
        print(f"Database initialized successfully at: {DB_PATH}")

    elif args.command == "set":
        try:
            val = json.loads(args.value)
        except ValueError:
            val = args.value
        store_data(args.key, val, category=args.category)
        print(f"Stored key '{args.key}' under category '{args.category}'.")

    elif args.command == "get":
        item = get_data(args.key)
        if item:
            print(json.dumps(item, indent=2))
        else:
            print(f"Key '{args.key}' not found.")
            sys.exit(1)

    elif args.command == "list":
        items = list_data(category=args.category, limit=args.limit)
        print(json.dumps(items, indent=2))

    elif args.command == "delete":
        success = delete_data(args.key)
        if success:
            print(f"Deleted key '{args.key}'.")
        else:
            print(f"Key '{args.key}' not found.")

    elif args.command == "query":
        res = execute_query(args.sql)
        print(json.dumps(res, indent=2, default=str))
