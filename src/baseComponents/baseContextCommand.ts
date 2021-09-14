import { StateStorage } from "../utility/stateStorage";
import { IExtensionContextCommand } from "../utility/types";

export abstract class BaseContextCommand {
    protected $state: StateStorage;

    constructor (state: StateStorage) {
        this.$state = state;
    }

    get command(): IExtensionContextCommand {
        return this.template();
    }

    protected template(): IExtensionContextCommand {
        return {} as IExtensionContextCommand;
    }
}