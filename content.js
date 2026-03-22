// ============================================================
//  YouTube Shorts Blocker — Safari Web Extension v2
//  Supports BOTH mobile (ytm-*) and desktop (ytd-*) YouTube
// ============================================================

// ── CSS nuke (fastest possible — hides before paint) ──────────────────────
const CSS = `
  /* ---- MOBILE (ytm-*) ---- */
  ytm-reel-shelf-renderer,
  ytm-shorts-lockup-view-model,
  ytm-reel-item-renderer,
  [data-content-type="shorts"],
  ytm-rich-shelf-renderer[component-style*="SHORTS"],
  ytm-pivot-bar-item-renderer[tab-identifier="FEshorts"],

  /* ---- DESKTOP (ytd-*) ---- */
  ytd-reel-shelf-renderer,
  ytd-rich-shelf-renderer[is-shorts],
  ytd-shorts,
  #shorts-container,
  ytd-guide-entry-renderer:has(a[href="/shorts"]),
  ytd-mini-guide-entry-renderer:has(a[href="/shorts"]) {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }
`;

function injectCSS() {
  if (document.getElementById("__shorts-blocker-css__")) return;
  const style = document.createElement("style");
  style.id = "__shorts-blocker-css__";
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);
}

injectCSS();

// ── Selectors for DOM removal ─────────────────────────────────────────────

const MOBILE_SELECTORS = [
  "ytm-reel-shelf-renderer",
  "ytm-shorts-lockup-view-model",
  "ytm-reel-item-renderer",
  "[data-content-type='shorts']",
  "ytm-pivot-bar-item-renderer[tab-identifier='FEshorts']",
];

const DESKTOP_SELECTORS = [
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer[is-shorts]",
  "ytd-shorts",
  "#shorts-container",
  "ytd-guide-entry-renderer a[href='/shorts']",
  "ytd-mini-guide-entry-renderer a[href='/shorts']",
  "ytd-rich-item-renderer a[href*='/shorts/']",
  "ytd-video-renderer a[href*='/shorts/']",
  "ytd-compact-video-renderer a[href*='/shorts/']",
];

const ALL_SELECTORS = [...MOBILE_SELECTORS, ...DESKTOP_SELECTORS];

const SAFE_REMOVE_TAGS = new Set([
  "ytm-reel-shelf-renderer",
  "ytm-shorts-lockup-view-model",
  "ytm-reel-item-renderer",
  "ytm-rich-item-renderer",
  "ytm-compact-video-renderer",
  "ytm-video-with-context-renderer",
  "ytd-rich-item-renderer",
  "ytd-grid-video-renderer",
  "ytd-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-reel-shelf-renderer",
  "ytd-rich-shelf-renderer",
  "ytd-guide-entry-renderer",
  "ytd-mini-guide-entry-renderer",
]);

const STOP_TAGS = new Set(["BODY", "HTML", "YTD-APP", "YTM-APP"]);

function findRemovableParent(el) {
  let node = el;
  while (node && !STOP_TAGS.has(node.tagName)) {
    if (SAFE_REMOVE_TAGS.has(node.tagName.toLowerCase())) return node;
    node = node.parentElement;
  }
  return el;
}

function purgeShorts() {
  injectCSS();

  ALL_SELECTORS.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        findRemovableParent(el).remove();
      });
    } catch (_) {}
  });

  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (/^\/?shorts\//.test(href)) {
      const target = findRemovableParent(a);
      if (!STOP_TAGS.has(target.tagName)) target.remove();
    }
  });

  if (location.pathname.startsWith("/shorts")) {
    const videoId = location.pathname.replace(/^\/shorts\/?/, "").split("?")[0];
    if (videoId) {
      location.replace("https://www.youtube.com/watch?v=" + videoId);
    } else {
      location.replace("https://www.youtube.com/");
    }
  }
}

purgeShorts();

let rafPending = false;
const observer = new MutationObserver(() => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      purgeShorts();
      rafPending = false;
    });
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("yt-navigate-finish", purgeShorts);

let lastPath = location.pathname;
setInterval(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    purgeShorts();
  }
}, 300);

let ticks = 0;
const poller = setInterval(() => {
  purgeShorts();
  if (++ticks >= 10) clearInterval(poller);
}, 500);
