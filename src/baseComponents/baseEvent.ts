import { IExtensionEvent } from "../utility/types";

export abstract class BaseEvent {
    protected $state: Record<string, any>;
    constructor(state: Record<string, any>) {
        this.$state = state;
    }

    get eventHandler(): IExtensionEvent {
        return this.template();
    }

    protected template(): IExtensionEvent {
        return {} as IExtensionEvent;
    }
}