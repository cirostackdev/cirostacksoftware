import { Router } from "express";
import { sendConversionEvents, type MetaEventData } from "./meta.service.js";

export const metaRouter = Router();

/**
 * POST /v1/meta/events
 *
 * Receives pixel events from the frontend and forwards them
 * to the Meta Conversions API (server-side).
 *
 * Body: { events: MetaEventData[], test_event_code?: string }
 */
metaRouter.post("/events", async (req, res) => {
  try {
    const { events, test_event_code } = req.body as {
      events: MetaEventData[];
      test_event_code?: string;
    };

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "events array is required" });
    }

    // Enrich each event with server-side data
    const enrichedEvents: MetaEventData[] = events.map((event) => ({
      ...event,
      event_time: event.event_time || Math.floor(Date.now() / 1000),
      action_source: "website" as const,
      user_data: {
        ...event.user_data,
        client_ip_address:
          event.user_data?.client_ip_address ||
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.ip,
        client_user_agent:
          event.user_data?.client_user_agent || req.headers["user-agent"],
      },
    }));

    const result = await sendConversionEvents({
      data: enrichedEvents,
      test_event_code,
    });

    return res.json(result);
  } catch (err) {
    console.error("[meta-capi] route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
