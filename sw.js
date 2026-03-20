self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});


const CACHE_NAME = "imperial-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/contact.html",
  "/checkout.html",
  "/faqs.html",
  "/login.html",
  "/more.html",
  "/mybookings.html",
  "/packages.html",
  "/portfolio.html",
  "/privacy-policy.html",
  "/profile.html",
  "/service-agreements.html",
  "/settings.html",
  "/spinner.html",
  "/vendor-t&c.html",
  "/offine-screen.html",
  "/offine-screen.css",
  "/offine-screen.js",
 

];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match("/offine-screen.html");
    })
  );
});