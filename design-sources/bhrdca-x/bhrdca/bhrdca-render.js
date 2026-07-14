/* ============================================================================
   BHRDCA — data-driven renderers. Reads window.BHRDCA_DATA (site-data.js).
   Usage on a page:  BHRDCA.render.clubs("#mount")
   ========================================================================== */
(function () {
  var D = window.BHRDCA_DATA || {};
  function $(s){ return document.querySelector(s); }
  function esc(t){ return String(t==null?"":t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function initials(name){
    var words = String(name).replace(/[^A-Za-z0-9 &\/-]/g," ").split(/[ \/&-]+/).filter(Boolean);
    var s = words.slice(0,3).map(function(w){ return w[0]; }).join("").toUpperCase();
    return s || "C";
  }
  function tel(p){ return p ? p.replace(/[^0-9+]/g,"") : ""; }

  function contactCard(c){
    var out = '<div class="bh-ccard">';
    out += '<div class="role">' + esc(c.role) + '</div>';
    out += '<div class="nm">' + esc(c.name || "TBC") + '</div>';
    if (c.phone) out += '<a href="tel:' + tel(c.phone) + '"><i class="ti ti-phone"></i> ' + esc(c.phone) + '</a>';
    if (c.email) out += '<a href="mailto:' + esc(c.email) + '"><i class="ti ti-mail"></i> ' + esc(c.email) + '</a>';
    if (!c.phone && !c.email) out += '<div class="row"><i class="ti ti-dots"></i> Contact details to come</div>';
    out += '</div>';
    return out;
  }

  var render = {
    clubs: function (sel) {
      var m = $(sel); if (!m) return;
      var clubs = D.clubs || [];
      m.innerHTML = '<div class="bh-clubgrid">' + clubs.map(function (c) {
        return '<a class="bh-club" href="' + esc(c.url) + '" target="_blank" rel="noopener">'
          + '<div class="crest">' + esc(initials(c.name)) + '</div>'
          + '<div class="cn">' + esc(c.name) + '</div>'
          + '<div class="cx"><i class="ti ti-external-link"></i> Visit site</div>'
          + '</a>';
      }).join("") + '</div>';
    },

    clubContacts: function (sel) {
      var m = $(sel); if (!m) return;
      var rows = D.clubContacts || [];
      var body = rows.map(function (r) {
        var email = r.email ? '<a href="mailto:' + esc(r.email.split(" ")[0]) + '">' + esc(r.email) + '</a>' : '<span style="color:var(--muted)">&mdash;</span>';
        var phone = r.number ? '<a href="tel:' + tel(r.number) + '">' + esc(r.number) + '</a>' : '<span style="color:var(--muted)">&mdash;</span>';
        return '<tr><td class="club-nm">' + esc(r.club) + '</td><td>' + esc(r.contact || "&mdash;") + '</td><td>' + phone + '</td><td>' + email + '</td></tr>';
      }).join("");
      m.innerHTML =
        '<input class="bh-search" id="bh-club-search" type="search" placeholder="Search clubs or contacts…" aria-label="Search club contacts">'
        + '<div class="bh-table-wrap"><table class="bh-table"><thead><tr><th>Club</th><th>Contact</th><th>Phone</th><th>Email</th></tr></thead><tbody id="bh-club-body">' + body + '</tbody></table></div>';
      var input = document.getElementById("bh-club-search");
      if (input) input.addEventListener("input", function () {
        var q = this.value.toLowerCase();
        var trs = document.querySelectorAll("#bh-club-body tr");
        trs.forEach(function (tr) { tr.style.display = tr.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none"; });
      });
    },

    sponsors: function (sel) {
      var m = $(sel); if (!m) return;
      var sp = D.sponsors || [];
      var tiers = ["Premier", "Partner", "Community"];
      var html = "";
      tiers.forEach(function (t) {
        var list = sp.filter(function (s) { return s.tier === t; });
        if (!list.length) return;
        html += '<div class="block-hed" style="margin-top:26px">' + t + (t === "Community" ? " & Compliance" : "") + ' Partners</div>';
        html += '<div class="bh-clubgrid">' + list.map(function (s) {
          return '<a class="bh-club" href="' + esc(s.url) + '" target="_blank" rel="noopener">'
            + '<div class="crest">' + esc(initials(s.name)) + '</div>'
            + '<div class="cn">' + esc(s.name) + '</div>'
            + '<div class="cx"><i class="ti ti-external-link"></i> Visit</div>'
            + '</a>';
        }).join("") + '</div>';
      });
      m.innerHTML = html;
    },

    committee: function (sel) {
      var m = $(sel); if (!m) return;
      m.innerHTML = '<div class="bh-cgrid">' + (D.committee || []).map(contactCard).join("") + '</div>';
    },

    subCommittees: function (sel) {
      var m = $(sel); if (!m) return;
      m.innerHTML = '<div class="bh-feature">' + (D.subCommittees || []).map(function (s) {
        return '<div class="bh-fcard"><i class="ti ti-users-group"></i><h3>' + esc(s.name) + '</h3>'
          + '<p>' + s.members.map(esc).join("<br>") + '</p></div>';
      }).join("") + '</div>';
    },

    section: function (sel, key) {
      var m = $(sel); if (!m) return;
      var s = (D.sections || {})[key]; if (!s) return;
      var out = '<div class="bh-secintro">'
        + '<div><div class="block-hed">' + esc(s.name) + ' Cricket</div>'
        + '<div class="block-sub" style="font-size:14px;line-height:1.7">' + esc(s.blurb) + '</div>'
        + '<div style="margin-top:16px"><a class="btn btn-red" href="' + esc(D.links.playhq) + '" target="_blank" rel="noopener"><i class="ti ti-scoreboard"></i> Fixtures, Results &amp; Ladders</a></div>'
        + '</div>'
        + '<div class="ph"><i class="ti ' + esc(s.icon) + '"></i></div>'
        + '</div>';
      out += '<div class="block-hed" style="margin-top:34px">Who to contact</div>';
      out += '<div class="bh-cgrid">' + s.contacts.map(contactCard).join("") + '</div>';
      if (s.resources && s.resources.length) {
        out += '<div class="block-hed" style="margin-top:34px">Resources &amp; Rules</div>';
        out += '<div class="bh-reslist">' + s.resources.map(function (r) {
          return '<a class="bh-res" href="' + esc(r.url) + '" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> ' + esc(r.label) + '</a>';
        }).join("") + '</div>';
      }
      m.innerHTML = out;
    },

    honours: function (sel) {
      var m = $(sel); if (!m) return;
      m.innerHTML = '<div class="bh-hongrid">' + (D.history || []).map(function (h) {
        return '<a class="bh-hon" href="' + esc(h.url) + '" target="_blank" rel="noopener">'
          + '<i class="ti ' + esc(h.icon) + '"></i><h3>' + esc(h.label) + '</h3><p>' + esc(h.desc) + '</p></a>';
      }).join("") + '</div>';
    },

    childSafety: function (sel) {
      var m = $(sel); if (!m) return;
      var cs = D.childSafety || {};
      var out = '<div class="bh-cgrid">' + [cs.officer, cs.complaints].filter(Boolean).map(contactCard).join("") + '</div>';
      out += '<div class="block-hed" style="margin-top:30px">Policies we endorse &amp; adopt</div>';
      out += '<div class="bh-reslist">' + (cs.policies || []).map(function (p) {
        return '<a class="bh-res" href="' + esc(p.url) + '" target="_blank" rel="noopener"><i class="ti ti-shield-check"></i> ' + esc(p.label) + '</a>';
      }).join("") + '</div>';
      m.innerHTML = out;
    },

    stats: function (sel) {
      var m = $(sel); if (!m) return;
      m.innerHTML = (D.stats || []).map(function (s) {
        return '<div class="bh-stat"><div class="n">' + esc(s.n) + '</div><div class="l">' + esc(s.label) + '</div></div>';
      }).join("");
    }
  };

  window.BHRDCA = window.BHRDCA || {};
  window.BHRDCA.render = render;
})();
