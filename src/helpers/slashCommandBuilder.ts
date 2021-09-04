import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { IExtensionCommand, IExtensionCommandOption, IExtensionSubCommand, IExtensionSubCommandGroup, OptionTypes } from "../utility/types";

export const buildSlashCommand = (extensionCommands: IExtensionCommand[]) => {
    const commands: SlashCommandBuilder[] = [];
    
    extensionCommands.forEach(command => {
        const commandBuilder = new SlashCommandBuilder();
        commandBuilder.setName(command.name)
                      .setDescription(command.description)
                      .setDefaultPermission(true);

        if (!!command.subCommands) {
            addSubCommands(commandBuilder, command.subCommands);
        }

        if (!!command.subCommandGroups) {
            addSubCommandGroups(commandBuilder, command.subCommandGroups);
        }

        if (!!command.options && !(!!command.subCommands || !!command.subCommandGroups)) {
            addOptions(commandBuilder, command.options);
        } 

        commands.push(commandBuilder);
    });
    return commands;
}

const addSubCommands = (command: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder, subCommands: IExtensionSubCommand[]) => {
    subCommands.forEach((subCommand) => {
        command.addSubcommand((subCmd) => {
            subCmd.setName(subCommand.name)
                  .setDescription(subCommand.description);

            if (!!subCommand.options) {
                addOptions(subCmd, subCommand.options);
            }

            return subCmd;
        });
    });
}

const addSubCommandGroups = (command: SlashCommandBuilder, subCommandGroups: IExtensionSubCommandGroup[]) => {
    subCommandGroups.forEach((subCommandGroup) => {
        command.addSubcommandGroup((subCmdGroup) => {
            subCmdGroup.setName(subCommandGroup.name)
                       .setDescription(subCommandGroup.description);
            
            addSubCommands(subCmdGroup, subCommandGroup.subCommands);

            return subCmdGroup;
        });
    });
}

const addOptions = (command: SlashCommandBuilder | SlashCommandSubcommandBuilder, options: IExtensionCommandOption[]) => {
    options.forEach(option => {
        switch (option.type) {
            case OptionTypes.String:
                command.addStringOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);

                    if (!!option.choices) {
                        addChoices(opt, option.choices);
                    }
                    
                    return opt;
                });
                break;
            case OptionTypes.Boolean:
                command.addBooleanOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);
                    
                    return opt;
                });
                break;
            case OptionTypes.Integer:
                command.addIntegerOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);

                    if (!!option.choices) {
                        addChoices(opt, option.choices);
                    }
                    
                    return opt;
                });
                break;
            case OptionTypes.Number:
                command.addNumberOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);

                    if (!!option.choices) {
                        addChoices(opt, option.choices);
                    }
                    
                    return opt;
                });
                break;
            case OptionTypes.Channel:
                command.addChannelOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);
                    
                    return opt;
                });
                break;
            case OptionTypes.Mentionable:
                command.addMentionableOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);
                    
                    return opt;
                });
                break;
            case OptionTypes.Role:
                command.addRoleOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);

                    return opt;
                });
                break;
            case OptionTypes.User:
                command.addUserOption((opt) => {
                    opt.setName(option.input)
                       .setDescription(option.description)
                       .setRequired(!!option.required);

                    return opt;
                });
                break;
        }
    });
}

const addChoices = (option: any, choices: any[]) => {
    choices.forEach(choice =>
        option.addChoice(choice.name, choice.value)
    );
}