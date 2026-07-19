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
    '.err{color:#C21F22;font-size:12px;margin-top:8px;display:none}';

  var host = document.createElement("div");
  host.className = "sp-mode-" + SOURCE;   // sp-mode-onboarding | sp-mode-report -- scopes the mobile rule
  var root = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);

  var opts = CATEGORIES.map(function (c) {
    return '<option value="' + c[0] + '">' + c[1] + '</option>';
  }).join("");

  var btnLabel = SOURCE === "onboarding" ? "Website check" : (LIVE ? "Report an issue" : "Feedback");
  var sendLabel = SOURCE === "onboarding" ? "Send" : (LIVE ? "Report an issue" : "Send feedback");

  root.innerHTML =
    '<style>' + css + '</style>' +
    '<button class="btn" id="sp-open" aria-label="' + btnLabel + '">' +
      SHIELD + '<span class="btn-label">' + btnLabel + '</span></button>' +
    '<div class="overlay" id="sp-overlay"><div class="card" id="sp-card">' +
      '<div class="head"><span class="mark">' + SHIELD + '</span>' +
        '<div><p class="title">' + btnLabel + '</p></div>' +
        '<button class="x" id="sp-close" aria-label="Close">&times;</button></div>' +
      '<p class="sub">Spotted something? Let us know -- takes 15 seconds.</p>' +
      '<label>What\'s it about?</label><select id="sp-cat">' + opts + '</select>' +
      '<label>What did you notice?</label>' +
      '<textarea id="sp-desc" placeholder="e.g. The ladder on this page is out of date"></textarea>' +
      '<div class="row"><input type="checkbox" id="sp-urgent"><label for="sp-urgent">This is urgent</label></div>' +
      '<div class="row"><input type="checkbox" id="sp-contact"><label for="sp-contact">I\'d like a reply</label></div>' +
      '<div id="sp-contactfields" style="display:none">' +
        '<label>Your name</label><input id="sp-name" type="text">' +
        '<label>Your email</label><input id="sp-email" type="email"></div>' +
      '<button class="send" id="sp-send">' + sendLabel + '</button>' +
      '<div class="err" id="sp-err"></div>' +
      '<p class="foot">Powered by SitePulse</p>' +
    '</div></div>';

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
