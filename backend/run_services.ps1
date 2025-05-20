# Liste des services à lancer
$services = @(
    "api_gateway",
    "services/user_service",
    "services/order_service",
    "services/payment_service",
    "services/notification_service",
    "services/provider_service",
    "services/transport_service",
    "services/moving_service",
    "services/cleaning_service",
    "services/repair_service",
    "services/child_assistance_service"
)

# Démarrage de chaque service dans une nouvelle fenêtre PowerShell
foreach ($service in $services) {
    $fullPath = Join-Path $PWD $service
        $command = "cd `"$fullPath`" ; python -m app.main"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
}
