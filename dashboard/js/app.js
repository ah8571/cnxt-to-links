// --- Config ---
const API_BASE = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8787"
  : "https://cnxt.to";

const PUBLIC_BASE = API_BASE.replace("http://127.0.0.1:8787", "http://127.0.0.1:8787");

// --- State ---
let currentUser = null; // { username, ...profile } or null
let sessionToken = localStorage.getItem("cnxt_session") || null;
let sessionEmail = null; // email from verified session (for new users)
let currentView = "landing";

// --- Router ---
function navigate(view, pushState = true) {
  currentView = view;
  if (pushState) {
    const paths = { landing: "/", editor: "/editor", "magic-sent": "/magic-sent" };
    history.pushState(null, "", paths[view] || "/");
  }
  render();
}

window.addEventListener("popstate", () => {
  const path = location.pathname;
  if (path === "/editor") navigate("editor", false);
  else if (path === "/magic-sent") navigate("magic-sent", false);
  else navigate("landing", false);
});

// --- API helpers ---
async function apiGet(path) {
  const headers = {};
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, data) {
  const headers = { "Content-Type": "application/json" };
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

async function apiPut(path, data) {
  const headers = { "Content-Type": "application/json" };
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

// --- Render ---
function render() {
  const app = document.getElementById("app");
  switch (currentView) {
    case "landing":    app.innerHTML = renderLanding(); bindLanding(); break;
    case "magic-sent": app.innerHTML = renderMagicSent(); bindMagicSent(); break;
    case "editor":     app.innerHTML = renderEditor(); bindEditor(); break;
    default:           app.innerHTML = renderLanding(); bindLanding();
  }
}

// --- Magic link verification on page load ---
async function handleVerifyOnLoad() {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  if (!token || !location.pathname.startsWith("/verify")) return;

  try {
    const result = await apiPost("/api/auth/verify", { token });
    if (result.sessionToken) {
      sessionToken = result.sessionToken;
      localStorage.setItem("cnxt_session", sessionToken);

      if (result.needsSetup) {
        // New user — go straight to editor in setup mode
        sessionEmail = result.email;
        currentUser = null;
        navigate("editor");
      } else {
        // Existing user — load their profile
        await loadProfile(result.username);
      }
      return;
    }
  } catch (err) {
    alert("Login link is invalid or expired. Please request a new one.");
  }
  navigate("landing");
}

// ========================
//  LANDING PAGE — email-first
// ========================
function renderLanding() {
  return `
    <header class="header">
      <div class="header-logo"><span style="color:var(--accent)">cnxt to</span> links</div>

    </header>
    <div class="container">
      <div class="hero centered">
        <h1>Your links.<br><span>One page. Free for most users.</span></h1>
        <p>Create your link-in-bio page in seconds. No fees, no lock-in, open source.</p>
        <div class="claim-form">
          <input type="email" class="form-input" id="start-email" placeholder="you@example.com" maxlength="320" style="border-radius:var(--radius) 0 0 var(--radius);">
          <button class="btn btn-primary" id="start-btn">Get Started</button>
        </div>
        <p id="start-error" class="alert alert-error" style="display:none; margin-top:1rem;"></p>
        <p id="start-info" style="display:none; margin-top:1rem; color:var(--text-muted); font-size:0.9rem;"></p>
      </div>

      <div class="features">
        <div class="card feature">
          <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <h3>Instant Pages</h3>
          <p>Your page loads in milliseconds from the edge. No spinners, no delays.</p>
        </div>
        <div class="card feature">
          <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17.5 10.5a5 5 0 0 0-10 0"/><circle cx="8.5" cy="14" r="2.5"/><path d="M12.5 17.5a5 5 0 0 0-8 0"/><circle cx="17" cy="15.5" r="2"/><path d="M20 19a4 4 0 0 0-6 0"/></svg></div>
          <h3>Clean Themes</h3>
          <p>Minimal light, dark, and bold themes. Your content is the focus.</p>
        </div>
        <div class="card feature">
          <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <h3>Simple Analytics</h3>
          <p>See who's clicking your links. No cookies, no creepy tracking.</p>
        </div>
        <div class="card feature">
          <div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>
          <h3>Open Source</h3>
          <p>GNU licensed. Self-host it. Fork it. Own your data completely.</p>
        </div>
      </div>

      <footer class="footer">
        <p>cnxt to links — open source, free for most users — <a href="https://github.com/ah8571/cnxt-to-links" target="_blank">github</a></p>
      </footer>
    </div>
  `;
}

function bindLanding() {
  const input = document.getElementById("start-email");
  const btn = document.getElementById("start-btn");
  const errorEl = document.getElementById("start-error");
  const infoEl = document.getElementById("start-info");

  btn.addEventListener("click", () => handleStart(input, errorEl, infoEl, btn));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleStart(input, errorEl, infoEl, btn);
  });
}

async function handleStart(input, errorEl, infoEl, btn) {
  const email = input.value.trim().toLowerCase();
  errorEl.style.display = "none";
  infoEl.style.display = "none";

  if (!email || !email.includes("@")) {
    errorEl.textContent = "Please enter a valid email address";
    errorEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "...";

  try {
    const result = await apiPost("/api/auth/start", { email });

    if (result.magicUrl) {
      // Dev mode — show clickable link
      infoEl.innerHTML = `Check your email! <a href="${escapeHtml(result.magicUrl)}" style="color:var(--accent);">Click here to log in</a> <span style="font-size:0.8rem;">(dev mode)</span>`;
      infoEl.style.display = "block";
    } else {
      // Production — email sent, go to confirmation page
      navigate("magic-sent");
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  }

  btn.disabled = false;
  btn.textContent = "Get Started";
}

// ========================
//  MAGIC LINK SENT (confirmation)
// ========================
function renderMagicSent() {
  return `
    <header class="header">
      <a href="/" class="header-logo" id="nav-home"><span style="color:var(--accent)">cnxt to</span> links</a>
    </header>
    <div class="container" style="max-width: 440px;">
      <div class="centered">
        <h2 style="margin-bottom: 0.5rem;">Check your email</h2>
        <p style="color:var(--text-muted); margin-bottom: 1.5rem;">We sent a login link. Click it to open your dashboard. No password needed.</p>
        <button class="btn btn-secondary" id="back-btn">Back to home</button>
      </div>
    </div>
  `;
}

function bindMagicSent() {
  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("landing");
  });
  document.getElementById("back-btn").addEventListener("click", () => navigate("landing"));
}

// ========================
//  PROFILE EDITOR (handles both new + existing users)
// ========================
let usernameCheckTimer = null;
let lastCheckedUsername = "";
let usernameAvailable = false;

function renderEditor() {
  const isNewUser = !currentUser;
  const profile = currentUser || { displayName: "", bio: "", avatarUrl: "", theme: "minimal-dark", links: [], socialLinks: [] };
  const publicUrl = currentUser ? `${PUBLIC_BASE.replace("http://127.0.0.1:8787", "cnxt.to")}/${profile.username}` : null;
  const displayUrl = currentUser ? `cnxt.to/${profile.username}` : null;

  const linksHtml = (profile.links || []).map((link, i) => `
    <div class="link-item" data-index="${i}">
      <div class="link-item-content">
        <div class="link-item-title">${escapeHtml(link.title)}</div>
        <div class="link-item-url">${escapeHtml(link.url)}</div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${link.enabled !== false ? "checked" : ""} data-toggle="${i}">
        <span class="toggle-slider"></span>
      </label>
      <button class="btn btn-danger btn-sm" data-delete="${i}">✕</button>
    </div>
  `).join("");

  return `
    <header class="header">
      <a href="/" class="header-logo" id="nav-home"><span style="color:var(--accent)">cnxt to</span> links</a>
      <nav class="header-nav">
        ${currentUser ? `<a href="${publicUrl.startsWith("cnxt") ? "https://" + publicUrl : publicUrl}" target="_blank" class="btn btn-secondary btn-sm">View Page</a>` : ""}
        <button class="btn btn-secondary btn-sm" id="logout-btn">Log out</button>
      </nav>
    </header>
    <div class="container">
      ${isNewUser ? `
        <h2 style="margin-bottom: 0.25rem;">Set up your page</h2>
        <p style="color:var(--text-muted); margin-bottom: 1.5rem;">Choose a URL and fill in your details below.</p>
      ` : `
        <div class="url-bar">
          <span class="url-bar-link">${escapeHtml(displayUrl)}</span>
          <button class="btn btn-sm btn-secondary" id="copy-url">Copy</button>
        </div>
      `}

      <div id="save-status"></div>

      ${isNewUser ? `
        <!-- Username claim (new users only) -->
        <div class="form-group">
          <label class="form-label">Choose your URL</label>
          <div class="claim-form" style="margin-bottom:0;">
            <div class="claim-prefix">cnxt.to/</div>
            <input type="text" class="form-input" id="edit-username" placeholder="yourname" maxlength="30" style="border-radius:0 var(--radius) var(--radius) 0;">
          </div>
          <p id="username-status" style="font-size:0.8rem; margin-top:0.35rem; min-height:1.2em;">&nbsp;</p>
        </div>
      ` : ""}

      <!-- Profile Details -->
      <p class="section-title">Profile</p>
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-input" id="edit-name" value="${escapeAttr(profile.displayName)}" maxlength="100" placeholder="Jane Doe">
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="form-textarea" id="edit-bio" maxlength="500" rows="2" placeholder="Designer & content creator">${escapeHtml(profile.bio || "")}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Avatar URL</label>
        <input type="url" class="form-input" id="edit-avatar" value="${escapeAttr(profile.avatarUrl || "")}" placeholder="https://...">
      </div>

      <!-- Theme -->
      <p class="section-title">Theme</p>
      <div class="theme-options" style="margin-bottom:1.5rem;">
        <div class="theme-option theme-light ${profile.theme === "minimal-light" ? "active" : ""}" data-theme="minimal-light">Light</div>
        <div class="theme-option theme-dark ${profile.theme === "minimal-dark" ? "active" : ""}" data-theme="minimal-dark">Dark</div>
        <div class="theme-option theme-bold ${profile.theme === "bold" ? "active" : ""}" data-theme="bold">Bold</div>
      </div>

      <!-- Links -->
      <p class="section-title">Links</p>
      <div id="links-list">
        ${linksHtml || '<p style="color:var(--text-muted); font-size:0.9rem;">No links yet. Add one below.</p>'}
      </div>

      <div class="card" style="margin-top:0.75rem; margin-bottom:1.5rem;">
        <div class="form-group" style="margin-bottom:0.5rem;">
          <input type="text" class="form-input" id="new-link-title" placeholder="Link title" maxlength="100">
        </div>
        <div class="form-group" style="margin-bottom:0.5rem;">
          <input type="url" class="form-input" id="new-link-url" placeholder="https://...">
        </div>
        <button class="btn btn-secondary btn-sm" id="add-link-btn">+ Add Link</button>
      </div>

      <!-- Social Links -->
      <p class="section-title">Social Profiles</p>
      <div id="socials-list" style="margin-bottom:0.75rem;">
        ${(profile.socialLinks || []).map((s, i) => `
          <div class="link-item" style="margin-bottom:0.5rem;">
            <div class="link-item-content">
              <div class="link-item-title">${escapeHtml(s.platform)}</div>
              <div class="link-item-url">${escapeHtml(s.url)}</div>
            </div>
            <button class="btn btn-danger btn-sm" data-delete-social="${i}">✕</button>
          </div>
        `).join("")}
      </div>
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="form-group" style="margin-bottom:0.5rem;">
          <select class="form-select" id="new-social-platform">
            <option value="">Select platform...</option>
            <option value="twitter">Twitter / X</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0.5rem;">
          <input type="url" class="form-input" id="new-social-url" placeholder="https://...">
        </div>
        <button class="btn btn-secondary btn-sm" id="add-social-btn">+ Add Social</button>
      </div>

      <!-- Save -->
      <button class="btn btn-primary btn-block" id="save-btn" style="margin-bottom:2rem;">${isNewUser ? "Create My Page" : "Save Changes"}</button>

      <footer class="footer">
        <p>cnxt to links — open source, free for most users — <a href="https://github.com/ah8571/cnxt-to-links" target="_blank">github</a></p>
      </footer>
    </div>
  `;
}

function bindEditor() {
  const isNewUser = !currentUser;

  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("landing");
  });

  // Copy URL (existing users only)
  const copyBtn = document.getElementById("copy-url");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const url = `https://cnxt.to/${currentUser.username}`;
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
      });
    });
  }

  // Username availability check (new users only)
  const usernameInput = document.getElementById("edit-username");
  if (usernameInput) {
    usernameAvailable = false;
    usernameInput.addEventListener("input", () => {
      usernameInput.value = usernameInput.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
      const val = usernameInput.value;
      const statusEl = document.getElementById("username-status");

      if (val.length < 3) {
        statusEl.textContent = val.length > 0 ? "Must be at least 3 characters" : " ";
        statusEl.style.color = "var(--text-muted)";
        usernameAvailable = false;
        return;
      }

      statusEl.textContent = "Checking...";
      statusEl.style.color = "var(--text-muted)";
      usernameAvailable = false;

      clearTimeout(usernameCheckTimer);
      usernameCheckTimer = setTimeout(() => checkUsername(val, statusEl), 350);
    });
  }

  // Theme selection
  document.querySelectorAll("[data-theme]").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll("[data-theme]").forEach((e) => e.classList.remove("active"));
      el.classList.add("active");
      if (currentUser) currentUser.theme = el.dataset.theme;
    });
  });

  // Toggle link enabled
  document.querySelectorAll("[data-toggle]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.toggle);
      currentUser.links[i].enabled = el.checked;
    });
  });

  // Delete link
  document.querySelectorAll("[data-delete]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.delete);
      currentUser.links.splice(i, 1);
      render();
    });
  });

  // Delete social
  document.querySelectorAll("[data-delete-social]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.deleteSocial);
      currentUser.socialLinks.splice(i, 1);
      render();
    });
  });

  // Add link (works for both new and existing users)
  document.getElementById("add-link-btn").addEventListener("click", () => {
    const title = document.getElementById("new-link-title").value.trim();
    const url = document.getElementById("new-link-url").value.trim();
    if (!title || !url) return;
    if (!currentUser) {
      currentUser = { displayName: "", bio: "", avatarUrl: "", theme: "minimal-dark", links: [], socialLinks: [] };
    }
    currentUser.links = currentUser.links || [];
    currentUser.links.push({ title, url, enabled: true });
    render();
  });

  // Add social (works for both new and existing users)
  document.getElementById("add-social-btn").addEventListener("click", () => {
    const platform = document.getElementById("new-social-platform").value;
    const url = document.getElementById("new-social-url").value.trim();
    if (!platform || !url) return;
    if (!currentUser) {
      currentUser = { displayName: "", bio: "", avatarUrl: "", theme: "minimal-dark", links: [], socialLinks: [] };
    }
    currentUser.socialLinks = currentUser.socialLinks || [];
    currentUser.socialLinks.push({ platform, url });
    render();
  });

  // Save / Create
  document.getElementById("save-btn").addEventListener("click", isNewUser ? handleCreate : handleSave);

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionToken = null;
    currentUser = null;
    sessionEmail = null;
    localStorage.removeItem("cnxt_session");
    navigate("landing");
  });
}

async function checkUsername(username, statusEl) {
  if (username === lastCheckedUsername) return;
  lastCheckedUsername = username;

  try {
    const res = await apiGet(`/api/username/check/${username}`);
    const input = document.getElementById("edit-username");
    if (!input || input.value !== username) return;

    if (res.available) {
      statusEl.textContent = "\u2713 cnxt.to/" + username + " is available!";
      statusEl.style.color = "var(--success)";
      usernameAvailable = true;
    } else {
      statusEl.textContent = res.reason === "reserved" ? "This name is reserved" : "Already taken";
      statusEl.style.color = "var(--danger)";
      usernameAvailable = false;
    }
  } catch {
    statusEl.textContent = "Could not check availability";
    statusEl.style.color = "var(--danger)";
    usernameAvailable = false;
  }
}

async function handleCreate() {
  const btn = document.getElementById("save-btn");
  const statusEl = document.getElementById("save-status");
  statusEl.innerHTML = "";

  const username = document.getElementById("edit-username")?.value.trim();
  const displayName = document.getElementById("edit-name").value.trim();
  const bio = document.getElementById("edit-bio").value.trim();
  const avatar = document.getElementById("edit-avatar").value.trim();
  const activeTheme = document.querySelector("[data-theme].active");
  const theme = activeTheme ? activeTheme.dataset.theme : "minimal-dark";

  if (!username || username.length < 3) {
    statusEl.innerHTML = '<div class="alert alert-error">Please choose a username (at least 3 characters)</div>';
    return;
  }

  if (!usernameAvailable) {
    statusEl.innerHTML = '<div class="alert alert-error">Please choose an available username</div>';
    return;
  }

  if (!displayName) {
    statusEl.innerHTML = '<div class="alert alert-error">Display name is required</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = "Creating...";

  // Gather links/socials that may have been added before creating
  const links = currentUser?.links || [];
  const socialLinks = currentUser?.socialLinks || [];

  try {
    const now = new Date().toISOString();
    const result = await apiPost("/api/profile", {
      username,
      displayName,
      bio,
      avatarUrl: avatar || undefined,
      theme,
      links,
      socialLinks,
      createdAt: now,
      updatedAt: now,
    });

    currentUser = result;
    sessionEmail = null;
    statusEl.innerHTML = '<div class="alert alert-success">Your page is live! \ud83c\udf89</div>';
    // Re-render to switch to the existing-user editor view
    render();
  } catch (err) {
    statusEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    btn.disabled = false;
    btn.textContent = "Create My Page";
  }
}

async function handleSave() {
  const btn = document.getElementById("save-btn");
  const statusEl = document.getElementById("save-status");
  btn.disabled = true;
  btn.textContent = "Saving...";
  statusEl.innerHTML = "";

  currentUser.displayName = document.getElementById("edit-name").value.trim();
  currentUser.bio = document.getElementById("edit-bio").value.trim();
  const avatar = document.getElementById("edit-avatar").value.trim();
  currentUser.avatarUrl = avatar || undefined;

  try {
    const updated = await apiPut(`/api/profile/${currentUser.username}`, currentUser);
    currentUser = updated;
    statusEl.innerHTML = '<div class="alert alert-success">Saved! Your page is live.</div>';
    btn.disabled = false;
    btn.textContent = "Save Changes";
  } catch (err) {
    statusEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
}

// --- Load existing profile ---
async function loadProfile(username) {
  try {
    const profile = await apiGet(`/api/profile/${username}`);
    currentUser = profile;
    navigate("editor");
  } catch (err) {
    alert(`Could not load profile: ${err.message}`);
  }
}

// --- Helpers ---
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- Init ---
(async () => {
  const path = location.pathname;

  // Handle magic link verification
  if (path.startsWith("/verify")) {
    await handleVerifyOnLoad();
    return;
  }

  // Try to restore session from stored token
  if (sessionToken && !currentUser) {
    try {
      const result = await apiGet("/api/auth/me");
      if (result.needsSetup) {
        sessionEmail = result.email;
        currentUser = null;
        navigate("editor", false);
        return;
      }
      currentUser = result;
      navigate("editor", false);
      return;
    } catch {
      sessionToken = null;
      localStorage.removeItem("cnxt_session");
    }
  }

  if (path === "/editor" && !currentUser && !sessionToken) navigate("landing", false);
  else if (path === "/editor") navigate("editor", false);
  else navigate("landing", false);
})();
