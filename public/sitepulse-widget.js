/* ============================================================
   SitePulse "Report an issue" widget for SportsWeb One
   Self-contained: vanilla JS + shadow DOM, no dependencies.
   Injected into the club public site with the rendered club's id:
     <script src="/sitepulse-widget.js" data-club-id="CLUB_UUID"></script>
   Posts to the sitepulse-ingest Edge Function (Verify-JWT ON, so the key
   below is the project's legacy anon JWT -- public/safe in the front end).
   ============================================================ */
(function () {
  "use strict";

  // ---- CONFIG ------------------------------------------------
  var INGEST_URL = "https://uzibfawcwoapfbigpzum.supabase.co/functions/v1/sitepulse-ingest";
  // Legacy anon JWT (satisfies Verify-JWT; the sb_publishable_ key would 401).
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWJmYXdjd29hcGZiaWdwenVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTg2NzcsImV4cCI6MjA5NjMzNDY3N30.-BYc-g-swQjjPXosNvPlrVTj_86i39TXXAklAW_N-ek";
  // ------------------------------------------------------------

  var thisScript = document.currentScript ||
    document.querySelector("script[data-club-id]");
  var CLUB_ID = thisScript && thisScript.getAttribute("data-club-id");
  // Optional: <script ... data-source="onboarding"> to log website-check items.
  var SOURCE = (thisScript && thisScript.getAttribute("data-source")) || "report";
  // Publish lifecycle (from the injector): "draft" -> review-phase copy ("Feedback"),
  // "published" -> live-site copy ("Report an issue"). Display only; nothing stored.
  var STATUS = (thisScript && thisScript.getAttribute("data-website-status")) || "";
  var LIVE = STATUS === "published";
  // Optional: <script ... data-help-url="https://sportsweb.com.au/sitepulse/help">
  // If set AND in onboarding mode, a "How it works" link is shown in the footer.
  // Per-embed + stable page you own, so the URL baked into deployed widgets never
  // drifts (embed a video on that page later without touching every site).
  var HELP_URL = (thisScript && thisScript.getAttribute("data-help-url")) || "";

  // Mode-aware helper line under the form title. One sentence; the whole point is
  // that it's obvious enough that most people never need the "How it works" page.
  var HELPER = SOURCE === "onboarding"
    ? "Reviewing this site? Tell us what looks wrong and where -- we'll capture the rest."
    : "Spotted something on this page? Tell us what and where -- we'll capture the rest.";

  // Categories MUST match the sitepulse_feedback CHECK constraint -- do not invent values.
  var CATEGORIES = [
    ["spelling", "Spelling or wording"],
    ["broken_link", "Broken link"],
    ["incorrect_info", "Incorrect information"],
    ["missing_info", "Missing information"],
    ["image_logo", "Image or logo issue"],
    ["mobile_display", "Looks wrong on mobile"],
    ["desktop_display", "Looks wrong on desktop"],
    ["sports_data", "Fixture / result / ladder issue"],
    ["sponsor", "Sponsor or advertiser"],
    ["event_ticketing", "Event or ticketing"],
    ["store", "Online store"],
    ["accessibility", "Accessibility"],
    ["improvement", "Improvement idea"],
    ["bug", "Something is broken"],
    ["other", "Other"]
  ];

  function deviceType() {
    var w = window.innerWidth;
    return w < 768 ? "mobile" : (w < 1024 ? "tablet" : "desktop");
  }
  function browserName() {
    var u = navigator.userAgent;
    if (/Edg\//.test(u)) return "Edge";
    if (/OPR\//.test(u)) return "Opera";
    if (/Chrome\//.test(u)) return "Chrome";
    if (/Safari\//.test(u) && !/Chrome/.test(u)) return "Safari";
    if (/Firefox\//.test(u)) return "Firefox";
    return "Unknown";
  }
  function osName() {
    var u = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(u)) return "iOS";
    if (/Android/.test(u)) return "Android";
    if (/Mac OS X/.test(u)) return "macOS";
    if (/Windows/.test(u)) return "Windows";
    if (/Linux/.test(u)) return "Linux";
    return "Unknown";
  }

  var SHIELD = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z" ' +
    'fill="rgba(255,255,255,.18)" stroke="#FFFFFF" stroke-width="1.3"/>' +
    '<path d="M6 12.5h2.5L10 9l2 6 1.6-3.5H18" fill="none" stroke="#FFFFFF" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Inline SVG icons (house style: SVG, not emoji). currentColor -> inherits text colour.
  var ICON_TARGET = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round"/></svg>';
  var ICON_IMG = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="8.5" cy="9.5" r="1.6" fill="currentColor"/>' +
    '<path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linejoin="round"/></svg>';
  var ICON_LINK = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-6-.5l-2 2' +
    'A4 4 0 0 0 11.7 17l1-1" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_BOX = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  function iconFor(tag) {
    if (tag === "img" || tag === "picture" || tag === "svg" || tag === "video" ||
        tag === "source" || tag === "canvas") return ICON_IMG;
    if (tag === "a") return ICON_LINK;
    return ICON_BOX;
  }

  // Escape text for safe innerHTML insertion (page-supplied labels are untrusted).
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Filename only: strip query/hash and any path.
  function fileName(u) {
    if (!u) return null;
    var s = String(u).split("?")[0].split("#")[0];
    var parts = s.split("/");
    return parts[parts.length - 1] || s || null;
  }
  function cleanText(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  // Nearest heading (h1-h6) preceding el in document order -- cheap recognition context.
  function nearestHeading(el) {
    var hs = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
    var best = null;
    for (var i = 0; i < hs.length; i++) {
      if (hs[i] === el) continue;
      if (el.compareDocumentPosition(hs[i]) & Node.DOCUMENT_POSITION_PRECEDING) best = hs[i];
      else break; // hs are in document order; first non-preceding ends the search
    }
    return best ? cleanText(best).slice(0, 120) || null : null;
  }
  // Label: first non-empty of alt, aria-label, title, innerText(<=80), placeholder, value;
  // img with no alt -> src filename; final fallback -> tag name (chip must always read).
  function labelFor(el) {
    var t = el.tagName.toLowerCase();
    var a = el.getAttribute && (el.getAttribute("alt") || el.getAttribute("aria-label") ||
      el.getAttribute("title"));
    if (a && a.trim()) return a.trim().slice(0, 200);
    var it = cleanText(el);
    if (it) return it.slice(0, 80);
    var ph = el.getAttribute && el.getAttribute("placeholder");
    if (ph && ph.trim()) return ph.trim().slice(0, 200);
    var v = ("value" in el && el.value != null) ? String(el.value).trim() : "";
    if (v) return v.slice(0, 200);
    if (t === "img") { var fn = fileName(el.getAttribute("src")); if (fn) return fn; }
    return t;
  }
  function metaFor(el) {
    var t = el.tagName.toLowerCase(), m = {};
    if (t === "img" || t === "video" || t === "source" || t === "iframe") {
      var fn = fileName(el.getAttribute("src") || el.currentSrc || "");
      if (fn) m.src = fn;
    }
    if (t === "a" && el.getAttribute("href")) m.href = el.getAttribute("href");
    var h = nearestHeading(el); if (h) m.heading = h;
    var r = el.getBoundingClientRect();
    var sx = window.pageXOffset || document.documentElement.scrollLeft || 0;
    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
    m.rect = { x: Math.round(r.left + sx), y: Math.round(r.top + sy),
               w: Math.round(r.width), h: Math.round(r.height) };
    m.page = {
      w: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
      h: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)
    };
    m.scroll = { x: Math.round(sx), y: Math.round(sy) };
    var pos = "";
    try { pos = getComputedStyle(el).position; } catch (e) {}
    m.fixed = (pos === "fixed" || pos === "sticky");
    return m;
  }

  var css =
    ':host{all:initial}' +
    '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}' +
    '.btn{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:8px;' +
    'border:1.5px solid rgba(255,255,255,.55);border-radius:999px;padding:11px 16px;cursor:pointer;color:#fff;' +
    'font-size:14px;font-weight:600;background:linear-gradient(180deg,#D6322F 0%,#B01D20 55%,#5B0000 100%);' +
    'box-shadow:0 6px 20px rgba(91,0,0,.35)}' +
    '.btn:hover{filter:brightness(1.06)}' +
    // Mobile: onboarding mode shrinks the button to an icon-only circular badge (48px keeps the
    // tap target above the 44px min). Scoped to onboarding so report mode keeps its label on
    // public sites by default -- an unlabelled icon is far less discoverable to an unbriefed visitor.
    '@media(max-width:640px){' +
      ':host(.sp-mode-onboarding) .btn{width:48px;height:48px;padding:0;gap:0;' +
        'border-radius:50%;justify-content:center}' +
      ':host(.sp-mode-onboarding) .btn-label{display:none}' +
    '}' +
    '.overlay{position:fixed;inset:0;z-index:2147483001;background:rgba(11,13,16,.5);display:none;' +
    'align-items:flex-end;justify-content:center}' +
    '.overlay.open{display:flex}' +
    '@media(min-width:640px){.overlay{align-items:center}}' +
    '.card{background:#fff;width:100%;max-width:440px;border-radius:16px 16px 0 0;padding:18px;' +
    'box-shadow:0 8px 30px rgba(0,0,0,.18);max-height:92vh;overflow:auto}' +
    '@media(min-width:640px){.card{border-radius:16px}}' +
    '.head{display:flex;align-items:center;gap:10px;margin-bottom:4px}' +
    '.mark{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;' +
    'background:linear-gradient(180deg,#D6322F,#5B0000);border:1px solid #A8AEB6}' +
    '.title{font-size:16px;font-weight:700;color:#14191F;margin:0}' +
    '.sub{font-size:12px;color:#6B7280;margin:0 0 12px}' +
    '.x{margin-left:auto;border:0;background:transparent;font-size:20px;line-height:1;color:#6B7280;cursor:pointer}' +
    'label{display:block;font-size:12px;font-weight:600;color:#14191F;margin:10px 0 4px}' +
    'select,textarea,input{width:100%;border:1px solid #E3E6EA;border-radius:10px;padding:10px;font-size:14px;color:#14191F;background:#fff}' +
    'textarea{min-height:84px;resize:vertical}' +
    'select:focus,textarea:focus,input:focus{outline:2px solid #FFE4E2;border-color:#C21F22}' +
    '.row{display:flex;align-items:center;gap:8px;margin-top:10px}' +
    '.row input{width:auto}.row label{margin:0;font-weight:500}' +
    '.send{margin-top:14px;width:100%;border:0;border-radius:10px;padding:12px;font-size:15px;font-weight:700;color:#fff;' +
    'cursor:pointer;background:linear-gradient(180deg,#D6322F,#C21F22)}' +
    '.send:hover{background:linear-gradient(180deg,#C21F22,#8E1518)}' +
    '.send:disabled{opacity:.6;cursor:default}' +
    '.foot{margin-top:10px;font-size:11px;color:#A8AEB6;text-align:center}' +
    '.done{text-align:center;padding:14px 4px}' +
    '.done .mark{margin:0 auto 10px;width:42px;height:42px}' +
    '.err{color:#C21F22;font-size:12px;margin-top:8px;display:none}' +
    // "Point at it" button + captured-element chip
    '.pickbtn{margin-top:8px;display:inline-flex;align-items:center;gap:6px;border:1px solid #E3E6EA;' +
    'background:#fff;color:#14191F;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer}' +
    '.pickbtn:hover{background:#F7F8FA}' +
    '.chip{margin-top:8px;display:none;align-items:center;gap:8px;background:#F3F4F6;border:1px solid #E3E6EA;' +
    'border-radius:10px;padding:8px 10px;font-size:13px;color:#14191F}' +
    '.chip.show{display:flex}' +
    '.chip .ci{display:flex;color:#6B7280;flex:0 0 auto}' +
    '.chip .ct{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.chip button{border:0;background:transparent;color:#6B7280;font-size:12px;font-weight:600;' +
    'cursor:pointer;padding:2px 4px;flex:0 0 auto}' +
    '.chip button:hover{color:#C21F22}' +
    '.foot a{color:#A8AEB6;text-decoration:underline}' +
    // Pick-mode banner (thin bar) + highlight overlay. Both live in the shadow root so they
    // stay self-contained; elementFromPoint returns the host for them, so they are auto-skipped.
    '.pbanner{position:fixed;top:0;left:0;right:0;z-index:2147483002;display:none;align-items:center;gap:10px;' +
    'padding:12px 16px;color:#fff;font-size:14px;font-weight:600;' +
    'background:linear-gradient(180deg,#D6322F,#B01D20);box-shadow:0 2px 12px rgba(0,0,0,.25)}' +
    '.pbanner.open{display:flex}' +
    '.pbanner .pcancel{margin-left:auto;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.5);' +
    'color:#fff;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer}' +
    '.sphl{position:fixed;z-index:2147483001;pointer-events:none;display:none;border:2px solid #C21F22;' +
    'background:rgba(214,50,47,.14);border-radius:3px;box-shadow:0 0 0 2px rgba(255,255,255,.5)}' +
    '.sphl.open{display:block}' +
    ':host(.sp-picking) .btn{display:none}';

  var host = document.createElement("div");
  host.className = "sp-mode-" + SOURCE;   // sp-mode-onboarding | sp-mode-report -- scopes the mobile rule
  var root = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);

  var opts = CATEGORIES.map(function (c) {
    return '<option value="' + c[0] + '">' + c[1] + '</option>';
  }).join("");

  var btnLabel = SOURCE === "onboarding" ? "Feedback" : (LIVE ? "Report an issue" : "Feedback");
  var sendLabel = SOURCE === "onboarding" ? "Send" : (LIVE ? "Report an issue" : "Send feedback");
  // "How it works" link: onboarding only (never nudge a live-site visitor off-task) and only
  // when the embed supplies data-help-url -- otherwise render nothing, never a dead link.
  var helpLink = (HELP_URL && SOURCE === "onboarding")
    ? ' &middot; <a href="' + esc(HELP_URL) + '" target="_blank" rel="noopener">How it works</a>'
    : "";

  root.innerHTML =
    '<style>' + css + '</style>' +
    '<button class="btn" id="sp-open" aria-label="' + btnLabel + '">' +
      SHIELD + '<span class="btn-label">' + btnLabel + '</span></button>' +
    '<div class="overlay" id="sp-overlay"><div class="card" id="sp-card">' +
      '<div class="head"><span class="mark">' + SHIELD + '</span>' +
        '<div><p class="title">' + btnLabel + '</p></div>' +
        '<button class="x" id="sp-close" aria-label="Close">&times;</button></div>' +
      '<p class="sub">' + esc(HELPER) + '</p>' +
      '<label>What\'s it about?</label><select id="sp-cat">' + opts + '</select>' +
      '<label>What did you notice?</label>' +
      '<textarea id="sp-desc" placeholder="e.g. The ladder on this page is out of date"></textarea>' +
      '<button type="button" class="pickbtn" id="sp-pick">' + ICON_TARGET + 'Point at it</button>' +
      '<div class="chip" id="sp-chip"></div>' +
      '<div class="row"><input type="checkbox" id="sp-urgent"><label for="sp-urgent">This is urgent</label></div>' +
      '<div class="row"><input type="checkbox" id="sp-contact"><label for="sp-contact">I\'d like a reply</label></div>' +
      '<div id="sp-contactfields" style="display:none">' +
        '<label>Your name</label><input id="sp-name" type="text">' +
        '<label>Your email</label><input id="sp-email" type="email"></div>' +
      '<button class="send" id="sp-send">' + sendLabel + '</button>' +
      '<div class="err" id="sp-err"></div>' +
      '<p class="foot">Powered by SitePulse' + helpLink + '</p>' +
    '</div></div>' +
    '<div class="pbanner" id="sp-pbanner"><span>Tap the thing you\'re talking about</span>' +
      '<button type="button" class="pcancel" id="sp-pcancel">Cancel</button></div>' +
    '<div class="sphl" id="sp-hl"></div>';

  var $ = function (id) { return root.getElementById(id); };
  var overlay = $("sp-overlay"), card = $("sp-card");
  function openM() { overlay.classList.add("open"); }
  function closeM() { overlay.classList.remove("open"); }

  $("sp-open").addEventListener("click", openM);
  $("sp-close").addEventListener("click", closeM);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeM(); });
  $("sp-contact").addEventListener("change", function (e) {
    $("sp-contactfields").style.display = e.target.checked ? "block" : "none";
  });

  // ---- PICK MODE ("Point at it") ---------------------------------
  // Capture-only (v1): records what was tapped (tag/label/context/coords); NO selector
  // engine. Picking is always optional -- submit is never gated on it.
  var picked = null;         // { tag, label, meta } or null
  var pickActive = false;
  var downX = 0, downY = 0;  // pointerdown position -> tap vs scroll discrimination
  var pending = false, lastPt = null;
  var crossStyle = null;

  function setCrosshair(on) {
    if (on) {
      crossStyle = document.createElement("style");
      crossStyle.textContent = "*{cursor:crosshair !important}";
      document.head.appendChild(crossStyle);
    } else if (crossStyle) {
      crossStyle.remove();
      crossStyle = null;
    }
  }
  // The element under a point, excluding our own widget (shadow host + the highlight).
  function targetAt(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el || el === host || host.contains(el)) return null;
    if (el === document.documentElement || el === document.body) return null;
    return el;
  }
  function positionHighlight(el) {
    var hl = $("sp-hl");
    if (!el) { hl.classList.remove("open"); return; }
    var r = el.getBoundingClientRect();
    hl.style.left = r.left + "px"; hl.style.top = r.top + "px";
    hl.style.width = r.width + "px"; hl.style.height = r.height + "px";
    hl.classList.add("open");
  }
  function onMove(e) {
    if (!pickActive) return;
    lastPt = { x: e.clientX, y: e.clientY };
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      positionHighlight(targetAt(lastPt.x, lastPt.y));
    });
  }
  function onDown(e) { downX = e.clientX; downY = e.clientY; }
  function onUp(e) {
    if (!pickActive) return;
    // A drag/scroll gesture (moved > ~10px) is not a tap -- leave pick mode running.
    if (Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10) return;
    var el = targetAt(e.clientX, e.clientY);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    swallowNextClick(); // stop the tap from activating a link/button on the page
    picked = { tag: el.tagName.toLowerCase(), label: labelFor(el), meta: metaFor(el) };
    endPick();
    openM();        // form returns exactly as it was -- typed text is untouched
    renderChip();
  }
  function onKey(e) { if (e.key === "Escape") { endPick(); openM(); } }
  function swallowNextClick() {
    var h = function (ev) { ev.preventDefault(); ev.stopPropagation(); cleanup(); };
    var cleanup = function () { document.removeEventListener("click", h, true); };
    document.addEventListener("click", h, true);
    setTimeout(cleanup, 400);
  }
  function startPick() {
    if (pickActive) return;
    pickActive = true;
    // Any prior pick is kept until a new tap confirms a replacement (Change re-picks).
    closeM();                               // hide form+dim; nodes (and typed text) persist
    host.classList.add("sp-picking");       // hide the floating open button
    $("sp-pbanner").classList.add("open");
    setCrosshair(true);
    // Capture phase so we see the tap before the page's own handlers.
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("keydown", onKey, true);
  }
  function endPick() {
    pickActive = false;
    host.classList.remove("sp-picking");
    $("sp-pbanner").classList.remove("open");
    $("sp-hl").classList.remove("open");
    setCrosshair(false);
    document.removeEventListener("pointermove", onMove, true);
    document.removeEventListener("pointerdown", onDown, true);
    document.removeEventListener("pointerup", onUp, true);
    document.removeEventListener("keydown", onKey, true);
  }
  function renderChip() {
    var chip = $("sp-chip");
    if (!picked) { chip.classList.remove("show"); chip.innerHTML = ""; return; }
    chip.classList.add("show");
    chip.innerHTML = '<span class="ci">' + iconFor(picked.tag) + '</span>' +
      '<span class="ct">' + esc(picked.tag) + ' -- ' + esc(picked.label) + '</span>' +
      '<button type="button" id="sp-chg">Change</button>' +
      '<button type="button" id="sp-rm">Remove</button>';
    $("sp-chg").addEventListener("click", startPick);
    $("sp-rm").addEventListener("click", function () { picked = null; renderChip(); });
  }
  $("sp-pick").addEventListener("click", startPick);
  $("sp-pcancel").addEventListener("click", function () { endPick(); openM(); });

  $("sp-send").addEventListener("click", function () {
    var desc = $("sp-desc").value.trim();
    var err = $("sp-err");
    if (!desc) { err.textContent = "Please describe what you noticed."; err.style.display = "block"; return; }
    if (!CLUB_ID) { err.textContent = "Widget misconfigured: no club id."; err.style.display = "block"; return; }
    err.style.display = "none";
    var btn = $("sp-send"); btn.disabled = true; btn.textContent = "Sending...";

    var payload = {
      club_id: CLUB_ID,
      source: SOURCE,
      page_url: location.href,
      description: desc,
      category: $("sp-cat").value,
      urgency_flag: $("sp-urgent").checked,
      contact_requested: $("sp-contact").checked,
      submitted_by_name: $("sp-name") && $("sp-name").value.trim() || null,
      submitted_by_email: $("sp-email") && $("sp-email").value.trim() || null,
      user_type: "public",
      device_type: deviceType(),
      browser: browserName(),
      os: osName(),
      viewport: window.innerWidth + "x" + window.innerHeight
    };

    // Element picker (v1): send only what we captured. No selector/confidence in v1 --
    // those are v2, and the ingest leaves them null.
    if (picked) {
      payload.element_tag = picked.tag;
      payload.element_label = picked.label;
      payload.element_meta = picked.meta;
    }

    fetch(INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, j: j }; });
    }).then(function (res) {
      if (!res.ok) throw new Error(res.j && res.j.error || "Submit failed");
      var ref = (res.j.id || "").slice(0, 8);
      card.innerHTML =
        '<div class="done"><span class="mark">' + SHIELD + '</span>' +
        '<p class="title">Thanks -- we\'ve logged it.</p>' +
        '<p class="sub">' + (payload.contact_requested
          ? "We\'ll be in touch." : "The team will take a look.") +
        '</p><p class="foot">Reference: ' + ref + '</p></div>';
      setTimeout(closeM, 2200);
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = sendLabel;
      err.textContent = e.message || "Something went wrong. Please try again.";
      err.style.display = "block";
    });
  });
})();
