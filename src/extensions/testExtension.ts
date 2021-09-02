import { BaseExtension } from "../baseExtension";
import { IExtensionCommand } from "../utility/types";

export class TestExtension extends BaseExtension {
    constructor(guildId: string) {
        super({collectionKey: guildId, documentKey: 'test'});
    }

    commands(): IExtensionCommand[] {
        const testCommand: IExtensionCommand = {
            key: 'helloWorld',
            name: 'Hello World',
            description: 'Replies with "Hello World"',
            method: () => {
                return "Hello World";
            },
        }; 

        return [
            testCommand,
        ];
    }
}