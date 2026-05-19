import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, FolderKanban, History, Users, ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/societies/$societyId")({ component: SocietyPage });

type Project = { id: string; name: string; description: string | null };
type EventRow = { id: string; name: string; event_date: string | null; project_id: string };

function SocietyPage() {
  const { societyId } = Route.useParams();
  const { user } = useAuth();
  const [society, setSociety] = useState<{ name: string; description: string | null } | null>(null);
  const [role, setRole] = useState<string>("member");
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<EventRow[]>([]);
  const [open, setOpen] = useState(false);
  const [pname, setPname] = useState(""); const [pdesc, setPdesc] = useState("");

  const canManage = role === "executive" || role === "project_owner";

  const load = async () => {
    const [{ data: soc }, { data: mem }, { data: pr }, { data: ev }] = await Promise.all([
      supabase.from("societies").select("name, description").eq("id", societyId).maybeSingle(),
      supabase.from("society_members").select("role").eq("society_id", societyId).eq("user_id", user!.id).maybeSingle(),
      supabase.from("projects").select("id, name, description").eq("society_id", societyId).order("created_at", { ascending: false }),
      supabase.from("events").select("id, name, event_date, project_id").eq("society_id", societyId).order("event_date", { ascending: false, nullsFirst: false }).limit(20),
    ]);
    if (soc) setSociety(soc);
    if (mem) setRole(mem.role);
    setProjects(pr ?? []);
    setHistory(ev ?? []);
  };

  useEffect(() => { load(); }, [societyId]);

  const createProject = async () => {
    const { error } = await supabase.from("projects").insert({ society_id: societyId, name: pname, description: pdesc, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Project created");
    setOpen(false); setPname(""); setPdesc("");
    load();
  };

  if (!society) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground"><Link to="/dashboard" className="hover:text-foreground">Societies</Link> / {society.name}</div>
          <h1 className="font-display text-4xl mt-1">{society.name}</h1>
          {society.description && <p className="text-muted-foreground mt-1 max-w-2xl">{society.description}</p>}
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={pname} onChange={(e) => setPname(e.target.value)} placeholder="e.g. 2026 Spring Series" /></div>
                <div><Label>Description</Label><Textarea value={pdesc} onChange={(e) => setPdesc(e.target.value)} /></div>
              </div>
              <DialogFooter><Button onClick={createProject}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <section>
        <h2 className="font-display text-2xl flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" /> Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="md:col-span-3 rounded-xl border border-dashed border-border p-10 text-center bg-card/50 text-muted-foreground">No projects yet.</div>
          ) : projects.map((p) => (
            <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40">
              <div className="font-display text-lg">{p.name}</div>
              {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
              <div className="mt-3 text-sm text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">Open <ChevronRight className="h-4 w-4" /></div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl flex items-center gap-2"><History className="h-5 w-5 text-accent" /> Society history</h2>
          {!canManage && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> Executives & Project Owners can clone past events</span>}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card divide-y divide-border">
          {history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No past events yet. As events are completed, they&rsquo;ll be available as blueprints.</div>
          ) : history.map((e) => (
            <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/40">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {e.event_date ?? "No date"}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
