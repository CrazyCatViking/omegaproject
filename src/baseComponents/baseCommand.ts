import { IExtensionCommand, IExtensionState } from "../utility/types";

export abstract class BaseCommand {
    $state?: IExtensionState;

    constructor(state: IExtensionState) {
        this.$state = state;
    }

    get command(): IExtensionCommand {
        const command = this.template();
        
        if (!!command.options && (!!command.subCommands || !!command.subCommandGroups)) {
            console.warn("A command cannot contain sub-commands and options at the same time, options will be ignored");
        }
        if (!!command.method && (!!command.subCommands || !!command.subCommandGroups)) {
            console.warn("This command has sub-commands, the registered method will be ignored");
        }

        return command; 
    }

    protected template(): IExtensionCommand {
        return {} as IExtensionCommand; 
    }
}