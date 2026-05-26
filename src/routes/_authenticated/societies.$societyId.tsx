import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { matchPastEvents } from "@/lib/match.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  History,
  Users,
  ChevronRight,
  Calendar,
  Sparkles,
  PenLine,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/societies/$societyId")({
  component: SocietyPage,
});

type EventRow = { id: string; name: string; event_date: string | null; reason?: string };

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "at",
  "with",
  "our",
  "my",
  "your",
  "new",
  "2024",
  "2025",
  "2026",
  "2027",
  "annual",
  "first",
  "second",
  "third",
  "ii",
  "iii",
  "iv",
  "v",
  "day",
  "night",
  "event",
  "party",
  "society",
  "club",
]);

function keywordsOf(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function keywordFallback(history: EventRow[], query: string): EventRow[] {
  const kws = keywordsOf(query);
  if (kws.length === 0) {
    const q = query.toLowerCase();
    return history.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 5);
  }
  return history
    .map((e) => {
      const eWords = e.name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 2);
      const score = kws.reduce(
        (acc, k) => acc + (eWords.some((w) => w.includes(k) || k.includes(w)) ? 1 : 0),
        0,
      );
      return { ...e, score };
    })
    .filter((e): e is EventRow & { score: number } => (e as EventRow & { score: number }).score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function SocietyPage() {
  const { societyId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [society, setSociety] = useState<{ name: string; description: string | null } | null>(null);
  const [role, setRole] = useState<string>("member");
  const [history, setHistory] = useState<EventRow[]>([]);

  // create-event dialog state
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [blueprint, setBlueprint] = useState<EventRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [aiMatches, setAiMatches] = useState<EventRow[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const callMatch = useServerFn(matchPastEvents);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canManage = role === "executive" || role === "project_owner";

  const load = async () => {
    const [{ data: soc }, { data: mem }, { data: ev }] = await Promise.all([
      supabase.from("societies").select("name, description").eq("id", societyId).maybeSingle(),
      supabase
        .from("society_members")
        .select("role")
        .eq("society_id", societyId)
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("events")
        .select("id, name, event_date")
        .eq("society_id", societyId)
        .order("event_date", { ascending: false, nullsFirst: false }),
    ]);
    if (soc) setSociety(soc);
    if (mem) setRole(mem.role);
    setHistory(ev ?? []);
  };

  useEffect(() => {
    load();
  }, [societyId]);

  // AI debounce: fire 500ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!newName.trim() || history.length === 0) {
      setAiMatches([]);
      setAiLoading(false);
      return;
    }
    setAiMatches([]);
    setAiLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { matches } = await callMatch({ data: { eventName: newName, candidates: history } });
        const enriched: EventRow[] = matches
          .map((m) => {
            const ev = history.find((h) => h.id === m.id);
            return ev ? { ...ev, reason: m.reason } : null;
          })
          .filter((e) => e !== null) as EventRow[];
        setAiMatches(enriched);
      } catch {
        /* fall through to keyword results */
      } finally {
        setAiLoading(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [newName, history]);

  const filteredBlueprints = useMemo(() => {
    if (!newName.trim()) return history.slice(0, 5);
    if (aiMatches.length > 0) return aiMatches;
    return keywordFallback(history, newName.trim());
  }, [history, aiMatches, newName]);

  const openDialog = () => {
    setNewName("");
    setBlueprint(null);
    setAiMatches([]);
    setAiLoading(false);
    setOpen(true);
  };

  const createEvent = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data: ev, error } = await supabase
        .from("events")
        .insert({
          society_id: societyId,
          name: newName,
          event_date: null,
          status: "planning",
          created_by: user!.id,
          cloned_from_event_id: blueprint?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (blueprint) {
        await deepClone({ srcId: blueprint.id, dstId: ev.id });
      }
      toast.success(blueprint ? "Event cloned from blueprint" : "Event created");
      setOpen(false);
      nav({ to: "/events/$eventId", params: { eventId: ev.id } });
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  if (!society) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">
              Societies
            </Link>{" "}
            / {society.name}
          </div>
          <h1 className="font-display text-4xl mt-1">{society.name}</h1>
          {society.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">{society.description}</p>
          )}
        </div>
        {canManage && (
          <Button onClick={openDialog}>
            <Plus className="h-4 w-4" /> Create event
          </Button>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <History className="h-5 w-5 text-accent" /> Events
          </h2>
          {!canManage && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> Executives & Project Owners can create events
            </span>
          )}
        </div>
        <div className="mt-4 rounded-md border border-border bg-card divide-y divide-border">
          {history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No events yet.{canManage && " Create the first one with the button above."}
            </div>
          ) : (
            history.map((e) => (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className="flex items-center justify-between px-5 py-4 hover:bg-secondary/40"
              >
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" /> {e.event_date ?? "No date"}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Create event dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Create event</DialogTitle>
          </DialogHeader>

          <div>
            <Label>Event name</Label>
            <Input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setBlueprint(null);
              }}
              placeholder="e.g. Annual Gala 2026"
              autoFocus
            />
          </div>

          <div className="mt-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {newName.trim() ? "Similar past events" : "Recent events"}
              </p>
              {aiLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              {!aiLoading && aiMatches.length > 0 && newName.trim() && (
                <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                  <Sparkles className="h-2.5 w-2.5" /> AI matched
                </span>
              )}
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
              {filteredBlueprints.length === 0 && !aiLoading ? (
                <button
                  onClick={() => createEvent()}
                  disabled={creating || !newName.trim()}
                  className="w-full text-left rounded-md border border-dashed border-border px-3 py-3 text-sm transition hover:border-primary/40 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <PenLine className="h-4 w-4 shrink-0" />
                  <span>
                    No related events found —{" "}
                    <span className="font-medium text-foreground">create new event</span>
                  </span>
                </button>
              ) : (
                filteredBlueprints.map((e) => {
                  const selected = blueprint?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setBlueprint(selected ? null : e)}
                      className={`w-full text-left rounded-md border px-3 py-2.5 text-sm transition flex items-center justify-between gap-2 ${selected ? "border-accent bg-accent/10" : "border-border bg-background hover:border-primary/30"}`}
                    >
                      <span className="min-w-0 text-left">
                        <span className="font-medium block truncate">{e.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {e.event_date && format(parseISO(e.event_date), "d MMM yyyy")}
                          {e.reason && <span className="ml-1">· {e.reason}</span>}
                        </span>
                      </span>
                      {selected ? (
                        <span className="text-xs text-accent-foreground bg-accent/40 rounded-full px-2 py-0.5 shrink-0">
                          Selected
                        </span>
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEvent} disabled={creating || !newName.trim()}>
              {creating ? (
                "Creating…"
              ) : blueprint ? (
                <>
                  <Sparkles className="h-4 w-4" /> Check blueprint
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" /> Create new event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function deepClone(args: { srcId: string; dstId: string }) {
  const { srcId, dstId } = args;
  const shiftDays = 0;

  const [{ data: tasks }, { data: vendors }, { data: risks }] = await Promise.all([
    supabase
      .from("event_tasks")
      .select("title, description, due_date, completed, position")
      .eq("event_id", srcId),
    supabase
      .from("event_vendors")
      .select("name, service, contact, rating, notes")
      .eq("event_id", srcId),
    supabase
      .from("event_risks")
      .select("title, description, severity, resolved")
      .eq("event_id", srcId),
  ]);

  await Promise.all([
    tasks?.length
      ? supabase.from("event_tasks").insert(
          tasks.map((t) => ({
            event_id: dstId,
            title: t.title,
            description: t.description,
            due_date: t.due_date
              ? format(addDays(parseISO(t.due_date), shiftDays), "yyyy-MM-dd")
              : null,
            completed: false,
            position: t.position,
          })),
        )
      : null,
    vendors?.length
      ? supabase.from("event_vendors").insert(vendors.map((v) => ({ ...v, event_id: dstId })))
      : null,
    risks?.length
      ? supabase.from("event_risks").insert(
          risks.map((r) => ({
            event_id: dstId,
            title: `[Legacy] ${r.title}`,
            description: r.description,
            severity: r.severity,
            resolved: false,
          })),
        )
      : null,
  ]);
}
