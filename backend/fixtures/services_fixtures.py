import os
import time
import psycopg2
from psycopg2.extras import Json
from faker import Faker

fake = Faker()

# Créneaux et jours (pour les services qui ont des availabilities)
SLOTS = ['09:00','10:00','11:00','14:00','15:00']
DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

def wait_for_table(db_url: str, table: str, timeout: int = 30):
    """Attends que la table <table> existe dans la base <db_url>."""
    start = time.time()
    while True:
        try:
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            cur.execute("SELECT to_regclass(%s);", (table,))
            if cur.fetchone()[0]:
                cur.close()
                conn.close()
                return
        except Exception:
            pass
        if time.time() - start > timeout:
            raise RuntimeError(f"Table {table} not available after {timeout}s")
        time.sleep(1)

def generate_availability():
    """Pour les services qui ont un champ JSONB availabilities."""
    return { d: { slot: fake.boolean(chance_of_getting_true=50) for slot in SLOTS } for d in DAYS }

# Mapping “type de prestataire” → (nom_table, SQL d’INSERT, fn de génération)
SERVICE_CONFIG = {
    'transport': {
        'table': 'transports',
        'insert_sql': """
            INSERT INTO transports
              (id_provider,
               activity_range,
               vehicle_type,
               driver_name,
               driver_contact,
               license_plate,
               availabilities,
               created_at,
               updated_at)
            VALUES (
               %s,  -- id_provider
               %s,  -- activity_range
               %s,  -- vehicle_type
               %s,  -- driver_name
               %s,  -- driver_contact
               %s,  -- license_plate
               %s,  -- availabilities
               NOW(),
               NOW()
            );
        """,
        'gen_fn': lambda pid: (
            pid,                                      # %s = id_provider
            fake.random_int(5, 100),                  # %s = activity_range
            fake.random_element(('voiture','camion','moto')),  # %s = vehicle_type
            fake.name(),                              # %s = driver_name
            fake.phone_number(),                      # %s = driver_contact
            fake.bothify('??-###-??'),                # %s = license_plate
            Json(generate_availability()),            # %s = availabilities
        ),
        'db_env': 'TRANSPORT_DB_URL'
    },
    'cleaning': {
        'table': 'cleanings',
        'insert_sql': """
            INSERT INTO cleanings
              (id_provider,
               location_type,
               cleaning_duration,
               availabilities,
               created_at,
               updated_at)
            VALUES (
               %s,  -- id_provider
               %s,  -- location_type
               %s,  -- cleaning_duration
               %s,  -- availabilities
               NOW(),
               NOW()
            );
        """,
        'gen_fn': lambda pid: (
            pid,                                      # %s = id_provider
            fake.random_element(('véhicule','maison','bureau')),  # %s = location_type
            fake.random_int(30, 180),                 # %s = cleaning_duration
            Json(generate_availability()),            # %s = availabilities
        ),
        'db_env': 'CLEANING_DB_URL'
    },
    'moving': {
        'table': 'movings',
        'insert_sql': """
            INSERT INTO movings
              (id_provider,
               activity_range,
               team_size,
               truck_size,
               availabilities,
               created_at,
               updated_at)
            VALUES (
               %s,  -- id_provider
               %s,  -- activity_range
               %s,  -- team_size
               %s,  -- truck_size
               %s,  -- availabilities
               NOW(),
               NOW()
            );
        """,
        'gen_fn': lambda pid: (
            pid,                                      # %s = id_provider
            fake.random_int(1, 1000),                 # %s = activity_range
            fake.random_int(1,4),         # %s = team_size
            fake.random_element(('petit','moyen','grand')),  # %s = truck_size
            Json(generate_availability()),            # %s = availabilities
        ),
        'db_env': 'MOVING_DB_URL'
    },
    'repair': {
        'table': 'repairs',
        'insert_sql': """
            INSERT INTO repairs
              (id_provider,
               issue_type,
               expertise_level,
               availabilities,
               created_at,
               updated_at)
            VALUES (
               %s,  -- id_provider
               %s,  -- issue_type
               %s,  -- expertise_level
               %s,  -- availabilities
               NOW(),
               NOW()
            );
        """,
        'gen_fn': lambda pid: (
            pid,                                      # %s = id_provider
            fake.random_element(('batterie','pneu','moteur','autre')),  # %s = issue_type
            fake.random_element(('junior','intermédiaire','senior','expert')),  # %s = expertise_level
            Json(generate_availability()),            # %s = availabilities
        ),
        'db_env': 'REPAIR_DB_URL'
    },
    'childcare': {
        'table': 'child_assistances',
        'insert_sql': """
            INSERT INTO child_assistances
              (id_provider,
               child_count,
               experience,
               availabilities,
               created_at,
               updated_at)
            VALUES (
               %s,  -- id_provider
               %s,  -- child_count
               %s,  -- experience
               %s,  -- availabilities
               NOW(),
               NOW()
            );
        """,
        'gen_fn': lambda pid: (
            pid,                                      # %s = id_provider
            fake.random_int(1,5),                     # %s = child_count
            fake.random_element(('junior','senior','expert')),  # %s = experience
            Json(generate_availability()),            # %s = availabilities
        ),
        'db_env': 'CHILD_ASSISTANCE_DB_URL'
    },
}

def seed_all_services():
    # 1) lire tous les prestataires
    prov_db = os.getenv("PROVIDER_DB_URL")
    wait_for_table(prov_db, "public.providers")
    with psycopg2.connect(prov_db) as conn_p, conn_p.cursor() as cur_p:
        cur_p.execute("SELECT id, type FROM providers;")
        providers = cur_p.fetchall()  # liste de tuples (id_user, type)

    # 2) pour chaque prestataire
    for pid, ptype in providers:
        cfg = SERVICE_CONFIG.get(ptype)
        if not cfg:
            print(f"⚠️ Type inconnu '{ptype}' pour provider {pid}, on skip.")
            continue

        # 3) attendre et ouvrir connexion service
        svc_db = os.getenv(cfg['db_env'])
        wait_for_table(svc_db, f"public.{cfg['table']}")
        with psycopg2.connect(svc_db) as conn_s, conn_s.cursor() as cur_s:
            # 4) vérifier s’il n’existe pas déjà
            cur_s.execute(
                f"SELECT 1 FROM {cfg['table']} WHERE id_provider = %s LIMIT 1;",
                (pid,)
            )
            if cur_s.fetchone():
                continue  # déjà seedé

            # 5) insérer
            cur_s.execute(cfg['insert_sql'], cfg['gen_fn'](pid))
            conn_s.commit()
            print(f"✅ Provider {pid} → service '{ptype}' seedé dans {cfg['table']}")

