import type { Env } from "./storage";

/** Generate a cryptographically random hex token */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a magic-link token, store it in KV, return the full URL */
export async function createMagicLink(
  kv: KVNamespace,
  username: string,
  email: string,
  dashboardOrigin: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  await kv.put(
    `magic:${token}`,
    JSON.stringify({ username, email, expiresAt }),
    { expirationTtl: 900 } // auto-delete after 15 min
  );

  return `${dashboardOrigin}/verify?token=${token}`;
}

/** Verify a magic-link token → exchange for a session token. Returns { sessionToken, username } or null. */
export async function verifyMagicToken(
  kv: KVNamespace
, token: string
): Promise<{ sessionToken: string; username: string } | null> {
  const raw = await kv.get(`magic:${token}`);
  if (!raw) return null;

  const data = JSON.parse(raw) as { username: string; email: string; expiresAt: number };
  if (Date.now() > data.expiresAt) {
    await kv.delete(`magic:${token}`);
    return null;
  }

  // Delete the magic token (single use)
  await kv.delete(`magic:${token}`);

  // Create a session token (30 days)
  const sessionToken = generateToken();
  await kv.put(
    `session:${sessionToken}`,
    JSON.stringify({ username: data.username, email: data.email }),
    { expirationTtl: 60 * 60 * 24 * 30 }
  );

  return { sessionToken, username: data.username };
}

/** Validate a session token → returns username or null */
export async function validateSession(
  kv: KVNamespace,
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const raw = await kv.get(`session:${token}`);
  if (!raw) return null;
  const data = JSON.parse(raw) as { username: string };
  return data.username;
}

/** Store an email→username mapping for login lookups */
export async function setEmailMapping(
  kv: KVNamespace,
  email: string,
  username: string
): Promise<void> {
  await kv.put(`email:${email.toLowerCase()}`, username);
}

/** Look up which username owns an email */
export async function getUsernameByEmail(
  kv: KVNamespace,
  email: string
): Promise<string | null> {
  return kv.get(`email:${email.toLowerCase()}`);
}

/** Send the magic link email via Resend. Returns true if sent, false if no API key (dev mode). */
export async function sendMagicEmail(
  env: Env,
  email: string,
  magicUrl: string
): Promise<boolean> {
  const apiKey = (env as unknown as Record<string, unknown>).RESEND_API_KEY as string | undefined;
  if (!apiKey) return false; // dev mode — caller should return the link directly

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "cnxt to links <noreply@links.cnxt.to>",
      to: [email],
      subject: "Your magic login link",
      html: `
        <div style="font-family:-apple-system,sans-serif; max-width:480px; margin:0 auto; padding:2rem;">
          <h2 style="color:#6366f1;">cnxt to links</h2>
          <p>Click below to log in to your dashboard. This link expires in 15 minutes.</p>
          <a href="${magicUrl}" style="display:inline-block; background:#6366f1; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; margin:1rem 0;">Log in to Dashboard</a>
          <p style="color:#999; font-size:0.85rem;">If you didn't request this, you can safely ignore it.</p>
        </div>
      `,
    }),
  });

  return res.ok;
}
