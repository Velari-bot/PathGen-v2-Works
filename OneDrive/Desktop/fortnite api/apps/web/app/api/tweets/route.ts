import { NextRequest, NextResponse } from "next/server";

// Cache tweets for 24 hours (in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// In-memory cache
let cachedTweets: any[] | null = null;
let lastFetchTime = 0;

interface ApifyTweet {
  id: string;
  text: string;
  author: {
    userName: string;
    name: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  url?: string;
  media?: any[];
}

/**
 * Fetch tweets from Apify API
 */
async function fetchTweetsFromApify(): Promise<ApifyTweet[]> {
  const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
  const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || "apidojo/tweet-scraper";
  const TWITTER_USERNAME = process.env.TWITTER_USERNAME || "osirion_gg";

  if (!APIFY_API_TOKEN) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  // Check cache first
  const now = Date.now();
  if (cachedTweets && (now - lastFetchTime) < CACHE_DURATION) {
    console.log("Returning cached tweets");
    return cachedTweets;
  }

  try {
    // Run Apify actor to scrape tweets
    const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`;
    
    const runResponse = await fetch(runUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startUrls: [`https://twitter.com/${TWITTER_USERNAME}`],
        maxItems: 50,
        sort: "Latest",
      }),
    });

    if (!runResponse.ok) {
      throw new Error(`Failed to start Apify run: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Wait for the run to complete (with timeout)
    let attempts = 0;
    const maxAttempts = 30;
    let runStatus = "RUNNING";

    while (runStatus === "RUNNING" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}?token=${APIFY_API_TOKEN}`
      );
      
      const statusData = await statusResponse.json();
      runStatus = statusData.data.status;
      attempts++;
    }

    if (runStatus !== "SUCCEEDED") {
      throw new Error(`Apify run did not succeed: ${runStatus}`);
    }

    // Fetch the dataset
    const datasetUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);

    if (!datasetResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
    }

    const tweets = await datasetResponse.json();

    // Deduplicate by tweet ID
    const uniqueTweets: { [key: string]: ApifyTweet } = {};
    tweets.forEach((tweet: any) => {
      if (tweet.id) {
        uniqueTweets[tweet.id] = {
          id: tweet.id,
          text: tweet.text || tweet.full_text || "",
          author: {
            userName: tweet.author?.userName || TWITTER_USERNAME,
            name: tweet.author?.name || "",
            profileImageUrl: tweet.author?.profileImageUrl,
          },
          createdAt: tweet.createdAt || new Date().toISOString(),
          likeCount: tweet.likeCount || 0,
          retweetCount: tweet.retweetCount || 0,
          replyCount: tweet.replyCount || 0,
          url: tweet.url || `https://twitter.com/${TWITTER_USERNAME}/status/${tweet.id}`,
          media: tweet.media || [],
        };
      }
    });

    const deduplicatedTweets = Object.values(uniqueTweets);

    // Update cache
    cachedTweets = deduplicatedTweets;
    lastFetchTime = now;

    return deduplicatedTweets;
  } catch (error) {
    console.error("Error fetching tweets from Apify:", error);
    
    // Return cached tweets if available, even if stale
    if (cachedTweets) {
      console.log("Returning stale cached tweets due to error");
      return cachedTweets;
    }
    
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // Force refresh if requested
    if (forceRefresh) {
      cachedTweets = null;
      lastFetchTime = 0;
    }

    const tweets = await fetchTweetsFromApify();

    return NextResponse.json({
      success: true,
      tweets,
      cached: !forceRefresh && cachedTweets !== null,
      count: tweets.length,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    console.error("Error in tweets API route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tweets",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Optional: Add a POST endpoint to manually trigger refresh
export async function POST(request: NextRequest) {
  try {
    // Clear cache and fetch fresh data
    cachedTweets = null;
    lastFetchTime = 0;

    const tweets = await fetchTweetsFromApify();

    return NextResponse.json({
      success: true,
      message: "Tweets refreshed successfully",
      tweets,
      count: tweets.length,
    });
  } catch (error: any) {
    console.error("Error refreshing tweets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh tweets",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

