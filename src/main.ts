import { Guild } from 'discord.js';
import { discord } from './discord';
import { events } from './events';
import { GuildManager } from './guildManager';

const connectedGuilds: Map<string, GuildManager> = new Map();
const client = discord;

client.once('ready', () => {
    client.guilds.cache.forEach((guild: Guild) => {
        const newGuild = new GuildManager(guild.id);
        connectedGuilds.set(guild.id, newGuild);
    });
    events(client, connectedGuilds);
    console.log('Ready');
});