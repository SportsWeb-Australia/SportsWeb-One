# -*- coding: utf-8 -*-
# BHRDCA page generator. Emits light page shells that share chrome + data layer.
import os
OUT = os.path.dirname(os.path.abspath(__file__))
PLAYHQ = "https://www.playhq.com/cricket-australia/org/box-hill-reporter-district-cricket-association/f8c1124c"

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title} — BHRDCA</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css">
<link rel="stylesheet" href="/_shared.css">
<link rel="stylesheet" href="/_pages.css">
<script src="/bhrdca-components.js"></script>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#0a2242">
<link rel="apple-touch-icon" href="/icon-192.png">
<script src="/pwa.js" defer></script>
</head>
<body data-page="{page}">

<div data-bhrdca="masthead"></div>
<div data-bhrdca="ticker"></div>

<header class="page-hero">
  <div class="page-hero-inner {wide}">
    <div class="crumb"><a href="/index.html">Home</a> <i class="ti ti-chevron-right"></i> {crumb}</div>
    <div class="eyebrow">{eyebrow}</div>
    <h1>{h1}</h1>
    <p class="page-sub">{sub}</p>
  </div>
</header>

<div class="page-wrap {wide}">
"""

FOOT = """</div>

<div data-bhrdca="sponsor-carousel"></div>
<div data-bhrdca="footer"></div>
{scripts}
</body>
</html>
"""

def emit(fn, page, title, crumb, eyebrow, h1, sub, body, scripts="", wide=""):
    html = HEAD.format(title=title, page=page, crumb=crumb, eyebrow=eyebrow, h1=h1, sub=sub, wide=wide)
    html += body + FOOT.format(scripts=scripts)
    open(os.path.join(OUT, fn), "w", encoding="utf-8").write(html)
    print("wrote", fn)

def data_scripts(calls):
    return ('<script src="/site-data.js"></script>\n<script src="/bhrdca-render.js"></script>\n<script>\n'
            + calls + '\n</script>')

# ---- Section pages (data-driven) ----
sections = [
    ("juniors.html","juniors","Juniors","Cricket · Juniors","Junior Cricket","Boys & Girls cricket across 20+ grades — Friday nights, Saturday & Sunday mornings."),
    ("seniors.html","seniors","Seniors","Cricket · Seniors","Senior Cricket","12+ Saturday grades plus a mid-week twilight T20 competition."),
    ("womens.html","womens","Women's","Cricket · Women's","Women's Cricket","A growing women's and girls' game right across the BHRDCA."),
    ("veterans.html","veterans","Veterans","Cricket · Veterans","Veterans Cricket","Over 40s & Over 50s cricket, played Sunday afternoons."),
    ("umpires.html","umpires","Umpires","Cricket · Umpires","BHRDCA Umpires Association","Supporting and appointing umpires across the competition. New umpires always welcome."),
]
for fn,page,title,crumb,h1,sub in sections:
    key = page
    body = '  <div class="section-block"><div id="m"></div></div>\n'
    emit(fn, page, title, crumb, "Play Cricket", h1, sub, body,
         scripts=data_scripts('BHRDCA.render.section("#m","%s");' % key), wide="wide")

# ---- Clubs directory ----
clubs_body = """  <div class="section-block">
    <div class="callout callout-blue" style="margin-bottom:18px">
      <i class="ti ti-info-circle"></i>
      <div><strong>Member clubs.</strong> Tap any club to visit its website. The full 28-club member set and official club crests are <strong>to be confirmed with the BHRDCA</strong> — the tiles below use placeholder crests.</div>
    </div>
    <div class="block-sub" id="clubs-note"></div>
    <div id="m"></div>
  </div>
"""
emit("clubs.html","clubs","Our Clubs","Clubs","Member Clubs","Our Clubs",
     "The clubs that make up the Box Hill Reporter District Cricket Association across Melbourne's east.",
     clubs_body,
     scripts=data_scripts('BHRDCA.render.clubs("#m");\n(function(){var d=window.BHRDCA_DATA||{};document.getElementById("clubs-note").innerHTML="Showing <strong>"+(d.clubs||[]).length+"</strong> member clubs. "+(d.clubsNote||"");})();'),
     wide="wide")

# ---- Club contacts (searchable table) ----
cc_body = """  <div class="section-block">
    <div class="block-sub">Contacts for all clubs affiliated with the BHRDCA for the 2025/26 season. Search by club or contact name.</div>
    <div id="m"></div>
  </div>
"""
emit("club-contacts.html","club-contacts","Club Contacts","Association · Club Contacts","Directory","Club Contacts",
     "Every affiliated club's primary contact for the current season.",
     cc_body, scripts=data_scripts('BHRDCA.render.clubContacts("#m");'), wide="wide")

# ---- Sponsors ----
sp_body = """  <div class="section-block">
    <div class="block-sub">The BHRDCA thanks the partners who help grow cricket across Melbourne's east. Tap a partner to visit their website.</div>
    <div id="m"></div>
  </div>
"""
emit("sponsors.html","sponsors","Sponsors & Partners","Association · Sponsors","Proudly supported by","Sponsors &amp; Partners",
     "Our valued sponsors and partners make community cricket possible.",
     sp_body, scripts=data_scripts('BHRDCA.render.sponsors("#m");'))

# ---- BHRDCA Contacts (committee) ----
contacts_body = """  <div class="section-block">
    <div class="callout callout-navy" style="margin-bottom:20px">
      <i class="ti ti-map-pin"></i>
      <div><strong>BHRDCA Postal Address:</strong> 604 Mountain Highway, Bayswater VIC 3153.<br>Registered with Consumer Affairs Victoria — Box Hill Reporter District Cricket Association Inc. Registered 26/9/1995, Registration #A0032112P.</div>
    </div>
    <div class="block-hed">2025/26 Administration</div>
    <div class="block-sub">The people who run the Association. New volunteers are always welcome — get in touch.</div>
    <div id="cm"></div>
  </div>
  <div class="section-block">
    <div class="block-hed">Sub-Committees</div>
    <div id="sm"></div>
  </div>
"""
emit("contacts.html","contacts","BHRDCA Contacts","Association · Contacts","Committee of Management","BHRDCA Contacts",
     "The Committee of Management and sub-committees for the 2025/26 season.",
     contacts_body, scripts=data_scripts('BHRDCA.render.committee("#cm");\nBHRDCA.render.subCommittees("#sm");'), wide="wide")

# ---- Honours & History ----
hon_body = """  <div class="section-block">
    <div class="block-sub">The BHRDCA is the longest-running cricket association in Victoria. Explore the records, heritage and people who have shaped 135 seasons of cricket.</div>
    <div id="m"></div>
  </div>
"""
emit("honours.html","honours","Honours & History","Honours","Since 1890/91","Honours &amp; History",
     "Heritage, office bearers, life members, statistical records and the Hall of Fame.",
     hon_body, scripts=data_scripts('BHRDCA.render.honours("#m");'), wide="wide")

# ---- Child Safety ----
cs_body = """  <div class="section-block">
    <div class="callout callout-blue" style="margin-bottom:20px">
      <i class="ti ti-shield-check"></i>
      <div><strong>The BHRDCA is committed to child safety.</strong> We endorse and adopt Australian Cricket's and Cricket Victoria's policies for safeguarding children and young people, and expect every affiliated club, coach, official and volunteer to uphold them.</div>
    </div>
    <div class="block-hed">Who to contact</div>
    <div id="m"></div>
  </div>
"""
emit("child-safety.html","child-safety","Child Safety","Association · Child Safety","A safe game for everyone","Child Safety",
     "Our Child Safety Officer, Complaints Manager and the policies we adopt.",
     cs_body, scripts=data_scripts('BHRDCA.render.childSafety("#m");'), wide="wide")

# ---- About (static) ----
about_body = """  <div class="section-block">
    <div class="bh-secintro">
      <div>
        <div class="block-hed">The BHRDCA story</div>
        <div class="block-sub" style="font-size:14px;line-height:1.8">The Box Hill Reporter District Cricket Association (BHRDCA) is an amateur &lsquo;hard wicket&rsquo; cricket association, centred around Melbourne&rsquo;s eastern suburbs and first established in 1890/91. In 2024/25 the Association operated in its 135th season and can lay claim to being the longest-running cricket association in Victoria.<br><br>We support Junior Boys &amp; Girls, Senior and Veterans (Over 40 &amp; Over 50) competitions and provide opportunities for more than 3,500 cricketers &mdash; of all ages and abilities &mdash; to participate on a weekly basis. The competition features more than 12 Senior grades, over 20 Junior grades playing Friday nights, Saturday &amp; Sunday mornings, and 8 Veterans grades on Sunday afternoons, plus a mid-week twilight T20 competition.<br><br>New players, umpires and officials are always welcome &mdash; look up our contact pages and get in touch if you&rsquo;ve moved into the area or are interested in playing the great game of cricket.</div>
      </div>
      <div class="ph"><i class="ti ti-shield"></i></div>
    </div>
  </div>
  <div class="section-block">
    <div class="bh-feature">
      <div class="bh-fcard"><i class="ti ti-calendar-stats"></i><h3>135th Season</h3><p>Operating since 1890/91 — the longest-running cricket association in Victoria.</p></div>
      <div class="bh-fcard"><i class="ti ti-users"></i><h3>3,500+ Players</h3><p>Juniors, Seniors, Women's and Veterans across all ages and abilities.</p></div>
      <div class="bh-fcard"><i class="ti ti-buildings"></i><h3>28 Clubs</h3><p>Community clubs right across Melbourne's eastern suburbs.</p></div>
      <div class="bh-fcard"><i class="ti ti-map-pin"></i><h3>Melbourne's East</h3><p>Postal: 604 Mountain Highway, Bayswater VIC 3153. Reg. #A0032112P.</p></div>
    </div>
  </div>
  <div class="section-block">
    <div class="page-hero-actions">
      <a class="btn btn-red" href="/contacts.html"><i class="ti ti-users"></i> BHRDCA Contacts</a>
      <a class="btn btn-navy" href="/rules.html"><i class="ti ti-file-text"></i> Rules &amp; Regulations</a>
      <a class="btn btn-outline-red" href="/honours.html"><i class="ti ti-award"></i> Honours &amp; History</a>
    </div>
  </div>
"""
emit("about.html","about","About","About","About the Association","About BHRDCA",
     "Amateur 'hard wicket' cricket across Melbourne's eastern suburbs since 1890.",
     about_body, wide="wide")

# ---- Rules & Regulations (static) ----
rules_body = """  <div class="section-block">
    <div class="callout callout-blue" style="margin-bottom:18px">
      <i class="ti ti-info-circle"></i>
      <div><strong>Association By-Laws &amp; Corporate Rules.</strong> The official BHRDCA Corporate Rules and By-Laws documents are <strong>to be supplied</strong> and will be linked here. The playing-condition summaries below are live.</div>
    </div>
    <div class="block-hed">Junior Playing Conditions</div>
    <div class="block-sub">Competition rules and grade summaries for junior cricket.</div>
    <div class="bh-reslist">
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/23872a_b03334bc0f454b80bd4ab3ae7bc0ca84.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> Junior Competition Rules</a>
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/c846e3_9ced7a2e55504257a291b053bc9b183f.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> Coaches Code of Behaviour</a>
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/bad3dd_3e47dc29944f4aaf91a5e279d98e4b12.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> U12 Rules Summary</a>
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/bad3dd_569e03d05715420b90b2d1abeb46df64.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> U14 Rules Summary</a>
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/bad3dd_40aa10fece5346adb0e3f8a6ecdc63d5.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> U16/U18 Rules Summary</a>
    </div>
  </div>
  <div class="section-block">
    <div class="block-hed">Umpiring</div>
    <div class="bh-reslist">
      <a class="bh-res" href="https://www.bhrdca.com.au/_files/ugd/bad3dd_28f8655c4480433980a6d9a94363414f.pdf" target="_blank" rel="noopener"><i class="ti ti-file-download"></i> Umpire Fees</a>
    </div>
  </div>
  <div class="section-block">
    <div class="block-hed">Governing Bodies</div>
    <div class="bh-reslist">
      <a class="bh-res" href="https://www.cricketvictoria.com.au/" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Cricket Victoria</a>
      <a class="bh-res" href="https://www.cricket.com.au/" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Cricket Australia</a>
      <a class="bh-res" href="https://www.cricketvictoria.com.au/child-safe-member-protection/" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Child Safe &amp; Member Protection</a>
    </div>
  </div>
"""
emit("rules.html","rules","Rules & Regulations","Association · Rules","Playing conditions","Rules &amp; Regulations",
     "Competition rules, playing conditions and the documents that govern BHRDCA cricket.",
     rules_body, wide="wide")

# ---- Contact (static form) ----
contact_body = """  <div class="section-block">
    <div class="bh-secintro">
      <div>
        <div class="block-hed">Contact the BHRDCA team</div>
        <div class="block-sub" style="font-size:14px;line-height:1.7">For media inquiries, reach out to our Media Manager below. For all other inquiries, send us a message and we'll point you in the right direction.</div>
        <div class="bh-ccard" style="margin-top:16px;max-width:340px">
          <div class="role">Media Manager</div>
          <div class="nm">Paul Hooper</div>
          <a href="tel:0420789811"><i class="ti ti-phone"></i> 0420 789 811</a>
          <a href="mailto:bhrdca.media@gmail.com"><i class="ti ti-mail"></i> bhrdca.media@gmail.com</a>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px">
          <a class="f-soc" style="background:var(--navy);color:#fff;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center" href="https://www.facebook.com/bhrdca" target="_blank" rel="noopener" aria-label="Facebook"><i class="ti ti-brand-facebook"></i></a>
          <a class="f-soc" style="background:var(--navy);color:#fff;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center" href="https://www.instagram.com/bhrdca1/" target="_blank" rel="noopener" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
        </div>
      </div>
      <div>
        <form class="bh-form" onsubmit="event.preventDefault();this.style.display='none';document.getElementById('bh-thanks').style.display='block';">
          <div class="bh-field"><label>First name</label><input required type="text" name="first"></div>
          <div class="bh-field"><label>Last name</label><input required type="text" name="last"></div>
          <div class="bh-field"><label>Email</label><input required type="email" name="email"></div>
          <div class="bh-field"><label>Phone</label><input type="tel" name="phone"></div>
          <div class="bh-field"><label>Message</label><textarea required rows="4" name="msg"></textarea></div>
          <button class="btn btn-red" type="submit"><i class="ti ti-send"></i> Submit</button>
          <p style="font-size:11px;color:var(--muted);margin-top:8px">This demo form shows a confirmation only. Live submissions &rarr; BHRDCA inbox is the SportsWeb One integration step.</p>
        </form>
        <div id="bh-thanks" style="display:none" class="callout callout-blue"><i class="ti ti-circle-check"></i><div><strong>Thanks for submitting!</strong> We'll be in touch soon.</div></div>
      </div>
    </div>
  </div>
  <div class="section-block">
    <div class="callout callout-navy"><i class="ti ti-mail-opened"></i><div><strong>Join our mailing list.</strong> Season information, important notices and event invitations — straight to your inbox. Ask your club to add you, or email <a href="mailto:bhrdca.media@gmail.com" style="color:var(--gold);font-weight:700">bhrdca.media@gmail.com</a>.</div></div>
  </div>
"""
emit("contact.html","contact","Contact","Contact","Get in touch","Contact",
     "Media inquiries, general questions and how to join our mailing list.",
     contact_body, wide="wide")

# ---- News (placeholder) ----
news_body = """  <div class="section-block">
    <div class="callout callout-blue" style="margin-bottom:18px"><i class="ti ti-info-circle"></i><div><strong>News hub coming soon.</strong> Association news and match reports will be published here. In the meantime, the latest updates, photos and results are shared on our social channels.</div></div>
    <div class="bh-feature">
      <a class="bh-fcard" href="https://www.facebook.com/bhrdca" target="_blank" rel="noopener"><i class="ti ti-brand-facebook"></i><h3>Facebook</h3><p>Match-day photos, results and community updates — @bhrdca.</p></a>
      <a class="bh-fcard" href="https://www.instagram.com/bhrdca1/" target="_blank" rel="noopener"><i class="ti ti-brand-instagram"></i><h3>Instagram</h3><p>Highlights and the visual side of the game — @bhrdca1.</p></a>
      <a class="bh-fcard" href="/podcasts.html"><i class="ti ti-microphone"></i><h3>Podcasts</h3><p>The talking points from around the grades, 2025/26.</p></a>
    </div>
  </div>
"""
emit("news.html","news","News","News","Around the grades","News",
     "Association news, match reports and community updates.",
     news_body, wide="wide")

# ---- Podcasts (placeholder) ----
pod_body = """  <div class="section-block">
    <div class="callout callout-blue" style="margin-bottom:18px"><i class="ti ti-microphone"></i><div><strong>BHRDCA Podcasts — 2025/26.</strong> Episodes and player features will be embedded here as they're released. Follow our socials so you don't miss a drop.</div></div>
    <div class="bh-feature">
      <a class="bh-fcard" href="https://www.facebook.com/bhrdca" target="_blank" rel="noopener"><i class="ti ti-brand-facebook"></i><h3>Follow on Facebook</h3><p>New episodes are announced on @bhrdca.</p></a>
      <a class="bh-fcard" href="https://www.instagram.com/bhrdca1/" target="_blank" rel="noopener"><i class="ti ti-brand-instagram"></i><h3>Follow on Instagram</h3><p>Clips and highlights — @bhrdca1.</p></a>
    </div>
  </div>
"""
emit("podcasts.html","podcasts","Podcasts","Association · Podcasts","Listen in","Podcasts",
     "The BHRDCA podcast — the stories from around the grades.",
     pod_body, wide="wide")

print("DONE")
