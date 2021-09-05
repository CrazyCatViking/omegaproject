import { BaseExtension } from "./baseComponents/baseExtension";
import { BaseManager } from "./baseComponents/baseManager";
import { TestExtension } from "./extensions/testExtension/testExtension";

export class ExtensionManager extends BaseManager {
    loadedExtensions: BaseExtension[];

    constructor(hashGuildId: string) {
        super(hashGuildId, { collectionKey: hashGuildId, documentKey: 'extensions' });
        this.loadedExtensions = this.extensions(hashGuildId);
    }

    extensions(guildId: string) {
        const testExtension = new TestExtension(guildId);

        return [
            testExtension,
        ]
    } 
}