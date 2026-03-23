# YouTube Shorts Blocker — Safari Web Extension

So I really hate shorts but I still love youtube, so I made this little thing to save my brain. The idea is basically to nuke YouTube Shorts from every corner of the site using a `MutationObserver` that watches for new elements popping up and removes them before you even see them.

---

## How it works

| Layer | Technique |
|---|---|
| **Selector sweep** | Queries specific `ytd-*` element tags & `href` patterns |
| **Parent climbing** | Walks up the DOM to remove the full card container, not just the inner anchor |
| **MutationObserver** | Post-render deletion on every DOM mutation (subtree) |
| **SPA navigation** | Listens to `yt-navigate-finish` for client-side page transitions |
| **Hard redirect** | If you somehow end up on `/shorts/…`, it bounces you to the normal `/watch` URL |
| **Hydration poller** | 500 ms × 10 ticks after page load to catch lazy-rendered content |

---

## Build & Install (macOS + Xcode needed)

### Step 1 — Turn it into a Safari Extension project

```bash
# Requires Xcode 14+ and macOS 13+
xcrun safari-web-extension-converter /path/to/shorts-blocker-extension \
  --project-location ~/Desktop \
  --app-name "Shorts Blocker" \
  --bundle-identifier com.yourname.shortsblocker \
  --swift
```

This gives you a full Xcode project with a macOS/iOS app wrapper.

### Step 2 — Add some icons (totally optional but looks better)

Drop your PNG icons into `icons/`:
- `icon-48.png`
- `icon-96.png`  
- `icon-128.png`

A simple red circle with a scissors icon works fine honestly.

### Step 3 — Build in Xcode

1. Open the generated `.xcodeproj`
2. Set your Team in **Signing & Capabilities**
3. Hit **⌘R** to build and run

### Step 4 — Turn it on in Safari

1. Safari → **Settings** → **Extensions**
2. Check **Shorts Blocker**
3. Click **Always Allow on youtube.com**

---

## What's getting removed

- Shorts shelf between regular videos
- Shorts video cards
- "Shorts" navigation link
- Any Shorts card in the watch page sidebar
- "Shorts" pill in the home feed filter bar
- `/shorts/VIDEO_ID` redirected to `/watch?v=VIDEO_ID`

---

## The files

```
shorts-blocker-extension/
├── manifest.json      ← Extension manifest (MV3)
├── content.js         ← The whole blocking logic
├── README.md
└── icons/
    ├── icon-48.png
    ├── icon-96.png
    └── icon-128.png
```

---

## Author 
Abdullah Mahmood @ 2026