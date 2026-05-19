import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown, History, AlertTriangle, Users, ListChecks, Handshake } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Crown className="h-4 w-4" /></span>
          <span className="font-display text-lg">Successor&rsquo;s Blueprint</span>
        </div>
        <Link to="/login" className="text-sm font-medium hover:text-primary">Sign in</Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Institutional memory for societies
          </span>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mt-6">
            Inherit the blueprint. <span className="text-primary">Never plan from zero.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            A society&rsquo;s knowledge shouldn&rsquo;t leave with its outgoing committee. Clone last year&rsquo;s timeline, import vetted vendors, and inherit the risk notes the previous team learned the hard way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Open your society <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium">
              How it works
            </a>
          </div>
        </div>

        <div id="how" className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            { icon: History, title: "Search society history", body: "Browse every event your society has ever run \u2014 finals, galas, hackathons \u2014 with timelines and vendors intact." },
            { icon: ListChecks, title: "Deep-clone the timeline", body: "Pick a new start date and we shift every task deadline accordingly. The Gantt is rebuilt for you." },
            { icon: Handshake, title: "Import vetted vendors", body: "Bring along the lighting crew you trust, the caterer with the 5-star rating, the AV team that delivered." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <h3 className="font-display text-xl mt-4">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border-l-4 border-warning bg-warning/10 p-6 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-warning-foreground shrink-0 mt-0.5" />
          <div>
            <div className="font-display text-lg">Legacy Risk Alerts, surfaced automatically</div>
            <p className="text-sm text-muted-foreground mt-1">
              &ldquo;Note from last year: High-voltage power required for Stage B.&rdquo; Every cloned event opens with the previous year&rsquo;s unresolved risks at the top of the dashboard.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> Role-based: only Executives and Project Owners can view history or create successor events.
        </div>
      </section>
    </div>
  );
}
