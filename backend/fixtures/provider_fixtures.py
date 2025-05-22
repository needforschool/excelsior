import os
import psycopg2
from faker import Faker

fake = Faker()

def seed_providers():
    """Peuple la table providers pour chaque utilisateur prestataire, sans duplication."""
    # 1) Récupérer tous les IDs de prestataires depuis users
    user_db_url = os.getenv("USER_DB_URL")
    with psycopg2.connect(user_db_url) as conn_user, conn_user.cursor() as cur_user:
        cur_user.execute("SELECT id FROM users WHERE role='prestataire';")
        prest_ids = [r[0] for r in cur_user.fetchall()]

    if not prest_ids:
        print("⚠️ Aucun utilisateur avec role='prestataire' trouvé.")
        return

    # 2) Connexion à la base providers
    prov_db_url = os.getenv("PROVIDER_DB_URL")
    with psycopg2.connect(prov_db_url) as conn, conn.cursor() as cur:
        for uid in prest_ids:
            # Vérifier qu'on n'a pas déjà un provider pour cet utilisateur
            cur.execute(
                "SELECT 1 FROM providers WHERE id_user = %s LIMIT 1;",
                (uid,)
            )
            if cur.fetchone():
                continue  # on skip si déjà présent

            # Insertion du provider pour cet utilisateur
            cur.execute(
                """
                INSERT INTO providers
                  (id_user, type, latitude, longitude, created_at, updated_at,
                   name, description, short_description)
                VALUES (%s, %s, %s, %s, NOW(), NOW(), %s, %s, %s);
                """,
                (
                    uid,
                    fake.random_element(elements=("transport","cleaning","repair","childcare","moving")),
                    float(fake.latitude()),
                    float(fake.longitude()),
                    fake.company(),
                    fake.catch_phrase(),
                    fake.sentence(nb_words=10)
                )
            )
        conn.commit()
        print(f"✅ Providers créés pour {len(prest_ids)} prestataires (sans duplication).")
