import { BaseExtension } from "../baseComponents/baseExtension";
import { BaseManager } from "../baseComponents/baseManager";
import { extensions } from '../extensions';

export class ExtensionManager extends BaseManager {
    loadedExtensions: BaseExtension[];

    constructor(hashGuildId: string) {
        super(hashGuildId, { collectionKey: hashGuildId, documentKey: 'extensions' });
        this.loadedExtensions = extensions(hashGuildId);
    }
}