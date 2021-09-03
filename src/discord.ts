import { Client, CommandInteraction, Guild, IntentsString, Interaction, Message} from 'discord.js';
import { GuildManager } from './guildManager';

const INTENTS: IntentsString[] = [
    "GUILDS",
    "GUILD_BANS",
    "GUILD_INTEGRATIONS",
    "GUILD_WEBHOOKS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGE_TYPING",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING"
]

export const connectedGuilds: Map<string, GuildManager> = new Map();
export const discord = new Client({intents: INTENTS});

discord.login(process.env.DISCORD_TOKEN);

discord.once('ready', () => {
    discord.guilds.cache.forEach((guild: Guild) => {
        const newGuild = new GuildManager(guild.id);
        connectedGuilds.set(guild.id, newGuild);
    });
    console.log('Ready');
});

discord.on('guildCreate', (guild) => {
    const newGuild = new GuildManager(guild.id);
    connectedGuilds.set(guild.id, newGuild);
    console.log(connectedGuilds);
});

discord.on('interactionCreate', (interaction) => {
    const guildId = interaction.guildId;
    if (guildId === null) return;

    if (interaction.isCommand()) {
        connectedGuilds.get(guildId)?.commandInteraction(interaction);
    }
})
