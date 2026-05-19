import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, ArrowRight, Crown, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type SocietyRow = { id: string; name: string; description: string | null; role: string };

function Dashboard() {
  const { user } = useAuth();
  const [societies, setSocieties] = useState<SocietyRow[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("society_members")
      .select("role, societies (id, name, description)")
      .eq("user_id", user!.id);
    if (error) toast.error(error.message);
    setSocieties(
      (data ?? []).map((r: any) => ({ id: r.societies.id, name: r.societies.name, description: r.societies.description, role: r.role }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("societies").insert({ name, description: desc, created_by: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Society created. You're its Executive.");
    setOpen(false); setName(""); setDesc("");
    load();
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl">Your societies</h1>
          <p className="text-muted-foreground mt-1">Pick a society to view its projects, events, and historical blueprint.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New society</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Start a new society</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="sname">Name</Label><Input id="sname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Photography Society" /></div>
              <div><Label htmlFor="sdesc">Description</Label><Textarea id="sdesc" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : societies.length === 0 ? (
          <div className="md:col-span-3 rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No societies yet. Create one to get started.</p>
          </div>
        ) : societies.map((s) => (
          <Link key={s.id} to="/societies/$societyId" params={{ societyId: s.id }} className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
              <RoleBadge role={s.role} />
            </div>
            <h3 className="font-display text-xl mt-4">{s.name}</h3>
            {s.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
            <div className="mt-4 text-sm text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              Open <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { icon: any; label: string; cls: string }> = {
    executive: { icon: Crown, label: "Executive", cls: "bg-accent/30 text-foreground" },
    project_owner: { icon: Shield, label: "Project Owner", cls: "bg-primary/10 text-primary" },
    member: { icon: Shield, label: "Member", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[role] ?? map.member;
  const Icon = m.icon;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}><Icon className="h-3 w-3" />{m.label}</span>;
}
