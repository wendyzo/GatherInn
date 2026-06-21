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
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-30 border-b border-sidebar-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/dashboard" className="group flex items-center gap-2">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-2">
            {!onDashboard && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <span className="hidden px-3 text-xs text-sidebar-foreground/70 sm:inline">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={async () => {
                await signOut();
                nav({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
