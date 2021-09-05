import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandInteraction, ContextMenuInteraction } from 'discord.js';

import { BaseExtension } from "./baseComponents/baseExtension";
import { BaseManager } from "./baseComponents/baseManager";
import { buildSlashCommand } from "./helpers/slashCommandBuilder";
import { decode } from './utility/hashids';
import { ApplicationCommandType, IApplicationContextCommand, IExtensionCommand, IExtensionContextCommand, InteractionCommandType } from './utility/types';

export class CommandManager extends BaseManager {
    constructor(hashGuildId: string) {
        super(hashGuildId, { collectionKey: hashGuildId, documentKey: 'commands' });
    }

    public registerCommands(extensions: BaseExtension[]): void {
        const commandBuilders: SlashCommandBuilder[] = [];
        const contextCommands: IApplicationContextCommand[]  = [];

        extensions.forEach((extension) => {
           commandBuilders.push(...buildSlashCommand(extension.commands()));
           contextCommands.push(...extension.contextCommands().map(command => {
               return {
                   name: command.name,
                   type: command.type,
               }
           }));
        });

        const commands: any[] = [
            ...commandBuilders.map(command => command.toJSON()),
            ...contextCommands,
        ];

        const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN as string);

        (async () => {
            try {console.log('Started refreshing application (/) commands.')
                await rest.put(
                    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as string, String(decode(this.hashGuildId))),
                    { body: commands }
                )

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.log(error);
            }
        })();
    }

    public registerCommandResponse(extensions: BaseExtension[]): void {
        const commands: IExtensionCommand[] = [];
        const contextCommands: IExtensionContextCommand[] = [];
        extensions.forEach(extension => {
            commands.push(...extension.commands());
            contextCommands.push(...extension.contextCommands());
        });

        commands.forEach((command) => {
            if (!(!!command.subCommands || !!command.subCommandGroups) && !!(command.method)) {
                const method = command.method as (interaction: CommandInteraction) => void;
                this.on(command.name, (interaction) => method(interaction));
            }

            if (!!command.subCommands) {
                command.subCommands.forEach((subCommand) => {
                    this.on(`${command.name}/${subCommand.name}`, (interaction) => subCommand.method(interaction));
                });
            }

            if (!!command.subCommandGroups) {
                command.subCommandGroups.forEach((group) => {
                    group.subCommands.forEach((subCommand) => {
                        this.on(`${command.name}/${group.name}/${subCommand.name}`, (interaction) => subCommand.method(interaction));
                    });
                });
            }
        });

        contextCommands.forEach((command) => {
            this.on(`contextCommand/${command.type}/${command.name}`, (interaction) => command.method(interaction));
        })
    }

    public interaction(interaction: CommandInteraction | ContextMenuInteraction) {
        const options = interaction.options.data[0];
        
        if (interaction.isCommand()) {
            if (!!options && options.type === InteractionCommandType.SubCommandGroup) {
                const groupOptions = options.options ? options.options[0] : undefined;
                if (!!groupOptions) this.emit(`${interaction.commandName}/${options.name}/${groupOptions.name}`, interaction);
                return;
            }
    
            if (!!options && options.type === InteractionCommandType.SubCommand) {
                this.emit(`${interaction.commandName}/${options.name}`, interaction);
                return;
            }

            this.emit(interaction.commandName, interaction);
        }

        if (interaction.isContextMenu()) {
            if (!!options && options.type as any === InteractionCommandType.MessageContextCommand) {
                this.emit(`contextCommand/${ApplicationCommandType.MessageCommand}/${interaction.commandName}`, interaction);
            }

            if (!!options && options.type as any === InteractionCommandType.UserContextCommand) {
                this.emit(`contextCommand/${ApplicationCommandType.UserCommand}/${interaction.commandName}`, interaction);
            }
        }
    }
}