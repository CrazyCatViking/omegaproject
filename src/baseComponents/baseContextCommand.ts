import { IExtensionContextCommand } from "../utility/types";

export abstract class BaseContextCommand {
    protected $state: Record<string, any>;

    constructor (state: Record<string, any>) {
        this.$state = state;
    }

    get command(): IExtensionContextCommand {
        return this.template();
    }

    protected template(): IExtensionContextCommand {
        return {} as IExtensionContextCommand;
    }
}