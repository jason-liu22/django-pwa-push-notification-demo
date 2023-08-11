const staticDevCoffee = "dj-pwa-push";
const assets = ["/", "/cdn/static/css/style.css", "/cdn/static/js/app.js"];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  );
});

// self.addEventListener("activate", async () => {
//   // This will be called only once when the service worker is activated.
//   try {
//     const options = {userVisibleOnly:true};
//     const subscription = await self.registration.pushManager.subscribe(options);
//     console.log(JSON.stringify(subscription));
//   } catch (err) {
//     console.log("Error", err);
//   }
// });

self.addEventListener("push", (event) => {
  let data = event.data.json();
  const image =
    "https://cdn.glitch.com/614286c9-b4fc-4303-a6a9-a4cef0601b74%2Flogo.png?v=1605150951230";
  const options = {
    body: data.options.body,
    icon: image,
  };
  self.registration.showNotification(data.title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("https://web.dev"));
});
