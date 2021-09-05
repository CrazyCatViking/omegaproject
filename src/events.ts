import { Client, Guild, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, User } from "discord.js";
import { GuildManager } from "./guildManager";
import { DiscordEventTypes, IEventPackage } from "./utility/types";

export const events = (client: Client, connectedGuilds: Map<string, GuildManager>) => {
    client.once('ready', () => {
        client.guilds.cache.forEach((guild: Guild) => {
            const newGuild = new GuildManager(guild.id);
            connectedGuilds.set(guild.id, newGuild);
        });
        console.log('Ready');
    });
    
    client.on('guildCreate', (guild) => {
        const newGuild = new GuildManager(guild.id);
        connectedGuilds.set(guild.id, newGuild);
        console.log(connectedGuilds);
    });

    client.on('interactionCreate', (interaction) => {
        const guildId = interaction.guildId;
        if (guildId === null) return;
    
        if (interaction.isCommand() || interaction.isContextMenu()) {
            connectedGuilds.get(guildId)?.interaction(interaction);
        };
    });

    client.on('messageCreate', (message: Message) => {
        const eventPackage: IEventPackage = {
            messages: [
                message,
            ],
        }

        const guildId = message.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
            console.log("Event fireing");
            connectedGuilds.get(guildId)?.event(DiscordEventTypes.MessageCreate, eventPackage); 
        }
    });

    client.on('messageDelete', (message: Message | PartialMessage) => {
        const eventPackage: IEventPackage = {
            messages: [
                message,
            ],
        }

        const guildId = message.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
            connectedGuilds.get(guildId)?.event(DiscordEventTypes.MessageDelete, eventPackage); 
        }
    });

    client.on('messageUpdate', (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
        const eventPackage: IEventPackage = {
            messages: [
                oldMessage,
                newMessage,
            ],
        }

        const guildId = newMessage.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
            connectedGuilds.get(guildId)?.event(DiscordEventTypes.MessageUpdate, eventPackage); 
        }
    });

    client.on('messageReactionAdd', (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        const eventPackage: IEventPackage = {
            reactions: [
                reaction,
            ],
            users: [
                user,
            ]
        }

        const guildId = reaction.message.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
            connectedGuilds.get(guildId)?.event(DiscordEventTypes.MessageReactionAdd, eventPackage); 
        }
    });

    client.on('messageReactionRemove', (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        const eventPackage: IEventPackage = {
            reactions: [
                reaction,
            ],
            users: [
                user,
            ]
        }

        const guildId = reaction.message.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
            connectedGuilds.get(guildId)?.event(DiscordEventTypes.MessageReactionRemove, eventPackage); 
        }
    });
}