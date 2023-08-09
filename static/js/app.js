if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/static/js/sw.js")
      .then((sw) => {
        if ("PushManager" in window) {
          window.Notification.requestPermission().then((permission) => {
            sw.showNotification("this is title", { body: "this is message" });
          });
        }
      })
      .catch((err) => console.log("service worker not registered", err));
  });
}
