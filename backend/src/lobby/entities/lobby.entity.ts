import { ApiErrors } from "src/common/errors/api-exceptions.helper";

export class Lobby {
  readonly id = crypto.randomUUID();
  status: LobbyStatus = 'open';
  private readonly _players = new Set<number>();

  constructor(
    private _hostId: number,
    public readonly maxPlayers: number = 4,
  ) {
    this._players.add(_hostId);
  }

  get players(): number[] {
    return Array.from(this._players.values());
  }

  join(userId: number) {
	if (this._players.has(userId))
	  throw ApiErrors.conflict("You already are in this lobby");

    if (this.status !== 'open')
      throw ApiErrors.conflict('Lobby is not open');

    if (this._players.size >= this.maxPlayers)
      throw ApiErrors.conflict('Lobby is full');

    this._players.add(userId);
  }

// ---------- This method call can result in an empty lobby -------------------
// ----------   caller must check the returned              -------------------
// ----------     value to delete it eventually             -------------------
  leave(userId: number) : boolean {
    if (!this._players.delete(userId))
      throw ApiErrors.conflict("You can't leave this lobby because you're not a participant");
    if (this.isEmpty())
      return true;

    if (this._hostId === userId) {
      this.switchHost();
    }

    return false;
  }

  eject(ejecterId: number, ejectedId: number) : boolean {
  	if (ejectedId === this._hostId)
  	  throw ApiErrors.conflict("Host cannot be ejected");
  	if (!this.isHost(ejecterId))
  	  throw ApiErrors.conflict("You need to be the host of this lobby to eject someone");
      if (!this._players.has(ejectedId))
        throw ApiErrors.conflict("The user you tried to eject is not in this lobby");

      // Since host can't be ejected and is replaced when leaving,
  	return this.leave(ejectedId);   // this can not result in an empty lobby for now
  }

  switchHost() {
    const next = this._players.values().next().value;
    if (next === undefined)
      throw new Error("Attempt to switch host on an empty lobby");
    this._hostId = next;
  }

  assertCanStart(requesterId: number) {
    if (!this.isHost(requesterId))
      throw ApiErrors.forbidden("Only the host can start the game");

    if (this.status !== 'open' && this.status !== 'locked')
      throw ApiErrors.conflict("Lobby is not startable");
  }

  assertCanInvite(requesterId: number, targetId: number) {
    if (!this.players.includes(requesterId))
      throw ApiErrors.forbidden("Cannot invite player. You are not in this lobby");
    if (this.players.includes(targetId))
      throw ApiErrors.conflict("Cannot invite player. He is already in this lobby");
  }

  contains(userId: number) : boolean { return this._players.has(userId); }
  isEmpty() : boolean { return this._players.size === 0; }
  isHost(userId: number) : boolean { return this._hostId === userId; }

  lock() { this.status = 'locked'; }
  inGame() { this.status = 'in-game'; }

  get hostId() : number { return this._hostId }
}

export type LobbyStatus =
  | 'open'
  | 'locked'
  | 'in-game';
