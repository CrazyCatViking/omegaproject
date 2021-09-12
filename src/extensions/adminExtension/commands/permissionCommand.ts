import { ApplicationCommandPermissions, CommandInteraction, Guild } from "discord.js";

import { BaseCommand } from "../../../baseComponents/baseCommand";
import { getCommandChoices } from "../../../utility/shared";
import { IExtensionCommand, IExtensionCommandOption, OptionTypes } from "../../../utility/types";
import { parseDiscordRoles, parseDiscordUsers } from "../../../helpers/parseDiscordStrings";

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
                        this.options.command,
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

            if (!commandId) return;

            if (!(users) && !(roles)) {
                interaction.reply("You have to specify either a role, a user or both to set the permission on.");
                return;
            }

            await updatePermission(commandId, interaction, users, roles, true);

            interaction.reply('Permissions have been updated.');
        },
        removePermissions: async (interaction: CommandInteraction) => {
            const users = interaction.options.getString('users');
            const roles = interaction.options.getString('roles');
            const commandName = interaction.options.getString('command');

            if (!(commandName)) return;
            if (!(interaction.guild)) return;

            const command = interaction.guild.commands.cache.find((item) => item.name === commandName);
            const commandId = command?.id ?? await fetchCommandId(commandName, interaction.guild);

            if (!commandId) return;

            if (!(users) && !(roles)) {
                interaction.reply("You have to specify either a role, a user or both to set the permission on.");
                return;
            }

            await updatePermission(commandId, interaction, users, roles, false);
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

const updatePermission = async (commandId: string, interaction: CommandInteraction, users: string | null, roles: string | null, _permission: boolean) => {
    const commandManager = interaction.guild?.commands;
    const userPermissions: ApplicationCommandPermissions[] = [];
    const rolePermissions: ApplicationCommandPermissions[] = [];

    if (!!users) {
        const permissions = parseDiscordUsers(users)?.map((user) => {
            const permission: ApplicationCommandPermissions = {
                id: user,
                type: 'USER',
                permission: _permission,
            }
            return permission;
        });

        if (permissions) userPermissions.push(...permissions);
    }

    if (!!roles) {
        const permissions = parseDiscordRoles(roles)?.map((role) => {
            const permission: ApplicationCommandPermissions = {
                id: role,
                type: 'ROLE',
                permission: _permission,
            }
            return permission;
        });

        if (permissions) rolePermissions.push(...permissions);
    }

    if (!!userPermissions && !!rolePermissions) {
        interaction.reply("You have to specify either a role, a user or both to set the permission on.");
        return;
    }

    if (!!userPermissions || !!rolePermissions) {
        await commandManager?.permissions.add({
            command: commandId,
            permissions: [
                ...userPermissions,
                ...rolePermissions,
            ],
        });

        interaction.reply('Permissions have been updated.');
    }
}