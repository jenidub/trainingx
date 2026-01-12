import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs"; // important, do not run in edge

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const { room, identity, name } = await req.json().catch(() => ({}));

  if (!room || typeof room !== "string") return jsonError("Missing room");
  if (!identity || typeof identity !== "string")
    return jsonError("Missing identity");

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return jsonError(
      "Server misconfigured: missing LIVEKIT_API_KEY/SECRET",
      500
    );
  }

  // Optional: validate room naming rules to prevent abuse
  // Example: only allow rooms that start with "study_"
  // if (!room.startsWith("study_")) return jsonError("Invalid room", 403);

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: typeof name === "string" ? name : identity,
  });

  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({
    token: token.toJwt(),
    url: process.env.LIVEKIT_URL,
  });
}
