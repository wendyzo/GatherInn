import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import {
  Clock,
  Users,
  AlertTriangle,
  Shield,
  Search,
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

const SEARCH_EVENTS = [
  "Finals Night 2024",
  "Spring Gala 2023",
  "Hackathon 2022",
  "Welcome Week 2024",
  "Alumni Mixer 2023",
  "Annual Ball 2022",
];

const VENDORS = [
  { name: "City Catering Co.", type: "Catering", stars: 5 },
  { name: "ProAV Systems", type: "AV Crew", stars: 4 },
  { name: "Stage Lighting Ltd", type: "Lighting", stars: 5 },
];

const CAPABILITIES = [
  { Icon: Clock, label: "Timeline" },
  { Icon: Users, label: "Vendors" },
  { Icon: AlertTriangle, label: "Risk Alerts" },
  { Icon: Shield, label: "Roles" },
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
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Shifted timeline</p>
      {tasks.map((task, i) => {
        const leftPct = ((task.start.getTime() - min) / span) * 100;
        const widthPct = Math.max(((task.end.getTime() - task.start.getTime()) / span) * 100, 4);
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
            <span className="w-28 shrink-0 text-right text-[11px] leading-tight text-gray-500 truncate">
              {task.name}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-gray-100">
              <div
                className="absolute h-full rounded-sm bg-[#1a1a1a]"
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-[10px] text-gray-400">
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
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Clone a blueprint
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-gray-500">Past event</label>
          <div className="relative">
            <select
              value={selectedLabel}
              onChange={(e) => {
                setSelectedLabel(e.target.value);
                setCloned(false);
              }}
              className="w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/15"
            >
              {EVENT_TEMPLATES.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-gray-500">New start date</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setCloned(false);
            }}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/15"
          />
        </div>
      </div>

      <button
        onClick={handleClone}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
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

// ── Search Demo ───────────────────────────────────────────────────

function SearchDemo() {
  const [query, setQuery] = useState("");
  const results = SEARCH_EVENTS.filter((e) => e.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events…"
          className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div>
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">No events found.</div>
        ) : (
          results.map((e, i) => (
            <div
              key={e}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              <span className="text-[#1a1a1a]">{e}</span>
              <span className="text-[10px] uppercase tracking-wide text-gray-400">View →</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Vendor Grid ───────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= count ? "text-[#EF9F27]" : "text-gray-200"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function VendorGrid() {
  const [imported, setImported] = useState<string[]>([]);

  const toggle = (name: string) =>
    setImported((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <div className="space-y-3">
      {VENDORS.map((v) => {
        const done = imported.includes(v.name);
        return (
          <div
            key={v.name}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">{v.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <Stars count={v.stars} />
                <span className="text-[11px] text-gray-400">{v.type}</span>
              </div>
            </div>
            <button
              onClick={() => toggle(v.name)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                done
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-gray-200 text-[#1a1a1a] hover:border-[#1a1a1a]"
              }`}
            >
              {done ? "Imported ✓" : "Import"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Risk Banner ───────────────────────────────────────────────────

function RiskBanner() {
  const [state, setState] = useState<"visible" | "acknowledged" | "dismissed">("visible");

  if (state === "dismissed") {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-3.5 text-sm text-gray-400">
        Risk alert dismissed.
      </div>
    );
  }

  if (state === "acknowledged") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5">
        <Check className="h-4 w-4 shrink-0 text-[#1a1a1a]" />
        <span className="text-sm font-medium text-[#1a1a1a]">
          Acknowledged — added to your checklist.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF9F27]" />
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#EF9F27]">
            Legacy alert
          </p>
          <p className="text-sm leading-snug text-[#1a1a1a]">
            Note from last year: High-voltage power required for Stage B.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setState("acknowledged")}
              className="rounded-md bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black"
            >
              Acknowledge
            </button>
            <button
              onClick={() => setState("dismissed")}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature Row ───────────────────────────────────────────────────

function FeatureRow({
  ui,
  heading,
  sub,
  flip = false,
}: {
  ui: ReactNode;
  heading: string;
  sub: string;
  flip?: boolean;
}) {
  const text = (
    <div>
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#1a1a1a]">
        {heading}
      </h2>
      <p className="mt-2 text-[#6b7280]">{sub}</p>
    </div>
  );

  return (
    <section className="border-t border-gray-200 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {flip ? (
            <>
              {text}
              <div>{ui}</div>
            </>
          ) : (
            <>
              <div>{ui}</div>
              {text}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Landing ───────────────────────────────────────────────────────

function Landing() {
  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* Nav */}
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <BrandLogo />
        <Link
          to="/login"
          className="text-sm font-medium text-[#1a1a1a] transition-opacity hover:opacity-60"
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-[#1a1a1a] md:text-6xl">
              Inherit the
              <br />
              blueprint.
            </h1>
            <p className="mt-4 text-xl text-[#6b7280]">Never plan from zero.</p>
          </div>
          <CloneCard />
        </div>
      </section>

      {/* Capability strip */}
      <div className="border-y border-gray-200">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {CAPABILITIES.map(({ Icon, label }, i) => (
              <div
                key={label}
                className={`flex items-center justify-center gap-2.5 py-5 ${
                  i > 0 ? "border-l border-gray-200" : ""
                }`}
              >
                <Icon className="h-4 w-4 text-[#6b7280]" />
                <span className="text-sm font-medium text-[#1a1a1a]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature rows */}
      <FeatureRow
        ui={<SearchDemo />}
        heading="Find any event, instantly."
        sub="Your society's full history, searchable."
      />
      <FeatureRow
        ui={<VendorGrid />}
        heading="Bring the team that delivered."
        sub="One click to carry vetted vendors forward."
        flip
      />
      <FeatureRow
        ui={<RiskBanner />}
        heading="Risks surface before they repeat."
        sub="Every clone opens with last year's unresolved alerts."
      />

      {/* CTA */}
      <section className="border-t border-gray-200 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-colors hover:bg-black"
          >
            Open your society <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-[#6b7280]">Free for student societies</p>
        </div>
      </section>
    </div>
  );
}
