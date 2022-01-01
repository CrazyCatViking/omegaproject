import { Guild } from 'discord.js';
import { discord } from './discord';
import { events } from './events';
import { GuildManager } from './managers/guildManager';
import { IErrorContext, logError } from './sentry';

const connectedGuilds: Map<string, GuildManager> = new Map();
const client = discord;

client.once('ready', () => {
    client.guilds.cache.forEach((guild: Guild) => {
        try {
            const newGuild = new GuildManager(guild);
            connectedGuilds.set(guild.id, newGuild);
        } catch (e) {
            const context: IErrorContext = {
                name: 'Client startup',
                ctx: null,
            }
            
            logError(e, context);
        }
    });
    events(client, connectedGuilds);
    console.log('Ready');
});