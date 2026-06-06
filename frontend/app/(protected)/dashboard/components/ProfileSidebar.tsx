"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Circle, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"

type User = {
  username: string
}

type Friend = {
  id: number
  username: string
  online: boolean
}

const ProfileSidebar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    fetch("http://localhost:3000/users/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCurrentUser(data))

    fetch("http://localhost:3000/friends", { credentials: "include" })
      .then(res => res.json())
      .then(data => setFriends(data))
  }, [])

  return (
    <Sidebar side="right">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white">
              {currentUser.username[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold">{currentUser.username}</p>
          </div>
        ) : (
          <p className="text-sm text-sidebar-foreground/50">Loading...</p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h2 className="text-lg font-bold">Friends</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {friends.map((friend) => (
                <SidebarMenuItem key={friend.id}>
                  <SidebarMenuButton className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-current text-gray-500" />
                    <span>{friend.username}</span>
                    <button className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">
                      Invite
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {friends.length === 0 && (
                <p className="text-xs text-sidebar-foreground/50 px-2 py-1">
                  No friends yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-cyan-400/30 text-sm text-cyan-400 hover:bg-cyan-400/10 transition-all">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default ProfileSidebar