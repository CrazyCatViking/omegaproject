import { BaseExtension } from "../baseComponents/baseExtension";
import { BaseManager } from "../baseComponents/baseManager";
import { extensions } from '../extensions';

export class ExtensionManager extends BaseManager {
    loadedExtensions: BaseExtension[];

    constructor(hashGuildId: string) {
        super(hashGuildId);
        this.loadedExtensions = extensions(hashGuildId);
    }
}