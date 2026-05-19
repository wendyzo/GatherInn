import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({ component: ProjectPage });

type EventRow = { id: string; name: string; event_date: string | null; status: string; cloned_from_event_id: string | null };

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<{ name: string; description: string | null; society_id: string } | null>(null);
  const [role, setRole] = useState("member");
  const [events, setEvents] = useState<EventRow[]>([]);

  const load = async () => {
    const { data: pr } = await supabase.from("projects").select("name, description, society_id").eq("id", projectId).maybeSingle();
    if (!pr) return;
    setProject(pr);
    const [{ data: mem }, { data: ev }] = await Promise.all([
      supabase.from("society_members").select("role").eq("society_id", pr.society_id).eq("user_id", user!.id).maybeSingle(),
      supabase.from("events").select("id, name, event_date, status, cloned_from_event_id").eq("project_id", projectId).order("event_date", { ascending: false, nullsFirst: false }),
    ]);
    if (mem) setRole(mem.role);
    setEvents(ev ?? []);
  };
  useEffect(() => { load(); }, [projectId]);

  const canManage = role === "executive" || role === "project_owner";

  if (!project) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted-foreground"><Link to="/dashboard" className="hover:text-foreground">Societies</Link> / <Link to="/societies/$societyId" params={{ societyId: project.society_id }} className="hover:text-foreground">Back to society</Link></div>
          <h1 className="font-display text-4xl mt-1">{project.name}</h1>
          {project.description && <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>}
        </div>
        {canManage && (
          <Link to="/projects/$projectId/new-event" params={{ projectId }}>
            <Button><Plus className="h-4 w-4" /> New event</Button>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {events.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">No events yet.</p>
            {canManage && (
              <Link to="/projects/$projectId/new-event" params={{ projectId }} className="mt-4 inline-flex items-center gap-1 text-primary font-medium"><Sparkles className="h-4 w-4" /> Create your first event</Link>
            )}
          </div>
        ) : events.map((e) => (
          <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/40">
            <div>
              <div className="font-medium flex items-center gap-2">
                {e.name}
                {e.cloned_from_event_id && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/30"><Sparkles className="h-3 w-3" /> Cloned</span>}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {e.event_date ?? "No date"} · {e.status}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
