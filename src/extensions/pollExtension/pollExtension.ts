import { Guild } from "discord.js";
import { BaseExtension } from "../../baseComponents/baseExtension";
import { discord } from "../../discord";
import { decode } from "../../utility/hashids";
import { IExtensionCommand, IExtensionEvent, ISessionState } from "../../utility/types";
import { PollCommand } from "./commands/pollCommand";
import { ReactionAddEvent } from "./events/reactionAddEvents";
import { numberEmoji } from "./helpers/numberEmoji";
import { IPollMessageData, IPollStorable, Poll, PollStatus } from "./poll";

export class PollExtension extends BaseExtension {
    name: string = 'pollExtension';
    guildId: string;

    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'extension/pollExtension'});
        this.guildId = guildId;
        this.$state.sessionState.polls = new Map<string, Poll>();
    }

    protected async init() {
        const polls: Map<string, IPollStorable> = new Map(Object.entries(this.$state.sharedState.polls));
        const guild = await discord.guilds.fetch(`${decode(this.guildId)}`);

        if (!polls || !guild) return;

        polls.forEach((item) => {
            this.$state.sessionState.polls.set(item.id, new Poll(item.mode, item.id, item.description, item.options, item.status, item.pollMessageData));
            if (!item.pollMessageData || item.status !== PollStatus.Posted) return;
            initPoll(guild, item.pollMessageData)
        });
    }

    commands(): IExtensionCommand[] {
        const pollCommand = new PollCommand(this.$state);

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