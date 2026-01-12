"use client";

import { ProfileMenu } from "@/components/layout/ProfileMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Bot,
  Sparkles,
  Users,
  Medal,
  Database,
  Swords,
  MessageCircleHeart,
  Rocket,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const logoImage = "/logo.webp";

type SidebarItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  onbordaId?: string;
};

const mainItems: SidebarItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Practice Zone",
    url: "/practice",
    icon: Trophy,
    onbordaId: "onborda-practice-link",
  },
  {
    title: "Project Arcade",
    url: "/projects",
    icon: Rocket,
    onbordaId: "onborda-projects-link",
  },
  {
    title: "Matching Zone",
    url: "/matching",
    icon: Sparkles,
    onbordaId: "onborda-matching-link",
  },
  // { title: "AI Career Coach", url: "/ai-career-coach", icon: Bot, onbordaId: "onborda-coach-link" },
  // {
  //   title: "AI Database",
  //   url: "/ai-database",
  //   icon: Database,
  //   onbordaId: "onborda-database-link",
  // },
];

const engagementItems: SidebarItem[] = [
  // { title: "Duels", url: "/duels", icon: Swords, onbordaId: "onborda-duels-link" },
];

const communityItems: SidebarItem[] = [
  { title: "Leaderboard", url: "/leaderboard", icon: Medal },
  { title: "Community", url: "/community", icon: Users },
  // {
  //   title: "Duels",
  //   url: "/duels",
  //   icon: Swords,
  //   onbordaId: "onborda-duels-link",
  // },
];

const aiItems: SidebarItem[] = [
  { title: "Spiral Study Buddy", url: "/spiral-the-study-buddy", icon: Bot },
  { title: "Custom GPTs", url: "/custom-gpts", icon: Bot },
  { title: "AI Platforms", url: "/platform-gpts", icon: Sparkles },
];

const careItems: SidebarItem[] = [
  { title: "Feedback", url: "/feedback", icon: MessageCircleHeart },
];

export function AppSidebar() {
  const location = usePathname();
  const { toggleSidebar, state } = useSidebar();

  const renderItems = (items: SidebarItem[]) => {
    return items.map((item) => {
      const isActive = location === item.url;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            id={item.onbordaId}
            data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            className={cn(
              "h-10 px-2 transition-all duration-200 rounded-xl border-2 border-transparent",
              "hover:bg-slate-100 hover:border-slate-200 font-semibold",
              isActive
                ? "bg-blue-50 text-blue-500 border-blue-200 border-b-4 font-extrabold"
                : "text-slate-500"
            )}
          >
            <Link href={item.url} className="flex items-center gap-1">
              <item.icon
                className={cn(
                  "w-6 h-6 stroke-[2.5]",
                  isActive ? "text-blue-500" : "text-slate-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-blue-500" : "text-slate-500"
                )}
              >
                {item.title}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white border-r-2 border-slate-200 px-0 mx-0"
    >
      <SidebarHeader className="border-b-2 border-slate-100 bg-white px-2 py-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center">
          <Link
            href="/"
            data-testid="sidebar-logo"
            className="group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden"
          >
            <div className="flex items-center gap-2 px-1 cursor-pointer group/logo">
              <img
                src={logoImage}
                alt="TrainingX.AI Logo"
                className="h-12 w-auto transition-transform group-hover/logo:scale-105 duration-200"
              />
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            data-testid="sidebar-toggle"
            className={cn(
              "p-2 rounded-lg transition-all duration-200 shrink-0",
              "hover:bg-slate-100 active:bg-slate-200",
              "text-slate-500 hover:text-slate-700",
              "border border-transparent hover:border-slate-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            )}
            title={
              state === "expanded" ? "Minimize sidebar" : "Maximize sidebar"
            }
            aria-label={
              state === "expanded" ? "Minimize sidebar" : "Maximize sidebar"
            }
          >
            {state === "expanded" ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white px-1 py-0 gap-3 pt-4">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Engagement
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(engagementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        <SidebarGroup className="py-0" id="onborda-community-section">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(communityItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0" id="onborda-aitools-section">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            AI Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(aiItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0" id="onborda-feedback-section">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Care
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(careItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-slate-100 bg-white px-2 py-3">
        <ProfileMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
