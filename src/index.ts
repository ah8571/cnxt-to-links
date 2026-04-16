import { getProfile, putProfile, profileExists, type Env } from "./storage";
import { ProfileSchema, RESERVED_SLUGS } from "./schema";
import { renderProfilePage } from "./render";
import {
  createMagicLink,
  verifyMagicToken,
  validateSession,
  setEmailMapping,
  getUsernameByEmail,
  sendMagicEmail,
} from "./auth";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- API routes ---
    if (path.startsWith("/api/")) {
      return handleApi(request, env, path);
    }

    // --- Health check ---
    if (path === "/health") {
      return new Response("ok", { status: 200 });
    }

    // --- Public profile page ---
    // /:username or /:username/links
    const linksMatch = path.match(/^\/([a-z0-9-]{3,30})\/links$/);
    const usernameMatch = linksMatch || path.match(/^\/([a-z0-9-]{3,30})$/);
    if (usernameMatch && request.method === "GET") {
      const username = usernameMatch[1];

      if (RESERVED_SLUGS.has(username)) {
        return notFound();
      }

      const profile = await getProfile(env.PROFILES, username);
      if (!profile) return notFound();

      // Track page view
      trackView(env.ANALYTICS, username).catch(() => {});

      const html = renderProfilePage(profile);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    // --- Root / landing ---
    if (path === "/") {
      return new Response("links by cnxt — coming soon", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return notFound();
  },
};

// ---- API handler ----

async function handleApi(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  const allowedOrigins = ["https://links.cnxt.to", "https://links-cnxt-dashboard.pages.dev", "http://localhost:5173", "http://localhost:3000"];
  const origin = request.headers.get("Origin") ?? "";
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // POST /api/event — analytics click tracking (public)
  if (path === "/api/event" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        username?: string;
        linkIndex?: number;
        timestamp?: string;
      };
      if (body.username && typeof body.linkIndex === "number") {
        await trackClick(env.ANALYTICS, body.username, body.linkIndex);
      }
      return new Response("ok", { status: 200, headers: corsHeaders });
    } catch {
      return new Response("bad request", { status: 400, headers: corsHeaders });
    }
  }

  // ---- Auth routes ----

  // POST /api/auth/magic — send a magic link to email (for existing users)
  if (path === "/api/auth/magic" && request.method === "POST") {
    try {
      const body = (await request.json()) as { email?: string };
      const email = body.email?.toLowerCase().trim();
      if (!email) {
        return jsonResponse({ error: "email required" }, 400, corsHeaders);
      }

      const username = await getUsernameByEmail(env.ANALYTICS, email);
      if (!username) {
        // Don't reveal if email exists or not
        return jsonResponse({ ok: true, message: "If that email is registered, a login link has been sent." }, 200, corsHeaders);
      }

      const dashboardOrigin = corsOrigin.includes("localhost") ? corsOrigin : "https://links.cnxt.to";
      const magicUrl = await createMagicLink(env.ANALYTICS, username, email, dashboardOrigin);
      const emailSent = await sendMagicEmail(env, email, magicUrl);

      if (emailSent) {
        return jsonResponse({ ok: true, message: "If that email is registered, a login link has been sent." }, 200, corsHeaders);
      }
      // Dev mode: no email service configured — return link directly
      return jsonResponse({ ok: true, message: "Magic link created (dev mode — no email service)", magicUrl }, 200, corsHeaders);
    } catch {
      return jsonResponse({ error: "bad request" }, 400, corsHeaders);
    }
  }

  // POST /api/auth/verify — exchange magic token for session token
  if (path === "/api/auth/verify" && request.method === "POST") {
    try {
      const body = (await request.json()) as { token?: string };
      if (!body.token) {
        return jsonResponse({ error: "token required" }, 400, corsHeaders);
      }

      const result = await verifyMagicToken(env.ANALYTICS, body.token);
      if (!result) {
        return jsonResponse({ error: "Invalid or expired link" }, 401, corsHeaders);
      }

      return jsonResponse({ ok: true, sessionToken: result.sessionToken, username: result.username }, 200, corsHeaders);
    } catch {
      return jsonResponse({ error: "bad request" }, 400, corsHeaders);
    }
  }

  // GET /api/auth/me — get current user from session token
  if (path === "/api/auth/me" && request.method === "GET") {
    const username = await validateSession(env.ANALYTICS, request.headers.get("Authorization"));
    if (!username) {
      return jsonResponse({ error: "unauthorized" }, 401, corsHeaders);
    }
    const profile = await getProfile(env.PROFILES, username);
    if (!profile) {
      return jsonResponse({ error: "profile not found" }, 404, corsHeaders);
    }
    const { email: _email, ...publicProfile } = profile;
    return jsonResponse(publicProfile, 200, corsHeaders);
  }

  // GET /api/profile/:username (public — strip email)
  const profileMatch = path.match(/^\/api\/profile\/([a-z0-9-]{3,30})$/);
  if (profileMatch && request.method === "GET") {
    const profile = await getProfile(env.PROFILES, profileMatch[1]);
    if (!profile)
      return jsonResponse({ error: "not found" }, 404, corsHeaders);
    // Strip email from public response
    const { email: _email, ...publicProfile } = profile;
    return jsonResponse(publicProfile, 200, corsHeaders);
  }

  // POST /api/profile — create new profile (public, but stores email + returns session)
  if (path === "/api/profile" && request.method === "POST") {
    try {
      const body = await request.json();
      const parsed = ProfileSchema.parse(body);

      if (RESERVED_SLUGS.has(parsed.username)) {
        return jsonResponse({ error: "username reserved" }, 400, corsHeaders);
      }

      if (await profileExists(env.PROFILES, parsed.username)) {
        return jsonResponse({ error: "username taken" }, 409, corsHeaders);
      }

      // Check if email is already in use
      const existingUsername = await getUsernameByEmail(env.ANALYTICS, parsed.email);
      if (existingUsername) {
        return jsonResponse({ error: "email already associated with another account" }, 409, corsHeaders);
      }

      const now = new Date().toISOString();
      const profile = { ...parsed, createdAt: now, updatedAt: now };
      await putProfile(env.PROFILES, profile);

      // Store email→username mapping
      await setEmailMapping(env.ANALYTICS, parsed.email, parsed.username);

      // Create a session token so user is logged in immediately
      const dashboardOrigin = corsOrigin.includes("localhost") ? corsOrigin : "https://links.cnxt.to";
      const magicUrl = await createMagicLink(env.ANALYTICS, parsed.username, parsed.email, dashboardOrigin);
      // Immediately verify it to get a session token (skip email for signup)
      const token = magicUrl.split("token=")[1];
      const session = await verifyMagicToken(env.ANALYTICS, token);

      // Strip email from response
      const { email: _email, ...publicProfile } = profile;
      return jsonResponse({ ...publicProfile, sessionToken: session?.sessionToken }, 201, corsHeaders);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "invalid request";
      return jsonResponse({ error: message }, 400, corsHeaders);
    }
  }

  // PUT /api/profile/:username — update existing profile (requires auth)
  if (profileMatch && request.method === "PUT") {
    const username = profileMatch[1];

    // Validate session
    const sessionUser = await validateSession(env.ANALYTICS, request.headers.get("Authorization"));
    if (!sessionUser || sessionUser !== username) {
      return jsonResponse({ error: "unauthorized" }, 401, corsHeaders);
    }

    const existing = await getProfile(env.PROFILES, username);
    if (!existing)
      return jsonResponse({ error: "not found" }, 404, corsHeaders);

    try {
      const body = (await request.json()) as Record<string, unknown>;
      // Keep original email — don't allow changing it via profile update
      const parsed = ProfileSchema.parse({ ...body, username, email: existing.email });
      const updated = {
        ...parsed,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await putProfile(env.PROFILES, updated);
      // Strip email from response
      const { email: _email, ...publicProfile } = updated;
      return jsonResponse(publicProfile, 200, corsHeaders);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "invalid request";
      return jsonResponse({ error: message }, 400, corsHeaders);
    }
  }

  return jsonResponse({ error: "not found" }, 404, corsHeaders);
}

// ---- Analytics helpers ----

async function trackView(kv: KVNamespace, username: string): Promise<void> {
  const date = new Date().toISOString().split("T")[0];
  const key = `views:${username}:${date}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 24 * 90 });
}

async function trackClick(
  kv: KVNamespace,
  username: string,
  linkIndex: number
): Promise<void> {
  const date = new Date().toISOString().split("T")[0];
  const key = `clicks:${username}:${linkIndex}:${date}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 24 * 90 });
}

// ---- Helpers ----

function jsonResponse(
  data: unknown,
  status: number,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function notFound(): Response {
  return new Response("not found", { status: 404 });
}
