import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  Star,
  Plus,
  Clock,
  Users,
  AlertTriangle,
  Shield,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export const Route = createFileRoute("/")({ component: Landing });

// ── Data ─────────────────────────────────────────────────────────

const SOURCE_TASKS = [
  { task: "Venue Booking", owner: "Sarah", due: "Oct 3" },
  { task: "AV Equipment", owner: "James", due: "Oct 5" },
  { task: "Catering Brief", owner: "Sarah", due: "Oct 10" },
  { task: "Tech Rehearsal", owner: "David", due: "Oct 14" },
  { task: "Event Night", owner: "All crew", due: "Oct 15" },
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

const RISKS_DATA = [
  {
    id: "power",
    severity: "red" as const,
    text: "Stage B requires high-voltage power (unresolved 2023)",
    note: "During Finals 2023, stage B tripped twice on standard 13A circuit. Facilities confirmed a dedicated 32A supply is needed. Not resolved before event ended.",
    date: "Finals Night 2023",
    flaggedBy: "James W.",
  },
  {
    id: "catering",
    severity: "amber" as const,
    text: "Caterer confirmed late in 2023 — book by Week 6",
    note: "The Feast Table sent written confirmation only 3 days before Gala 2023. Risk of last-minute no-show. Minimum 6-week lead time recommended.",
    date: "Spring Gala 2023",
    flaggedBy: "Sarah K.",
  },
  {
    id: "venue",
    severity: "green" as const,
    text: "Venue deposit accepted bank transfer in past 2 years",
    note: "City Hall venue processed BACS transfer within 2 working days for both Finals 2023 and Gala 2023. No issues with payment method.",
    date: "Verified Oct 2023",
    flaggedBy: "finance@society.ac.uk",
  },
];

const VENDORS_DATA = [
  {
    id: "lights",
    name: "Bright Lights Co.",
    role: "Lighting",
    lastEvent: "Gala 2023",
    email: "hello@brightlights.co",
    rating: 4,
    notes:
      "Excellent setup, arrived 2h early. Slight issue with gel colours — brought wrong shades but resolved quickly on-site. Would book again.",
  },
  {
    id: "av",
    name: "SoundWave AV",
    role: "AV Crew",
    lastEvent: "Finals 2024",
    email: "bookings@soundwave.av",
    rating: 5,
    notes:
      "Flawless delivery. Mic battery issue caught in tech rehearsal and self-resolved before doors. Best AV crew we've worked with.",
  },
  {
    id: "catering",
    name: "The Feast Table",
    role: "Catering",
    lastEvent: "Gala 2023",
    email: "events@thefeasttable.com",
    rating: 3,
    notes:
      "Food quality excellent. Arrived 45 min late for setup — catering area not ready when doors opened. Must confirm arrival window at booking.",
  },
];

const ROLES_DATA = [
  { id: "president", name: "President", access: "Full access", members: 2, initials: ["PL", "QR"] },
  {
    id: "exec",
    name: "Event Executive",
    access: "Edit access",
    members: 5,
    initials: ["AJ", "BK", "CL"],
  },
  {
    id: "member",
    name: "General Member",
    access: "View only",
    members: 34,
    initials: ["XY", "YZ", "ZA"],
  },
];

const PERM_LABELS = [
  "View History",
  "Clone Events",
  "Edit Timeline",
  "Manage Vendors",
  "Manage Roles",
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  president: {
    "View History": true,
    "Clone Events": true,
    "Edit Timeline": true,
    "Manage Vendors": true,
    "Manage Roles": true,
  },
  exec: {
    "View History": true,
    "Clone Events": true,
    "Edit Timeline": true,
    "Manage Vendors": false,
    "Manage Roles": false,
  },
  member: {
    "View History": true,
    "Clone Events": false,
    "Edit Timeline": false,
    "Manage Vendors": false,
    "Manage Roles": false,
  },
};

const SEVERITY = {
  red: { dot: "#E24B4A", bg: "rgba(226,75,74,0.07)" },
  amber: { dot: "#EF9F27", bg: "rgba(239,159,39,0.07)" },
  green: { dot: "#1D9E75", bg: "rgba(29,158,117,0.07)" },
};

// ── Hero ──────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-medium text-[#1a1a1a] leading-tight tracking-tight">
          Inherit the blueprint.
        </h1>
        <p className="mt-3 text-lg text-gray-400">Your society's event memory, built in.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
        {/* Source card */}
        <div
          className="w-full lg:flex-1 rounded-xl bg-white p-5"
          style={{ border: "0.5px solid #e8e8e8" }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Source event
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(29,158,117,0.1)", color: "#1D9E75" }}
            >
              Completed
            </span>
          </div>
          <div className="mb-5">
            <p className="text-base font-medium text-[#1a1a1a]">Finals Night 2024</p>
            <p className="text-xs text-gray-400 mt-0.5">Oct 15, 2024</p>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <span className="flex-1 text-[10px] text-gray-300 uppercase tracking-wider">Task</span>
            <span className="w-16 text-[10px] text-gray-300 uppercase tracking-wider">Owner</span>
            <span className="w-11 text-[10px] text-gray-300 uppercase tracking-wider">Due</span>
            <span className="w-5" />
          </div>
          {SOURCE_TASKS.map((t) => (
            <div key={t.task} className="flex items-center gap-2 py-2.5 border-t border-gray-50">
              <span className="flex-1 text-sm text-[#1a1a1a]">{t.task}</span>
              <span className="w-16 text-xs text-gray-400">{t.owner}</span>
              <span className="w-11 text-xs text-gray-400">{t.due}</span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(29,158,117,0.12)" }}
              >
                <Check className="h-3 w-3" style={{ color: "#1D9E75" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex lg:flex-col items-center justify-center py-1 lg:py-0 lg:w-14 shrink-0">
          <style>{`
            @keyframes arrow-drift {
              0%,100%{opacity:.9;transform:translateX(0)}
              50%{opacity:.5;transform:translateX(4px)}
            }
            @media(max-width:1023px){
              @keyframes arrow-drift {
                0%,100%{opacity:.9;transform:translateY(0) rotate(90deg)}
                50%{opacity:.5;transform:translateY(4px) rotate(90deg)}
              }
            }
            .arrow-drift{animation:arrow-drift 1.8s ease-in-out infinite}
          `}</style>
          <ArrowRight
            className="h-5 w-5 arrow-drift rotate-90 lg:rotate-0"
            style={{ color: "#EF9F27" }}
          />
        </div>

        {/* Blueprint card */}
        <div
          className="w-full lg:flex-1 rounded-xl bg-white p-5"
          style={{ border: "0.5px solid #EF9F27" }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(239,159,39,0.12)", color: "#EF9F27" }}
            >
              Blueprint
            </span>
            <span className="text-xs text-gray-300">Owners &amp; dates to assign</span>
          </div>
          <div className="mb-5">
            <p className="text-base font-medium text-[#1a1a1a]">Finals Night Blueprint</p>
            <p className="text-xs text-gray-300 mt-0.5">Date not set</p>
          </div>
          <div className="flex items-center gap-2 pb-2">
            <span className="flex-1 text-[10px] text-gray-300 uppercase tracking-wider">Task</span>
            <span className="w-16 text-[10px] text-gray-300 uppercase tracking-wider">Owner</span>
            <span className="w-11 text-[10px] text-gray-300 uppercase tracking-wider">Due</span>
            <span className="w-5" />
          </div>
          {SOURCE_TASKS.map((t) => (
            <div key={t.task} className="flex items-center gap-2 py-2.5 border-t border-gray-50">
              <span className="flex-1 text-sm text-[#1a1a1a]">{t.task}</span>
              <span className="w-16 text-xs text-gray-200">—</span>
              <span className="w-11 text-xs text-gray-200">—</span>
              <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0" />
            </div>
          ))}
          <button className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white hover:opacity-80 transition-opacity">
            Use this blueprint <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Slide: Timeline ───────────────────────────────────────────────

function TimelineSlide() {
  const maxLoad = Math.max(...WEEK_LOAD);
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Task schedule — Finals Night 2025
        </p>
        <div className="space-y-2.5">
          {GANTT_TASKS.map((task, i) => (
            <div key={task.name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-right text-[11px] text-gray-400 truncate">
                {task.name}
              </span>
              <div className="relative flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden">
                <div
                  className="absolute h-full rounded-sm bg-[#1a1a1a]"
                  style={{ left: `${task.start}%`, width: `${task.width}%`, opacity: 1 - i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Task density by week
        </p>
        <div className="flex items-end gap-1.5 h-20">
          {WEEK_LOAD.map((load, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="w-full rounded-t-sm bg-[#1a1a1a]"
                style={{
                  height: `${(load / maxLoad) * 100}%`,
                  opacity: 0.25 + (load / maxLoad) * 0.75,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-gray-400">10 wks out</span>
          <span className="text-[10px] text-gray-400">Event day</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "28", label: "tasks auto-scheduled" },
          { value: "7", label: "stakeholders notified" },
          { value: "0", label: "conflicts detected" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl bg-white px-3 py-4 text-center"
            style={{ border: "0.5px solid #e8e8e8" }}
          >
            <p className="text-2xl font-medium text-[#1a1a1a]">{value}</p>
            <p className="mt-1 text-[10px] text-gray-400 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Vendors ────────────────────────────────────────────────

function VendorSlide() {
  const [openId, setOpenId] = useState<string | null>(null);
  const vendor = VENDORS_DATA.find((v) => v.id === openId) ?? null;

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "0.5px solid #e8e8e8" }}>
      <div
        className="flex border-b border-gray-100 overflow-x-auto"
        style={{ background: "rgba(0,0,0,0.015)" }}
      >
        {["Overview", "Timeline", "Stakeholders", "Files"].map((tab) => (
          <button
            key={tab}
            className={`shrink-0 px-4 py-3 text-xs font-medium transition-colors ${
              tab === "Stakeholders"
                ? "-mb-px border-b-2 border-[#1a1a1a] bg-white text-[#1a1a1a]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Last Event
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {VENDORS_DATA.map((v) => (
                <tr
                  key={v.id}
                  className={`border-t border-gray-50 transition-colors ${
                    openId === v.id ? "bg-gray-50" : "hover:bg-gray-50/60"
                  }`}
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                    {v.name}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">{v.role}</td>
                  <td className="hidden md:table-cell px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                    {v.lastEvent}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {v.email}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setOpenId(openId === v.id ? null : v.id)}
                      className="text-xs font-medium text-gray-400 hover:text-[#1a1a1a] transition-colors whitespace-nowrap"
                    >
                      {openId === v.id ? "Close ×" : "View record →"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel */}
        <div
          className="overflow-hidden shrink-0 border-l border-gray-100 transition-all duration-300"
          style={{ width: openId ? "224px" : "0px" }}
        >
          {vendor && (
            <div className="w-56 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{vendor.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{vendor.role}</p>
                </div>
                <button
                  onClick={() => setOpenId(null)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Rating
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      style={{
                        fill: i <= vendor.rating ? "#EF9F27" : "transparent",
                        color: i <= vendor.rating ? "#EF9F27" : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Notes — {vendor.lastEvent}
                </p>
                <p className="text-xs text-[#1a1a1a] leading-relaxed">{vendor.notes}</p>
              </div>

              <button className="w-full rounded-lg bg-[#1a1a1a] text-white text-xs font-medium py-2.5 hover:opacity-80 transition-opacity">
                Re-invite to event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slide: Risk Alerts ────────────────────────────────────────────

function RiskSlide() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "0.5px solid #e8e8e8" }}>
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
          Risk panel — Finals Night 2025
        </p>
      </div>
      {RISKS_DATA.map((risk, i) => {
        const s = SEVERITY[risk.severity];
        const isOpen = expanded === risk.id;
        return (
          <div key={risk.id}>
            <div
              className={`flex items-start gap-3 px-5 py-4 ${i > 0 ? "border-t border-gray-100" : ""}`}
              style={{ background: s.bg }}
            >
              <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: s.dot }} />
              <p className="flex-1 min-w-0 text-sm text-[#1a1a1a] leading-snug">{risk.text}</p>
              <button
                onClick={() => setExpanded(isOpen ? null : risk.id)}
                className="ml-2 shrink-0 text-xs font-medium text-gray-400 hover:text-[#1a1a1a] transition-colors whitespace-nowrap"
              >
                {isOpen ? "Hide" : "View details"}
              </button>
            </div>
            <div
              className="overflow-hidden"
              style={{ maxHeight: isOpen ? "240px" : "0px", transition: "max-height 0.3s ease" }}
            >
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
                <p className="text-sm text-[#1a1a1a] leading-relaxed">{risk.note}</p>
                <div className="flex flex-wrap gap-5 text-xs text-gray-400">
                  <span>{risk.date}</span>
                  <span>Flagged by {risk.flaggedBy}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Slide: Roles ──────────────────────────────────────────────────

function RolesSlide() {
  const [selectedRole, setSelectedRole] = useState("exec");
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const toggle = (perm: string) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [perm]: !prev[selectedRole][perm] },
    }));
  };

  const role = ROLES_DATA.find((r) => r.id === selectedRole)!;
  const perms = permissions[selectedRole];

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ border: "0.5px solid #e8e8e8" }}>
      <div className="flex flex-col md:flex-row">
        {/* Role list */}
        <div className="md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Roles</p>
          </div>
          {ROLES_DATA.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`w-full px-4 py-4 text-left transition-colors ${i > 0 ? "border-t border-gray-50" : ""} ${
                selectedRole === r.id ? "bg-gray-50" : "hover:bg-gray-50/50"
              }`}
            >
              <p
                className={`text-sm font-medium ${selectedRole === r.id ? "text-[#1a1a1a]" : "text-gray-500"}`}
              >
                {r.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{r.access}</p>
              <div className="flex items-center mt-2">
                {r.initials.slice(0, 3).map((init, j) => (
                  <div
                    key={init}
                    className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center"
                    style={{ marginLeft: j > 0 ? "-5px" : "0", zIndex: 3 - j }}
                  >
                    <span className="text-[8px] font-semibold text-gray-500">{init[0]}</span>
                  </div>
                ))}
                {r.members > 3 && (
                  <span className="ml-2 text-[10px] text-gray-400">+{r.members - 3}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Permissions */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              {role.name}
            </p>
            <button className="text-xs font-medium text-gray-400 hover:text-[#1a1a1a] transition-colors">
              Edit role
            </button>
          </div>

          <div className="px-5 py-5 flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-4">
              Permissions
            </p>
            <div className="space-y-4">
              {PERM_LABELS.map((perm) => (
                <div key={perm} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#1a1a1a]">{perm}</span>
                  <button
                    onClick={() => toggle(perm)}
                    className="relative h-5 w-9 rounded-full shrink-0 transition-colors duration-200"
                    style={{ background: perms[perm] ? "#1a1a1a" : "#e5e7eb" }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
                      style={{ transform: perms[perm] ? "translateX(16px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              Add member
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name or email address"
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
              />
              <button className="shrink-0 h-9 w-9 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-400">Access granted the moment they join the role.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature slideshow ─────────────────────────────────────────────

const FEATURE_TABS = [
  {
    id: "timeline",
    Icon: Clock,
    label: "Timeline",
    heading: "Every deadline, mapped.",
    sub: "Clone a past blueprint and watch every task auto-shift to your new date.",
    Demo: TimelineSlide,
  },
  {
    id: "vendors",
    Icon: Users,
    label: "Vendors",
    heading: "Every vendor, one tab away.",
    sub: "Your society's full supplier history — notes, ratings, and re-invite in one click.",
    Demo: VendorSlide,
  },
  {
    id: "risk",
    Icon: AlertTriangle,
    label: "Risk Alerts",
    heading: "Risks from last year.",
    sub: "Surfaced before they repeat — flagged, dated, and attributed.",
    Demo: RiskSlide,
  },
  {
    id: "roles",
    Icon: Shield,
    label: "Roles",
    heading: "Set it once.",
    sub: "Access follows the role, not the person. Granted the moment someone joins.",
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

  const current = FEATURE_TABS.find((f) => f.id === active)!;

  return (
    <>
      {/* Tab strip */}
      <div className="border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {FEATURE_TABS.map(({ id, Icon, label }, i) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`flex items-center justify-center gap-2.5 py-5 transition-colors ${
                  i > 0 ? "border-l border-gray-100" : ""
                } ${active === id ? "bg-gray-50" : "hover:bg-gray-50/50"}`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${active === id ? "text-[#1a1a1a]" : "text-gray-400"}`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${active === id ? "text-[#1a1a1a]" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide */}
      <section
        className="border-b border-gray-100 py-20"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[2fr_3fr] gap-16 items-start">
          <div className="lg:sticky lg:top-10">
            <h2 className="text-2xl font-medium text-[#1a1a1a] leading-snug">{current.heading}</h2>
            <p className="mt-2 text-gray-400">{current.sub}</p>
          </div>
          <current.Demo />
        </div>
      </section>
    </>
  );
}

// ── Landing ───────────────────────────────────────────────────────

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/login"
            className="text-sm font-medium text-[#1a1a1a] hover:opacity-60 transition-opacity"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <HeroSection />
      <FeatureSlideshow />

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white hover:opacity-80 transition-opacity"
          >
            Open your society <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-gray-400">Free for student societies</p>
        </div>
      </section>
    </div>
  );
}
