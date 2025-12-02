# PowerShell script to add Apify environment variables to Vercel
# Run this from: apps/web directory

Write-Host "Adding Apify Twitter Integration to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "ERROR: Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "You'll need the following:" -ForegroundColor Yellow
Write-Host "  1. Apify API Token (from https://console.apify.com/account/integrations)" -ForegroundColor Gray
Write-Host "  2. Apify Actor ID (e.g., apidojo/tweet-scraper)" -ForegroundColor Gray
Write-Host "  3. Twitter Username to scrape (e.g., osirion_gg)" -ForegroundColor Gray
Write-Host ""

# Set APIFY_API_TOKEN
Write-Host "Setting APIFY_API_TOKEN..." -ForegroundColor Cyan
$apiToken = Read-Host "Enter your Apify API Token"
if ($apiToken) {
    echo $apiToken | vercel env add APIFY_API_TOKEN production
    echo $apiToken | vercel env add APIFY_API_TOKEN preview
    Write-Host "SUCCESS: APIFY_API_TOKEN added" -ForegroundColor Green
} else {
    Write-Host "WARNING: Skipped APIFY_API_TOKEN" -ForegroundColor Yellow
}

Write-Host ""

# Set APIFY_ACTOR_ID
Write-Host "Setting APIFY_ACTOR_ID..." -ForegroundColor Cyan
$actorId = Read-Host "Enter Apify Actor ID (default: apidojo/tweet-scraper)"
if (-not $actorId) {
    $actorId = "apidojo/tweet-scraper"
}
echo $actorId | vercel env add APIFY_ACTOR_ID production
echo $actorId | vercel env add APIFY_ACTOR_ID preview
Write-Host "SUCCESS: APIFY_ACTOR_ID set to: $actorId" -ForegroundColor Green

Write-Host ""

# Set TWITTER_USERNAME
Write-Host "Setting TWITTER_USERNAME..." -ForegroundColor Cyan
$twitterUsername = Read-Host "Enter Twitter username to scrape (default: osirion_gg)"
if (-not $twitterUsername) {
    $twitterUsername = "osirion_gg"
}
echo $twitterUsername | vercel env add TWITTER_USERNAME production
echo $twitterUsername | vercel env add TWITTER_USERNAME preview
Write-Host "SUCCESS: TWITTER_USERNAME set to: @$twitterUsername" -ForegroundColor Green

Write-Host ""
Write-Host "SUCCESS: Apify environment variables added!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy to Vercel: vercel --prod" -ForegroundColor Gray
Write-Host "  2. Test endpoint: https://pathgen.dev/api/tweets" -ForegroundColor Gray
Write-Host ""
Write-Host "See APIFY_TWITTER_SETUP.md for full documentation" -ForegroundColor Cyan

