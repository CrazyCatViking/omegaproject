import { BaseExtension } from "./baseComponents/baseExtension";
import { BaseManager } from "./baseComponents/baseManager";
import { DiscordEventTypes, IEventPackage, IExtensionEvent } from "./utility/types";

export class EventManager extends BaseManager {
    public registerEventResponses(extensions: BaseExtension[]): void {
        const events: IExtensionEvent[] = [];

        extensions.forEach((extension) => {
            events.push(...extension.events());
        });

        events.forEach((eventHandler) => {
            this.on(`${eventHandler.event}`, (eventPackage) => eventHandler.method(eventPackage));
        })
    }

    public event(eventType: DiscordEventTypes, eventPackage: IEventPackage) {
        this.emit(eventType, eventPackage);
    }
}