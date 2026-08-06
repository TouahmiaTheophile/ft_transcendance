"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import { getSocket } from "@/app/lib/socket"
import Avatar from "./components/Avatar"
import FriendList from "./components/FriendList"
import PendingRequests from "./components/PendingRequests"
import AddFriend from "./components/AddFriend"
import ChatPanel from "./components/ChatPanel"
import ProfileModal from "./components/ProfileModal"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type User = {
  id: number
  username: string
  avatarUrl: string | null
  email?: string | null
  // -rbauerMod2- Only present when this User object came from GET
  // /users/me (your own, private profile) -- other users' objects
  // (friends, chat...) never carry an age, the same way they never carry
  // an email. `null` means the account exists but never set an age
  // (created before this field did).
  age?: number | null
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
  const { t } = useTranslation()
  const [me, setMe] = useState<User | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [profile, setProfile] = useState<{ kind: "me" } | { kind: "user"; user: User } | null>(null)
  const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set())

  const loadMe = useCallback(() => {
    apiFetch("/users/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setMe(data) })
  }, [])

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

  const loadOnline = useCallback(() => {
    apiFetch("/friends/online")
      .then(res => res.ok ? res.json() : null)
      .then((data: number[] | null) => { if (data) setOnlineIds(new Set(data)) })
  }, [])

  useEffect(() => {
    loadMe()
    loadFriends()
    loadPending()
    loadConversations()
    loadOnline()
  }, [loadMe, loadFriends, loadPending, loadConversations, loadOnline])

  // live online/offline updates for friends
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onStatus = ({ userId, status }: { userId: number; status: "online" | "offline" }) => {
      setOnlineIds(prev => {
        const next = new Set(prev)
        if (status === "online") next.add(userId)
        else next.delete(userId)
        return next
      })
    }

    socket.on("friend:status", onStatus)
    return () => { socket.off("friend:status", onStatus) }
  }, [])

  const removeFriend = async (friendshipId: number) => {
    const res = await apiFetch(`/friends/${friendshipId}`, { method: "DELETE" })
    if (!res.ok) return

    // the conversation is gone too (deleted in cascade with the friendship),
    // so close the chat panel if it was the one being displayed
    const removed = friends.find(f => f.id === friendshipId)
    setSelectedConversation(prev => prev?.friend.id === removed?.friend.id ? null : prev)
    loadFriends()
    loadConversations()
  }

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const friendIds = new Set(friends.map(f => f.friend.id))


  return (
    <div className="min-h-screen flex flex-col pt-10 px-4 pb-4 gap-6">
      <Link
        href="/dashboard"
        aria-label={t("common.backToDashboardAria")}
        className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
      >
        <span className="text-lg leading-none">←</span>
        {t("common.backToDashboard")}
      </Link>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">

      <section className="flex flex-col gap-4 min-h-0 lg:h-full">
        {me && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setProfile({ kind: "me" })}
              className="flex items-center gap-3 hover:opacity-80 cursor-pointer"
            >
              <Avatar username={me.username} avatarUrl={me.avatarUrl} size={40} />
              <span className="text-white font-semibold">{me.username}</span>
            </button>
            <button
              onClick={logout}
              className="ml-auto text-sm text-blue-200/70 hover:text-blue-200 cursor-pointer"
            >
              {t("common.logout")}
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <FriendList
            friends={friends}
            onlineIds={onlineIds}
            onConversationSelect={(friendId) => {
              const convo = conversations.find(c => c.friend.id === friendId)
              if (convo) setSelectedConversation(convo)
            }
          }
            onRemove={removeFriend}
          />
        </div>
        <PendingRequests
          requests={pending}
          onResolved={() => { loadPending(); loadFriends() }}
        />
        <AddFriend friendIds={friendIds} meId={me?.id ?? null} />
      </section>

      <section className="lg:col-span-2 min-h-0 lg:h-full">
        <ChatPanel
          conversation={selectedConversation}
          meId={me?.id ?? null}
          onViewProfile={(user) => setProfile({ kind: "user", user })}
        />
      </section>

      </div>

      {profile && me && (
        <ProfileModal
          user={profile.kind === "me" ? me : profile.user}
          isMe={profile.kind === "me"}
          onClose={() => setProfile(null)}
          onUpdated={loadMe}
        />
      )}

    </div>
  )
}
