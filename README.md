# YouTube Shorts Blocker — Safari Web Extension

I f***ing hate shorts but I love youtube so, needed a way to save my brain 
and still enjoy youtube. So i built this, the goal is to nukes YouTube Shorts 
from every surface using a `MutationObserver` watches for newly inserted nodes 
and immediately removes any Shorts shelf, navigation entry, video card, or 
chip that appears before your btain ever land on it.

---


Below is AI generated README (don't hate me lol) 

## How it works

| Layer | Technique |
|---|---|
| **Selector sweep** | Queries specific `ytd-*` element tags & `href` patterns |
| **Parent climbing** | Walks up the DOM to remove the full safe container, not just the inner anchor |
| **MutationObserver** | Post-render deletion on every DOM mutation (subtree) |
| **SPA navigation** | Listens to `yt-navigate-finish` for client-side page transitions |
| **Hard redirect** | If you somehow land on `/shorts/…`, bounces you to the normal `/watch` URL |
| **Hydration poller** | 500 ms × 10 ticks after page load to catch lazy-rendered content |

---

## Build & Install (macOS + Xcode required)

### Step 1 — Convert to a Safari Extension project

```bash
# Requires Xcode 14+ and macOS 13+
xcrun safari-web-extension-converter /path/to/shorts-blocker-extension \
  --project-location ~/Desktop \
  --app-name "Shorts Blocker" \
  --bundle-identifier com.yourname.shortsblocker \
  --swift
```

This generates a full Xcode project with a macOS/iOS app wrapper.

### Step 2 — Add icons (optional but recommended)

Drop your PNG icons into `icons/`:
- `icon-48.png`
- `icon-96.png`  
- `icon-128.png`

A simple plain red circle with a scissors icon works great.

### Step 3 — Build in Xcode

1. Open the generated `.xcodeproj`
2. Set your Team in **Signing & Capabilities**
3. Press **⌘R** to build and run

### Step 4 — Enable in Safari

1. Safari → **Settings** → **Extensions**
2. Tick **Shorts Blocker**
3. Click **Always Allow on youtube.com**

---

## Files

```
shorts-blocker-extension/
├── manifest.json      ← Extension manifest (MV3)
├── content.js         ← The entire blocking logic
├── README.md
└── icons/
    ├── icon-48.png
    ├── icon-96.png
    └── icon-128.png
```

---

## What gets removed

- Shorts shelf between regular videos
-  Shorts video cards
- "Shorts" navigation link
- Any Shorts card in the watch page sidebar
- "Shorts" pill in the home feed filter bar
- `/shorts/VIDEO_ID` redirected to `/watch?v=VIDEO_ID`

# Author 
Abdullah Mahmood @ 2026
