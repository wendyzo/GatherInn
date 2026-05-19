import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, ListChecks, Handshake, Calendar, Star, Trash2, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/_authenticated/events/$eventId")({ component: EventPage });

type EventDetail = { id: string; name: string; description: string | null; event_date: string | null; status: string; project_id: string; society_id: string; cloned_from_event_id: string | null };
type Task = { id: string; title: string; description: string | null; due_date: string | null; completed: boolean; position: number };
type Vendor = { id: string; name: string; service: string | null; contact: string | null; rating: number | null; notes: string | null };
type Risk = { id: string; title: string; description: string | null; severity: string; resolved: boolean };

function EventPage() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [parentName, setParentName] = useState<string | null>(null);

  const load = async () => {
    const { data: ev } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
    if (!ev) return;
    setEvent(ev as EventDetail);
    const [{ data: mem }, { data: t }, { data: v }, { data: r }] = await Promise.all([
      supabase.from("society_members").select("role").eq("society_id", ev.society_id).eq("user_id", user!.id).maybeSingle(),
      supabase.from("event_tasks").select("*").eq("event_id", eventId).order("position").order("due_date"),
      supabase.from("event_vendors").select("*").eq("event_id", eventId).order("name"),
      supabase.from("event_risks").select("*").eq("event_id", eventId).order("resolved").order("severity"),
    ]);
    setCanManage(mem?.role === "executive" || mem?.role === "project_owner");
    setTasks((t ?? []) as Task[]);
    setVendors((v ?? []) as Vendor[]);
    setRisks((r ?? []) as Risk[]);
    if (ev.cloned_from_event_id) {
      const { data: parent } = await supabase.from("events").select("name").eq("id", ev.cloned_from_event_id).maybeSingle();
      setParentName(parent?.name ?? null);
    }
  };
  useEffect(() => { load(); }, [eventId]);

  if (!event) return <p className="text-muted-foreground">Loading…</p>;

  const legacyRisks = risks.filter((r) => r.title.startsWith("[Legacy]") && !r.resolved);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-muted-foreground"><Link to="/projects/$projectId" params={{ projectId: event.project_id }} className="hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to project</Link></div>
        <div className="flex items-end justify-between mt-1 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl flex items-center gap-3">
              {event.name}
              {parentName && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/30 font-sans font-medium"><Sparkles className="h-3 w-3" /> Cloned from {parentName}</span>}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {event.event_date ?? "No date"}</span>
              <span>Status: {event.status}</span>
            </div>
          </div>
        </div>
      </div>

      {legacyRisks.length > 0 && (
        <div className="rounded-xl border-l-4 border-warning bg-warning/15 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-display text-lg">Legacy Risk Alerts</div>
              <p className="text-xs text-muted-foreground">Inherited from {parentName ?? "the previous event"}. Review before the timeline starts.</p>
              <ul className="mt-3 space-y-2">
                {legacyRisks.map((r) => (
                  <li key={r.id} className="rounded-md bg-background/60 border border-warning/30 p-3">
                    <div className="font-medium text-sm">{r.title.replace("[Legacy] ", "")}</div>
                    {r.description && <p className="text-sm text-muted-foreground mt-0.5">{r.description}</p>}
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Severity: {r.severity}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <TimelineSection eventId={eventId} eventDate={event.event_date} tasks={tasks} canManage={canManage} reload={load} />
        <div className="space-y-6">
          <VendorsSection eventId={eventId} vendors={vendors} canManage={canManage} reload={load} />
          <RiskSection eventId={eventId} risks={risks} canManage={canManage} reload={load} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Timeline (checklist + lightweight gantt) ---------- */
function TimelineSection({ eventId, eventDate, tasks, canManage, reload }: { eventId: string; eventDate: string | null; tasks: Task[]; canManage: boolean; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");

  const add = async () => {
    if (!title.trim()) return;
    const pos = tasks.length;
    const { error } = await supabase.from("event_tasks").insert({ event_id: eventId, title, description: desc, due_date: due || null, position: pos });
    if (error) return toast.error(error.message);
    setOpen(false); setTitle(""); setDesc(""); setDue("");
    reload();
  };
  const toggle = async (t: Task) => {
    await supabase.from("event_tasks").update({ completed: !t.completed }).eq("id", t.id);
    reload();
  };
  const remove = async (id: string) => { await supabase.from("event_tasks").delete().eq("id", id); reload(); };

  // gantt range
  const dated = tasks.filter((t) => t.due_date);
  const min = dated.length ? dated.reduce((a, b) => (a.due_date! < b.due_date! ? a : b)).due_date! : null;
  const max = dated.length ? dated.reduce((a, b) => (a.due_date! > b.due_date! ? a : b)).due_date! : null;
  const span = min && max ? Math.max(1, differenceInCalendarDays(parseISO(max), parseISO(min))) : 1;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Timeline</h2>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
                <div><Label>Due date</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
              </div>
              <DialogFooter><Button onClick={add}>Add task</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Gantt */}
      {min && max && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="text-xs text-muted-foreground flex justify-between"><span>{format(parseISO(min), "MMM d")}</span><span>{eventDate ? `Event: ${format(parseISO(eventDate), "MMM d")}` : ""}</span><span>{format(parseISO(max), "MMM d")}</span></div>
          <div className="mt-3 space-y-1.5">
            {dated.map((t) => {
              const pct = (differenceInCalendarDays(parseISO(t.due_date!), parseISO(min)) / span) * 100;
              return (
                <div key={t.id} className="relative h-6">
                  <div className="absolute inset-y-0 left-0 right-0 rounded bg-muted/40" />
                  <div
                    className={`absolute inset-y-0 rounded ${t.completed ? "bg-primary/40" : "bg-primary"}`}
                    style={{ left: `${Math.max(0, pct - 1)}%`, width: "3%" }}
                    title={t.title}
                  />
                  <div className="absolute inset-y-0 left-2 flex items-center text-xs text-foreground/80 pointer-events-none">{t.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checklist */}
      <ul className="mt-5 divide-y divide-border">
        {tasks.length === 0 ? <li className="py-6 text-center text-sm text-muted-foreground">No tasks yet.</li> :
          tasks.map((t) => (
            <li key={t.id} className="py-3 flex items-start gap-3">
              <Checkbox checked={t.completed} onCheckedChange={() => canManage && toggle(t)} disabled={!canManage} className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                {t.due_date && <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(parseISO(t.due_date), "PP")}</div>}
              </div>
              {canManage && <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
            </li>
          ))
        }
      </ul>
    </section>
  );
}

/* ---------- Vendors ---------- */
function VendorsSection({ eventId, vendors, canManage, reload }: { eventId: string; vendors: Vendor[]; canManage: boolean; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", service: "", contact: "", rating: "5", notes: "" });
  const add = async () => {
    if (!v.name.trim()) return;
    const { error } = await supabase.from("event_vendors").insert({ event_id: eventId, name: v.name, service: v.service, contact: v.contact, rating: Number(v.rating), notes: v.notes });
    if (error) return toast.error(error.message);
    setOpen(false); setV({ name: "", service: "", contact: "", rating: "5", notes: "" });
    reload();
  };
  const remove = async (id: string) => { await supabase.from("event_vendors").delete().eq("id", id); reload(); };

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" /> Vetted vendors</h2>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add vendor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
                <div><Label>Service</Label><Input value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })} placeholder="e.g. Catering, AV, Stage" /></div>
                <div><Label>Contact</Label><Input value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} placeholder="email / phone" /></div>
                <div>
                  <Label>Rating</Label>
                  <Select value={v.rating} onValueChange={(val) => setV({ ...v, rating: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={add}>Add vendor</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {vendors.length === 0 ? <li className="text-sm text-muted-foreground text-center py-6">No vendors yet.</li> :
          vendors.map((vd) => (
            <li key={vd.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{vd.name}</div>
                  <div className="text-xs text-muted-foreground">{vd.service}{vd.contact ? ` · ${vd.contact}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  {vd.rating && <span className="inline-flex items-center gap-0.5 text-xs text-accent-foreground bg-accent/30 px-2 py-0.5 rounded-full"><Star className="h-3 w-3 fill-current" /> {vd.rating}</span>}
                  {canManage && <button onClick={() => remove(vd.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
              {vd.notes && <p className="text-xs text-muted-foreground mt-1">{vd.notes}</p>}
            </li>
          ))}
      </ul>
    </section>
  );
}

/* ---------- Risks ---------- */
function RiskSection({ eventId, risks, canManage, reload }: { eventId: string; risks: Risk[]; canManage: boolean; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [r, setR] = useState({ title: "", description: "", severity: "medium" });
  const add = async () => {
    if (!r.title.trim()) return;
    const { error } = await supabase.from("event_risks").insert({ event_id: eventId, ...r });
    if (error) return toast.error(error.message);
    setOpen(false); setR({ title: "", description: "", severity: "medium" });
    reload();
  };
  const toggle = async (rk: Risk) => { await supabase.from("event_risks").update({ resolved: !rk.resolved }).eq("id", rk.id); reload(); };
  const remove = async (id: string) => { await supabase.from("event_risks").delete().eq("id", id); reload(); };

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Risk log</h2>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log a risk / issue</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={r.title} onChange={(e) => setR({ ...r, title: e.target.value })} placeholder="e.g. High-voltage power required for Stage B" /></div>
                <div><Label>Description</Label><Textarea value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} /></div>
                <div>
                  <Label>Severity</Label>
                  <Select value={r.severity} onValueChange={(val) => setR({ ...r, severity: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={add}>Log risk</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {risks.length === 0 ? <li className="text-sm text-muted-foreground text-center py-6">No risks logged.</li> :
          risks.map((rk) => (
            <li key={rk.id} className={`rounded-lg border p-3 ${rk.resolved ? "border-border bg-background/50 opacity-60" : sevClass(rk.severity)}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{rk.title}</div>
                  {rk.description && <p className="text-xs text-muted-foreground mt-0.5">{rk.description}</p>}
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{rk.severity}{rk.resolved ? " · resolved" : ""}</div>
                </div>
                {canManage && (
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => toggle(rk)} className="text-xs text-primary hover:underline">{rk.resolved ? "Reopen" : "Resolve"}</button>
                    <button onClick={() => remove(rk.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}

function sevClass(s: string) {
  switch (s) {
    case "critical": return "border-destructive/40 bg-destructive/10";
    case "high": return "border-warning/50 bg-warning/15";
    case "medium": return "border-accent/40 bg-accent/10";
    default: return "border-border bg-background";
  }
}
