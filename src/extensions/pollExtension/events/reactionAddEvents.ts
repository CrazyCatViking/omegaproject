import { BaseEvent } from "../../../baseComponents/baseEvent";
import { DiscordEventTypes, IEventPackage, IExtensionEvent } from "../../../utility/types";
import { numberEmoji } from "../helpers/numberEmoji";
import { Poll, PollModes } from "../poll";

export class ReactionAddEvent extends BaseEvent {
    protected template(): IExtensionEvent {
        return {
            event: DiscordEventTypes.MessageReactionAdd,
            method: this.methods.reactionAdd,
        }
    }

    private methods = {
        reactionAdd: (eventPackage: IEventPackage) => {
            const reactions = eventPackage.reactions;
            const users = eventPackage.users;

            if (!reactions?.length || !users?.length) return;

            const reaction = reactions[0]; 
            const user = users[0];

            if (user.bot) return;

            const reactionManager = reaction.message.reactions;
            const messageId = reaction.message.id;
            let poll: Poll = {} as Poll;

            this.$state.polls.forEach((item: Poll) => {
                if (item.getPollMessageData()?.messageId === messageId) poll = item;
            });

            if (!poll) return;

            if (reaction.emoji.name && !numberEmoji.includes(reaction.emoji.name)) return;
            if (poll.pollMode === PollModes.MultiVote) return;
            
            reactionManager.cache.forEach((item) => {
                if (item.emoji.name === reaction.emoji.name) return;
                if (!item.users.cache.has(user.id)) return;
                item.users.remove(user.id);
            });
        },
    }
}