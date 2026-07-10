/* admin.js — three small jobs: sign in, sign out, save settings. */

"use strict";

function setStatus(el, kind, text) {
  el.className = `form-status mono ${kind}`;
  el.textContent = text;
}

/* ── Login ──────────────────────────────────────────────────────────── */

function initLogin() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "", "Checking…");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: form.elements.password.value }),
      });
      const body = await res.json();
      if (body.ok) {
        location.href = "/admin";
      } else {
        setStatus(status, "err", (body.errors && body.errors[0]?.message) || "Sign-in failed");
      }
    } catch {
      setStatus(status, "err", "Can't reach the server");
    }
  });
}

/* ── Logout ─────────────────────────────────────────────────────────── */

function initLogout() {
  const button = document.getElementById("logout");
  if (!button) return;
  button.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  });
}

/* ── Settings form ──────────────────────────────────────────────────── */

function brandsFromTextarea(textarea) {
  return textarea.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function renderBrandPreview(list, brands) {
  list.textContent = "";
  for (const brand of brands) {
    const li = document.createElement("li");
    li.className = "badge";
    li.textContent = brand;
    list.appendChild(li);
  }
}

function initSettings() {
  const form = document.getElementById("settings-form");
  const status = document.getElementById("save-status");
  if (!form || !status) return;

  const badges = form.elements.badges;
  const preview = document.getElementById("brand-preview");
  renderBrandPreview(preview, brandsFromTextarea(badges));
  badges.addEventListener("input", () => {
    renderBrandPreview(preview, brandsFromTextarea(badges));
  });

  form.addEventListener("input", () => setStatus(status, "", "Unsaved changes"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    setStatus(status, "", "Saving…");

    const payload = {
      phone: form.elements.phone.value,
      email: form.elements.email.value,
      address: form.elements.address.value,
      hours: form.elements.hours.value,
      badges: brandsFromTextarea(badges),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (body.ok) {
        setStatus(status, "ok", "Saved — live on the site now");
      } else if (res.status === 401) {
        location.href = "/admin/login";
      } else {
        setStatus(status, "err", (body.errors && body.errors[0]?.message) || "Check the fields");
        for (const err of body.errors || []) {
          const input = form.elements[err.field.split(".")[0]];
          const wrap = input && input.closest ? input.closest(".panel-field") : null;
          if (wrap) wrap.classList.add("invalid");
        }
      }
    } catch {
      setStatus(status, "err", "Can't reach the server");
    }
  });
}

/* ── Incoming requests: mark handled / back to new ──────────────────── */

function initRequests() {
  const list = document.getElementById("request-list");
  if (!list) return;

  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".btn-mark");
    if (!button) return;
    const card = button.closest(".request");
    const handled = !card.classList.contains("handled");
    button.disabled = true;

    try {
      const res = await fetch("/api/admin/requests/mark", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ts: Number(card.dataset.ts), id: card.dataset.id, handled }),
      });
      const body = await res.json();
      if (body.ok) {
        card.classList.toggle("handled", handled);
        button.textContent = handled ? "Move back to new" : "Mark handled";
        card.querySelector(".request-meta").innerHTML = card
          .querySelector(".request-meta")
          .innerHTML.replace(
            handled ? "<strong>NEW</strong>" : "HANDLED",
            handled ? "HANDLED" : "<strong>NEW</strong>",
          );
      } else if (res.status === 401) {
        location.href = "/admin/login";
      }
    } finally {
      button.disabled = false;
    }
  });
}

initLogin();
initLogout();
initSettings();
initRequests();
