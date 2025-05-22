import os
import time
import psycopg2
from faker import Faker

fake = Faker()

def wait_for_table(db_url: str, table: str, timeout: int = 30):
    start = time.time()
    while True:
        try:
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            cur.execute("SELECT to_regclass(%s);", (table,))
            if cur.fetchone()[0]:
                conn.close()
                return
        except Exception:
            pass
        if time.time() - start > timeout:
            raise RuntimeError(f"Table {table} not available after {timeout}s")
        time.sleep(1)

def seed_users(count: int = 100):
    db_url = os.getenv("USER_DB_URL")
    wait_for_table(db_url, "public.users")

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users;")
    if cur.fetchone()[0] == 0:
        for _ in range(count):
            cur.execute(
                """
                INSERT INTO users
                  ("lastName", "firstName", phone, email, password, role, created_at, updated_at)
                VALUES (%s,%s,%s,%s,%s,%s,NOW(),NOW());
                """,
                (
                    fake.last_name(),
                    fake.first_name(),
                    fake.phone_number(),
                    fake.unique.email(),
                    fake.password(length=12),
                    fake.random_element(elements=("client","prestataire")),
                )
            )
        conn.commit()
        print(f"✅ Insérés {count} users.")
    else:
        print("ℹ️  La table users n’est pas vide.")
    conn.close()
