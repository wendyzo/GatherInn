import { createServerFn } from "@tanstack/react-start";

type Candidate = { id: string; name: string; event_date: string | null };
type Match = { id: string; reason: string };

export const matchPastEvents = createServerFn({ method: "POST" })
  .inputValidator((d: { eventName: string; candidates: Candidate[] }) => {
    if (!d?.eventName || typeof d.eventName !== "string") throw new Error("eventName required");
    if (!Array.isArray(d.candidates)) throw new Error("candidates required");
    return { eventName: d.eventName.slice(0, 200), candidates: d.candidates.slice(0, 50) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const list = data.candidates
      .map((c, i) => `${i + 1}. [${c.id}] "${c.name}"${c.event_date ? ` (${c.event_date})` : ""}`)
      .join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              'You find similar past events to help plan a new one. Return ONLY a JSON array of up to 4 matches, ranked by similarity. Format: [{"id": "uuid", "reason": "brief reason max 8 words"}]. Only include meaningful matches. No prose, no markdown fences.',
          },
          { role: "user", content: `New event: "${data.eventName}"\n\nPast events:\n${list}` },
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
    let matches: Match[] = [];
    try {
      matches = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\[[\s\S]*\]/);
      if (m) matches = JSON.parse(m[0]);
    }
    return { matches: Array.isArray(matches) ? matches.slice(0, 4) : [] };
  });
