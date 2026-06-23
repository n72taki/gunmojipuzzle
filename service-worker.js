const CACHE_VERSION = "kana-gunmatsuri-v60";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./data/cards.js",
  "./scripts/game.js",
  "./scripts/register-service-worker.js",
  "./assets/gunmoji-logo.png",
  "./assets/gunmoji-logo.svg",
  "./assets/g-daruma.svg",
  "./assets/exchange-daruma.svg",
  "./assets/app-icon.svg",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/generated/stage-festival-bg.png",
  "./assets/generated/stage-game-akagi-haruna.png",
  "./assets/generated/stage-game-kusatsu-onsen.png",
  "./assets/generated/stage-game-myogi-rail.png",
  "./assets/generated/special-gunma-crane.png",
  "./assets/generated/card-basic-gunma-ken.png",
  "./assets/generated/card-basic-daruma.png",
  "./assets/generated/card-basic-akagi-san.png",
  "./assets/generated/card-city-maebashi.png",
  "./assets/generated/card-city-takasaki.png",
  "./assets/generated/card-city-kiryu.png",
  "./assets/generated/card-city-isesaki.png",
  "./assets/generated/card-city-ota.png",
  "./assets/generated/card-city-numata.png",
  "./assets/generated/card-city-tatebayashi.png",
  "./assets/generated/card-city-shibukawa.png",
  "./assets/generated/card-city-fujioka.png",
  "./assets/generated/card-city-tomioka.png",
  "./assets/generated/card-city-annaka.png",
  "./assets/generated/card-city-midori.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("", { status: 504, statusText: "Offline" });
        });
    }),
  );
});
