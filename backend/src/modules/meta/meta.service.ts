// Meta Conversions API (CAPI) service
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api

const PIXEL_ID = "1301589608584208";
const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

export interface MetaEventData {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: "website";
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // _fbc cookie
    fbp?: string; // _fbp cookie
    em?: string; // hashed email
    ph?: string; // hashed phone
    fn?: string; // hashed first name
    ln?: string; // hashed last name
  };
  custom_data?: Record<string, unknown>;
}

export interface SendEventsPayload {
  data: MetaEventData[];
  test_event_code?: string;
}

export async function sendConversionEvents(payload: SendEventsPayload) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[meta-capi] META_ACCESS_TOKEN not set — skipping event send");
    return { success: false, error: "META_ACCESS_TOKEN not configured" };
  }

  const testCode = payload.test_event_code || process.env.META_TEST_EVENT_CODE;

  const body: Record<string, unknown> = {
    data: payload.data,
    access_token: accessToken,
  };
  if (testCode) {
    body.test_event_code = testCode;
  }

  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("[meta-capi] error:", JSON.stringify(json));
    return { success: false, error: json };
  }

  return { success: true, ...json };
}
