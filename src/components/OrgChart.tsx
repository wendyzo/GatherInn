import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Check, Clock, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { toast } from "sonner";

type OrgPos = {
  id: string;
  title: string;
  tier: "executive" | "project_owner" | "member";
  parent_id: string | null;
  position_order: number;
  description: string | null;
};

type Assignment = {
  id: string;
  position_id: string;
  user_id: string;
  assigned_by: string;
  status: "pending" | "active";
  full_name: string | null;
};

type OrgMember = {
  user_id: string;
  full_name: string | null;
};

const TIER_ORDER = ["executive", "project_owner", "member"] as const;

const TIER_LABELS: Record<string, string> = {
  executive: "Executive",
  project_owner: "Project Owner",
  member: "Member",
};

const TIER_SECTION_LABELS: Record<string, string> = {
  executive: "Leadership",
  project_owner: "Committee",
  member: "Members",
};

const TIER_BADGE_CLASSES: Record<string, string> = {
  executive: "bg-primary/10 text-primary border-primary/20",
  project_owner: "bg-amber-500/10 text-amber-700 border-amber-300/40",
  member: "bg-muted text-muted-foreground border-border",
};

const TIER_PERMISSIONS: Record<string, string[]> = {
  executive: [
    "Create, edit & delete events",
    "Manage society members",
    "Assign & approve org positions",
    "Edit society details",
  ],
  project_owner: [
    "Create & edit events",
    "Manage runsheets, tasks & vendors",
    "Log and resolve event risks",
    "Add society members",
  ],
  member: ["View all society content", "View org structure"],
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface OrgChartProps {
  societyId: string;
  canManage: boolean;
  userId: string;
}

export function OrgChart({ societyId, canManage, userId }: OrgChartProps) {
  const [positions, setPositions] = useState<OrgPos[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addTier, setAddTier] = useState<"executive" | "project_owner" | "member">("member");
  const [addSaving, setAddSaving] = useState(false);

  const [assigningPos, setAssigningPos] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>("");

  const pendingCount = assignments.filter((a) => a.status === "pending").length;

  const load = async () => {
    setLoading(true);
    const { data: pos } = await supabase
      .from("org_positions")
      .select("*")
      .eq("society_id", societyId)
      .order("position_order");

    const posIds = (pos ?? []).map((p) => p.id);

    const [{ data: assignData }, { data: mems }] = await Promise.all([
      posIds.length
        ? supabase
            .from("position_assignments")
            .select("id, position_id, user_id, assigned_by, status")
            .in("position_id", posIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              position_id: string;
              user_id: string;
              assigned_by: string;
              status: string;
            }[],
          }),
      supabase.from("society_members").select("user_id").eq("society_id", societyId),
    ]);

    const allUserIds = [
      ...new Set([
        ...(assignData ?? []).map((a) => a.user_id),
        ...(mems ?? []).map((m) => m.user_id),
      ]),
    ];

    const { data: profiles } = allUserIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", allUserIds)
      : { data: [] as { id: string; full_name: string | null }[] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

    setPositions((pos ?? []) as OrgPos[]);
    setAssignments(
      (assignData ?? []).map((a) => ({
        id: a.id,
        position_id: a.position_id,
        user_id: a.user_id,
        assigned_by: a.assigned_by,
        status: a.status as "pending" | "active",
        full_name: profileMap.get(a.user_id) ?? null,
      })),
    );
    setMembers(
      (mems ?? []).map((m) => ({
        user_id: m.user_id,
        full_name: profileMap.get(m.user_id) ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [societyId]);

  const savePosition = async () => {
    if (!addTitle.trim()) return;
    setAddSaving(true);
    try {
      const { error } = await supabase.from("org_positions").insert({
        society_id: societyId,
        title: addTitle.trim(),
        tier: addTier,
        position_order: positions.length,
      });
      if (error) throw error;
      toast.success("Position added");
      setAddOpen(false);
      setAddTitle("");
      setAddTier("member");
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to add position");
    } finally {
      setAddSaving(false);
    }
  };

  const deletePosition = async (posId: string) => {
    const { error } = await supabase.from("org_positions").delete().eq("id", posId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (expandedId === posId) setExpandedId(null);
    toast.success("Position removed");
    await load();
  };

  const assignMember = async (posId: string) => {
    if (!assignUserId) return;
    const { error } = await supabase.from("position_assignments").upsert(
      {
        position_id: posId,
        user_id: assignUserId,
        assigned_by: userId,
        status: "pending",
      },
      { onConflict: "position_id,user_id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast("Assignment created", { description: "Pending executive approval." });
    setAssigningPos(null);
    setAssignUserId("");
    await load();
  };

  const approveAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from("position_assignments")
      .update({ status: "active" })
      .eq("id", assignmentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment approved");
    await load();
  };

  const removeAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from("position_assignments").delete().eq("id", assignmentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment removed");
    await load();
  };

  if (loading) return <p className="text-muted-foreground text-sm py-8">Loading…</p>;

  const byTier = TIER_ORDER.reduce(
    (acc, tier) => ({ ...acc, [tier]: positions.filter((p) => p.tier === tier) }),
    {} as Record<string, OrgPos[]>,
  );

  return (
    <div className="space-y-8">
      {canManage && pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-amber-300/40 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {pendingCount} assignment{pendingCount > 1 ? "s" : ""} waiting for executive approval —
            expand the card below to approve.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Org Structure</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {positions.length} position{positions.length !== 1 ? "s" : ""} · {members.length} member
            {members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add position
          </Button>
        )}
      </div>

      {positions.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
          {canManage
            ? "No positions yet. Add your first position to start building the org structure."
            : "No org structure has been set up for this society yet."}
        </div>
      )}

      {TIER_ORDER.filter((tier) => byTier[tier]?.length > 0).map((tier) => (
        <div key={tier}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {TIER_SECTION_LABELS[tier]}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byTier[tier].map((pos) => {
              const posAssignments = assignments.filter((a) => a.position_id === pos.id);
              const active = posAssignments.filter((a) => a.status === "active");
              const pending = posAssignments.filter((a) => a.status === "pending");
              const isExpanded = expandedId === pos.id;
              const isAssigning = assigningPos === pos.id;
              const assignedMember = active[0] ?? null;
              const pendingMember = pending[0] ?? null;

              return (
                <div
                  key={pos.id}
                  className={`rounded-lg border bg-card transition-shadow ${
                    isExpanded
                      ? "border-primary/30 shadow-md"
                      : "border-border hover:border-primary/20 hover:shadow-sm"
                  }`}
                >
                  <button
                    className="w-full text-left p-4"
                    onClick={() => setExpandedId(isExpanded ? null : pos.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display text-lg leading-tight">{pos.title}</p>
                        <span
                          className={`mt-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${TIER_BADGE_CLASSES[pos.tier]}`}
                        >
                          {TIER_LABELS[pos.tier]}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {assignedMember ? (
                        <>
                          <Avatar className="h-6 w-6 text-xs">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {getInitials(assignedMember.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {assignedMember.full_name ?? "Unknown"}
                          </span>
                        </>
                      ) : pendingMember ? (
                        <>
                          <Avatar className="h-6 w-6 text-xs">
                            <AvatarFallback className="bg-amber-100 text-amber-700 text-[10px]">
                              {getInitials(pendingMember.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-amber-700">
                            {pendingMember.full_name ?? "Unknown"}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full leading-none">
                            pending
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                            <span className="text-[9px] text-muted-foreground/40">?</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        </>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
                          <Shield className="h-3 w-3" /> Permissions
                        </p>
                        <ul className="space-y-1.5">
                          {(TIER_PERMISSIONS[pos.tier] ?? []).map((perm) => (
                            <li
                              key={perm}
                              className="text-xs text-muted-foreground flex items-start gap-1.5"
                            >
                              <Check className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                              {perm}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {canManage && (
                        <div className="space-y-2 pt-1 border-t border-border">
                          {pending.map((pa) => (
                            <div
                              key={pa.id}
                              className="flex items-center justify-between rounded-md bg-amber-50/60 border border-amber-200/60 px-3 py-2"
                            >
                              <span className="text-xs text-amber-800 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {pa.full_name ?? "Unknown"} — pending
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                                onClick={() => approveAssignment(pa.id)}
                              >
                                Approve
                              </Button>
                            </div>
                          ))}

                          {active.map((aa) => (
                            <div
                              key={aa.id}
                              className="flex items-center justify-between text-xs text-muted-foreground"
                            >
                              <span>{aa.full_name ?? "Unknown"} · active</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeAssignment(aa.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}

                          {isAssigning ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Select value={assignUserId} onValueChange={setAssignUserId}>
                                <SelectTrigger className="h-8 text-xs flex-1">
                                  <SelectValue placeholder="Select member…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {members.map((m) => (
                                    <SelectItem
                                      key={m.user_id}
                                      value={m.user_id}
                                      className="text-xs"
                                    >
                                      {m.full_name ?? m.user_id.slice(0, 8)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="h-8 text-xs px-2 shrink-0"
                                disabled={!assignUserId}
                                onClick={() => assignMember(pos.id)}
                              >
                                Assign
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs px-2 shrink-0"
                                onClick={() => {
                                  setAssigningPos(null);
                                  setAssignUserId("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setAssigningPos(pos.id);
                                  setAssignUserId("");
                                }}
                              >
                                <Plus className="h-3 w-3" /> Assign member
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deletePosition(pos.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Events Director"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && savePosition()}
              />
            </div>
            <div>
              <Label>Permission tier</Label>
              <Select value={addTier} onValueChange={(v) => setAddTier(v as typeof addTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive — full control</SelectItem>
                  <SelectItem value="project_owner">
                    Project Owner — create &amp; manage events
                  </SelectItem>
                  <SelectItem value="member">Member — view only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePosition} disabled={addSaving || !addTitle.trim()}>
              {addSaving ? "Saving…" : "Add position"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
