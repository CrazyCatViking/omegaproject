import { IExtensionEvent, IExtensionState } from "../utility/types";

export abstract class BaseEvent {
    $state?: IExtensionState;
    constructor(state?: IExtensionState) {
        this.$state = state;
    }

    get eventHandler(): IExtensionEvent {
        return this.template();
    }

    protected template(): IExtensionEvent {
        return {} as IExtensionEvent;
    }
}