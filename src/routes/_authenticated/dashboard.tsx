import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, ArrowRight, Crown, Shield, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, subDays, startOfWeek, addDays, startOfDay } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type SocietyRow = { id: string; name: string; description: string | null; role: string };
type ContribEvent = {
  id: string;
  name: string;
  event_date: string | null;
  status: string;
  created_at: string;
  society_name: string;
  project_name: string;
  society_id: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [societies, setSocieties] = useState<SocietyRow[]>([]);
  const [contributions, setContributions] = useState<ContribEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: memberData, error: memberError }, { data: contribData, error: contribError }] =
      await Promise.all([
        supabase
          .from("society_members")
          .select("role, societies (id, name, description)")
          .eq("user_id", user!.id),
        supabase
          .from("events")
          .select(
            "id, name, event_date, status, created_at, society_id, societies(name), projects(name)",
          )
          .eq("created_by", user!.id)
          .order("created_at", { ascending: false }),
      ]);
    if (memberError) toast.error(memberError.message);
    if (contribError) toast.error(contribError.message);
    setSocieties(
      (memberData ?? []).map(
        (r: {
          role: string;
          societies: { id: string; name: string; description: string | null };
        }) => ({
          id: r.societies.id,
          name: r.societies.name,
          description: r.societies.description,
          role: r.role,
        }),
      ),
    );
    setContributions(
      (contribData ?? []).map(
        (e: {
          id: string;
          name: string;
          event_date: string | null;
          status: string;
          created_at: string;
          society_id: string;
          societies?: { name: string } | null;
          projects?: { name: string } | null;
        }) => ({
          id: e.id,
          name: e.name,
          event_date: e.event_date,
          status: e.status,
          created_at: e.created_at,
          society_name: e.societies?.name ?? "—",
          project_name: e.projects?.name ?? "—",
          society_id: e.society_id,
        }),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("societies")
      .insert({ name, description: desc, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Society created. You're its Executive.");
    setOpen(false);
    setName("");
    setDesc("");
    load();
  };

  const execCount = societies.filter((s) => s.role === "executive").length;
  const ownerCount = societies.filter((s) => s.role === "project_owner").length;

  return (
    <div className="blueprint-bg space-y-12">
      {/* Page hero */}
      <div className="pb-2">
        <h1 className="font-display text-4xl lg:text-5xl text-foreground">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">{user?.email}</p>
      </div>

      {/* Portfolio */}
      <section>
        <h2 className="font-display text-2xl mb-4">Portfolio</h2>

        <div className="rounded-md border border-border bg-card p-5">
          <ContributionCalendar events={contributions} loading={loading} />
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border text-sm">
            <span>
              <strong>{societies.length}</strong>{" "}
              <span className="text-muted-foreground">societies</span>
            </span>
            <span>
              <strong>{contributions.length}</strong>{" "}
              <span className="text-muted-foreground">events created</span>
            </span>
            <span>
              <strong>{execCount + ownerCount}</strong>{" "}
              <span className="text-muted-foreground">leadership roles</span>
            </span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-4">
          Contribution history
        </h3>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : contributions.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center bg-card/50">
            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No events created yet.</p>
          </div>
        ) : (
          <div className="relative border-l border-border ml-2 space-y-0">
            {contributions.map((e) => (
              <div key={e.id} className="relative pl-6 pb-6 group">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: e.id }}
                      className="font-medium hover:text-primary transition text-sm"
                    >
                      {e.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {e.society_name} · {e.project_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={e.status} />
                    <span className="text-xs text-muted-foreground">
                      {e.event_date
                        ? format(parseISO(e.event_date), "d MMM yyyy")
                        : format(parseISO(e.created_at), "d MMM yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Societies */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">Your societies</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New society
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a new society</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sname">Name</Label>
                  <Input
                    id="sname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Photography Society"
                  />
                </div>
                <div>
                  <Label htmlFor="sdesc">Description</Label>
                  <Textarea id="sdesc" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={create}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : societies.length === 0 ? (
            <div className="md:col-span-3 rounded-md border border-dashed border-border p-12 text-center bg-card/50">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No societies yet. Create one to get started.
              </p>
            </div>
          ) : (
            societies.map((s) => (
              <Link
                key={s.id}
                to="/societies/$societyId"
                params={{ societyId: s.id }}
                className="group rounded-md border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <RoleBadge role={s.role} />
                </div>
                <h3 className="font-display text-xl mt-4">{s.name}</h3>
                {s.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                )}
                <div className="mt-4 text-sm text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Open <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ContributionCalendar({ events, loading }: { events: ContribEvent[]; loading: boolean }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const gridStart = useMemo(() => startOfWeek(subDays(today, 364), { weekStartsOn: 0 }), [today]);

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of events) {
      const day = e.created_at.slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    }
    return map;
  }, [events]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let cur = gridStart;
    while (cur <= today) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) week.push(addDays(cur, d));
      result.push(week);
      cur = addDays(cur, 7);
    }
    return result;
  }, [gridStart, today]);

  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const m = week[0].getMonth();
      if (m !== lastMonth) {
        labels.push({ col: i, label: format(week[0], "MMM") });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  const cellColor = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count === 1) return "bg-primary/25";
    if (count === 2) return "bg-primary/55";
    return "bg-primary";
  };

  if (loading) return <div className="h-[90px] animate-pulse bg-muted/30 rounded" />;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-[3px] min-w-0">
        {/* Month labels */}
        <div className="flex gap-[3px] ml-7">
          {weeks.map((_week, i) => {
            const ml = monthLabels.find((m) => m.col === i);
            return (
              <div key={i} className="w-[11px] text-[9px] text-muted-foreground leading-none">
                {ml?.label ?? ""}
              </div>
            );
          })}
        </div>
        <div className="flex gap-[3px]">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] mr-1 w-6">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div
                key={i}
                className="h-[11px] text-[8px] text-muted-foreground leading-[11px] text-right pr-1"
              >
                {d}
              </div>
            ))}
          </div>
          {/* Heatmap columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const key = format(day, "yyyy-MM-dd");
                const count = countMap[key] ?? 0;
                const future = day > today;
                return (
                  <div
                    key={di}
                    title={
                      future
                        ? ""
                        : `${format(day, "d MMM yyyy")}: ${count} event${count !== 1 ? "s" : ""}`
                    }
                    className={`h-[11px] w-[11px] rounded-[2px] ${future ? "invisible" : cellColor(count)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-1 ml-7 self-end">
          <span className="text-[9px] text-muted-foreground mr-1">Less</span>
          {["bg-muted/50", "bg-primary/25", "bg-primary/55", "bg-primary"].map((c) => (
            <div key={c} className={`h-[11px] w-[11px] rounded-[2px] ${c}`} />
          ))}
          <span className="text-[9px] text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    planning: "bg-muted text-muted-foreground",
    active: "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-600",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? map.planning}`}
    >
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { icon: React.ElementType; label: string; cls: string }> = {
    executive: { icon: Crown, label: "Executive", cls: "bg-accent/30 text-foreground" },
    project_owner: { icon: Shield, label: "Project Owner", cls: "bg-primary/10 text-primary" },
    member: { icon: Shield, label: "Member", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[role] ?? map.member;
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}
