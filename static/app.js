/* app.js — progressive enhancement only. The page works without it.
   Three small jobs: scroll reveals, a work-order number, and async
   submission of the estimate form. */

"use strict";

/* Announce JS so CSS may hide .reveal elements; without this the page
   renders fully visible (no-JS fallback). */
document.documentElement.classList.add("js");

/* Scroll-triggered reveals. */
function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 4) * 60}ms`;
    observer.observe(el);
  });
}

/* Give the paper form a plausible work-order number. */
function initWorkOrderNumber() {
  const el = document.getElementById("wo-number");
  if (!el) return;
  const n = Math.floor(1000 + Math.random() * 9000);
  el.textContent = `WO-${new Date().getFullYear()}-${n}`;
}

/* Submit the estimate form with fetch; fall back to a normal POST if JS
   is disabled (the server accepts form-encoded bodies too). */
function initEstimateForm() {
  const form = document.getElementById("estimate-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    status.className = "form-status mono";
    status.textContent = "Sending…";

    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (body.ok) {
        status.classList.add("ok");
        status.textContent = "Received. We'll call you back within one business day.";
        form.reset();
      } else {
        status.classList.add("err");
        status.textContent = "Check the highlighted fields and try again.";
        markFieldErrors(form, body.errors ?? []);
      }
    } catch {
      status.classList.add("err");
      status.textContent = "Couldn't reach the shop — call us instead.";
    }
  });
}

function clearFieldErrors(form) {
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function markFieldErrors(form, errors) {
  for (const err of errors) {
    const input = form.elements.namedItem(err.field);
    if (input && input.closest) {
      const wrap = input.closest(".field, .field-trio > div");
      if (wrap) wrap.classList.add("invalid");
    }
  }
}

initReveals();
initWorkOrderNumber();
initEstimateForm();
