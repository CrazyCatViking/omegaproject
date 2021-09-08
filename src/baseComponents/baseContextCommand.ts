import { IExtensionContextCommand, IExtensionState } from "../utility/types";

export abstract class BaseContextCommand {
    $state?: IExtensionState;

    constructor (state?: IExtensionState) {
        this.$state = state;
    }

    get command(): IExtensionContextCommand {
        return this.template();
    }

    protected template(): IExtensionContextCommand {
        return {} as IExtensionContextCommand;
    }
}