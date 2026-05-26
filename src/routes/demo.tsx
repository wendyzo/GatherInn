import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO, subDays, startOfWeek, addDays, startOfDay } from "date-fns";
import {
  Building2,
  ArrowRight,
  Crown,
  Shield,
  Sparkles,
  ChevronDown,
  Clock,
  GripVertical,
  History,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

export const Route = createFileRoute("/demo")({ component: Demo });

// ── Mock data ─────────────────────────────────────────────────────────────────

const today = new Date();
const d = (daysAgo: number) => subDays(today, daysAgo).toISOString();

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

const EVENTS_BY_SOCIETY: Record<
  string,
  { id: string; name: string; event_date: string; status: string; hasBlueprint: boolean }[]
> = {
  "1": [
    {
      id: "e1",
      name: "Annual Photography Exhibition",
      event_date: d(8),
      status: "active",
      hasBlueprint: true,
    },
    {
      id: "e2",
      name: "Dark-Room Induction Workshop",
      event_date: d(22),
      status: "completed",
      hasBlueprint: false,
    },
    {
      id: "e3",
      name: "Portrait Masterclass",
      event_date: d(45),
      status: "completed",
      hasBlueprint: true,
    },
  ],
  "2": [
    {
      id: "e4",
      name: "Regional Robotics Championship",
      event_date: d(3),
      status: "planning",
      hasBlueprint: true,
    },
    {
      id: "e5",
      name: "Soldering Sprint",
      event_date: d(60),
      status: "completed",
      hasBlueprint: false,
    },
    {
      id: "e6",
      name: "Sponsor Pitch Night",
      event_date: d(90),
      status: "completed",
      hasBlueprint: true,
    },
  ],
  "3": [
    {
      id: "e7",
      name: "Spring Production: Hamlet",
      event_date: d(15),
      status: "active",
      hasBlueprint: true,
    },
    {
      id: "e8",
      name: "Improv Night",
      event_date: d(120),
      status: "completed",
      hasBlueprint: false,
    },
    {
      id: "e9",
      name: "Auditions: Hamlet",
      event_date: d(135),
      status: "completed",
      hasBlueprint: false,
    },
  ],
};

const RUNSHEET_BY_EVENT: Record<
  string,
  { id: string; title: string; start_time: string; duration_minutes: number; ai: boolean }[]
> = {
  e1: [
    {
      id: "b1",
      title: "Venue Setup & Registration",
      start_time: "09:00",
      duration_minutes: 60,
      ai: false,
    },
    { id: "b2", title: "Opening Ceremony", start_time: "10:00", duration_minutes: 30, ai: true },
    {
      id: "b3",
      title: "Gallery Tour — Student Works",
      start_time: "10:30",
      duration_minutes: 90,
      ai: true,
    },
    {
      id: "b4",
      title: "Judges Deliberation",
      start_time: "12:00",
      duration_minutes: 30,
      ai: false,
    },
    {
      id: "b5",
      title: "Awards & Closing Remarks",
      start_time: "12:30",
      duration_minutes: 45,
      ai: true,
    },
  ],
  e4: [
    {
      id: "b6",
      title: "Team Check-in & Inspection",
      start_time: "08:00",
      duration_minutes: 60,
      ai: false,
    },
    {
      id: "b7",
      title: "Round 1 — Autonomous",
      start_time: "09:00",
      duration_minutes: 45,
      ai: true,
    },
    {
      id: "b8",
      title: "Round 2 — Obstacle Course",
      start_time: "10:00",
      duration_minutes: 45,
      ai: true,
    },
    { id: "b9", title: "Lunch Break", start_time: "11:00", duration_minutes: 60, ai: false },
    { id: "b10", title: "Finals", start_time: "12:00", duration_minutes: 90, ai: true },
    { id: "b11", title: "Award Ceremony", start_time: "13:30", duration_minutes: 30, ai: true },
  ],
  e7: [
    {
      id: "b12",
      title: "Front of House Opens",
      start_time: "18:30",
      duration_minutes: 30,
      ai: false,
    },
    { id: "b13", title: "Welcome & Pre-show", start_time: "19:00", duration_minutes: 15, ai: true },
    { id: "b14", title: "Act I — Hamlet", start_time: "19:15", duration_minutes: 60, ai: true },
    { id: "b15", title: "Intermission", start_time: "20:15", duration_minutes: 20, ai: false },
    { id: "b16", title: "Act II — Hamlet", start_time: "20:35", duration_minutes: 55, ai: true },
    {
      id: "b17",
      title: "Curtain Call & Closing",
      start_time: "21:30",
      duration_minutes: 15,
      ai: true,
    },
  ],
};

const CONTRIBUTIONS = Object.entries(EVENTS_BY_SOCIETY).flatMap(([societyId, events]) =>
  events.map((e) => ({ ...e, created_at: e.event_date, society_id: societyId })),
);

// ── Main component ────────────────────────────────────────────────────────────

function Demo() {
  const [activeSociety, setActiveSociety] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSocietyClick = (id: string) => {
    if (activeSociety === id) {
      setActiveSociety(null);
      setActiveEvent(null);
    } else {
      setActiveSociety(id);
      setActiveEvent(null);
    }
  };

  const handleEventClick = (id: string) => {
    setActiveEvent(activeEvent === id ? null : id);
  };

  const activeBlocks = activeEvent ? (RUNSHEET_BY_EVENT[activeEvent] ?? []) : [];
  const activeEvents = activeSociety ? (EVENTS_BY_SOCIETY[activeSociety] ?? []) : [];
  const activeSocietyData = SOCIETIES.find((s) => s.id === activeSociety);
  const activeEventData = activeEvents.find((e) => e.id === activeEvent);

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
            This is a live demo with fictional data —{" "}
            <Link to="/login" className="underline underline-offset-2 font-medium">
              create a free account
            </Link>{" "}
            to build your own.
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
          </section>

          {/* Societies */}
          <section>
            <div className="flex items-end justify-between mb-2">
              <div>
                <h2 className="font-display text-2xl">Your societies</h2>
                <p className="text-muted-foreground mt-1 text-sm mb-6">
                  Click a society to explore its events and runsheets.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="text-muted-foreground">
                  Sign up to create
                </Button>
              </Link>
            </div>

            {/* Society cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SOCIETIES.map((s, i) => {
                const isActive = activeSociety === s.id;
                const isDimmed = activeSociety !== null && !isActive;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSocietyClick(s.id)}
                    style={{ transitionDelay: mounted ? "0ms" : `${i * 80}ms` }}
                    className={[
                      "rounded-md border bg-card p-6 text-left w-full",
                      "transition-all duration-300 ease-in-out",
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                      isActive
                        ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-[1.02]"
                        : isDimmed
                          ? "border-border opacity-40 scale-[0.98]"
                          : "border-border hover:border-primary/40 hover:shadow-sm",
                    ].join(" ")}
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
                    <div
                      className={[
                        "mt-4 text-sm text-primary inline-flex items-center gap-1 transition-all duration-200",
                        isActive ? "opacity-100" : "opacity-40",
                      ].join(" ")}
                    >
                      {isActive ? (
                        <>
                          <ChevronDown className="h-4 w-4" /> Viewing events
                        </>
                      ) : (
                        <>
                          Open <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Events panel — Tier 2 */}
            <div
              className={[
                "overflow-hidden transition-all duration-500 ease-in-out",
                activeSociety ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0",
              ].join(" ")}
            >
              {activeSocietyData && (
                <div className="rounded-md border border-primary/20 bg-card">
                  {/* Panel header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                    <History className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{activeSocietyData.name} — Events</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Click an event to see its runsheet
                    </span>
                  </div>

                  {/* Event list */}
                  <div className="divide-y divide-border">
                    {activeEvents.map((e, i) => {
                      const isEventActive = activeEvent === e.id;
                      const isEventDimmed = activeEvent !== null && !isEventActive;
                      return (
                        <div key={e.id}>
                          <button
                            onClick={() => handleEventClick(e.id)}
                            style={{ transitionDelay: `${i * 60}ms` }}
                            className={[
                              "w-full flex items-center justify-between px-5 py-4 text-left",
                              "transition-all duration-300",
                              isEventActive
                                ? "bg-primary/5"
                                : isEventDimmed
                                  ? "opacity-40"
                                  : "hover:bg-muted/30",
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={[
                                  "h-2 w-2 rounded-full flex-shrink-0 transition-all duration-200",
                                  isEventActive ? "bg-primary scale-125" : "bg-primary/30",
                                ].join(" ")}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{e.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(parseISO(e.event_date), "d MMM yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              {e.hasBlueprint && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-accent/30 text-foreground px-2 py-0.5 rounded-full">
                                  <History className="h-2.5 w-2.5" /> Blueprint
                                </span>
                              )}
                              <StatusBadge status={e.status} />
                              <ChevronDown
                                className={[
                                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                  isEventActive ? "rotate-180" : "",
                                ].join(" ")}
                              />
                            </div>
                          </button>

                          {/* Runsheet panel — Tier 3 */}
                          <div
                            className={[
                              "overflow-hidden transition-all duration-500 ease-in-out",
                              isEventActive && activeBlocks.length > 0
                                ? "max-h-[1200px] opacity-100"
                                : isEventActive
                                  ? "max-h-[80px] opacity-100"
                                  : "max-h-0 opacity-0",
                            ].join(" ")}
                          >
                            <div className="px-5 pb-5">
                              {/* Runsheet header */}
                              <div className="mt-4 mb-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Runsheet
                                </span>
                                {activeEventData?.hasBlueprint && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-accent/30 text-foreground px-2 py-0.5 rounded-full">
                                    <History className="h-2.5 w-2.5" /> Cloned from past event
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                                  <Sparkles className="h-2.5 w-2.5" /> AI assisted
                                </span>
                              </div>

                              {activeBlocks.length > 0 ? (
                                <div className="space-y-2">
                                  {activeBlocks.map((b, bi) => (
                                    <div
                                      key={b.id}
                                      style={{ transitionDelay: `${bi * 50}ms` }}
                                      className={[
                                        "flex items-start gap-3 rounded-md border px-4 py-3",
                                        "transition-all duration-300",
                                        b.ai
                                          ? "border-primary/20 bg-primary/5"
                                          : "border-border bg-background",
                                      ].join(" ")}
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-medium">{b.title}</span>
                                          {b.ai && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                                              <Sparkles className="h-2.5 w-2.5" /> AI generated
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {b.start_time}
                                          </span>
                                          <span>{b.duration_minutes} min</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                                  No runsheet yet — AI can generate one instantly.
                                </div>
                              )}

                              {/* Feature callout */}
                              <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/40 border border-border px-4 py-3">
                                <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                  In the real app you can <strong>drag to reorder</strong>, edit
                                  inline, add blocks, and{" "}
                                  <strong>generate a full runsheet from just the event name</strong>{" "}
                                  using AI.
                                </p>
                              </div>

                              <div className="mt-3 flex justify-end">
                                <Link to="/login">
                                  <Button size="sm">
                                    Try it yourself <ArrowRight className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Contribution history */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
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
                        {SOCIETIES.find((s) => s.id === e.society_id)?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(e.event_date), "d MMM yyyy")}
                      </span>
                    </div>
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

// ── Sub-components ────────────────────────────────────────────────────────────

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
            {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
              <div
                key={i}
                className="h-[11px] text-[8px] text-muted-foreground leading-[11px] text-right pr-1"
              >
                {day}
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
