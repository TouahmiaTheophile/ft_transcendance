"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import FriendList from "./components/FriendList"
import AddFriend from "./components/AddFriend"
import ChatPanel from "./components/ChatPanel"

type Friend = {
  id: number
  friend: {
    id: number;
    username: string;
    avatarUrl: string | null
  }
}

export default function SocialPage() {
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    apiFetch("/friends")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setFriends(data) })
  }, [])

  const friendIds = new Set(friends.map(f => f.friend.id))

  return (
    <div className="min-h-screen p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      <section className="flex flex-col gap-4">
        <FriendList friends={friends} />
        <AddFriend friendIds={friendIds} />
      </section>

      <section className="lg:col-span-2">
        <ChatPanel />
      </section>

    </div>
  )
}
