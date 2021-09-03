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

export interface IDatabaseContextKey {
    collectionKey: string;
    documentKey: string;
};

export interface IExtensionCommand {
    name: string;
    options?: IExtensionCommandOption[];
    description: string;
    method: Function;
    subCommands?: IExtensionSubCommand[];
    subCommandGroups?: IExtensionSubCommandGroup[];
};

export interface IExtensionSubCommand {
    name: string;
    options?: IExtensionCommandOption[];
    description: string;
    method: Function;
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