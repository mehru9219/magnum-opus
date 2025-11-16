import Link from "next/link";
import { Sparkles, FileText, Send, BarChart3, Lightbulb, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold">Magnum Opus</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <NavLink href="/dashboard" icon={<BarChart3 className="h-5 w-5" />}>
              Overview
            </NavLink>
            <NavLink href="/dashboard/generate" icon={<FileText className="h-5 w-5" />}>
              Generate Content
            </NavLink>
            <NavLink href="/dashboard/publish" icon={<Send className="h-5 w-5" />}>
              Publishing
            </NavLink>
            <NavLink href="/dashboard/tracking" icon={<BarChart3 className="h-5 w-5" />}>
              AI Tracking
            </NavLink>
            <NavLink href="/dashboard/opportunities" icon={<Lightbulb className="h-5 w-5" />}>
              Opportunities
            </NavLink>
            <NavLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
              Settings
            </NavLink>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User</p>
                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
