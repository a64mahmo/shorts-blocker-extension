// ============================================================
//  YouTube Shorts Blocker — Safari Web Extension
//  Strategy: post-render DOM deletion via MutationObserver
// ============================================================

const SHORTS_SELECTORS = [
  // Shelf / section containers
  "ytd-rich-shelf-renderer[is-shorts]",
  "ytd-reel-shelf-renderer",
  "ytd-shorts",
  "#shorts-container",

  // Sidebar / guide navigation entry
  "ytd-guide-entry-renderer a[href='/shorts']",
  "ytd-mini-guide-entry-renderer a[href='/shorts']",

  // Video cards that link to a /shorts/ URL
  "ytd-video-renderer a[href*='/shorts/']",
  "ytd-grid-video-renderer a[href*='/shorts/']",
  "ytd-rich-item-renderer a[href*='/shorts/']",
  "ytd-compact-video-renderer a[href*='/shorts/']",

  // Chip / filter bar "Shorts" pill
  "yt-chip-cloud-chip-renderer[chip-style='STYLE_HOME_FILTER'] #text[title='Shorts']",
];

// Climb up the DOM until we find a "safe" removable container
function findRemovableParent(el) {
  const stopTags = new Set(["YTD-APP", "YTD-PAGE-MANAGER", "BODY", "HTML"]);
  let node = el;
  while (node && !stopTags.has(node.tagName)) {
    const tag = node.tagName.toLowerCase();
    // Top-level item renderers are safe to remove entirely
    if (
      tag === "ytd-rich-item-renderer" ||
      tag === "ytd-grid-video-renderer" ||
      tag === "ytd-video-renderer" ||
      tag === "ytd-compact-video-renderer" ||
      tag === "ytd-reel-shelf-renderer" ||
      tag === "ytd-rich-shelf-renderer" ||
      tag === "ytd-guide-entry-renderer" ||
      tag === "ytd-mini-guide-entry-renderer"
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return el; // fallback: remove the matched element itself
}

function purgeShorts(root = document) {
  let removed = 0;

  // 1. Selector-based sweep
  SHORTS_SELECTORS.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((el) => {
        const target = findRemovableParent(el);
        target.remove();
        removed++;
      });
    } catch (_) {}
  });

  // 2. Catch any video/reel card whose href contains /shorts/ (belt-and-suspenders)
  root.querySelectorAll("a[href]").forEach((a) => {
    if (/^\/shorts\//.test(a.getAttribute("href"))) {
      const target = findRemovableParent(a);
      if (target !== document.body) {
        target.remove();
        removed++;
      }
    }
  });

  // 3. Hard-redirect: if the user lands ON a Shorts page, send them away
  if (location.pathname.startsWith("/shorts/")) {
    const videoId = location.pathname.split("/shorts/")[1]?.split("?")[0];
    if (videoId) {
      location.replace(`https://www.youtube.com/watch?v=${videoId}`);
    } else {
      location.replace("https://www.youtube.com/");
    }
  }

  return removed;
}

// ── Initial pass (runs as soon as the script injects) ──────────────────────
purgeShorts();

// ── MutationObserver: fires on every DOM mutation (post-render deletion) ───
const observer = new MutationObserver((mutations) => {
  // Batch: collect all added nodes first, then sweep once
  let needsSweep = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      needsSweep = true;
      break;
    }
  }
  if (needsSweep) purgeShorts();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// ── YouTube SPA navigation listener ───────────────────────────────────────
// YouTube fires this custom event on every client-side page transition
document.addEventListener("yt-navigate-finish", () => {
  purgeShorts();
});

// Fallback: poll for the first 5 s after load (catches lazy hydration)
let ticks = 0;
const poller = setInterval(() => {
  purgeShorts();
  if (++ticks >= 10) clearInterval(poller);
}, 500);
