import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles, History, AlertTriangle, ListChecks, Handshake, Calendar, ArrowRight, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { differenceInCalendarDays, addDays, format, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/projects/$projectId/new-event")({ component: NewEventPage });

type HistEvent = {
  id: string; name: string; event_date: string | null;
  task_count: number; vendor_count: number; risk_count: number;
};

function NewEventPage() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [societyId, setSocietyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [query, setQuery] = useState("");
  const [historyEvents, setHistoryEvents] = useState<HistEvent[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<HistEvent | null>(null);
  const [busy, setBusy] = useState(false);

  // Load project's society + history
  useEffect(() => {
    (async () => {
      const { data: pr } = await supabase.from("projects").select("society_id").eq("id", projectId).maybeSingle();
      if (!pr) return;
      setSocietyId(pr.society_id);
      const { data: evs } = await supabase
        .from("events")
        .select("id, name, event_date, event_tasks(count), event_vendors(count), event_risks(count)")
        .eq("society_id", pr.society_id)
        .order("event_date", { ascending: false, nullsFirst: false });
      setHistoryEvents((evs ?? []).map((e: any) => ({
        id: e.id, name: e.name, event_date: e.event_date,
        task_count: e.event_tasks?.[0]?.count ?? 0,
        vendor_count: e.event_vendors?.[0]?.count ?? 0,
        risk_count: e.event_risks?.[0]?.count ?? 0,
      })));
    })();
  }, [projectId]);

  const filtered = useMemo(() => {
    if (!query) return historyEvents;
    const q = query.toLowerCase();
    return historyEvents.filter((e) => e.name.toLowerCase().includes(q));
  }, [historyEvents, query]);

  const create = async () => {
    if (!name.trim() || !societyId) return;
    setBusy(true);
    try {
      // 1. create event
      const { data: ev, error } = await supabase.from("events").insert({
        project_id: projectId, society_id: societyId,
        name, description, event_date: eventDate, status: "planning",
        created_by: user!.id,
        cloned_from_event_id: selectedBlueprint?.id ?? null,
      }).select("id").single();
      if (error) throw error;

      // 2. if cloning, deep-copy
      if (selectedBlueprint) {
        await deepClone({ srcId: selectedBlueprint.id, srcDate: selectedBlueprint.event_date, dstId: ev.id, dstDate: eventDate });
      }
      toast.success(selectedBlueprint ? "Event cloned from blueprint" : "Event created");
      nav({ to: "/events/$eventId", params: { eventId: ev.id } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create event");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-muted-foreground"><Link to="/projects/$projectId" params={{ projectId }} className="hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to project</Link></div>
        <h1 className="font-display text-4xl mt-1">New event</h1>
        <p className="text-muted-foreground mt-1">Start fresh, or inherit a blueprint from your society&rsquo;s history.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* LEFT: details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 h-fit">
          <h2 className="font-display text-xl">Event details</h2>
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Annual Gala 2026" /></div>
          <div><Label>Date</Label><Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>

          {selectedBlueprint && (
            <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium flex items-center gap-1"><Sparkles className="h-4 w-4 text-accent-foreground" /> Cloning: {selectedBlueprint.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Timeline will shift by {selectedBlueprint.event_date ? differenceInCalendarDays(parseISO(eventDate), parseISO(selectedBlueprint.event_date)) : "—"} days · {selectedBlueprint.vendor_count} vendors imported · {selectedBlueprint.risk_count} risks surfaced
                  </div>
                </div>
                <button onClick={() => setSelectedBlueprint(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          <Button onClick={create} disabled={busy || !name.trim()} className="w-full">
            {busy ? "Creating…" : selectedBlueprint ? <>Clone & create <ArrowRight className="h-4 w-4" /></> : <>Create event <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>

        {/* RIGHT: blueprint search */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl">Search society history</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Pick a previous event to inherit its timeline, vetted vendors, and risk log.</p>

          <div className="relative mt-4">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search past events…" className="pl-9" />
          </div>

          <div className="mt-4 space-y-2 max-h-[28rem] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No matching events.</p>
            ) : filtered.map((e) => {
              const sel = selectedBlueprint?.id === e.id;
              return (
                <button key={e.id} onClick={() => setSelectedBlueprint(e)} className={`w-full text-left rounded-lg border p-4 transition ${sel ? "border-accent bg-accent/10" : "border-border bg-background hover:border-primary/40"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> {e.event_date ?? "No date"}</div>
                    </div>
                    {sel && <span className="text-xs text-accent-foreground bg-accent/40 rounded-full px-2 py-0.5">Selected</span>}
                  </div>
                  <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" /> {e.task_count} tasks</span>
                    <span className="inline-flex items-center gap-1"><Handshake className="h-3 w-3" /> {e.vendor_count} vendors</span>
                    <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {e.risk_count} risks</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

async function deepClone(args: { srcId: string; srcDate: string | null; dstId: string; dstDate: string }) {
  const { srcId, srcDate, dstId, dstDate } = args;
  const shiftDays = srcDate ? differenceInCalendarDays(parseISO(dstDate), parseISO(srcDate)) : 0;

  // Tasks: shift due_date
  const { data: tasks } = await supabase.from("event_tasks").select("title, description, due_date, completed, position").eq("event_id", srcId);
  if (tasks?.length) {
    const rows = tasks.map((t) => ({
      event_id: dstId,
      title: t.title,
      description: t.description,
      due_date: t.due_date ? format(addDays(parseISO(t.due_date), shiftDays), "yyyy-MM-dd") : null,
      completed: false,
      position: t.position,
    }));
    await supabase.from("event_tasks").insert(rows);
  }

  // Vendors: copy as-is
  const { data: vendors } = await supabase.from("event_vendors").select("name, service, contact, rating, notes").eq("event_id", srcId);
  if (vendors?.length) {
    await supabase.from("event_vendors").insert(vendors.map((v) => ({ ...v, event_id: dstId })));
  }

  // Risks: copy unresolved ones as "Legacy" warnings
  const { data: risks } = await supabase.from("event_risks").select("title, description, severity, resolved").eq("event_id", srcId);
  if (risks?.length) {
    await supabase.from("event_risks").insert(risks.map((r) => ({
      event_id: dstId,
      title: `[Legacy] ${r.title}`,
      description: r.description,
      severity: r.severity,
      resolved: false,
    })));
  }
}
