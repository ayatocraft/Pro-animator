const CACHE_NAME = "animator-cache-v1";
const urlsToCache = [
  "index.html",
  "home.html",
  "project.html",
  "backup.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

// インストール時（キャッシュ登録）
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("キャッシュを登録中...");
      return cache.addAll(urlsToCache);
    })
  );
});

// リソース取得時（キャッシュ優先）
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // オフライン時のフォールバック
      if (event.request.destination === "document") {
        return caches.match("index.html");
      }
    })
  );
});

// 古いキャッシュ削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("古いキャッシュ削除:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});
