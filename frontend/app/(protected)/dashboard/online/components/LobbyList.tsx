import { apiFetch } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './LobbyList.module.css';

type Lobby = {
    id: string;
    hostId: number;
    maxPlayers: number;
    currentPlayers: number;
};


const LobbyList = () => {
    const router = useRouter();
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
                setError(err?.message ?? "Could not join lobby")
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
                const err = await res.json().catch(() => null)
                setError(err?.message ?? "Could not create lobby")
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
        <h2 className={styles.title}>Lobby List</h2>
        {error && <p className={styles.error}>{error}</p>}
        {lobbies.length === 0 && (
            <p className={styles.empty}>No lobbies available.</p>
        )}
        {lobbies.map(l => (
            <div key={l.id} className={styles.row}>
                <span>Lobby</span>
                <span className={styles.count}>{l.currentPlayers}/{l.maxPlayers}</span>
                <button onClick={() => joinLobby(l.id)} className={styles.joinBtn}>
                    Join
                </button>
            </div>
        ))}
        <button onClick={() => createLobby()} className={styles.createBtn}>
            Create Lobby
        </button>
    </div>
  )
}

export default LobbyList