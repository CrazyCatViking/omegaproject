import { BaseEvent } from "../../../baseComponents/baseEvent";
import { DiscordEventTypes, IEventPackage, IExtensionEvent } from "../../../utility/types";

export class TestEvent extends BaseEvent {
    protected template(): IExtensionEvent {
        return {
            event: DiscordEventTypes.MessageCreate,
            method: this.methods.testMethod,
        }
    }

    methods = {
        testMethod: (eventPackage: IEventPackage) => {
            console.log(eventPackage);
        }
    }
}