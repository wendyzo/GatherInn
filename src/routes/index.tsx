import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import {
  Clock,
  Users,
  AlertTriangle,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export const Route = createFileRoute("/")({ component: Landing });

// ── Data ─────────────────────────────────────────────────────────

type TaskTemplate = { name: string; offsetDays: number; duration: number };
type EventTemplate = { label: string; tasks: TaskTemplate[] };

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    label: "Finals 2024",
    tasks: [
      { name: "Book venue", offsetDays: -28, duration: 7 },
      { name: "Brief catering", offsetDays: -14, duration: 5 },
      { name: "Tech rehearsal", offsetDays: -5, duration: 2 },
      { name: "Event day", offsetDays: 0, duration: 1 },
      { name: "Debrief", offsetDays: 2, duration: 2 },
    ],
  },
  {
    label: "Gala 2023",
    tasks: [
      { name: "Venue deposit", offsetDays: -45, duration: 5 },
      { name: "Invite list", offsetDays: -30, duration: 10 },
      { name: "Dress rehearsal", offsetDays: -3, duration: 2 },
      { name: "Gala night", offsetDays: 0, duration: 1 },
      { name: "Thank-you notes", offsetDays: 3, duration: 3 },
    ],
  },
  {
    label: "Hackathon 2022",
    tasks: [
      { name: "Platform setup", offsetDays: -21, duration: 7 },
      { name: "Sponsor brief", offsetDays: -14, duration: 4 },
      { name: "Registration", offsetDays: -7, duration: 5 },
      { name: "Hackathon", offsetDays: 0, duration: 2 },
      { name: "Winners live", offsetDays: 3, duration: 1 },
    ],
  },
];

const GANTT_TASKS = [
  { name: "Venue booking", start: 0, width: 18 },
  { name: "Sponsor outreach", start: 10, width: 22 },
  { name: "Invite list", start: 28, width: 24 },
  { name: "AV setup", start: 50, width: 16 },
  { name: "Tech rehearsal", start: 68, width: 12 },
  { name: "Event day", start: 82, width: 5 },
  { name: "Debrief", start: 89, width: 10 },
];

const WEEK_LOAD = [1, 2, 3, 4, 3, 5, 7, 8, 5, 2];

const VENDOR_METRICS = [
  {
    name: "City Catering Co.",
    type: "Catering",
    stars: 5,
    reliability: 92,
    value: 78,
    speed: 85,
    usedIn: ["Finals '24", "Gala '23"],
  },
  {
    name: "ProAV Systems",
    type: "AV Crew",
    stars: 4,
    reliability: 75,
    value: 88,
    speed: 70,
    usedIn: ["Finals '24", "Hack '22"],
  },
  {
    name: "Stage Lighting Ltd",
    type: "Lighting",
    stars: 5,
    reliability: 90,
    value: 65,
    speed: 80,
    usedIn: ["Gala '23"],
  },
];

const RISKS = [
  {
    text: "High-voltage power required for Stage B",
    severity: "high",
    status: "pending",
    event: "Finals '24",
  },
  {
    text: "Venue capacity exceeded fire limit by 12%",
    severity: "high",
    status: "acknowledged",
    event: "Gala '23",
  },
  {
    text: "Catering delivery arrived 2h late",
    severity: "medium",
    status: "resolved",
    event: "Gala '23",
  },
  {
    text: "Backup microphone unavailable on the night",
    severity: "low",
    status: "resolved",
    event: "Hack '22",
  },
];

const RISK_CATEGORIES = [
  { label: "Technical", count: 4 },
  { label: "Venue", count: 3 },
  { label: "Logistics", count: 2 },
  { label: "Budget", count: 1 },
];

const TASK_LABELS = ["Venue", "Catering", "Budget", "AV"];
const ROLE_MATRIX = [
  { role: "President", tasks: [true, false, true, false] },
  { role: "VP Events", tasks: [true, true, false, true] },
  { role: "Treasurer", tasks: [false, false, true, false] },
  { role: "Logistics Lead", tasks: [false, true, false, true] },
  { role: "AV Lead", tasks: [false, false, false, true] },
];

const HANDOVER_ITEMS = [
  { item: "Event documentation", done: true },
  { item: "Vendor contacts exported", done: true },
  { item: "Budget report filed", done: true },
  { item: "Photo archive uploaded", done: false },
  { item: "Post-event survey sent", done: false },
];

// ── Mini Gantt ────────────────────────────────────────────────────

type GanttTask = { name: string; start: Date; end: Date };

function MiniGantt({ tasks, visible }: { tasks: GanttTask[]; visible: boolean }) {
  const times = tasks.flatMap((t) => [t.start.getTime(), t.end.getTime()]);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  return (
    <div
      className="mt-5 space-y-2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Shifted timeline
      </p>
      {tasks.map((task, i) => {
        const leftPct = ((task.start.getTime() - min) / span) * 100;
        const widthPct = Math.max(
          ((task.end.getTime() - task.start.getTime()) / span) * 100,
          4,
        );
        return (
          <div
            key={task.name}
            className="flex items-center gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(4px)",
              transition: `opacity 0.3s ease ${i * 70}ms, transform 0.3s ease ${i * 70}ms`,
            }}
          >
            <span className="w-28 shrink-0 text-right text-[11px] leading-tight text-muted-foreground truncate">
              {task.name}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-muted">
              <div
                className="absolute h-full rounded-sm bg-foreground"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-[10px] text-muted-foreground">
              {format(task.start, "d MMM")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Clone Card ────────────────────────────────────────────────────

function CloneCard() {
  const defaultDate = format(addDays(new Date(), 60), "yyyy-MM-dd");
  const [selectedLabel, setSelectedLabel] = useState("Finals 2024");
  const [newDate, setNewDate] = useState(defaultDate);
  const [cloned, setCloned] = useState(false);

  const template = EVENT_TEMPLATES.find((e) => e.label === selectedLabel)!;

  const ganttTasks: GanttTask[] =
    newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)
      ? template.tasks.map((t) => {
          const start = addDays(parseISO(newDate), t.offsetDays);
          return { name: t.name, start, end: addDays(start, t.duration) };
        })
      : [];

  const handleClone = () => {
    setCloned(false);
    setTimeout(() => setCloned(true), 40);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Clone a blueprint
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Past event</label>
          <div className="relative">
            <select
              value={selectedLabel}
              onChange={(e) => {
                setSelectedLabel(e.target.value);
                setCloned(false);
              }}
              className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {EVENT_TEMPLATES.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">New start date</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setCloned(false);
            }}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <button
        onClick={handleClone}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        {cloned ? (
          <>
            <Check className="h-4 w-4" /> Cloned
          </>
        ) : (
          <>
            Clone blueprint <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <MiniGantt tasks={ganttTasks} visible={cloned} />
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-sm ${i <= count ? "text-warning" : "text-muted-foreground/30"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ── Slide: Timeline ───────────────────────────────────────────────

function TimelineSlide() {
  const maxLoad = Math.max(...WEEK_LOAD);
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Task schedule — Finals Night 2025
        </p>
        <div className="space-y-2.5">
          {GANTT_TASKS.map((task, i) => (
            <div key={task.name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-right text-[11px] text-muted-foreground truncate">
                {task.name}
              </span>
              <div className="relative flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                <div
                  className="absolute h-full rounded-sm bg-foreground"
                  style={{
                    left: `${task.start}%`,
                    width: `${task.width}%`,
                    opacity: 1 - i * 0.08,
                  }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground">
                W{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Task density by week
        </p>
        <div className="flex items-end gap-1.5 h-20">
          {WEEK_LOAD.map((load, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <div
                className="w-full rounded-t-sm bg-foreground"
                style={{
                  height: `${(load / maxLoad) * 100}%`,
                  opacity: 0.35 + (load / maxLoad) * 0.65,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">10 wks out</span>
          <span className="text-[10px] text-muted-foreground">Event day</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "28", label: "tasks auto-scheduled" },
          { value: "7", label: "stakeholders notified" },
          { value: "0", label: "conflicts detected" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-4 text-center">
            <p className="font-display text-2xl text-foreground">{value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Vendors ────────────────────────────────────────────────

function VendorSlide() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Vendor scorecards
      </p>
      {VENDOR_METRICS.map((v) => {
        const isSelected = selected === v.name;
        return (
          <button
            key={v.name}
            onClick={() => setSelected(isSelected ? null : v.name)}
            className={`w-full rounded-lg border bg-card px-4 py-4 text-left transition-all ${
              isSelected ? "border-foreground" : "border-border hover:border-foreground/40"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-foreground">{v.name}</span>
                <span className="ml-2 text-[10px] text-muted-foreground">{v.type}</span>
              </div>
              <Stars count={v.stars} />
            </div>

            <div className="space-y-2">
              {[
                { label: "Reliability", value: v.reliability },
                { label: "Value", value: v.value },
                { label: "Speed", value: v.speed },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground">
                    {value}%
                  </span>
                </div>
              ))}
            </div>

            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isSelected ? "60px" : "0px", opacity: isSelected ? 1 : 0 }}
            >
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Used in:</span>
                {v.usedIn.map((e) => (
                  <span
                    key={e}
                    className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-foreground"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Slide: Risk Alerts ────────────────────────────────────────────

function RiskSlide() {
  const maxCount = Math.max(...RISK_CATEGORIES.map((c) => c.count));
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Inherited alerts
        </p>
        <div className="space-y-2">
          {RISKS.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  risk.severity === "high"
                    ? "bg-destructive"
                    : risk.severity === "medium"
                      ? "bg-warning"
                      : "bg-muted-foreground"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-foreground leading-snug">{risk.text}</p>
                <span className="text-[10px] text-muted-foreground">{risk.event}</span>
              </div>
              <span
                className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                  risk.status === "resolved"
                    ? "bg-secondary text-muted-foreground"
                    : risk.status === "acknowledged"
                      ? "bg-foreground/10 text-foreground"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {risk.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Risks by category
        </p>
        <div className="space-y-3">
          {RISK_CATEGORIES.map(({ label, count }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 text-[11px] text-muted-foreground">{label}</span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-4 text-right text-[11px] font-medium text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "4", label: "unresolved from last year" },
          { value: "100%", label: "surfaced on day one" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-4 text-center">
            <p className="font-display text-2xl text-foreground">{value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Roles ──────────────────────────────────────────────────

function RolesSlide() {
  const doneCount = HANDOVER_ITEMS.filter((h) => h.done).length;
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Role × responsibility matrix
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                {TASK_LABELS.map((t) => (
                  <th
                    key={t}
                    className="px-2 py-2.5 text-center font-medium text-muted-foreground"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_MATRIX.map((row, i) => (
                <tr key={row.role} className={i > 0 ? "border-t border-border" : ""}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.role}</td>
                  {row.tasks.map((has, j) => (
                    <td key={j} className="px-2 py-3 text-center">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          has ? "bg-foreground" : "bg-muted"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Handover checklist
        </p>
        <div className="space-y-2.5">
          {HANDOVER_ITEMS.map((item) => (
            <div key={item.item} className="flex items-center gap-2.5">
              <div
                className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center ${
                  item.done ? "border-foreground bg-foreground" : "border-border"
                }`}
              >
                {item.done && <Check className="h-3 w-3 text-background" />}
              </div>
              <span
                className={`text-[12px] ${
                  item.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {item.item}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: `${(doneCount / HANDOVER_ITEMS.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {doneCount}/{HANDOVER_ITEMS.length} items handed over
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Feature slideshow ─────────────────────────────────────────────

const FEATURE_SLIDES = [
  {
    id: "timeline",
    Icon: Clock,
    label: "Timeline",
    heading: "Every deadline, mapped.",
    sub: "Clone a past blueprint and watch every task auto-shift to your new date. No re-planning from scratch.",
    Demo: TimelineSlide,
  },
  {
    id: "vendors",
    Icon: Users,
    label: "Vendors",
    heading: "Bring the team that delivered.",
    sub: "Compare vendors by reliability, value, and speed. Import the ones that worked in one click.",
    Demo: VendorSlide,
  },
  {
    id: "risk",
    Icon: AlertTriangle,
    label: "Risk Alerts",
    heading: "Risks surface before they repeat.",
    sub: "Every clone opens with last year's unresolved alerts — categorised, prioritised, and ready to action.",
    Demo: RiskSlide,
  },
  {
    id: "roles",
    Icon: Shield,
    label: "Roles",
    heading: "Clear ownership, zero confusion.",
    sub: "Assign roles once. Responsibilities and handover checklists carry forward with every blueprint.",
    Demo: RolesSlide,
  },
];

function FeatureSlideshow() {
  const [active, setActive] = useState("timeline");
  const [visible, setVisible] = useState(true);

  const handleSelect = (id: string) => {
    if (id === active) return;
    setVisible(false);
    setTimeout(() => {
      setActive(id);
      setVisible(true);
    }, 150);
  };

  const current = FEATURE_SLIDES.find((f) => f.id === active)!;

  return (
    <>
      <div className="border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {FEATURE_SLIDES.map(({ id, Icon, label }, i) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`flex items-center justify-center gap-2.5 py-5 transition-colors ${
                  i > 0 ? "border-l border-border" : ""
                } ${active === id ? "bg-secondary/70" : "hover:bg-secondary/30"}`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    active === id ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    active === id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section
        className="border-b border-border py-20"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-16 lg:grid-cols-[2fr_3fr]">
            <div className="lg:sticky lg:top-10">
              <h2 className="font-display text-3xl leading-tight text-foreground">
                {current.heading}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">{current.sub}</p>
            </div>
            <current.Demo />
          </div>
        </div>
      </section>
    </>
  );
}

// ── Landing ───────────────────────────────────────────────────────

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <BrandLogo />
        <Link
          to="/login"
          className="text-sm font-medium text-foreground transition-opacity hover:opacity-60"
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
              Inherit the
              <br />
              blueprint.
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">Never plan from zero.</p>
          </div>
          <CloneCard />
        </div>
      </section>

      {/* Feature slideshow */}
      <FeatureSlideshow />

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open your society <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">Free for student societies</p>
        </div>
      </section>
    </div>
  );
}
