import { discord, connectedGuilds } from './discord';
import { registerDiscordEvents } from './helpers/events';

const guildList = connectedGuilds;
const client = discord;

client.on('interactionCreate', (interaction) => {
    const guildId = interaction.guildId;
    if (guildId === null) return;

    if (interaction.isCommand() || interaction.isContextMenu()) {
        guildList.get(guildId)?.interaction(interaction);
    };
});

registerDiscordEvents(client, guildList);