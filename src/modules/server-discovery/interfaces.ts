import { URIComponents } from 'uri-js';

export interface ServersResponse {
  servers: RawServer[];
}

export interface RawServer {
  addresses: string[];
  location: string;
  info: RawServerInfo;
}

interface RawServerInfo {
  maxClients: number;
  maxPlayers: number;
  passworded: boolean;
  gameType: string;
  name: string;
  map: RawMapInfo;
  version: string;
  clientScoreKind: string;
  requiresLogin: boolean;
  clients: RawClient[];
}

interface RawMapInfo {
  name: string;
  sha256?: string;
  size?: number;
}

interface RawClient {
  name: string;
  clan: string;
  country: number;
  score: number;
  isPlayer: boolean;
  afk: boolean;
  team: number;
  skin: {
    name: string;
    color_body?: number;
    color_feet?: number;
  };
}
