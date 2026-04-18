// Meta Pixel (Facebook Pixel) utilities
// Dataset ID: 1301589608584208

export const META_PIXEL_ID = "1301589608584208";

// ── Standard events ─────────────────────────────────────────────────────────

type StandardEvent =
  | "AddPaymentInfo"
  | "AddToCart"
  | "AddToWishlist"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "InitiateCheckout"
  | "Lead"
  | "PageView"
  | "Purchase"
  | "Schedule"
  | "Search"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "ViewContent";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/** Fire a standard Meta Pixel event */
export function trackEvent(event: StandardEvent, params?: Record<string, unknown>) {
  fbq("track", event, params);
}

/** Fire a custom Meta Pixel event */
export function trackCustomEvent(event: string, params?: Record<string, unknown>) {
  fbq("trackCustom", event, params);
}

// ── Convenience wrappers for common Academy events ──────────────────────────

/** User viewed a page (auto-fired by the FacebookPixel component) */
export function trackPageView() {
  trackEvent("PageView");
}

/** User signed up / registered */
export function trackCompleteRegistration(params?: { content_name?: string; value?: number; currency?: string }) {
  trackEvent("CompleteRegistration", params);
}

/** User became a lead (e.g. free trial signup) */
export function trackLead(params?: { content_name?: string; value?: number; currency?: string }) {
  trackEvent("Lead", params);
}

/** User started a free trial */
export function trackStartTrial(params?: { value?: number; currency?: string; predicted_ltv?: number }) {
  trackEvent("StartTrial", params);
}

/** User viewed a course or lesson */
export function trackViewContent(params?: {
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  trackEvent("ViewContent", params);
}

/** User initiated checkout for a course/subscription */
export function trackInitiateCheckout(params?: {
  content_name?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  trackEvent("InitiateCheckout", params);
}

/** User completed a purchase */
export function trackPurchase(params: { value: number; currency: string; content_name?: string; content_ids?: string[] }) {
  trackEvent("Purchase", params);
}

/** User subscribed to a plan */
export function trackSubscribe(params?: { value?: number; currency?: string; predicted_ltv?: number }) {
  trackEvent("Subscribe", params);
}

/** User searched for courses */
export function trackSearch(params?: { search_string?: string; content_category?: string }) {
  trackEvent("Search", params);
}
