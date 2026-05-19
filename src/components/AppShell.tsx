import { Link, useNavigate, useMatch } from "@tanstack/react-router";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import BrandLogo from "./BrandLogo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const onDashboard = useMatch({ from: "/_authenticated/dashboard", shouldThrow: false });
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-2">
            {!onDashboard && (
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <span className="text-xs text-muted-foreground hidden sm:inline px-3">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
