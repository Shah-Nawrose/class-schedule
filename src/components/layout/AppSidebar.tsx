import { BookOpen, Calendar, Home } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Class Schedule", url: "/schedule", icon: BookOpen },
  { title: "Events", url: "/events", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) =>
    location.pathname === url || location.pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            <span className="font-bold text-lg tracking-wide text-gray-600 uppercase">
              Class schedule
            </span>
          </SidebarGroupLabel>
          <hr className="my-2 border-gray-200" />
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="flex flex-col gap-3">
              {navigation.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title} className="relative">
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative ${
                          active
                            ? "bg-black text-white font-semibold shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-black"
                        }`}
                      >
                        {/* Active left indicator */}
                        {active && !isCollapsed && (
                          <span className="absolute left-0 top-1/4 h-1/2 w-1 bg-blue-500 rounded-r-full transition-all" />
                        )}

                        <item.icon
                          className={`h-6 w-6 transition-colors ${
                            active ? "text-white" : "text-gray-500 group-hover:text-black"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="text-sm md:text-base">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
