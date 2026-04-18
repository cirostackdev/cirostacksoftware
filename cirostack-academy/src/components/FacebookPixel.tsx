"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { META_PIXEL_ID, trackPageView } from "@/lib/meta-pixel";

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inject the Meta Pixel base code once on mount
  useEffect(() => {
    if (typeof window === "undefined" || window.fbq) return;

    // fbq shim (matches Meta's official snippet)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n = (window.fbq = function (...args: unknown[]) {
      if ((n as Record<string, unknown>).callMethod) {
        (n as { callMethod: (...a: unknown[]) => void }).callMethod(...args);
      } else {
        (n as { queue: unknown[][] }).queue.push(args);
      }
    }) as Record<string, unknown>;
    if (!window._fbq) window._fbq = n as typeof window._fbq;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [] as unknown[];

    // Load the SDK script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    // Initialize with our Pixel ID
    window.fbq("init", META_PIXEL_ID);
    trackPageView();
  }, []);

  // Track page views on route changes (SPA navigation)
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      trackPageView();
    }
  }, [pathname, searchParams]);

  // noscript fallback image
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
