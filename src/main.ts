import { discord } from './discord';
import { events } from './events';
import { GuildManager } from './guildManager';

const connectedGuilds: Map<string, GuildManager> = new Map();
const client = discord;

events(client, connectedGuilds);