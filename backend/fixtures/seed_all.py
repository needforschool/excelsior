# fixtures/seed_all.py
from user_fixtures import seed_users
from provider_fixtures import seed_providers

def main():
    print("🔄 Démarrage du seed global")
    seed_users(count=100)
    seed_providers(count=50)
    print("🎉 Seed terminé.")

if __name__ == "__main__":
    main()
