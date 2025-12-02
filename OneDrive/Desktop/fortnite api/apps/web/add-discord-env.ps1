# PowerShell script to add Discord OAuth environment variables to Vercel
# Run this from: apps/web directory

Write-Host "Adding Discord OAuth to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "ERROR: Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "You'll need:" -ForegroundColor Yellow
Write-Host "  1. Discord Client ID (from https://discord.com/developers/applications)" -ForegroundColor Gray
Write-Host "  2. Discord Client Secret (from same page)" -ForegroundColor Gray
Write-Host ""

# Set DISCORD_CLIENT_ID
Write-Host "Setting DISCORD_CLIENT_ID..." -ForegroundColor Cyan
$clientId = Read-Host "Enter your Discord Client ID"
if ($clientId) {
    echo $clientId | vercel env add DISCORD_CLIENT_ID production
    echo $clientId | vercel env add DISCORD_CLIENT_ID preview
    Write-Host "SUCCESS: DISCORD_CLIENT_ID added" -ForegroundColor Green
} else {
    Write-Host "WARNING: Skipped DISCORD_CLIENT_ID" -ForegroundColor Yellow
}

Write-Host ""

# Set DISCORD_CLIENT_SECRET
Write-Host "Setting DISCORD_CLIENT_SECRET..." -ForegroundColor Cyan
$clientSecret = Read-Host "Enter your Discord Client Secret"
if ($clientSecret) {
    echo $clientSecret | vercel env add DISCORD_CLIENT_SECRET production
    echo $clientSecret | vercel env add DISCORD_CLIENT_SECRET preview
    Write-Host "SUCCESS: DISCORD_CLIENT_SECRET added" -ForegroundColor Green
} else {
    Write-Host "WARNING: Skipped DISCORD_CLIENT_SECRET" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SUCCESS: Discord OAuth environment variables added!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy to Vercel: vercel --prod" -ForegroundColor Gray
Write-Host "  2. Test login at: https://pathgen.dev/setup.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Discord Application Settings:" -ForegroundColor Cyan
Write-Host "  Make sure your Redirect URI is set to:" -ForegroundColor Gray
Write-Host "  https://pathgen.dev/setup.html" -ForegroundColor Green

