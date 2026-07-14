/* RDCA PWA — registers the service worker and shows a branded install prompt
   shortly after the page loads (Android/Chrome/Edge via beforeinstallprompt;
   iOS Safari gets an "Add to Home Screen" hint). Dismissals are remembered. */
(function () {
  "use strict";

  // ---- register service worker ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }

  var KEY = "bhrdcaPwaDismissed";
  var SNOOZE_DAYS = 14;
  var deferred = null;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
           window.navigator.standalone === true;
  }
  function dismissedRecently() {
    try {
      var t = parseInt(localStorage.getItem(KEY) || "0", 10);
      return t && (Date.now() - t) < SNOOZE_DAYS * 864e5;
    } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  }

  function injectStyles() {
    if (document.getElementById("rdca-pwa-style")) return;
    var css = ''
      + '.rdca-pwa{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(140%);'
      + 'z-index:2147483000;width:min(420px,calc(100vw - 24px));background:linear-gradient(150deg,#152d52,#0d1f3c);'
      + 'color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.45);'
      + 'padding:14px 14px 14px 14px;font-family:"DM Sans",system-ui,sans-serif;opacity:0;'
      + 'transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .45s}'
      + '.rdca-pwa.show{transform:translateX(-50%) translateY(0);opacity:1}'
      + '.rdca-pwa-row{display:flex;align-items:center;gap:13px}'
      + '.rdca-pwa-ic{flex:0 0 46px;width:46px;height:46px;border-radius:12px;background:#fff;'
      + 'display:flex;align-items:center;justify-content:center;overflow:hidden}'
      + '.rdca-pwa-ic img{width:84%;height:84%;object-fit:contain}'
      + '.rdca-pwa-tt{font-weight:700;font-size:14px;line-height:1.2}'
      + '.rdca-pwa-sb{font-size:12px;color:rgba(255,255,255,.72);line-height:1.45;margin-top:2px}'
      + '.rdca-pwa-x{margin-left:auto;background:rgba(255,255,255,.1);border:none;color:#fff;width:30px;height:30px;'
      + 'border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:0 0 auto;align-self:flex-start}'
      + '.rdca-pwa-x:hover{background:rgba(255,255,255,.2)}'
      + '.rdca-pwa-actions{display:flex;gap:9px;margin-top:12px}'
      + '.rdca-pwa-btn{flex:1;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;'
      + 'padding:10px 14px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px}'
      + '.rdca-pwa-install{background:#f6c21c;color:#0a2242}.rdca-pwa-install:hover{background:#ffcb2e}'
      + '.rdca-pwa-later{background:rgba(255,255,255,.1);color:#fff}.rdca-pwa-later:hover{background:rgba(255,255,255,.18)}'
      + '.rdca-pwa-ios{font-size:12.5px;color:rgba(255,255,255,.82);line-height:1.5;margin-top:10px}'
      + '.rdca-pwa-ios b{color:#fff}';
    var st = document.createElement("style");
    st.id = "rdca-pwa-style"; st.textContent = css;
    document.head.appendChild(st);
  }

  function build(inner) {
    injectStyles();
    var el = document.createElement("div");
    el.className = "rdca-pwa";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Install the BHRDCA app");
    el.innerHTML = inner;
    document.body.appendChild(el);
    requestAnimationFrame(function () { setTimeout(function () { el.classList.add("show"); }, 20); });
    return el;
  }
  function close(el) { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 460); }

  function showInstall() {
    var el = build(
      '<div class="rdca-pwa-row">' +
        '<div class="rdca-pwa-ic"><img src="/icon-192.png" alt=""></div>' +
        '<div><div class="rdca-pwa-tt">Install the BHRDCA app</div>' +
        '<div class="rdca-pwa-sb">Add it to your home screen for one-tap access to fixtures, results, ladders &amp; club news.</div></div>' +
        '<button class="rdca-pwa-x" aria-label="Dismiss"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<div class="rdca-pwa-actions">' +
        '<button class="rdca-pwa-btn rdca-pwa-install">Install app</button>' +
        '<button class="rdca-pwa-btn rdca-pwa-later">Not now</button>' +
      '</div>'
    );
    el.querySelector(".rdca-pwa-x").onclick = function () { remember(); close(el); };
    el.querySelector(".rdca-pwa-later").onclick = function () { remember(); close(el); };
    el.querySelector(".rdca-pwa-install").onclick = function () {
      if (!deferred) { close(el); return; }
      deferred.prompt();
      deferred.userChoice.then(function () { remember(); deferred = null; close(el); });
    };
  }

  function showIOS() {
    var el = build(
      '<div class="rdca-pwa-row">' +
        '<div class="rdca-pwa-ic"><img src="/icon-192.png" alt=""></div>' +
        '<div><div class="rdca-pwa-tt">Add RDCA to your home screen</div>' +
        '<div class="rdca-pwa-sb">Get the app experience on your iPhone or iPad.</div></div>' +
        '<button class="rdca-pwa-x" aria-label="Dismiss"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<div class="rdca-pwa-ios">Tap the <b>Share</b> button ' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M12 16V4M8 8l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>' +
      ' then <b>Add to Home Screen</b>.</div>'
    );
    el.querySelector(".rdca-pwa-x").onclick = function () { remember(); close(el); };
  }

  if (isStandalone() || dismissedRecently()) return;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    setTimeout(function () { if (deferred) showInstall(); }, 1400);
  });

  window.addEventListener("appinstalled", function () {
    remember(); deferred = null;
    var b = document.querySelector(".rdca-pwa"); if (b) close(b);
  });

  // iOS Safari has no beforeinstallprompt — show the manual hint
  if (isIOS()) {
    window.addEventListener("load", function () {
      setTimeout(function () { if (!isStandalone() && !dismissedRecently()) showIOS(); }, 1600);
    });
  }
})();

/* ============================================================================
   MATCH-DAY ALERTS (demo) — opt-in via the nav bell ([data-rdca-alerts]).
   Requests notification permission on a user gesture, then shows a realistic
   association notification through the service worker. No backend required;
   the SW push handler above is ready to wire to a real sender later.
   ========================================================================== */
(function () {
  "use strict";
  var SAMPLES = [
    { title: "AGM \u2014 28 January", body: "The RDCA AGM is set for 28 January. All member clubs are invited.", url: "/notices.html#agm" },
    { title: "Ground closures in effect", body: "Some grounds are closed \u2014 check conditions before you travel.", url: "/notices.html#ground-closures" },
    { title: "Awards Night nominations open", body: "Nominations for the RDCA Awards Night are open until 31 January.", url: "/notices.html#awards" },
    { title: "Round 15 fixtures are live", body: "See who your club plays this Saturday across all grades.", url: "/competition.html" },
    { title: "Wet weather update", body: "Some grounds may be affected today \u2014 tap for the latest ground status.", url: "/competition.html" },
    { title: "Live now on FrogBox", body: "Ringwood CC v Croydon CC is streaming live. Tap to watch.", url: "/video.html" },
    { title: "New photos added", body: "Around-the-grounds shots from the weekend are up in the gallery.", url: "/photos.html" },
    { title: "Registrations are open", body: "2026/27 player registrations are now open across the RDCA.", url: "/competition.html" }
  ];
  function pick() { return SAMPLES[Math.floor(Math.random() * SAMPLES.length)]; }

  function toast(msg, ok) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(20px);" +
      "z-index:2147483600;background:" + (ok ? "#0d1f3c" : "#7a1020") + ";color:#fff;" +
      "font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:600;padding:11px 16px;" +
      "border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.35);opacity:0;transition:all .35s;max-width:90vw;text-align:center";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
    setTimeout(function () { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)";
      setTimeout(function () { t.remove(); }, 400); }, 4500);
  }

  function fire() {
    var s = pick();
    var opts = { body: s.body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "rdca-demo",
                 data: { url: s.url }, vibrate: [60, 40, 60] };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (reg) {
        try { reg.showNotification(s.title + "  \u00b7  RDCA", opts); }
        catch (_) { try { new Notification(s.title, opts); } catch (e) {} }
      });
    } else {
      try { new Notification(s.title, opts); } catch (e) {}
    }
  }

  function enable() {
    if (!("Notification" in window)) { toast("Notifications aren't supported on this browser.", false); return; }
    if (Notification.permission === "granted") { toast("Match-day alerts are on (demo) \u2014 here's a sample!", true); setTimeout(fire, 700); return; }
    if (Notification.permission === "denied") { toast("Alerts are blocked \u2014 enable notifications for this site in your browser settings.", false); return; }
    Notification.requestPermission().then(function (p) {
      if (p === "granted") { toast("You're subscribed to match-day alerts (demo).", true); setTimeout(fire, 900); }
      else { toast("No problem \u2014 tap the bell anytime to turn on alerts.", false); }
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("[data-rdca-alerts]");
    if (b) { e.preventDefault(); enable(); }
  });
})();

/* ---- Back-to-top button (all pages) ---- */
(function () {
  if (document.getElementById("rdcaToTop")) return;
  var b = document.createElement("button");
  b.id = "rdcaToTop";
  b.type = "button";
  b.setAttribute("aria-label", "Back to top");
  b.innerHTML = '<i class="ti ti-arrow-up"></i>';
  b.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:1200;width:46px;height:46px;border:none;border-radius:50%;background:#0d1f3c;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(13,31,60,.32);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .2s,transform .2s,background .15s";
  b.addEventListener("mouseenter", function () { b.style.background = "#cc2222"; });
  b.addEventListener("mouseleave", function () { b.style.background = "#0d1f3c"; });
  b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  function show() {
    var on = window.scrollY > 400;
    b.style.opacity = on ? "1" : "0";
    b.style.visibility = on ? "visible" : "hidden";
    b.style.transform = on ? "translateY(0)" : "translateY(8px)";
  }
  function mount() { if (document.body && !b.parentNode) { document.body.appendChild(b); show(); } }
  window.addEventListener("scroll", show, { passive: true });
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
