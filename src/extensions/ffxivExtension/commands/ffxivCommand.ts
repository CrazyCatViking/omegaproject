import { CommandInteraction } from "discord.js";
import { BaseCommand } from "../../../baseComponents/baseCommand";
import { IExtensionCommand, IExtensionCommandOption, OptionTypes } from "../../../utility/types";

export class FFXIVCommand extends BaseCommand {
    template(): IExtensionCommand {
        return {
            name: 'ffxiv',
            description: 'Link and get information on your linked ffxiv profile',
            subCommands: [
                {
                    name: 'iam',
                    description: 'Registers your ffxiv profile to your discord user',
                    method: this.methods.iam,
                    options: [ 
                        {
                            ...this.options.ffxivCharacter,
                            required: true,
                        },
                        {
                            ...this.options.ffxivServer,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'stats',
                    description: 'Shows the stats for the user or a specified ffxiv character',
                    method: this.methods.stats,
                    options: [
                        this.options.discordUser,
                        this.options.ffxivCharacter,
                        this.options.ffxivServer,
                    ]
                },
                {
                    name: 'gear',
                    description: 'Shows the currently equiped gear for the user or a specified ffxiv charaver',
                    method: this.methods.gear,
                    options: [
                        this.options.discordUser,
                        this.options.ffxivCharacter,
                        this.options.ffxivServer,
                    ]
                },
            ]
        }
    }

    private methods = {
        iam: (interaction: CommandInteraction) => {
            const ffxivChrName = interaction.options.getString('ffxiv-character');
            const ffxivServer = interaction.options.getString('ffxiv-server');
        },
        stats: (interaction: CommandInteraction) => {
            const user = interaction.options.getUser('discord-user');
            const ffxivChrName = interaction.options.getString('ffxiv-character');
            const ffxivServer = interaction.options.getString('ffxiv-server');
        },
        gear: (interaction: CommandInteraction) => {
            const user = interaction.options.getUser('discord-user');
            const ffxivChrName = interaction.options.getString('ffxiv-character');
            const ffxivServer = interaction.options.getString('ffxiv-server');
        }
    }

    private options: {[option: string]: IExtensionCommandOption} = {
        discordUser: {
            type: OptionTypes.User,
            input: 'discord-user',
            description: 'A mentionable discord user'
        },
        ffxivCharacter: {
            type: OptionTypes.String,
            input: 'ffxiv-character',
            description: 'A ffxiv characters full name'
        },
        ffxivServer: {
            type: OptionTypes.String,
            input: 'ffxiv-server',
            description: 'A ffxiv server name'
        }
    }
}