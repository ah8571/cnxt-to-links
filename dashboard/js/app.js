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
let autoSaveTimer = null;
let isSaving = false;

// --- Router ---
function navigate(view, pushState = true) {
  currentView = view;
  if (pushState) {
    const paths = { landing: "/", editor: "/editor" };
    history.pushState(null, "", paths[view] || "/");
  }
  render();
}

window.addEventListener("popstate", () => {
  const path = location.pathname;
  if (path === "/editor") navigate("editor", false);
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
    } else {
      infoEl.innerHTML = `We sent a login link to <strong>${escapeHtml(email)}</strong>. Click it to open your dashboard.`;
    }
    infoEl.style.display = "block";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  }

  btn.disabled = false;
  btn.textContent = "Get Started";
}



// ========================
//  PROFILE EDITOR (handles both new + existing users)
// ========================
let usernameCheckTimer = null;
let lastCheckedUsername = "";
let usernameAvailable = false;

function renderEditor() {
  const isNewUser = !currentUser;
  const profile = currentUser || { displayName: "", bio: "", avatarUrl: "", theme: "minimal-dark", links: [] };
  const publicUrl = currentUser ? `${PUBLIC_BASE.replace("http://127.0.0.1:8787", "cnxt.to")}/${profile.username}` : null;
  const displayUrl = currentUser ? `cnxt.to/${profile.username}` : null;

  const PLATFORM_LABELS = { twitter: "Twitter / X", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", github: "GitHub", linkedin: "LinkedIn" };

  const linksHtml = (profile.links || []).map((link, i) => {
    const isFirst = i === 0;
    const isLast = i === (profile.links.length - 1);
    const platformLabel = link.platform ? (PLATFORM_LABELS[link.platform] || link.platform) : "";
    return `
    <div class="link-item-wrapper" data-index="${i}">
      <div class="link-item">
        <div class="link-reorder">
          <button class="reorder-btn" data-move-up="${i}" ${isFirst ? "disabled" : ""} title="Move up">&#9650;</button>
          <button class="reorder-btn" data-move-down="${i}" ${isLast ? "disabled" : ""} title="Move down">&#9660;</button>
        </div>
        <div class="link-item-content">
          <div class="link-item-title">${escapeHtml(link.title)}${platformLabel ? ` <span class="link-platform-badge">${escapeHtml(platformLabel)}</span>` : ""}</div>
          <div class="link-item-url">${escapeHtml(link.url)}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${link.enabled !== false ? "checked" : ""} data-toggle="${i}">
          <span class="toggle-slider"></span>
        </label>
        <button class="link-edit-btn" data-expand="${i}" title="Edit link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 20 14"/><path d="M15 9h.01"/><path d="M17.8 6.2 20 4"/><path d="m3 21 9-9"/><path d="M12.2 6.2 10 4"/></svg></button>
        <button class="btn btn-danger btn-sm" data-delete="${i}">✕</button>
      </div>
      <div class="link-edit-panel" id="link-edit-${i}" style="display:none;">
        <input type="text" class="form-input" data-edit-title="${i}" value="${escapeAttr(link.title)}" placeholder="Link title" maxlength="100">
        <input type="url" class="form-input" data-edit-url="${i}" value="${escapeAttr(link.url)}" placeholder="https://...">
        <textarea class="form-input" data-edit-desc="${i}" placeholder="Description (optional — shown as expandable on your page)" maxlength="500" rows="2" style="resize:vertical;min-height:50px;">${escapeHtml(link.description || "")}</textarea>
        <select class="form-select" data-edit-platform="${i}">
          <option value="">No platform (regular link)</option>
          <option value="twitter" ${link.platform === "twitter" ? "selected" : ""}>Twitter / X</option>
          <option value="instagram" ${link.platform === "instagram" ? "selected" : ""}>Instagram</option>
          <option value="youtube" ${link.platform === "youtube" ? "selected" : ""}>YouTube</option>
          <option value="tiktok" ${link.platform === "tiktok" ? "selected" : ""}>TikTok</option>
          <option value="github" ${link.platform === "github" ? "selected" : ""}>GitHub</option>
          <option value="linkedin" ${link.platform === "linkedin" ? "selected" : ""}>LinkedIn</option>
        </select>
      </div>
    </div>
  `}).join("");

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
        <label class="form-label">Photo</label>
        <div class="avatar-upload" style="display:flex; align-items:center; gap:1rem;">
          ${profile.avatarUrl
            ? `<img src="${escapeAttr(API_BASE + profile.avatarUrl)}" class="avatar-preview" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">`
            : `<div class="avatar-preview" style="width:56px;height:56px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.8rem;">No photo</div>`}
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
            Upload
            <input type="file" id="edit-avatar" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none;">
          </label>
          <span id="avatar-status" style="font-size:0.8rem;color:var(--text-muted);"></span>
        </div>
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
        <div class="form-group" style="margin-bottom:0.5rem;">
          <textarea class="form-input" id="new-link-desc" placeholder="Description (optional)" maxlength="500" rows="2" style="resize:vertical;min-height:50px;"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:0.5rem;">
          <select class="form-select" id="new-link-platform">
            <option value="">Regular link</option>
            <option value="twitter">Twitter / X</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" id="add-link-btn">+ Add Link</button>
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

  // Avatar file upload
  const avatarInput = document.getElementById("edit-avatar");
  if (avatarInput) {
    avatarInput.addEventListener("change", async () => {
      const file = avatarInput.files[0];
      if (!file) return;
      const statusEl = document.getElementById("avatar-status");
      if (file.size > 2 * 1024 * 1024) {
        statusEl.textContent = "Image must be under 2 MB";
        statusEl.style.color = "#ef4444";
        return;
      }
      statusEl.textContent = "Uploading...";
      statusEl.style.color = "var(--text-muted)";
      try {
        const res = await fetch(`${API_BASE}/api/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": file.type },
          body: file,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        if (currentUser) currentUser.avatarUrl = data.avatarUrl;
        // Update the preview
        const preview = document.querySelector(".avatar-preview");
        if (preview) {
          const img = document.createElement("img");
          img.src = `${API_BASE}${data.avatarUrl}?t=${Date.now()}`;
          img.className = "avatar-preview";
          img.style.cssText = "width:56px;height:56px;border-radius:50%;object-fit:cover;";
          preview.replaceWith(img);
        }
        statusEl.textContent = "Uploaded!";
        statusEl.style.color = "#22c55e";
      } catch (err) {
        statusEl.textContent = err.message;
        statusEl.style.color = "#ef4444";
      }
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
      if (currentUser) { currentUser.theme = el.dataset.theme; scheduleAutoSave(); }
    });
  });

  // Auto-save on name/bio change (debounced)
  const nameInput = document.getElementById("edit-name");
  if (nameInput && !isNewUser) nameInput.addEventListener("input", () => scheduleAutoSave());
  const bioInput = document.getElementById("edit-bio");
  if (bioInput && !isNewUser) bioInput.addEventListener("input", () => scheduleAutoSave());

  // Expand/collapse link edit panels
  document.querySelectorAll("[data-expand]").forEach((el) => {
    el.addEventListener("click", () => {
      const i = el.dataset.expand;
      const panel = document.getElementById(`link-edit-${i}`);
      const isOpen = panel.style.display !== "none";
      panel.style.display = isOpen ? "none" : "flex";
      el.classList.toggle("expanded", !isOpen);
    });
  });

  // Inline edit link title/url
  document.querySelectorAll("[data-edit-title]").forEach((el) => {
    el.addEventListener("input", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.editTitle);
      currentUser.links[i].title = el.value;
      // Update the displayed title
      const wrapper = el.closest(".link-item-wrapper");
      const titleEl = wrapper.querySelector(".link-item-title");
      if (titleEl) {
        const badge = currentUser.links[i].platform ? ` <span class="link-platform-badge">${escapeHtml({"twitter":"Twitter / X","instagram":"Instagram","youtube":"YouTube","tiktok":"TikTok","github":"GitHub","linkedin":"LinkedIn"}[currentUser.links[i].platform] || currentUser.links[i].platform)}</span>` : "";
        titleEl.innerHTML = escapeHtml(el.value) + badge;
      }
      scheduleAutoSave();
    });
  });
  document.querySelectorAll("[data-edit-url]").forEach((el) => {
    el.addEventListener("input", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.editUrl);
      currentUser.links[i].url = el.value;
      // Update the displayed url
      const wrapper = el.closest(".link-item-wrapper");
      const urlEl = wrapper.querySelector(".link-item-url");
      if (urlEl) urlEl.textContent = el.value;
      scheduleAutoSave();
    });
  });

  // Inline edit description
  document.querySelectorAll("[data-edit-desc]").forEach((el) => {
    el.addEventListener("input", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.editDesc);
      currentUser.links[i].description = el.value || undefined;
      scheduleAutoSave();
    });
  });

  // Inline edit platform
  document.querySelectorAll("[data-edit-platform]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.editPlatform);
      const val = el.value || undefined;
      currentUser.links[i].platform = val;
      // If platform selected and title was empty or was old platform name, auto-fill
      const labels = {"twitter":"Twitter / X","instagram":"Instagram","youtube":"YouTube","tiktok":"TikTok","github":"GitHub","linkedin":"LinkedIn"};
      const titleInput = document.querySelector(`[data-edit-title="${i}"]`);
      const oldTitle = currentUser.links[i].title;
      const oldLabels = Object.values(labels);
      if (val && (!oldTitle || oldLabels.includes(oldTitle))) {
        const newTitle = labels[val] || val;
        currentUser.links[i].title = newTitle;
        if (titleInput) titleInput.value = newTitle;
      }
      autoSaveNow(); // save immediately + re-render
      render();
    });
  });

  // Reorder links
  document.querySelectorAll("[data-move-up]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.moveUp);
      if (i < 1) return;
      const links = currentUser.links;
      [links[i - 1], links[i]] = [links[i], links[i - 1]];
      autoSaveNow();
      render();
    });
  });
  document.querySelectorAll("[data-move-down]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.moveDown);
      if (i >= currentUser.links.length - 1) return;
      const links = currentUser.links;
      [links[i], links[i + 1]] = [links[i + 1], links[i]];
      autoSaveNow();
      render();
    });
  });

  // Toggle link enabled
  document.querySelectorAll("[data-toggle]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.toggle);
      currentUser.links[i].enabled = el.checked;
      autoSaveNow();
    });
  });

  // Delete link
  document.querySelectorAll("[data-delete]").forEach((el) => {
    el.addEventListener("click", () => {
      if (!currentUser) return;
      const i = parseInt(el.dataset.delete);
      currentUser.links.splice(i, 1);
      autoSaveNow();
      render();
    });
  });

  // Add link (works for both new and existing users)
  document.getElementById("add-link-btn").addEventListener("click", () => {
    const title = document.getElementById("new-link-title").value.trim();
    const url = document.getElementById("new-link-url").value.trim();
    const desc = document.getElementById("new-link-desc").value.trim();
    const platform = document.getElementById("new-link-platform").value || undefined;
    if (!url) return;
    const labels = {"twitter":"Twitter / X","instagram":"Instagram","youtube":"YouTube","tiktok":"TikTok","github":"GitHub","linkedin":"LinkedIn"};
    const finalTitle = title || (platform ? (labels[platform] || platform) : "");
    if (!finalTitle) return;
    if (!currentUser) {
      currentUser = { displayName: "", bio: "", avatarUrl: "", theme: "minimal-dark", links: [] };
    }
    currentUser.links = currentUser.links || [];
    const newLink = { title: finalTitle, url, enabled: true };
    if (platform) newLink.platform = platform;
    if (desc) newLink.description = desc;
    currentUser.links.push(newLink);
    autoSaveNow();
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

  // Gather links that may have been added before creating
  const links = currentUser?.links || [];

  try {
    const now = new Date().toISOString();
    const result = await apiPost("/api/profile", {
      username,
      displayName,
      bio,
      avatarUrl: currentUser?.avatarUrl || undefined,
      theme,
      links,
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

function scheduleAutoSave() {
  if (!currentUser || !currentUser.username) return; // only for existing users
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => doAutoSave(), 1000);
}

function autoSaveNow() {
  if (!currentUser || !currentUser.username) return;
  clearTimeout(autoSaveTimer);
  doAutoSave();
}

async function doAutoSave() {
  if (!currentUser || !currentUser.username || isSaving) return;
  isSaving = true;
  const statusEl = document.getElementById("save-status");
  const btn = document.getElementById("save-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }
  if (statusEl) statusEl.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem;">Saving...</span>';

  // Sync name/bio from inputs if they exist
  const nameEl = document.getElementById("edit-name");
  const bioEl = document.getElementById("edit-bio");
  if (nameEl) currentUser.displayName = nameEl.value.trim();
  if (bioEl) currentUser.bio = bioEl.value.trim();

  try {
    const updated = await apiPut(`/api/profile/${currentUser.username}`, currentUser);
    currentUser = updated;
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--success);font-size:0.85rem;">\u2713 Saved</span>';
    if (btn) { btn.disabled = false; btn.textContent = "Save Changes"; }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    if (btn) { btn.disabled = false; btn.textContent = "Save Changes"; }
  }
  isSaving = false;
}

async function handleSave() {
  const btn = document.getElementById("save-btn");
  const statusEl = document.getElementById("save-status");
  btn.disabled = true;
  btn.textContent = "Saving...";
  statusEl.innerHTML = "";

  currentUser.displayName = document.getElementById("edit-name").value.trim();
  currentUser.bio = document.getElementById("edit-bio").value.trim();

  try {
    const updated = await apiPut(`/api/profile/${currentUser.username}`, currentUser);
    currentUser = updated;
    statusEl.innerHTML = '<div class="alert alert-success">Saved!</div>';
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
    // Migrate legacy socialLinks into unified links array
    if (profile.socialLinks && profile.socialLinks.length) {
      profile.links = profile.links || [];
      for (const s of profile.socialLinks) {
        profile.links.push({ title: s.platform, url: s.url, platform: s.platform, enabled: true });
      }
      delete profile.socialLinks;
    }
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
