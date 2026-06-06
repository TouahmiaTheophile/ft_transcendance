import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ProfileSidebar from "./components/ProfileSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative w-full">
        <div className="absolute top-4 right-4 z-20">
          <SidebarTrigger />
        </div>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </div>
      <ProfileSidebar />
    </SidebarProvider>
  )
}