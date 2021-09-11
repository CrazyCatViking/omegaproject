import { CommandInteraction, Guild } from "discord.js";

import { BaseCommand } from "../../../baseComponents/baseCommand";
import { getCommandChoices } from "../../../utility/shared";
import { IExtensionCommand, IExtensionCommandOption, OptionTypes } from "../../../utility/types";

export class PermissionCommand extends BaseCommand {
    template(): IExtensionCommand {
        return {
            name: 'permission',
            description: 'Manage bot command permissions',
            subCommands: [
                {
                    name: 'add',
                    description: 'Sets permissions for the selected commands and users/roles',
                    method: this.methods.addPermissions,
                    options: [
                        this.options.command,
                        this.options.users,
                        this.options.roles,
                    ]
                },
                {
                    name: 'remove',
                    description: 'Removed permission for the selected commands and users/roles',
                    method: this.methods.removePermissions,
                    options: [
                        this.options.users,
                        this.options.roles,
                    ]
                },
            ]
        }
    }

    methods = {
        addPermissions: async (interaction: CommandInteraction) => {
            const users = interaction.options.getString('users');
            const roles = interaction.options.getString('roles');
            const commandName = interaction.options.getString('command');

            if (!(commandName)) return;
            if (!(interaction.guild)) return;

            const command = interaction.guild.commands.cache.find((item) => item.name === commandName);
            const commandId = command?.id ?? await fetchCommandId(commandName, interaction.guild);

            

            interaction.reply('Working on it');
        },
        removePermissions: (interaction: CommandInteraction) => {

        },
    }

    options: {[option: string]: IExtensionCommandOption} = {
        users: {
            type: OptionTypes.String,
            input: 'users',
            description: 'users to add permissions to',
            required: false,
        },
        roles: {
            type: OptionTypes.String,
            input: 'roles',
            description: 'roles to add permissions to',
            required: false,
        },
        command: {
            type: OptionTypes.String,
            input: 'command',
            description: 'the command to set permission for',
            required: true,
            choices: getCommandChoices(),
        }
    }
}

const fetchCommandId = async (commandName: string, guild: Guild) => {
    const commands = await guild.commands.fetch();
    return commands.find((item) => item.name === commandName)?.id;
}

const updatePermission = async (commandId: string, users: string, roles: string, guild: Guild) => {

}