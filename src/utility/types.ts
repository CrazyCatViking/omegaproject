import { Application, CommandInteraction, ContextMenuInteraction, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, User } from "discord.js";

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
    UserContextCommand = 'USER',
    MessageContextCommand = '_MESSAGE',
}

export enum DiscordEventTypes {
    MessageCreate = "messageCreate",
    MessageDelete = "messageDelete",
    MessageUpdate = "messageUpdate",
    MessageReactionAdd = "messageReactionAdd",
    MessageReactionRemove = "messageReactionRemove",
}

export interface IEventPackage {
    messages?: (Message | PartialMessage)[];
    reactions?: (MessageReaction | PartialMessageReaction)[];
    users?: (User | PartialUser)[];
    anyObjects?: any[];
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
    event: DiscordEventTypes;
    method: (eventPackage: IEventPackage) => void;
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

export interface IQueryObject {
    query: object;
    data?: object;
}

export interface IQueryResult {
    result: boolean;
    data?: object;
}

export interface ISessionState {
    ready?: boolean;
}

export interface ISharedState {

}