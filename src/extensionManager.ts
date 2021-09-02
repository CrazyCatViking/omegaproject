import { BaseExtension } from "./baseExtension";
import { BaseManager } from "./baseManager";
import { TestExtension } from "./extensions/testExtension";

export class ExtensionManager extends BaseManager {
    loadedExtensions: {[key: string]: BaseExtension};

    constructor(guildId: string) {
        super({ collectionKey: guildId, documentKey: 'extensions' });
        this.loadedExtensions = this.extensions(guildId);
    }

    extensions(guildId: string) {
        const testExtension = new TestExtension(guildId);

        return {
            testExtension,
        }
    } 
}