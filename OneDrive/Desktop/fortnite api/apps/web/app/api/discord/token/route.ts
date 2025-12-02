import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, redirectUri } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Discord OAuth not configured");
      return NextResponse.json(
        { error: "Discord OAuth not configured" },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Discord token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Failed to exchange authorization code" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    // Get user information
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Discord user fetch failed:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch user information" },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();

    // Return both token and user data
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        verified: userData.verified,
        mfa_enabled: userData.mfa_enabled,
        locale: userData.locale,
      },
    });
  } catch (error: any) {
    console.error("Discord OAuth error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

