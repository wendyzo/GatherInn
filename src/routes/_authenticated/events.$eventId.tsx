import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, GripVertical, MapPin, CalendarDays, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/events/$eventId")({ component: RunsheetPage });

type EventDetail = {
  id: string; name: string; description: string | null;
  event_date: string | null; location: string | null;
  status: string; society_id: string;
};
type Block = {
  id: string; title: string; description: string | null;
  start_time: string; duration_minutes: number; position: number;
};

const STATUSES = ["planning", "active", "completed", "cancelled"];

function RunsheetPage() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [societyName, setSocietyName] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // add/edit block dialog
  const [blockDialog, setBlockDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [bTitle, setBTitle] = useState("");
  const [bTime, setBTime] = useState("09:00");
  const [bDur, setBDur] = useState("30");
  const [bDesc, setBDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async () => {
    const { data: ev } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
    if (!ev) return;
    setEvent(ev as EventDetail);
    const [{ data: mem }, { data: soc }, { data: bl }] = await Promise.all([
      supabase.from("society_members").select("role").eq("society_id", ev.society_id).eq("user_id", user!.id).maybeSingle(),
      supabase.from("societies").select("name").eq("id", ev.society_id).maybeSingle(),
      supabase.from("runsheet_blocks").select("*").eq("event_id", eventId).order("position"),
    ]);
    setCanManage(mem?.role === "executive" || mem?.role === "project_owner");
    setSocietyName(soc?.name ?? null);
    setBlocks((bl ?? []) as Block[]);
  };

  useEffect(() => { load(); }, [eventId]);

  /* ---- inline event field updates ---- */
  const saveField = async (field: Partial<EventDetail>) => {
    const { error } = await supabase.from("events").update(field).eq("id", eventId);
    if (error) toast.error(error.message);
    else setEvent((prev) => prev ? { ...prev, ...field } : prev);
  };

  /* ---- block dialog helpers ---- */
  const openAdd = () => {
    setEditingBlock(null);
    setBTitle(""); setBTime("09:00"); setBDur("30"); setBDesc("");
    setBlockDialog(true);
  };
  const openEdit = (b: Block) => {
    setEditingBlock(b);
    setBTitle(b.title); setBTime(b.start_time);
    setBDur(String(b.duration_minutes)); setBDesc(b.description ?? "");
    setBlockDialog(true);
  };

  const saveBlock = async () => {
    if (!bTitle.trim()) return;
    setSaving(true);
    try {
      if (editingBlock) {
        await supabase.from("runsheet_blocks").update({
          title: bTitle, start_time: bTime,
          duration_minutes: Number(bDur) || 30, description: bDesc || null,
        }).eq("id", editingBlock.id);
      } else {
        await supabase.from("runsheet_blocks").insert({
          event_id: eventId, title: bTitle, start_time: bTime,
          duration_minutes: Number(bDur) || 30, description: bDesc || null,
          position: blocks.length,
        });
      }
      setBlockDialog(false);
      load();
    } finally { setSaving(false); }
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("runsheet_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  /* ---- drag and drop ---- */
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx).map((b, i) => ({ ...b, position: i }));
    setBlocks(reordered);
    await Promise.all(reordered.map((b) => supabase.from("runsheet_blocks").update({ position: b.position }).eq("id", b.id)));
  };

  if (!event) return <p className="text-muted-foreground p-6">Loading…</p>;

  return (
    <div className="space-y-8 pb-16">

      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground">
        <Link to="/societies/$societyId" params={{ societyId: event.society_id }} className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> {societyName ?? "Society"}
        </Link>
      </div>

      {/* Event header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <EditableTitle value={event.name} disabled={!canManage} onSave={(v) => saveField({ name: v })} />
          {canManage ? (
            <Select value={event.status} onValueChange={(v) => saveField({ status: v })}>
              <SelectTrigger className="w-36 h-8 text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs capitalize px-2 py-1 rounded-full bg-muted text-muted-foreground">{event.status}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <EditableField
            icon={<CalendarDays className="h-4 w-4" />}
            value={event.event_date ? format(parseISO(event.event_date), "d MMM yyyy") : ""}
            rawValue={event.event_date ?? ""}
            placeholder="Set date"
            type="date"
            disabled={!canManage}
            onSave={(v) => saveField({ event_date: v || null })}
          />
          <EditableField
            icon={<MapPin className="h-4 w-4" />}
            value={event.location ?? ""}
            rawValue={event.location ?? ""}
            placeholder="Add location"
            type="text"
            disabled={!canManage}
            onSave={(v) => saveField({ location: v || null })}
          />
        </div>
      </div>

      {/* Runsheet */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Runsheet</h2>
          {canManage && (
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Add block</Button>
          )}
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center bg-card/50">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No blocks yet.</p>
            {canManage && <button onClick={openAdd} className="mt-2 text-sm text-primary hover:underline">Add the first block</button>}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-0">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    canManage={canManage}
                    onEdit={openEdit}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Add / Edit block dialog */}
      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingBlock ? "Edit block" : "Add block"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="e.g. Registration" autoFocus /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start time</Label><Input type="time" value={bTime} onChange={(e) => setBTime(e.target.value)} /></div>
              <div><Label>Duration (min)</Label><Input type="number" min={1} value={bDur} onChange={(e) => setBDur(e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={bDesc} onChange={(e) => setBDesc(e.target.value)} placeholder="Optional notes…" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog(false)}>Cancel</Button>
            <Button onClick={saveBlock} disabled={saving || !bTitle.trim()}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Sortable block row ---- */
function SortableBlock({ block, canManage, onEdit, onDelete }: {
  block: Block; canManage: boolean;
  onEdit: (b: Block) => void; onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const endTime = (() => {
    const [h, m] = block.start_time.split(":").map(Number);
    const total = h * 60 + m + block.duration_minutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  })();

  return (
    <div ref={setNodeRef} style={style} className="flex gap-0 group">
      {/* Time column */}
      <div className="w-16 shrink-0 pt-4 pr-3 text-right">
        <span className="text-xs font-mono text-muted-foreground">{block.start_time}</span>
      </div>

      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-5">
        <div className="mt-4 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background shrink-0" />
        <div className="flex-1 w-px bg-border min-h-[2rem]" />
      </div>

      {/* Block card */}
      <div className="flex-1 ml-3 mb-1 mt-2">
        <div className="rounded-md border border-border bg-card px-4 py-3 flex items-start gap-3 hover:border-primary/30 transition">
          {canManage && (
            <button {...attributes} {...listeners} className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none">
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{block.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {block.start_time} – {endTime} · {block.duration_minutes} min
            </p>
            {block.description && <p className="text-xs text-muted-foreground mt-1">{block.description}</p>}
          </div>
          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button onClick={() => onEdit(block)} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(block.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Editable title ---- */
function EditableTitle({ value, disabled, onSave }: { value: string; disabled: boolean; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { setEditing(false); if (draft.trim() && draft !== value) onSave(draft.trim()); };

  if (editing) {
    return (
      <input
        ref={ref} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className="font-display text-4xl bg-transparent border-b border-primary outline-none w-full max-w-lg"
      />
    );
  }
  return (
    <h1
      onClick={() => !disabled && setEditing(true)}
      className={`font-display text-4xl leading-tight ${!disabled ? "cursor-text hover:text-primary/80 transition" : ""}`}
    >
      {value}
    </h1>
  );
}

/* ---- Editable inline field (date, location) ---- */
function EditableField({ icon, value, rawValue, placeholder, type, disabled, onSave }: {
  icon: React.ReactNode; value: string; rawValue: string;
  placeholder: string; type: "text" | "date"; disabled: boolean; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rawValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(rawValue); }, [rawValue]);

  const commit = () => { setEditing(false); onSave(draft); };

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {icon}
      {editing ? (
        <input
          ref={ref} type={type} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(rawValue); setEditing(false); } }}
          className="border-b border-primary bg-transparent outline-none text-sm text-foreground w-44"
        />
      ) : (
        <span
          onClick={() => !disabled && setEditing(true)}
          className={`${!disabled ? "cursor-text hover:text-foreground transition" : ""} ${!value ? "italic" : ""}`}
        >
          {value || placeholder}
        </span>
      )}
    </div>
  );
}
