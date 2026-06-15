import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Calendar, MessageSquare, Target, Video, Bot, User } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "메인 홈" },
    { href: "/players", icon: Users, label: "선수 연구실" },
    { href: "/matches", icon: Calendar, label: "경기 연구실" },
    { href: "/community", icon: MessageSquare, label: "야덕 토론장" },
    { href: "/predictions", icon: Target, label: "떡상 예측소" },
    { href: "/highlights", icon: Video, label: "명장면" },
    { href: "/chat", icon: Bot, label: "AI 야구박사" },
    { href: "/mypage", icon: User, label: "마이페이지" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-background text-foreground dark">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 font-bold text-2xl text-primary tracking-tighter uppercase border-b border-border">
          야덕연구소
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                location === item.href
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">{children}</div>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex justify-around p-2 z-50">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
              location === item.href ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
