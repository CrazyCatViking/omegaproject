import { CacheType, CommandInteraction, CommandInteractionOptionResolver, Message } from "discord.js";
import { GraphQLClient, useGraphQL } from "../../../graphql/useGraphQL";

import { BaseCommand } from "../../../baseComponents/baseCommand";
import { createDiscordEmbed } from "../../../helpers/createDiscordEmbed";
import { 
    ICommandOptions, 
    IExtensionCommand, 
    IExtensionCommandOption, 
    OptionTypes 
} from "../../../utility/types";
import { numberEmoji } from "../helpers/numberEmoji";
import { Poll, PollStatus } from "../poll";
import { CREATE_POLL, UPDATE_POLL, DELETE_POLL } from "../gql/pollQueries";

enum PollMode {
    SingleVote = 'single-vote',
    MultiVote = 'multi-vote',
}

export class PollCommand extends BaseCommand {
    client: GraphQLClient;

    constructor(options: ICommandOptions) {
        super(options);

        const { client } = useGraphQL({ dbContext: this.$guildId });
        this.client = client;
    }

    template(): IExtensionCommand {
        return {
            name: 'poll',
            description: 'Create and manage polls',
            subCommands: [
                {
                    name: 'create',
                    description: 'Create a new poll with up to 9 options',
                    method: this.methods.pollCreate,
                    options: [
                        this.options.pollMode,
                        this.options.pollId,
                        this.options.pollDescription,
                        
                        this.options.pollOption(1),
                        this.options.pollOption(2),
                        this.options.pollOption(3),
                        this.options.pollOption(4),
                        this.options.pollOption(5),
                        this.options.pollOption(6),
                        this.options.pollOption(7),
                        this.options.pollOption(8),
                        this.options.pollOption(9),
                    ]
                },
                {
                    name: 'post',
                    description: 'Post a poll to the channel the command is called from',
                    method: this.methods.pollPost,
                    options: [
                        this.options.pollId,
                    ]
                },
                {
                    name: 'end',
                    description: 'End a poll in the channel the command is called from',
                    method: this.methods.pollEnd,
                    options: [
                        this.options.pollId,
                    ]
                },
                {
                    name: 'delete',
                    description: 'Delete an unposted poll',
                    method: this.methods.pollDelete,
                    options: [
                        this.options.pollId,
                    ]
                },
                {
                    name: 'list',
                    description: 'List posted and un-posted polls',
                    method: this.methods.pollList,
                },
            ]
        }    
    }

    private methods = {
        pollCreate: async (interaction: CommandInteraction) => {
            const mode = interaction.options.getString('mode');
            const id = interaction.options.getString('id');
            const description = interaction.options.getString('description');

            const options = getOptions(interaction.options);

            if (!mode || !id || !description || !options.length) {
                interaction.reply('One or more of the command inputs were invalid, try again');
                return;
            };

            const poll = new Poll(mode, id, description, options);

            const res = await this.client.mutation({
                mutation: CREATE_POLL,
                variables: {
                    input: poll.storablePoll
                },
            });

            if (!res) {
                interaction.reply(`Poll could not be created, please try again`);
                return;
            }

            this.$state.polls.set(id, poll);
            interaction.reply(`Poll with id: ${id} was successfully created`);
        },
        pollPost: async (interaction: CommandInteraction) => {
            const id = interaction.options.getString('id');
            const channelId = interaction.channelId;

            if (!id) {
                interaction.reply('You must specify a poll id');
                return;
            }

            if (!this.$state.polls.has(id)) {
                interaction.reply(`There is no poll with the id: ${id}`);
                return;
            }

            const poll: Poll = this.$state.polls.get(id);
            const postablePoll = poll.postablePoll;
            const pollOptions = getPostableOptions(postablePoll.options);
            
            const embed = createDiscordEmbed(`**${postablePoll.description}**`, {description: pollOptions});

            await interaction.reply({embeds: [embed]});
            const message = await interaction.fetchReply();
            
            if (!message) {
                interaction.reply('Something went wrong when posting the poll, please try again.');
                return;
            }

            setReactions(message as Message, postablePoll.options);

            poll.pollMessageData = {messageId: message.id, channelId: channelId};
            poll.status = PollStatus.Posted;

            this.client.mutation({
                mutation: UPDATE_POLL,
                variables: {
                    input: poll.storablePoll,
                },
            });
        },
        pollEnd: async (interaction: CommandInteraction) => {
            const id = interaction.options.getString('id');

            if (!id) {
                interaction.reply('You must specify a poll id');
                return;
            }

            if (!this.$state.polls.has(id)) {
                interaction.reply(`There is no poll with the id: ${id}`);
                return;
            }

            if (this.$state.polls.get(id).status !== PollStatus.Posted) {
                interaction.reply(`The poll with id: ${id}, has not been posted yet`);
                return;
            }

            const poll: Poll = this.$state.polls.get(id);
            const messageData = poll.getPollMessageData();

            if (!messageData?.channelId) {
                interaction.reply('The poll message data is not corretly defined. The poll cannot be ended, use /poll delete to remove it.');
                return;
            }

            const channel = await interaction.guild?.channels.fetch(messageData?.channelId);

            if (!channel?.isText()) {
                interaction.reply('Could not find the channel the message was posted in. The poll cannot be ended, use /poll delete to remove it.');
                return;
            }

            const message = await channel.messages.fetch(messageData.messageId);
            const pollResults = getPollResults(message, poll.options);

            const embed = createDiscordEmbed(`**${poll.description}**`, {description: pollResults});
            interaction.reply({embeds: [embed]});

            this.$state.polls.delete(id);

            this.client.mutation({
                mutation: DELETE_POLL,
                variables: { id },
            });
        },
        pollDelete: (interaction: CommandInteraction) => {
            const id = interaction.options.getString('id');

            if (!id) {
                interaction.reply('You must specify a poll id');
                return;
            }

            if (!this.$state.polls.has(id)) {
                interaction.reply(`There is no poll with the id: ${id}`);
                return;
            }

            this.$state.polls.delete(id);

            this.client.mutation({
                mutation: DELETE_POLL,
                variables: { id },
            });

            interaction.reply(`Poll with id: ${id}, has been deleted`);
        },
        pollList: (interaction: CommandInteraction) => {
            let reply = "**These are the posted and un-posted polls:**\n";
            this.$state.polls.forEach((item: Poll) => {
                reply += `**${item.id}:** ${item.description} | Status: ${item.status}\n`
            });

            interaction.reply(reply);
        },
    }

    private options = {
        pollMode: {
            type: OptionTypes.String,
            input: 'mode',
            description: 'Sets the poll mode to single or multivote mode',
            required: true,
            choices: [
                {
                    name: 'singlevote',
                    value: PollMode.SingleVote,
                },
                {
                    name: 'multivote',
                    value: PollMode.MultiVote,
                }
            ]
        },
        pollId: {
            type: OptionTypes.String,
            input: 'id',
            description: 'A unique poll id',
            required: true,
        },
        pollDescription: {
            type: OptionTypes.String,
            input: 'description',
            description: 'A cool description for the poll',
            required: true,
        },
        pollOption: (optNo: number): IExtensionCommandOption => {
            return {
                type: OptionTypes.String,
                input: `option-${optNo}`,
                description: `Option number ${optNo}`,
                required: optNo === 1 ? true : false,
            }
        }
    }
}

const getOptions = (options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">): string[] => {
    const pollOptions = options.data[0].options?.filter(item => item.name.includes('option'));

    if (!!pollOptions?.length) return pollOptions.map(item => item.value as string);
    return [];
}

const getPostableOptions = (pollOptions: string[]): string => {
    const numberEmoji: string[] = ["1⃣", "2⃣", "3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"];
    let polls: string = "";

    pollOptions.forEach((item, index) => {
        polls += `${numberEmoji[index]} ${item}\n`;
    });

    return polls;
}

const getPollResults = (message: Message, pollOptions: string[]): string => {
    const reactions = message.reactions.cache.map((item) => ({
        name: item.emoji.name, 
        count: item.count - 1,
    }));

    let result: string = "";
    reactions.forEach((item, index) => {
        result += `${item.name} ${pollOptions[index]} got ${getCountString(item.count)}\n`;
    });

    return result;
} 

const getCountString = (count: number): string => {
    if (count === 1) return `${count} vote`;
    return `${count} votes`;
}

const setReactions = async (message: Message, pollOptions: string[]) => {
    pollOptions.forEach(async (_, index) => {
        await message.react(numberEmoji[index]);
    });
}