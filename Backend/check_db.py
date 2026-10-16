import sqlite3
conn = sqlite3.connect('workforce.db')
print(conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='employees'").fetchone()[0])
