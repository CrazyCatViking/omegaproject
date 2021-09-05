import { Client, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, User } from "discord.js";
import { GuildManager } from "../guildManager";
import { DiscordEventTypes, IEventPackage } from "../utility/types";

export const registerDiscordEvents = (client: Client, connectedGuilds: Map<string, GuildManager>) => {
    client.on('messageCreate', (message: Message) => {
        const eventPackage: IEventPackage = {
            messages: [
                message,
            ],
        }

        const guildId = message.guildId;
        if (!!guildId && connectedGuilds.has(guildId)) {
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