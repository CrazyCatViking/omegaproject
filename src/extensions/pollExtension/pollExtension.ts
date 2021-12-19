import { Guild } from "discord.js";
import { BaseExtension } from "../../baseComponents/baseExtension";
import { discord } from "../../discord";
import { useGraphQL } from "../../graphql/useGraphQL";
import { decode } from "../../utility/hashids";
import { IExtensionCommand, IExtensionEvent } from "../../utility/types";
import { PollCommand } from "./commands/pollCommand";
import { ReactionAddEvent } from "./events/reactionAddEvents";
import { numberEmoji } from "./helpers/numberEmoji";
import { IPollMessageData, Poll, PollStatus } from "./poll";

import { ENABLE_POLL_EXTENSION, GET_POLLS } from './gql/pollQueries';

export class PollExtension extends BaseExtension {
    name: string = 'pollExtension';

    protected async init() {
        const { client } = useGraphQL({ dbContext: this.$guildId });
        const guild = await discord.guilds.fetch(`${decode(this.$guildId)}`);

        this.$state.polls = new Map<string, Poll>();

        // This could maybe be moved out to the extension manager...
        const { data: { enablePollExtension } } = await client.mutation({
            mutation: ENABLE_POLL_EXTENSION,
        });

        if (!enablePollExtension) return; // Should somehow handle this and throw error
        
        const res = await client.query({
            query: GET_POLLS,
        });

        const { data } = res;
        const polls = data.polls;

        if (!polls || !guild) return;

        polls.forEach((item: any) => {
            this.$state.polls.set(item.id, new Poll(item.mode, item.id, item.description, item.options, item.status, item.pollMessageData));
            if (!item.pollMessageData || item.status !== PollStatus.Posted) return;
            initPoll(guild, item.pollMessageData);
        });
    }

    commands(): IExtensionCommand[] {
        const pollCommand = new PollCommand({ state: this.$state, guildId: this.$guildId });

        return [
            pollCommand.command,
        ]
    }

    events(): IExtensionEvent[] {
        const reactionAddEvent = new ReactionAddEvent(this.$state);

        return [
            reactionAddEvent.eventHandler,
        ]
    }
}

const initPoll = async (guild: Guild, messageData: IPollMessageData) => {
    const channel = await guild.channels.fetch(messageData.channelId);

    if (!channel?.isText()) return;

    const message = await channel.messages.fetch(messageData.messageId);

    const hasVoted: string[] = [];
    message.reactions.cache.forEach(async (reaction) => {
        if (!reaction.emoji.name || !numberEmoji.includes(reaction.emoji.name)) {
            reaction.remove();
            return;
        }
        //console.log(reaction);
        (await reaction.users.fetch()).forEach((user) => {
            if (user.bot) return;
            if (!hasVoted.includes(user.id)) {
                hasVoted.push(user.id);
                return;
            }
            reaction.users.remove(user.id);
        });
    });
}