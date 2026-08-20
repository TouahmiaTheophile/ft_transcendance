"use client";

import { apiFetch } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './LobbyList.module.css';
import { useTranslation } from '@/app/lib/i18n/useTranslation';

type Lobby = {
    id: string;
    hostId: number;
    maxPlayers: number;
    currentPlayers: number;
};


const LobbyList = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [error, setError] = useState<string | null>(null);

    
    const loadLobbies = useCallback(() => {
        apiFetch("/lobby/joinable?limit=20")
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setLobbies(data) })
    }, []);
        
    const joinLobby = (lobbyId: string) => {
        apiFetch("/lobby/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lobbyId }) })
        .then(async res => {
            if (res.ok) {
                setError(null)
                router.push(`/dashboard/online/lobby/${lobbyId}`)
            } else {
                const err = await res.json().catch(() => null)
                if (err?.message?.includes("already are in this lobby")) {
                    setError(null)
                    router.push(`/dashboard/online/lobby/${lobbyId}`)
                    return
                }
                setError(t("online.errors.joinFailed"))
                loadLobbies()
            }
        })
    }

    const createLobby = () => {
        apiFetch("/lobby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        .then(async res => {
            if (res.ok) {
                setError(null)
                const data = await res.json().catch(() => null)
                if (data?.id) {
                    router.push(`/dashboard/online/lobby/${data.id}`)
                }
            } else {
                setError(t("online.errors.createFailed"))
                loadLobbies()
            }
        })
    }

    useEffect(() => {
        loadLobbies();
        const id = setInterval(loadLobbies, 3000)
        return () => clearInterval(id)
    }, [loadLobbies]);

  return (
    <div className={styles.section}>
        <h2 className={styles.title}>{t("online.lobbyListTitle")}</h2>
        {error && <p className={styles.error}>{error}</p>}
        {lobbies.length === 0 && (
            <p className={styles.empty}>{t("online.noLobbies")}</p>
        )}
        {lobbies.map(l => (
            <div key={l.id} className={styles.row}>
                <span>{t("online.lobby")}</span>
                <span className={styles.count}>{l.currentPlayers}/{l.maxPlayers}</span>
                <button onClick={() => joinLobby(l.id)} className={styles.joinBtn}>
                    {t("online.join")}
                </button>
            </div>
        ))}
        <button onClick={() => createLobby()} className={styles.createBtn}>
            {t("online.createLobby")}
        </button>
    </div>
  )
}

export default LobbyList