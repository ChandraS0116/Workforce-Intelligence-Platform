import sqlite3
import pandas as pd

def audit_db():
    try:
        conn = sqlite3.connect('C:/Users/chand/.gemini/antigravity/scratch/workforce-backend/workforce.db')
        
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print('--- DATABASE TABLES & COUNTS ---')
        for table in tables:
            table_name = table[0]
            cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
            count = cursor.fetchone()[0]
            print(f'{table_name}: {count} records')
            
        print('\n--- DATA QUALITY CHECKS ---')
        
        # Unstaffed Active Projects
        unstaffed_df = pd.read_sql_query('''
            SELECT p.id, p.name 
            FROM projects p
            LEFT JOIN team_assignments ta ON p.id = ta.project_id
            WHERE p.status = "Active" AND ta.id IS NULL
        ''', conn)
        print(f'Unstaffed Active Projects: {len(unstaffed_df)}')
        
        # Employees with no skills
        no_skills_df = pd.read_sql_query('''
            SELECT e.id, e.name
            FROM employees e
            LEFT JOIN employee_skills es ON e.id = es.employee_id
            WHERE es.id IS NULL
        ''', conn)
        print(f'Employees missing skills: {len(no_skills_df)}')
        
        conn.close()
    except Exception as e:
        print(f'DB Audit Error: {e}')

audit_db()
