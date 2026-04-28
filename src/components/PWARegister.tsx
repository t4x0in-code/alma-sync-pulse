import { useEffect } from "react";

/**
 * Registers the PWA service worker, but ONLY when:
 *  - running in the browser
 *  - NOT inside an iframe (Lovable preview)
 *  - NOT on a Lovable preview hostname
 *  - production build
 *
 * Also adds the manifest link tag dynamically so it's only present in real installs.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    const host = window.location.hostname;
    const isPreviewHost =
      host.includes("id-preview--") ||
      host.includes("lovableproject.com") ||
      host.includes("lovable.app") === false
        ? false
        : false; // allow .lovable.app published domains
    const isLovablePreview = host.includes("id-preview--") || host.includes("lovableproject.com");

    if (isInIframe || isLovablePreview || !import.meta.env.PROD) {
      // Clean up any previously-registered SW in dev/preview
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {});
      }
      return;
    }

    // Inject manifest link
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.webmanifest";
      document.head.appendChild(link);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#dc143c";
      document.head.appendChild(meta);
    }
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      apple.href = "/favicon.svg";
      document.head.appendChild(apple);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }

    // Suppress unused warning
    void isPreviewHost;
  }, []);

  return null;
}
