import { Application, CommandInteraction, ContextMenuInteraction } from "discord.js";

export enum OptionTypes {
    String = "String",
    Integer = "Integer",
    Number = "Number",
    Boolean = "Boolean",
    User = "User",
    Channel = "Channel",
    Role = "Role",
    Mentionable = "Mentionable",
}

export enum ApplicationCommandType {
    SlashCommand = 1,
    UserCommand = 2,
    MessageCommand = 3,
}

export enum InteractionCommandType {
    SubCommandGroup = 'SUB_COMMAND_GROUP',
    SubCommand = 'SUB_COMMAND',
}

export interface IDatabaseContextKey {
    collectionKey: string;
    documentKey: string;
};

export interface IExtensionCommand {
    name: string;
    options?: IExtensionCommandOption[];
    description: string;
    method?: (interaction: CommandInteraction) => void;
    subCommands?: IExtensionSubCommand[];
    subCommandGroups?: IExtensionSubCommandGroup[];
};

export interface IExtensionSubCommand {
    name: string;
    options?: IExtensionCommandOption[];
    description: string;
    method: (interaction: CommandInteraction) => void;
};

export interface IExtensionSubCommandGroup {
    name: string;
    description: string;
    subCommands: IExtensionSubCommand[];
}

export interface IExtensionCommandOption {
    type: OptionTypes;
    input: string;
    description: string;
    required?: boolean;
    choices?: IExtensionCommandOptionChoice[];
};

export interface IExtensionCommandOptionChoice {
    name: string,
    value: any,
}

export interface IExtensionEvent {
    key: string;
    method: Function;
};

export interface IExtensionContextCommand {
    name: string;
    type: ApplicationCommandType;
    method: (interaction: ContextMenuInteraction) => void;
}

export interface IApplicationContextCommand {
    name: string;
    type: ApplicationCommandType;
}

export interface IExtensionState {
    
}