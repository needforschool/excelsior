from user_fixtures import seed_users
from provider_fixtures import seed_providers
from services_fixtures import seed_all_services

USER_COUNT = 300

def main():
    print("🔄 Démarrage du seed global")
    seed_users(count=USER_COUNT)
    seed_providers()
    seed_all_services()
    print("🎉 Seed terminé.")

if __name__ == "__main__":
    main()
