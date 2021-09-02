export interface IDatabaseContextKey {
    collectionKey: string;
    documentKey: string;
};

export interface IExtensionCommand {
    key: string;
    name: string;
    variables?: string[];
    description: string;
    method: Function;
    subCommands?: IExtensionSubCommand[];
}

export interface IExtensionSubCommand {
    key: string;
    name: string;
    variables?: string[];
    description: string;
    method: Function;
}

export interface IExtensionEvent {
    key: string;
    method: Function;
}