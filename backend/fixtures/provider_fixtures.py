# fixtures/provider_fixtures.py
import os
import psycopg2
from faker import Faker
import random

fake = Faker()

def seed_providers(count: int = 50):
    """Peuple la table providers si elle est vide, en récupérant d’abord des prestataires uniques."""
    # 1) Récupérer les IDs prestataire depuis users
    user_db_url = os.getenv("USER_DB_URL")
    conn_user = psycopg2.connect(user_db_url)
    cur_user = conn_user.cursor()
    cur_user.execute("SELECT id FROM users WHERE role='prestataire';")
    prest_ids = [r[0] for r in cur_user.fetchall()]
    cur_user.close()
    conn_user.close()

    if not prest_ids:
        print("⚠️  Aucun prestataire trouvé dans users. Pas de providers créés.")
        return

    # Déterminer le nombre à créer sans dépasser le nombre de prestataires
    to_create = min(count, len(prest_ids))
    # Sélectionner au hasard *to_create* IDs distincts
    selected_ids = random.sample(prest_ids, to_create)

    # 2) Peuplage de providers
    db_url = os.getenv("PROVIDER_DB_URL")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM providers;")
    if cur.fetchone()[0] == 0:
        for uid in selected_ids:
            cur.execute(
                """
                INSERT INTO providers
                  (id_user, type, latitude, longitude, created_at, updated_at)
                VALUES (%s,%s,%s,%s,NOW(),NOW());
                """,
                (
                    uid,
                    fake.random_element(elements=("transport","cleaning","repair","childcare","moving")),
                    float(fake.latitude()),
                    float(fake.longitude()),
                )
            )
        conn.commit()
        print(f"✅ Insérés {to_create} providers (chacun lié à un prestataire unique).")
    else:
        print("ℹ️  La table providers n’est pas vide.")
    cur.close()
    conn.close()
