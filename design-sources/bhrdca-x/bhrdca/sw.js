/* BHRDCA service worker — bump CACHE to invalidate on deploy.
   Network-first for pages + app code (css/js/json); cache-first for images/icons. */
var CACHE = "bhrdca-v1";
var CORE = [
  "/", "/index.html",
  "/_shared.css", "/_pages.css",
  "/bhrdca-components.js", "/bhrdca-render.js", "/site-data.js", "/pwa.js",
  "/bhrdca-logo.svg", "/favicon.ico", "/favicon-32.png", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var isPage = req.mode === "navigate";
  var isCode = /\.(?:css|js|json|webmanifest)$/.test(url.pathname);
  if (isPage || isCode) {
    e.respondWith(fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return r;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || (isPage ? caches.match("/index.html") : undefined); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (m) {
    return m || fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return r;
    });
  }));
});
self.addEventListener("push", function (e) {
  var data = {}; try { data = e.data ? e.data.json() : {}; } catch (_) { data = { body: e.data && e.data.text() }; }
  var opts = { body: data.body || "", icon: "/icon-192.png", badge: "/icon-192.png", tag: data.tag || "bhrdca", data: { url: data.url || "/index.html" } };
  e.waitUntil(self.registration.showNotification(data.title || "BHRDCA", opts));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "/index.html";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if (list[i].url.indexOf(url) > -1 && "focus" in list[i]) return list[i].focus(); }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  }));
});
