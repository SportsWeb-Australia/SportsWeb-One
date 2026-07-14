/* ============================================================================
   BHRDCA — shared chrome injector  (bhrdca-components.js)
   Renders the masthead (top bar + mobile menu + nav), a slim info ticker, the
   sponsor carousel and the footer into <div data-bhrdca="..."> mount points,
   so every inner page stays small and the chrome lives in ONE file.
   Set the active nav item with <body data-page="clubs">.
   ========================================================================== */
(function () {
  var LOGO = "/bhrdca-logo.svg";
  var FB = "https://www.facebook.com/bhrdca";
  var IG = "https://www.instagram.com/bhrdca1/";
  var PLAYHQ = "https://www.playhq.com/cricket-australia/org/box-hill-reporter-district-cricket-association/f8c1124c";

  // sponsor names for the moving carousel (static chrome, matches association wall)
  var SPONSORS = [
    ["Century Cricket Centre","https://www.cricketcentre.com.au/"],
    ["Kookaburra Sport","https://www.kookaburrasport.com.au/cricket/"],
    ["Cricket Victoria","https://www.cricketvictoria.com.au/"],
    ["Field of View","https://www.fieldofview.com.au/"],
    ["SportsWeb Australia","https://sportsweb.com.au"],
    ["Topline Cricket","https://www.toplinecricket.com.au/"],
    ["Top Notch Trophies","https://www.topnotchtrophies.com.au/"],
    ["SEDA College","https://seda.vic.edu.au/"],
    ["Box Hill Indoor Sports","https://boxhillindoorsports.com.au/sports-and-activities/indoor-cricket/"],
    ["Mulgrave Country Club","https://mulgravecc.com.au/sports/"],
    ["Geyer Accountants","https://geyeraccountants.com.au/"],
    ["Grant Professionals","https://au.linkedin.com/company/grant-professionals"],
    ["Club Builder","https://www.club-builder.com.au/"],
    ["Michael Sukkar MP","https://www.michaelsukkar.com.au/"],
    ["Club Connect","https://clubconnect.net.au"],
    ["Melbourne Metro Refrigeration","https://www.melbournemetrorefrigeration.com.au/"],
    ["APMG Painting","https://apmgpainting.com.au/"],
    ["HGCB","https://hgcb.com.au/"],
    ["Altegra","https://www.altegra.com.au/"],
    ["Good Sports","https://goodsports.com.au/"]
  ];
  function scItems() {
    var set = SPONSORS.map(function (s) {
      return '<a href="' + s[1] + '" target="_blank" rel="noopener" class="sci scitxt">' + s[0] + '</a>';
    }).join("");
    return set + set; // doubled for seamless loop
  }

  var T = {
    "topbar": '<div class="topbar">'
      + '<div style="display:flex;align-items:center;gap:18px">'
      + '<div class="tb-item"><i class="ti ti-map-pin"></i> Melbourne\'s Eastern Suburbs</div>'
      + '<div class="tb-item"><i class="ti ti-mail"></i> bhrdca.media@gmail.com</div>'
      + '<div class="tb-item"><i class="ti ti-ball-baseball"></i> Est. 1890 &middot; 135th Season</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:12px">'
      + '<div class="t-soc">'
      + '<a href="' + FB + '" target="_blank" rel="noopener" aria-label="BHRDCA on Facebook"><i class="ti ti-brand-facebook"></i></a>'
      + '<a href="' + IG + '" target="_blank" rel="noopener" aria-label="BHRDCA on Instagram"><i class="ti ti-brand-instagram"></i></a>'
      + '</div>'
      + '<a href="' + PLAYHQ + '" target="_blank" rel="noopener" style="background:var(--gold);color:var(--ink-gold);padding:4px 14px;border-radius:6px;font-size:11px;font-weight:700">Fixtures &amp; Ladders</a>'
      + '</div>'
      + '</div>',

    "mobile-menu": '<div class="mob-menu" id="mob-menu">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.1)">'
      + '<div style="display:flex;align-items:center;gap:10px"><img src="' + LOGO + '" alt="BHRDCA" style="width:38px;height:38px;object-fit:contain"><div style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:#fff">BHRDCA</div></div>'
      + '<button onclick="document.getElementById(\'mob-menu\').classList.remove(\'open\')" style="background:rgba(255,255,255,.1);border:none;color:#fff;width:36px;height:36px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center"><i class="ti ti-x" style="font-size:18px"></i></button>'
      + '</div>'
      + '<a href="/index.html" class="mob-link active"><i class="ti ti-home"></i> Home</a>'
      + '<a href="' + PLAYHQ + '" target="_blank" rel="noopener" class="mob-link"><i class="ti ti-scoreboard"></i> Fixtures, Results &amp; Ladders</a>'
      + '<div class="mob-group">Cricket</div>'
      + '<a href="/juniors.html" class="mob-link"><i class="ti ti-friends"></i> Juniors</a>'
      + '<a href="/seniors.html" class="mob-link"><i class="ti ti-trophy"></i> Seniors</a>'
      + '<a href="/womens.html" class="mob-link"><i class="ti ti-cricket"></i> Women\'s</a>'
      + '<a href="/veterans.html" class="mob-link"><i class="ti ti-medal"></i> Veterans</a>'
      + '<a href="/umpires.html" class="mob-link"><i class="ti ti-gavel"></i> Umpires</a>'
      + '<div class="mob-group">Clubs &amp; Community</div>'
      + '<a href="/clubs.html" class="mob-link"><i class="ti ti-buildings"></i> Our Clubs</a>'
      + '<a href="/club-contacts.html" class="mob-link"><i class="ti ti-address-book"></i> Club Contacts</a>'
      + '<a href="/communications.html" class="mob-link"><i class="ti ti-broadcast"></i> Communications</a>'
      + '<a href="/sponsors.html" class="mob-link"><i class="ti ti-heart-handshake"></i> Sponsors &amp; Partners</a>'
      + '<a href="/news.html" class="mob-link"><i class="ti ti-news"></i> News</a>'
      + '<a href="/podcasts.html" class="mob-link"><i class="ti ti-microphone"></i> Podcasts</a>'
      + '<div class="mob-group">The Association</div>'
      + '<a href="/about.html" class="mob-link"><i class="ti ti-info-circle"></i> About</a>'
      + '<a href="/contacts.html" class="mob-link"><i class="ti ti-users"></i> BHRDCA Contacts</a>'
      + '<a href="/rules.html" class="mob-link"><i class="ti ti-file-text"></i> Rules &amp; Regulations</a>'
      + '<a href="/child-safety.html" class="mob-link"><i class="ti ti-shield-check"></i> Child Safety</a>'
      + '<a href="/honours.html" class="mob-link"><i class="ti ti-award"></i> Honours &amp; History</a>'
      + '<a href="/contact.html" class="mob-link"><i class="ti ti-mail"></i> Contact</a>'
      + '<div style="margin-top:12px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1)">'
      + '<a class="btn btn-red" style="width:100%;justify-content:center" href="' + PLAYHQ + '" target="_blank" rel="noopener"><i class="ti ti-user-plus"></i> Register / Play</a>'
      + '</div>'
      + '</div>',

    "header-nav": '<nav class="nav-wrap">'
      + '<div class="nav-inner">'
      + '<a class="nav-brand" href="/index.html"><img src="' + LOGO + '" alt="BHRDCA" class="nav-logo-img"><div><div class="brand-name">BHRDCA</div><div class="brand-sub">Box Hill Reporter District Cricket Association</div></div></a>'
      + '<div class="nav-links">'
      + '<a class="nav-link active" href="/index.html">Home</a>'
      + '<div class="nav-item">'
      + '<a class="nav-link nav-drop-toggle" href="/seniors.html">Cricket <i class="ti ti-chevron-down" style="font-size:12px"></i></a>'
      + '<div class="nav-drop">'
      + '<a href="/juniors.html">Juniors</a>'
      + '<a href="/seniors.html">Seniors</a>'
      + '<a href="/womens.html">Women\'s</a>'
      + '<a href="/veterans.html">Veterans</a>'
      + '<a href="/umpires.html">Umpires</a>'
      + '</div>'
      + '</div>'
      + '<a class="nav-link" href="/clubs.html">Clubs</a>'
      + '<a class="nav-link" href="/communications.html">Communications</a>'
      + '<a class="nav-link" href="/news.html">News</a>'
      + '<a class="nav-link" href="/honours.html">Honours</a>'
      + '<div class="nav-item">'
      + '<a class="nav-link nav-drop-toggle" href="/about.html">Association <i class="ti ti-chevron-down" style="font-size:12px"></i></a>'
      + '<div class="nav-drop">'
      + '<a href="/about.html">About</a>'
      + '<a href="/contacts.html">BHRDCA Contacts</a>'
      + '<a href="/club-contacts.html">Club Contacts</a>'
      + '<a href="/rules.html">Rules &amp; Regulations</a>'
      + '<a href="/child-safety.html">Child Safety</a>'
      + '<a href="/sponsors.html">Sponsors &amp; Partners</a>'
      + '<a href="/podcasts.html">Podcasts</a>'
      + '<a href="/contact.html">Contact</a>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="nav-actions">'
      + '<a class="nav-icon-btn" href="' + FB + '" target="_blank" rel="noopener" data-tip="Facebook" aria-label="Facebook"><i class="ti ti-brand-facebook" style="font-size:18px"></i></a>'
      + '<a class="nav-icon-btn" href="' + IG + '" target="_blank" rel="noopener" data-tip="Instagram" aria-label="Instagram"><i class="ti ti-brand-instagram" style="font-size:18px"></i></a>'
      + '<button class="nav-icon-btn hamburger" onclick="document.getElementById(\'mob-menu\').classList.add(\'open\')"><i class="ti ti-menu-2" style="font-size:18px"></i></button>'
      + '<a class="btn btn-red btn-sm" href="' + PLAYHQ + '" target="_blank" rel="noopener">Fixtures</a>'
      + '</div>'
      + '</div>'
      + '</nav>',

    "ticker": '<div class="bh-strip">'
      + '<div class="bh-strip-inner">'
      + '<span class="bh-strip-pill"><i class="ti ti-scoreboard"></i> This Season</span>'
      + '<span class="bh-strip-tx">Fixtures, results &amp; ladders are live on PlayHQ &mdash; Juniors, Seniors, Women\'s &amp; Veterans.</span>'
      + '<a class="bh-strip-cta" href="' + PLAYHQ + '" target="_blank" rel="noopener">Open PlayHQ <i class="ti ti-external-link"></i></a>'
      + '</div>'
      + '</div>',

    "sponsor-carousel": '<div class="sc-wrap">'
      + '<div class="sc-inner">'
      + '<button class="sc-btn" id="sc-prev"><i class="ti ti-chevron-left" style="font-size:14px;pointer-events:none"></i></button>'
      + '<div class="sc-label-block"><span class="sc-label">Our Partners</span><span class="sc-label-sub">Proudly supporting BHRDCA cricket</span></div>'
      + '<div class="sc-scroll" id="sc-scroll"><div class="sc-track" id="sc-track">' + scItems() + '</div></div>'
      + '<button class="sc-btn" id="sc-next"><i class="ti ti-chevron-right" style="font-size:14px;pointer-events:none"></i></button>'
      + '</div>'
      + '</div>',

    "footer": '<footer class="footer">'
      + '<div class="footer-accent"></div>'
      + '<div class="footer-top">'
      + '<div>'
      + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">'
      + '<a href="/index.html" aria-label="BHRDCA home" style="display:inline-flex"><img src="' + LOGO + '" alt="BHRDCA" style="width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3))"></a>'
      + '<div><div style="font-family:\'Bebas Neue\',sans-serif;font-size:20px;color:#fff;letter-spacing:.5px">BHRDCA</div><div style="font-size:10px;color:rgba(255,255,255,.82)">Box Hill Reporter District Cricket Association</div></div>'
      + '</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,.85);line-height:1.7;max-width:250px;margin-bottom:14px">The longest-running cricket association in Victoria — proudly serving Melbourne\'s eastern suburbs since 1890.</div>'
      + '<div style="display:flex;gap:10px">'
      + '<a href="' + FB + '" target="_blank" rel="noopener" aria-label="BHRDCA on Facebook" class="f-soc"><i class="ti ti-brand-facebook"></i></a>'
      + '<a href="' + IG + '" target="_blank" rel="noopener" aria-label="BHRDCA on Instagram" class="f-soc"><i class="ti ti-brand-instagram"></i></a>'
      + '</div>'
      + '</div>'
      + '<div>'
      + '<div class="f-hd">Cricket</div>'
      + '<a class="f-link" href="/juniors.html">Juniors</a><a class="f-link" href="/seniors.html">Seniors</a><a class="f-link" href="/womens.html">Women\'s</a><a class="f-link" href="/veterans.html">Veterans</a><a class="f-link" href="/umpires.html">Umpires</a>'
      + '</div>'
      + '<div>'
      + '<div class="f-hd">Clubs &amp; Community</div>'
      + '<a class="f-link" href="/clubs.html">Our Clubs</a><a class="f-link" href="/club-contacts.html">Club Contacts</a><a class="f-link" href="/communications.html">Communications</a><a class="f-link" href="/sponsors.html">Sponsors &amp; Partners</a><a class="f-link" href="/news.html">News</a><a class="f-link" href="/podcasts.html">Podcasts</a>'
      + '</div>'
      + '<div>'
      + '<div class="f-hd">The Association</div>'
      + '<a class="f-link" href="/about.html">About</a><a class="f-link" href="/contacts.html">BHRDCA Contacts</a><a class="f-link" href="/rules.html">Rules &amp; Regulations</a><a class="f-link" href="/child-safety.html">Child Safety</a><a class="f-link" href="/honours.html">Honours &amp; History</a><a class="f-link" href="/contact.html">Contact</a>'
      + '</div>'
      + '</div>'
      + '<div style="border-top:1px solid rgba(255,255,255,.06);padding:14px 20px">'
      + '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">'
      + '<div style="font-size:11px;color:rgba(255,255,255,.62)">&copy; ' + (new Date().getFullYear()) + ' Box Hill Reporter District Cricket Association Inc. Reg. #A0032112P. All rights reserved.</div>'
      + '<div style="font-size:11px;color:rgba(255,255,255,.62)">Powered by <a href="https://sportsweb.com.au" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:none">SportsWeb One</a></div>'
      + '</div>'
      + '</div>'
      + '</footer>'
  };

  function html(key) {
    if (key === "masthead") return T["topbar"] + T["mobile-menu"] + T["header-nav"];
    return T[key] || "";
  }

  var ACTIVEMAP = {
    "home":"home","index":"home",
    "juniors":"cricket","seniors":"cricket","veterans":"cricket","womens":"cricket","umpires":"cricket",
    "clubs":"clubs","club-contacts":"clubs",
    "communications":"communications","news":"news","honours":"honours","history":"honours",
    "about":"association","contacts":"association","rules":"association","child-safety":"association",
    "sponsors":"association","podcasts":"association","contact":"association"
  };
  function wireNav() {
    var page = (document.body.getAttribute("data-page") || "").toLowerCase();
    var active = ACTIVEMAP[page] || page;
    var links = document.querySelectorAll(".nav-link");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var key = (a.textContent || "").trim().toLowerCase().replace(/\s+.*$/,"");
      a.classList.remove("active");
      if (key === active) a.classList.add("active");
    }
  }

  function initCarousel() {
    var el = document.getElementById("sc-scroll");
    var track = document.getElementById("sc-track");
    if (!el || !track) return;
    var half = 0, pos = 0, speed = 0.45, boost = 0, paused = false;
    function measure(){ half = track.scrollWidth / 2; }
    measure();
    window.addEventListener("resize", measure);
    setTimeout(measure, 600); setTimeout(measure, 2000);
    el.addEventListener("mouseenter", function(){ paused = true; });
    el.addEventListener("mouseleave", function(){ paused = false; });
    function group(){ return Math.max(el.clientWidth * 0.9, 240); }
    var prev = document.getElementById("sc-prev"), next = document.getElementById("sc-next");
    if (next) next.addEventListener("click", function(){ boost += group(); });
    if (prev) prev.addEventListener("click", function(){ boost -= group(); });
    function frame(){
      var step = paused ? 0 : speed;
      if (boost !== 0){
        var rush = Math.max(speed, group() / 20);
        var d = boost > 0 ? Math.min(boost, rush) : Math.max(boost, -rush);
        step += d; boost -= d;
      }
      pos += step;
      if (half > 0){ if (pos >= half) pos -= half; else if (pos < 0) pos += half; }
      el.scrollLeft = pos;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function mount() {
    var nodes = document.querySelectorAll("[data-bhrdca]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-bhrdca");
      nodes[i].outerHTML = html(key);
    }
    wireNav();
    initCarousel();
  }

  window.BHRDCA = window.BHRDCA || {};
  window.BHRDCA.mount = mount;
  window.BHRDCA.LOGO = LOGO;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
