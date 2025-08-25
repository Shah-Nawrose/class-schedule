import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { InstallPrompt } from "../InstallPrompt";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppFooter } from "../footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <div className="flex flex-1 w-full">
          <AppSidebar />

          {/* Main content with header + children */}
          <main className="flex-1 flex flex-col">
            <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center gap-3">
                <Link to="/">
                  <div className="h-20 w-30 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </Link>
              </div>
            </header>

            {/* content grows and pushes footer down */}
            <div className="flex-1 p-6">{children}</div>

            {/* footer now sits inside main flex flow */}
            <AppFooter />
          </main>
        </div>

        <InstallPrompt />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
