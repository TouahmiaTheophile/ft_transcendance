"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import Avatar from "./components/Avatar"
import FriendList from "./components/FriendList"
import PendingRequests from "./components/PendingRequests"
import AddFriend from "./components/AddFriend"
import ChatPanel from "./components/ChatPanel"

type User = {
  id: number
  username: string
  avatarUrl: string | null
}

type Friend = {
  id: number
  friend: User
}

type Conversation = {
  id: number
  friend: User
}

type PendingRequest = {
  id: number
  requester: User
}

export default function SocialPage() {
  const [me, setMe] = useState<User | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const loadFriends = useCallback(() => {
    apiFetch("/friends")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setFriends(data) })
  }, [])

  const loadConversations = useCallback(() => {
    apiFetch("/conversations")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setConversations(data) })
  }, [])

  const loadPending = useCallback(() => {
    apiFetch("/friends/pending")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPending(data) })
  }, [])

  useEffect(() => {
    apiFetch("/users/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setMe(data) })
    loadFriends()
    loadPending()
    loadConversations()
  }, [loadFriends, loadPending, loadConversations])

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const friendIds = new Set(friends.map(f => f.friend.id))


  return (
    <div className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      <section className="flex flex-col gap-4 lg:h-[calc(100vh-3rem)]">
        {me && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
            <Avatar username={me.username} avatarUrl={me.avatarUrl} size={40} />
            <span className="text-white font-semibold">{me.username}</span>
            <button
              onClick={logout}
              className="ml-auto text-sm text-blue-200/70 hover:text-blue-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <FriendList
            friends={friends}
            onConversationSelect={(friendId) => {
              const convo = conversations.find(c => c.friend.id === friendId)
              if (convo) setSelectedConversation(convo)
            }}
          />
        </div>
        <PendingRequests
          requests={pending}
          onResolved={() => { loadPending(); loadFriends() }}
        />
        <AddFriend friendIds={friendIds} meId={me?.id ?? null} />
      </section>

      <section className="lg:col-span-2 lg:h-[calc(100vh-3rem)]">
        <ChatPanel conversation={selectedConversation} meId={me?.id ?? null} />
      </section>

    </div>
  )
}
