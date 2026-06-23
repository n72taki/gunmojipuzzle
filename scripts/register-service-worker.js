(() => {
  "use strict";

  const supportedProtocol = location.protocol === "http:" || location.protocol === "https:";
  if (!supportedProtocol || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Offline support is a release polish layer; registration failures must not block play.
    });
  });
})();
