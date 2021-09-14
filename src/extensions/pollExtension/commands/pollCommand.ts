import { CommandInteraction, CommandInteractionOptionResolver, Interaction, Options } from "discord.js";
import { BaseCommand } from "../../../baseComponents/baseCommand";
import { IExtensionCommand, IExtensionCommandOption, OptionTypes } from "../../../utility/types";
import { Poll } from "../poll";

enum PollMode {
    SingleVote = 'single-vote',
    MultiVote = 'multi-vote',
}

export class PollCommand extends BaseCommand {
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

    methods = {
        pollCreate: (interaction: CommandInteraction) => {
            const mode = interaction.options.getString('mode');
            const id = interaction.options.getString('id');
            const description = interaction.options.getString('description');

            const options = getOptions(interaction.options);

            if (!mode || !id || !description || !options.length) return;

            const poll = new Poll(mode, id, description, options);
            this.$state.sessionState.polls.set(id, poll);

            interaction.reply(`Poll with id: ${id} was successfully created`);
        },
        pollPost: (interaction: CommandInteraction) => {

        },
        pollEnd: (interaction: CommandInteraction) => {

        },
        pollDelete: (interaction: CommandInteraction) => {

        },
        pollList: (interaction: CommandInteraction) => {
            let reply = "**These are the posted and un-posted polls:**\n";
            this.$state.sessionState.polls.forEach((item: Poll) => {
                reply += `**${item.id}:** ${item.description} | Status: ${item.status}\n`
            });

            interaction.reply(reply);
        },
    }

    options = {
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

const getOptions = (options: CommandInteractionOptionResolver): string[] => {
    const pollOptions = options.data[0].options?.filter(item => item.name.includes('option'));

    if (!!pollOptions?.length) return pollOptions.map(item => item.value as string);
    return [];
}