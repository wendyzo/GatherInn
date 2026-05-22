import { createServerFn } from "@tanstack/react-start";

type Block = { title: string; start_time: string; duration_minutes: number; description?: string };

export const generateBlueprint = createServerFn({ method: "POST" })
  .inputValidator((d: { eventName: string }) => {
    if (!d?.eventName || typeof d.eventName !== "string") throw new Error("eventName required");
    return { eventName: d.eventName.slice(0, 200) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

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
          { role: "user", content: `Event: ${data.eventName}` },
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
