import { createServerFn } from "@tanstack/react-start";
import { findSeedTemplate } from "./blueprint.templates";

type Block = { title: string; start_time: string; duration_minutes: number; description?: string };
type PastEvent = { eventName: string; blocks: { title: string; duration_minutes: number; description?: string | null }[] };

export const generateBlueprint = createServerFn({ method: "POST" })
  .inputValidator((d: { eventName: string; pastContext?: PastEvent[] }) => {
    if (!d?.eventName || typeof d.eventName !== "string") throw new Error("eventName required");
    return {
      eventName: d.eventName.slice(0, 200),
      pastContext: Array.isArray(d.pastContext) ? d.pastContext.slice(0, 4) : [],
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const context =
      data.pastContext.length > 0
        ? data.pastContext
        : (() => { const seed = findSeedTemplate(data.eventName); return seed ? [seed] : []; })();

    const contextSection =
      context.length > 0
        ? "\n\nHere are runsheets from similar past events to use as reference:\n\n" +
          context
            .map(
              (e) =>
                `Past event: "${e.eventName}"\n` +
                e.blocks
                  .map((b) => `- ${b.title} (${b.duration_minutes}min)${b.description ? `: ${b.description}` : ""}`)
                  .join("\n"),
            )
            .join("\n\n")
        : "";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You generate a realistic runsheet (event timeline) for university society events. Return ONLY a JSON array of 5-8 blocks. Each block: { title: string, start_time: 'HH:MM' (24h, starting around 09:00), duration_minutes: number (15-120), description: short string }. No prose, no markdown fences.",
          },
          { role: "user", content: `Event: ${data.eventName}${contextSection}` },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    let blocks: Block[] = [];
    try {
      blocks = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\[[\s\S]*\]/);
      if (m) blocks = JSON.parse(m[0]);
    }
    return { blocks: Array.isArray(blocks) ? blocks.slice(0, 12) : [] };
  });
