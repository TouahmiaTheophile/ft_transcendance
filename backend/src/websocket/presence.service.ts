export class PresenceService {
  private connected: Map<number, Set<string>> = new Map();

  connect(userId: number, socketId: string) {
    if (!this.connected.has(userId)) {
      this.connected.set(userId, new Set());
    }

    this.connected.get(userId)!.add(socketId);
  }

  disconnect(userId: number, socketId: string) {
    const set = this.connected.get(userId);
    if (!set) return;

    set.delete(socketId);

    if (set.size === 0) {
      this.connected.delete(userId);
    }
  }

  isOnline(userId: number): boolean {
    return this.connected.has(userId);
  }
}