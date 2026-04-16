import type { Profile } from "./schema";

/** Social platform → SVG icon path (24x24 viewBox) */
const SOCIAL_ICONS: Record<string, string> = {
  twitter: `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>`,
  x: `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>`,
  instagram: `<rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5"/>`,
  youtube: `<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>`,
  tiktok: `<path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  github: `<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>`,
  linkedin: `<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>`,
};

function socialIcon(platform: string): string {
  const path = SOCIAL_ICONS[platform.toLowerCase()];
  if (!path) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${path}</svg>`;
}

const THEMES: Record<string, { bg: string; card: string; text: string; accent: string; link: string }> = {
  "minimal-light": { bg: "#ffffff", card: "#f5f5f5", text: "#111111", accent: "#6366f1", link: "#ffffff" },
  "minimal-dark": { bg: "#0f0f0f", card: "#1a1a1a", text: "#f5f5f5", accent: "#818cf8", link: "#1a1a1a" },
  "bold": { bg: "#1e1b4b", card: "#312e81", text: "#e0e7ff", accent: "#f59e0b", link: "#312e81" },
};

export function renderProfilePage(profile: Profile): string {
  const t = THEMES[profile.theme] ?? THEMES["minimal-light"];

  const linksHtml = profile.links
    .filter((l) => l.enabled !== false)
    .map(
      (l) =>
        `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="link" data-idx="${profile.links.indexOf(l)}">${escapeHtml(l.title)}</a>`
    )
    .join("\n      ");

  const socialsHtml = profile.socialLinks
    .map(
      (s) =>
        `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="social" title="${escapeHtml(s.platform)}">${socialIcon(s.platform) || escapeHtml(s.platform)}</a>`
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(profile.displayName)} — Links</title>
  <meta name="description" content="${escapeHtml(profile.bio || profile.displayName)}">
  <meta property="og:title" content="${escapeHtml(profile.displayName)}">
  <meta property="og:description" content="${escapeHtml(profile.bio || "")}">
  ${profile.avatarUrl ? `<meta property="og:image" content="${escapeHtml(profile.avatarUrl)}">` : ""}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${t.bg};
      color: ${t.text};
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .container { max-width: 480px; width: 100%; text-align: center; }
    .avatar {
      width: 88px; height: 88px; border-radius: 50%;
      object-fit: cover; margin-bottom: 1rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .bio { opacity: 0.8; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.4; }
    .link {
      display: block; padding: 0.875rem 1.25rem; margin-bottom: 0.75rem;
      background: ${t.accent}; color: ${t.link}; text-decoration: none;
      border-radius: 8px; font-weight: 500; font-size: 1rem;
      transition: opacity 0.15s;
    }
    .link:hover { opacity: 0.85; }
    .socials { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
    .social { color: ${t.text}; opacity: 0.7; transition: opacity 0.15s; }
    .social:hover { opacity: 1; }
    .footer { margin-top: 2.5rem; font-size: 0.75rem; opacity: 0.4; }
    .footer a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    ${profile.avatarUrl ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.displayName)}" class="avatar">` : ""}
    <h1>${escapeHtml(profile.displayName)}</h1>
    ${profile.bio ? `<p class="bio">${escapeHtml(profile.bio)}</p>` : ""}
    <div class="links">
      ${linksHtml}
    </div>
    ${socialsHtml ? `<div class="socials">${socialsHtml}</div>` : ""}
    <p class="footer"><a href="/">cnxt to links</a></p>
  </div>
  <script>
    document.querySelectorAll('.link').forEach(function(a) {
      a.addEventListener('click', function() {
        var idx = a.getAttribute('data-idx');
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/event', JSON.stringify({
            username: '${profile.username}',
            linkIndex: parseInt(idx, 10),
            timestamp: new Date().toISOString()
          }));
        }
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
