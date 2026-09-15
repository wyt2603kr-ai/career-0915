import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  Users, 
  FileText, 
  Award, 
  FolderGit2
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "개요", icon: LayoutDashboard },
  { path: "/companies", label: "지원 기업", icon: Building2 },
  { path: "/tasks", label: "할 일", icon: CheckSquare },
  { path: "/interviews", label: "면접 일정", icon: Users },
  { path: "/cover-letters", label: "자기소개서", icon: FileText },
  { path: "/certificates", label: "자격증", icon: Award },
  { path: "/portfolio", label: "포트폴리오", icon: FolderGit2 },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm">
              <span className="text-sidebar-primary-foreground font-bold leading-none">J</span>
            </div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">취준 대시보드</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="h-14 flex-shrink-0 border-b bg-card flex items-center px-4 md:hidden z-10 relative">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold leading-none">J</span>
            </div>
            <h1 className="text-base font-bold">취준 대시보드</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
