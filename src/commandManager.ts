import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandInteraction } from 'discord.js';

import { BaseExtension } from "./baseExtension";
import { BaseManager } from "./baseManager";
import { buildSlashCommand } from "./helpers/slashCommandBuilder";
import { decode } from './utility/hashids';
import { IExtensionCommand } from './utility/types';

export class CommandManager extends BaseManager {
    constructor(hashGuildId: string) {
        super({ collectionKey: hashGuildId, documentKey: 'commands' }, hashGuildId);
    }

    public registerCommands(extensions: BaseExtension[]): void {
        const commands: SlashCommandBuilder[] = [];

        extensions.forEach((extension) => {
           commands.push(...buildSlashCommand(extension.commands()));
        });

        const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN as string);

        (async () => {
            try {console.log('Started refreshing application (/) commands.')
                await rest.put(
                    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as string, String(decode(this.hashGuildId))),
                    { body: commands.map(command => command.toJSON()) }
                )

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.log(error);
            }
        })();
    }

    public registerCommandResponse(extensions: BaseExtension[]): void {
        const commands: IExtensionCommand[] = [];
        extensions.forEach(extension => commands.push(...extension.commands()));

        commands.forEach((command) => {
            this.on(command.name, (interaction) => command.method(interaction));
        });
    }

    public commandInteraction(interaction: CommandInteraction) {
        this.emit(interaction.commandName, interaction);
    }
}