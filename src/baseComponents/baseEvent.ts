import { StateStorage } from "../utility/stateStorage";
import { IExtensionEvent } from "../utility/types";

export abstract class BaseEvent {
    protected $state: StateStorage;
    constructor(state: StateStorage) {
        this.$state = state;
    }

    get eventHandler(): IExtensionEvent {
        return this.template();
    }

    protected template(): IExtensionEvent {
        return {} as IExtensionEvent;
    }
}