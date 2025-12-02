# Apify Twitter Integration Setup

## 🐦 Twitter Scraper with Apify

This guide shows you how to set up automatic Twitter scraping for your PathGen v2 app using Apify.

## 📋 Prerequisites

1. **Apify Account**: Sign up at https://apify.com
2. **Apify API Token**: Get from https://console.apify.com/account/integrations
3. **Twitter Username**: The account you want to scrape (default: `osirion_gg`)

## 🔧 Setup Instructions

### Step 1: Get Apify API Token

1. Go to https://console.apify.com/account/integrations
2. Copy your API token
3. Save it for the next step

### Step 2: Choose an Apify Actor

Recommended actors for Twitter scraping:
- `apidojo/tweet-scraper` (Free tier available)
- `clockworks/twitter-scraper`
- `quacker/twitter-scraper`

You can browse more at: https://apify.com/store?search=twitter

### Step 3: Add Environment Variables to Vercel

Run this PowerShell script or add manually in Vercel dashboard:

```powershell
# Navigate to your project
cd "C:\Users\bende\OneDrive\Desktop\fortnite api\apps\web"

# Set Apify environment variables
vercel env add APIFY_API_TOKEN
# Paste your Apify API token when prompted

vercel env add APIFY_ACTOR_ID
# Enter: apidojo/tweet-scraper (or your chosen actor)

vercel env add TWITTER_USERNAME
# Enter: osirion_gg (or your Twitter username)
```

Or add manually in Vercel Dashboard:
1. Go to: https://vercel.com/velari-bots-projects/pathgen/settings/environment-variables
2. Add these variables:
   - `APIFY_API_TOKEN`: Your Apify API token
   - `APIFY_ACTOR_ID`: `apidojo/tweet-scraper`
   - `TWITTER_USERNAME`: `osirion_gg`

### Step 4: Deploy to Vercel

```bash
cd "C:\Users\bende\OneDrive\Desktop\fortnite api"
vercel --prod
```

## 📡 API Endpoints

### GET /api/tweets

Fetch latest tweets (cached for 24 hours):

```javascript
const response = await fetch('https://pathgen.dev/api/tweets');
const data = await response.json();

console.log(data);
// {
//   success: true,
//   tweets: [...],
//   cached: true,
//   count: 50
// }
```

### GET /api/tweets?refresh=true

Force refresh (bypass cache):

```javascript
const response = await fetch('https://pathgen.dev/api/tweets?refresh=true');
const data = await response.json();
```

### POST /api/tweets

Manually trigger refresh:

```javascript
const response = await fetch('https://pathgen.dev/api/tweets', {
  method: 'POST'
});
const data = await response.json();
```

## 🎨 Frontend Integration

### Example React Component

```typescript
import { useEffect, useState } from 'react';

interface Tweet {
  id: string;
  text: string;
  author: {
    userName: string;
    name: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  url: string;
}

export default function TweetFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tweets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTweets(data.tweets);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tweets:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading tweets...</div>;

  return (
    <div className="tweet-feed">
      {tweets.map(tweet => (
        <div key={tweet.id} className="tweet">
          <div className="tweet-author">
            {tweet.author.profileImageUrl && (
              <img src={tweet.author.profileImageUrl} alt={tweet.author.name} />
            )}
            <div>
              <strong>{tweet.author.name}</strong>
              <span>@{tweet.author.userName}</span>
            </div>
          </div>
          <p>{tweet.text}</p>
          <div className="tweet-stats">
            <span>❤️ {tweet.likeCount}</span>
            <span>🔁 {tweet.retweetCount}</span>
          </div>
          <a href={tweet.url} target="_blank" rel="noopener noreferrer">
            View on Twitter
          </a>
        </div>
      ))}
    </div>
  );
}
```

## ⏰ Automatic Updates (Cron Job)

To automatically refresh tweets every 24 hours, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/tweets",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This will hit the endpoint daily at midnight UTC.

## 💰 Apify Pricing

- **Free tier**: 5,000 actor compute units/month (~500 tweets)
- **Paid plans**: Start at $49/month for more usage
- See: https://apify.com/pricing

## 🔍 Testing Locally

Create a `.env.local` file:

```bash
APIFY_API_TOKEN=your_token_here
APIFY_ACTOR_ID=apidojo/tweet-scraper
TWITTER_USERNAME=osirion_gg
```

Then run:

```bash
cd apps/web
npm run dev
```

Visit: http://localhost:3000/api/tweets

## 🐛 Troubleshooting

### Error: "APIFY_API_TOKEN is not configured"
- Make sure you've added the environment variable to Vercel
- Redeploy after adding environment variables

### Error: "Apify run did not succeed"
- Check your Apify account for run logs
- Verify the actor ID is correct
- Ensure you have enough Apify credits

### Tweets not updating
- Call `/api/tweets?refresh=true` to force refresh
- Check Vercel function logs for errors
- Verify Twitter username is correct

## 📚 Additional Resources

- Apify Documentation: https://docs.apify.com
- Twitter Scraper Actors: https://apify.com/store?search=twitter
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs

## ✅ Next Steps

1. Add environment variables to Vercel
2. Deploy to production
3. Test the `/api/tweets` endpoint
4. Integrate into your frontend
5. (Optional) Set up cron job for auto-refresh

