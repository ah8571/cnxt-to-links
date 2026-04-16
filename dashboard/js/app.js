// --- Config ---
const API_BASE = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8787"
  : "https://cnxt.to";

const PUBLIC_BASE = API_BASE.replace("http://127.0.0.1:8787", "http://127.0.0.1:8787");

// --- State ---
let currentUser = null; // { username, ...profile }
let sessionToken = localStorage.getItem("cnxt_session") || null;
let pendingEmail = null; // email captured from landing page, carried to signup
let signupMagicUrl = null; // dev-mode magic link shown after signup
let justSignedUp = false; // flag to show welcome banner in editor
let currentView = "landing";

// --- Router ---
function navigate(view, pushState = true) {
  currentView = view;
  if (pushState) {
    const paths = { landing: "/", editor: "/editor", signup: "/signup" };
    history.pushState(null, "", paths[view] || "/");
  }
  render();
}

window.addEventListener("popstate", () => {
  const path = location.pathname;
  if (path === "/editor") navigate("editor", false);
  else if (path === "/signup") navigate("signup", false);
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
    case "landing":  app.innerHTML = renderLanding(); bindLanding(); break;
    case "signup":   app.innerHTML = renderSignup(); bindSignup(); break;
    case "magic-sent": app.innerHTML = renderMagicSent(); bindMagicSent(); break;
    case "editor":   app.innerHTML = renderEditor(); bindEditor(); break;
    default:         app.innerHTML = renderLanding(); bindLanding();
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
      await loadProfile(result.username);
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
      <div class="header-logo">links by <span style="color:var(--accent)">cnxt</span></div>
      <nav class="header-nav">
        <a href="https://github.com/ah8571/links-by-connectionism" target="_blank" class="btn btn-secondary btn-sm">GitHub</a>
      </nav>
    </header>
    <div class="container">
      <div class="hero centered">
        <h1>Your links.<br><span>One page. Free.</span></h1>
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
          <p>MIT licensed. Self-host it. Fork it. Own your data completely.</p>
        </div>
      </div>

      <footer class="footer">
        <p>links by cnxt — open source, free forever</p>
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

    if (result.newUser) {
      // New user — go to signup with email prefilled
      pendingEmail = email;
      navigate("signup");
    } else {
      // Existing user — magic link sent (or returned in dev mode)
      if (result.magicUrl) {
        infoEl.innerHTML = `Welcome back! <a href="${escapeHtml(result.magicUrl)}" style="color:var(--accent);">Click here to log in</a> <span style="font-size:0.8rem;">(dev mode)</span>`;
      } else {
        infoEl.textContent = "Welcome back! Check your email for a login link.";
      }
      infoEl.style.display = "block";
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  }

  btn.disabled = false;
  btn.textContent = "Get Started";
}

// ========================
//  SIGNUP PAGE — username claim + profile setup
// ========================
function renderSignup() {
  const email = pendingEmail || "";
  return `
    <header class="header">
      <a href="/" class="header-logo" id="nav-home">links by <span style="color:var(--accent)">cnxt</span></a>
    </header>
    <div class="container" style="max-width: 440px;">
      <h2 style="margin-bottom: 0.5rem;">Create your page</h2>
      <p style="color:var(--text-muted); margin-bottom: 1.5rem;">Signing up as <strong style="color:var(--text);">${escapeHtml(email)}</strong></p>

      <div id="signup-error" class="alert alert-error" style="display:none;"></div>

      <div class="form-group">
        <label class="form-label">Choose your URL</label>
        <div class="claim-form" style="margin-bottom:0;">
          <div class="claim-prefix">cnxt.to/</div>
          <input type="text" class="form-input" id="signup-username" placeholder="yourname" maxlength="30" pattern="[a-z0-9-]+" style="border-radius:0 var(--radius) var(--radius) 0;">
        </div>
        <p id="username-status" style="font-size:0.8rem; margin-top:0.35rem; min-height:1.2em;">&nbsp;</p>
      </div>
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-input" id="signup-name" placeholder="Jane Doe" maxlength="100">
      </div>
      <div class="form-group">
        <label class="form-label">Bio (optional)</label>
        <textarea class="form-textarea" id="signup-bio" placeholder="Designer & content creator" maxlength="500" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Add your first link (optional)</label>
        <input type="text" class="form-input" id="signup-link-title" placeholder="Link title" maxlength="100" style="margin-bottom:0.5rem;">
        <input type="url" class="form-input" id="signup-link-url" placeholder="https://...">
      </div>

      <button class="btn btn-primary btn-block" id="signup-submit" style="margin-top:0.5rem;" disabled>Create My Page</button>
    </div>
  `;
}

let usernameCheckTimer = null;
let lastCheckedUsername = "";

function bindSignup() {
  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("landing");
  });

  const usernameInput = document.getElementById("signup-username");
  const statusEl = document.getElementById("username-status");
  const submitBtn = document.getElementById("signup-submit");

  // Auto-lowercase and strip invalid chars + live availability check
  usernameInput.addEventListener("input", () => {
    usernameInput.value = usernameInput.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const val = usernameInput.value;

    if (val.length < 3) {
      statusEl.textContent = val.length > 0 ? "Must be at least 3 characters" : " ";
      statusEl.style.color = "var(--text-muted)";
      submitBtn.disabled = true;
      return;
    }

    statusEl.textContent = "Checking...";
    statusEl.style.color = "var(--text-muted)";
    submitBtn.disabled = true;

    clearTimeout(usernameCheckTimer);
    usernameCheckTimer = setTimeout(() => checkUsername(val, statusEl, submitBtn), 350);
  });

  submitBtn.addEventListener("click", handleSignup);
}

async function checkUsername(username, statusEl, submitBtn) {
  if (username === lastCheckedUsername) return;
  lastCheckedUsername = username;

  try {
    const res = await apiGet(`/api/username/check/${username}`);
    // Make sure the input hasn't changed since we started
    if (document.getElementById("signup-username").value !== username) return;

    if (res.available) {
      statusEl.textContent = "✓ cnxt.to/" + username + " is available!";
      statusEl.style.color = "var(--success)";
      submitBtn.disabled = false;
    } else {
      statusEl.textContent = res.reason === "reserved" ? "This name is reserved" : "Already taken";
      statusEl.style.color = "var(--danger)";
      submitBtn.disabled = true;
    }
  } catch {
    statusEl.textContent = "Could not check availability";
    statusEl.style.color = "var(--danger)";
    submitBtn.disabled = true;
  }
}

async function handleSignup() {
  const errorEl = document.getElementById("signup-error");
  const btn = document.getElementById("signup-submit");
  errorEl.style.display = "none";
  btn.disabled = true;
  btn.textContent = "Creating...";

  const username = document.getElementById("signup-username").value.trim();
  const email = pendingEmail;
  const displayName = document.getElementById("signup-name").value.trim();
  const bio = document.getElementById("signup-bio").value.trim();
  const linkTitle = document.getElementById("signup-link-title").value.trim();
  const linkUrl = document.getElementById("signup-link-url").value.trim();

  if (!username || username.length < 3) {
    errorEl.textContent = "Please choose a username";
    errorEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Create My Page";
    return;
  }

  if (!email) {
    errorEl.textContent = "Missing email — please start over";
    errorEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Create My Page";
    return;
  }

  if (!displayName) {
    errorEl.textContent = "Display name is required";
    errorEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Create My Page";
    return;
  }

  const links = [];
  if (linkTitle && linkUrl) {
    links.push({ title: linkTitle, url: linkUrl, enabled: true });
  }

  try {
    const now = new Date().toISOString();
    const result = await apiPost("/api/profile", {
      username,
      email,
      displayName,
      bio,
      theme: "minimal-dark",
      links,
      socialLinks: [],
      createdAt: now,
      updatedAt: now,
    });

    // Store session token from signup response
    if (result.sessionToken) {
      sessionToken = result.sessionToken;
      localStorage.setItem("cnxt_session", sessionToken);
    }

    // Capture magic link for the welcome banner
    justSignedUp = true;
    signupMagicUrl = result.magicUrl || null;

    currentUser = result;
    pendingEmail = null;
    navigate("editor");
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Create My Page";
  }
}

// ========================
//  MAGIC LINK SENT (confirmation)
// ========================
function renderMagicSent() {
  return `
    <header class="header">
      <a href="/" class="header-logo" id="nav-home">links by <span style="color:var(--accent)">cnxt</span></a>
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
//  PROFILE EDITOR
// ========================
function renderEditor() {
  if (!currentUser) return renderLanding();

  const profile = currentUser;
  const publicUrl = `${PUBLIC_BASE.replace("http://127.0.0.1:8787", "cnxt.to")}/${profile.username}`;
  const displayUrl = `cnxt.to/${profile.username}`;

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
      <a href="/" class="header-logo" id="nav-home">links by <span style="color:var(--accent)">cnxt</span></a>
      <nav class="header-nav">
        <a href="${publicUrl.startsWith("cnxt") ? "https://" + publicUrl : publicUrl}" target="_blank" class="btn btn-secondary btn-sm">View Page</a>
        <button class="btn btn-secondary btn-sm" id="logout-btn">Log out</button>
      </nav>
    </header>
    <div class="container">
      <div class="url-bar">
        <span class="url-bar-link">${escapeHtml(displayUrl)}</span>
        <button class="btn btn-sm btn-secondary" id="copy-url">Copy</button>
      </div>

      <div id="save-status"></div>

      ${justSignedUp ? `
        <div class="alert alert-success" id="welcome-banner" style="margin-bottom:1.5rem;">
          <strong>Your page is live!</strong> 🎉<br>
          ${signupMagicUrl
            ? `<span style="font-size:0.85rem;">Save this link to log back in later: <a href="${escapeHtml(signupMagicUrl)}" style="color:#166534; word-break:break-all;">${escapeHtml(signupMagicUrl)}</a></span><br><span style="font-size:0.8rem; opacity:0.7;">(Dev mode — once email is configured, this link will be emailed to you automatically.)</span>`
            : `<span style="font-size:0.85rem;">We sent a login link to your email — save it to come back and edit anytime.</span>`
          }
        </div>
      ` : ''}

      <!-- Profile Details -->
      <p class="section-title">Profile</p>
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-input" id="edit-name" value="${escapeAttr(profile.displayName)}" maxlength="100">
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="form-textarea" id="edit-bio" maxlength="500" rows="2">${escapeHtml(profile.bio || "")}</textarea>
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
      <button class="btn btn-primary btn-block" id="save-btn" style="margin-bottom:2rem;">Save Changes</button>

      <footer class="footer">
        <p>links by cnxt — open source, free forever</p>
      </footer>
    </div>
  `;
}

function bindEditor() {
  if (!currentUser) return;

  // Clear signup flags after rendering
  justSignedUp = false;
  signupMagicUrl = null;

  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("landing");
  });

  // Copy URL
  document.getElementById("copy-url").addEventListener("click", () => {
    const url = `https://cnxt.to/${currentUser.username}`;
    navigator.clipboard.writeText(url).then(() => {
      document.getElementById("copy-url").textContent = "Copied!";
      setTimeout(() => { document.getElementById("copy-url").textContent = "Copy"; }, 2000);
    });
  });

  // Theme selection
  document.querySelectorAll("[data-theme]").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll("[data-theme]").forEach((e) => e.classList.remove("active"));
      el.classList.add("active");
      currentUser.theme = el.dataset.theme;
    });
  });

  // Toggle link enabled
  document.querySelectorAll("[data-toggle]").forEach((el) => {
    el.addEventListener("change", () => {
      const i = parseInt(el.dataset.toggle);
      currentUser.links[i].enabled = el.checked;
    });
  });

  // Delete link
  document.querySelectorAll("[data-delete]").forEach((el) => {
    el.addEventListener("click", () => {
      const i = parseInt(el.dataset.delete);
      currentUser.links.splice(i, 1);
      render();
    });
  });

  // Delete social
  document.querySelectorAll("[data-delete-social]").forEach((el) => {
    el.addEventListener("click", () => {
      const i = parseInt(el.dataset.deleteSocial);
      currentUser.socialLinks.splice(i, 1);
      render();
    });
  });

  // Add link
  document.getElementById("add-link-btn").addEventListener("click", () => {
    const title = document.getElementById("new-link-title").value.trim();
    const url = document.getElementById("new-link-url").value.trim();
    if (!title || !url) return;
    currentUser.links = currentUser.links || [];
    currentUser.links.push({ title, url, enabled: true });
    render();
  });

  // Add social
  document.getElementById("add-social-btn").addEventListener("click", () => {
    const platform = document.getElementById("new-social-platform").value;
    const url = document.getElementById("new-social-url").value.trim();
    if (!platform || !url) return;
    currentUser.socialLinks = currentUser.socialLinks || [];
    currentUser.socialLinks.push({ platform, url });
    render();
  });

  // Save
  document.getElementById("save-btn").addEventListener("click", handleSave);

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionToken = null;
    currentUser = null;
    localStorage.removeItem("cnxt_session");
    navigate("landing");
  });
}

async function handleSave() {
  const btn = document.getElementById("save-btn");
  const statusEl = document.getElementById("save-status");
  btn.disabled = true;
  btn.textContent = "Saving...";
  statusEl.innerHTML = "";

  // Read form values into currentUser
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
      const profile = await apiGet("/api/auth/me");
      currentUser = profile;
      navigate("editor", false);
      return;
    } catch {
      // Token expired or invalid — clear it
      sessionToken = null;
      localStorage.removeItem("cnxt_session");
    }
  }

  if (path === "/editor" && !currentUser) navigate("landing", false);
  else if (path === "/editor") navigate("editor", false);
  else if (path === "/signup" && pendingEmail) navigate("signup", false);
  else navigate("landing", false);
})();
