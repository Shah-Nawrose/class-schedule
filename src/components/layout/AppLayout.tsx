import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { InstallPrompt } from "../InstallPrompt";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">CS</span>
              </div>
              <h1 className="text-xl font-semibold bg-primary bg-clip-text text-transparent">
                Class Schedule Planner
              </h1>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
      
      <InstallPrompt />
      <Toaster />
    </SidebarProvider>
  );
}