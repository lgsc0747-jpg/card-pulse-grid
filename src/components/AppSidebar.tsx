import { CreditCard, LayoutDashboard, List, User, Wifi } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "NFC Cards", url: "/cards", icon: CreditCard },
  { title: "Interaction Logs", url: "/logs", icon: List },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Wifi className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            NFC Hub
          </span>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/60 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success pulse-online" />
            <span>System Online</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
