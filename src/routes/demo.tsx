import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO, subDays, startOfWeek, addDays, startOfDay } from "date-fns";
import { Building2, ArrowRight, Crown, Shield, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

export const Route = createFileRoute("/demo")({ component: Demo });

// ── Mock data ────────────────────────────────────────────────────────────────

const SOCIETIES = [
  {
    id: "1",
    name: "Photography Society",
    description: "Weekly shoots, dark-room workshops, and annual exhibition.",
    role: "executive",
  },
  {
    id: "2",
    name: "Robotics Club",
    description: "Hardware builds, coding sprints, and inter-uni competitions.",
    role: "project_owner",
  },
  {
    id: "3",
    name: "Drama Society",
    description: "Two full productions per semester and improv nights.",
    role: "member",
  },
];

const today = new Date();
const d = (daysAgo: number) => subDays(today, daysAgo).toISOString();

const CONTRIBUTIONS = [
  {
    id: "e1",
    name: "Annual Photography Exhibition",
    event_date: d(8),
    status: "active",
    created_at: d(8),
    society_name: "Photography Society",
    project_name: "Exhibition 2026",
    society_id: "1",
  },
  {
    id: "e2",
    name: "Dark-Room Induction Workshop",
    event_date: d(22),
    status: "completed",
    created_at: d(22),
    society_name: "Photography Society",
    project_name: "Workshops",
    society_id: "1",
  },
  {
    id: "e3",
    name: "Portrait Masterclass",
    event_date: d(45),
    status: "completed",
    created_at: d(45),
    society_name: "Photography Society",
    project_name: "Workshops",
    society_id: "1",
  },
  {
    id: "e4",
    name: "Regional Robotics Championship",
    event_date: d(3),
    status: "planning",
    created_at: d(3),
    society_name: "Robotics Club",
    project_name: "Competitions",
    society_id: "2",
  },
  {
    id: "e5",
    name: "Soldering Sprint",
    event_date: d(60),
    status: "completed",
    created_at: d(60),
    society_name: "Robotics Club",
    project_name: "Build Season",
    society_id: "2",
  },
  {
    id: "e6",
    name: "Sponsor Pitch Night",
    event_date: d(90),
    status: "completed",
    created_at: d(90),
    society_name: "Robotics Club",
    project_name: "Fundraising",
    society_id: "2",
  },
  {
    id: "e7",
    name: "Spring Production: Hamlet",
    event_date: d(15),
    status: "active",
    created_at: d(15),
    society_name: "Drama Society",
    project_name: "Spring 2026",
    society_id: "3",
  },
  {
    id: "e8",
    name: "Improv Night",
    event_date: d(120),
    status: "completed",
    created_at: d(120),
    society_name: "Drama Society",
    project_name: "Events",
    society_id: "3",
  },
  {
    id: "e9",
    name: "Auditions: Hamlet",
    event_date: d(135),
    status: "completed",
    created_at: d(135),
    society_name: "Drama Society",
    project_name: "Spring 2026",
    society_id: "3",
  },
  {
    id: "e10",
    name: "Costume & Set Planning",
    event_date: d(200),
    status: "completed",
    created_at: d(200),
    society_name: "Drama Society",
    project_name: "Spring 2026",
    society_id: "3",
  },
  {
    id: "e11",
    name: "Semester Kickoff Social",
    event_date: d(270),
    status: "completed",
    created_at: d(270),
    society_name: "Photography Society",
    project_name: "Social",
    society_id: "1",
  },
  {
    id: "e12",
    name: "Landscape Weekend Trip",
    event_date: d(310),
    status: "cancelled",
    created_at: d(310),
    society_name: "Photography Society",
    project_name: "Trips",
    society_id: "1",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

function Demo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-sidebar/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline px-3">
              Viewing as guest
            </span>
            <Link to="/login">
              <Button size="sm" variant="outline">
                Sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Sign up free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-primary/5 border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center gap-2 text-sm text-primary">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span>
            This is a demo with fictional data —{" "}
            <Link to="/login" className="underline underline-offset-2 font-medium">
              create a free account
            </Link>{" "}
            to start your own societies.
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="blueprint-bg space-y-12">
          {/* Portfolio */}
          <section>
            <h2 className="font-display text-2xl mb-1">Portfolio</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your activity across all societies.
            </p>

            <div className="rounded-md border border-border bg-card p-5">
              <ContributionCalendar events={CONTRIBUTIONS} />
              <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border text-sm">
                <span>
                  <strong>{SOCIETIES.length}</strong>{" "}
                  <span className="text-muted-foreground">societies</span>
                </span>
                <span>
                  <strong>{CONTRIBUTIONS.length}</strong>{" "}
                  <span className="text-muted-foreground">events created</span>
                </span>
                <span>
                  <strong>2</strong> <span className="text-muted-foreground">leadership roles</span>
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-4">
              Contribution history
            </h3>
            <div className="relative border-l border-border ml-2 space-y-0">
              {CONTRIBUTIONS.map((e) => (
                <div key={e.id} className="relative pl-6 pb-6 group">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-sm">{e.name}</span>
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
          </section>

          {/* Societies */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl">Your societies</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Pick a society to view its projects, events, and historical blueprint.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="text-muted-foreground">
                  Sign up to create
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SOCIETIES.map((s) => (
                <div
                  key={s.id}
                  className="rounded-md border border-border bg-card p-6 cursor-default opacity-90"
                >
                  <div className="flex items-start justify-between">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <RoleBadge role={s.role} />
                  </div>
                  <h3 className="font-display text-xl mt-4">{s.name}</h3>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-4 text-sm text-primary inline-flex items-center gap-1 opacity-40">
                    Open <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-md border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="font-display text-2xl mb-2">Ready to get started?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create your own societies, manage events, and build your organisation's blueprint —
              for free.
            </p>
            <Link to="/login">
              <Button size="lg">Create a free account</Button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components (same as dashboard) ───────────────────────────────────────

type ContribEvent = { id: string; created_at: string };

function ContributionCalendar({ events }: { events: ContribEvent[] }) {
  const todayDate = startOfDay(new Date());
  const gridStart = startOfWeek(subDays(todayDate, 364), { weekStartsOn: 0 });

  const countMap: Record<string, number> = {};
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    countMap[day] = (countMap[day] ?? 0) + 1;
  }

  const weeks: Date[][] = [];
  let cur = gridStart;
  while (cur <= todayDate) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) week.push(addDays(cur, d));
    weeks.push(week);
    cur = addDays(cur, 7);
  }

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ col: i, label: format(week[0], "MMM") });
      lastMonth = m;
    }
  });

  const cellColor = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count === 1) return "bg-primary/25";
    if (count === 2) return "bg-primary/55";
    return "bg-primary";
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-[3px] min-w-0">
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
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const key = format(day, "yyyy-MM-dd");
                const count = countMap[key] ?? 0;
                const future = day > todayDate;
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
