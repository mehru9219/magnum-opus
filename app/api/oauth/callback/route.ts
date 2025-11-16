import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for third-party platform integrations
 * (WordPress, Shopify, Medium, LinkedIn, Webflow, etc.)
 *
 * This endpoint receives OAuth callback codes and exchanges them for access tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/publish?error=${encodeURIComponent(error)}`,
        request.url
      )
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  try {
    // Decode state to determine which platform this is for
    const stateData = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8")
    );
    const { platform, userId } = stateData;

    // TODO: Exchange code for access token based on platform
    // This will be implemented by Agent 4 (Publishing Backend)
    console.log("OAuth callback:", { platform, userId, code });

    // TODO: Store credentials in Convex
    // await storeOAuthCredentials(platform, userId, accessToken, refreshToken);

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL(
        `/dashboard/publish?success=true&platform=${platform}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/publish?error=${encodeURIComponent("Failed to connect platform")}`,
        request.url
      )
    );
  }
}
