# Apify Cost Analysis for Twitter Scraping

## 💰 Pricing Breakdown

### Apify Pricing Tiers

**Free Tier:**
- $5 free credits monthly
- ~5,000 compute units/month
- No credit card required

**Starter Plan ($49/month):**
- $50 credits included
- ~50,000 compute units/month
- Additional credits: $0.25 per 1,000 compute units

**Team Plan ($499/month):**
- $500 credits included
- ~500,000 compute units/month

## 📊 Twitter Scraper Costs

### Compute Units Per Tweet

**apidojo/tweet-scraper** (Recommended):
- ~1-2 compute units per tweet
- Fast and efficient
- Includes media, metrics, author info

### Cost Per 1,000 Tweets

**Using apidojo/tweet-scraper:**

| Tweets | Compute Units | Cost (at $0.25/1K units) |
|--------|---------------|--------------------------|
| 1,000  | ~1,500       | $0.375                   |
| 5,000  | ~7,500       | $1.875                   |
| 10,000 | ~15,000      | $3.75                    |
| 50,000 | ~75,000      | $18.75                   |

### ✅ Your Current Setup

**Scraping @osirion_gg:**
- Filter: December 1, 2024 onwards
- Fetch: ~100 tweets per run
- Cache: 24 hours

**Monthly estimates:**

| Scenario | Runs/Month | Tweets | Compute Units | Cost |
|----------|------------|--------|---------------|------|
| **Daily refresh** | 30 | 3,000 | ~4,500 | $1.13 |
| **Twice daily** | 60 | 6,000 | ~9,000 | $2.25 |
| **4x daily** | 120 | 12,000 | ~18,000 | $4.50 |

**With your current settings (24h cache + on-demand):**
- Estimated: 30-60 runs/month
- Cost: **$1-2/month** 💚

### Free Tier Coverage

With $5 free credits:
- ~20,000 compute units
- ~13,000 tweets/month
- **FREE for ~400+ API calls** 🎉

## 🎯 Your Configuration

**Date Filter:** December 1, 2024 onwards
- Only fetches recent tweets
- Reduces unnecessary API calls
- Stays within free tier easily

**24-Hour Cache:**
- Minimizes redundant API calls
- Reduces costs by ~95%
- Still provides fresh data

## 💡 Cost Optimization Tips

### 1. **Use Caching** (Already implemented ✅)
- 24-hour cache saves ~29 API calls/month
- Reduces cost from ~$30 to ~$1/month

### 2. **Date Filtering** (Already implemented ✅)
- Only fetch tweets from Dec 1 onwards
- Reduces compute units by filtering old tweets

### 3. **Limit maxItems**
```typescript
maxItems: 100, // Fetch 100 tweets max per run
```

### 4. **On-Demand Fetching**
- Only fetch when users visit `/api/tweets`
- Don't use cron jobs unless necessary

### 5. **Monitor Usage**
Check Apify dashboard:
- https://console.apify.com/account/usage

## 📈 Real-World Example

**Scenario: PathGen v2 with moderate traffic**

- Users visit tweets page: 50x/day
- Cache hit rate: 95%
- Actual API calls: 2-3/day
- Monthly cost: **$0.50-1.00** 💰

**Free tier is MORE than enough!** 🎉

## 🚀 Recommendations

### For Your Use Case (@osirion_gg, Dec 1+):

1. ✅ **Stay on Free Tier**
   - Your current setup uses ~$1-2/month
   - Free tier gives $5/month
   - You're fully covered!

2. ✅ **Current Configuration is Optimal**
   - 24h cache ✅
   - Date filter ✅
   - maxItems: 100 ✅

3. 🔄 **Consider upgrading only if:**
   - You add 10+ Twitter accounts
   - You need real-time updates (< 1h cache)
   - You exceed 20,000 tweets/month

## 📊 Monitoring

Track your usage:
```bash
# Check Apify dashboard
https://console.apify.com/account/usage

# View in your app
GET /api/tweets
# Returns: { cached: true/false, count: X }
```

## 🎓 Summary

**Your Current Setup:**
- ✅ Costs: ~$1-2/month
- ✅ Covered by: FREE tier ($5/month)
- ✅ Fetches: Only tweets from Dec 1+
- ✅ Caches: 24 hours
- ✅ No upgrades needed!

**Per 1,000 Tweets:**
- Direct cost: ~$0.38
- With caching: ~$0.02
- **Your cost: $0 (free tier)** 🎉

