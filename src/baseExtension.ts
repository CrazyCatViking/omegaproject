import { DbContext } from "./dbManager";
import { IDatabaseContextKey, IExtensionCommand, IExtensionEvent } from "./utility/types";

export class BaseExtension {
    dbContext?: DbContext;
    enabled: boolean = true;

    constructor(databaseContextKey: IDatabaseContextKey | null) {
        if (!!databaseContextKey) this.dbContext = new DbContext(databaseContextKey);
    }

    commands(): IExtensionCommand[] {
        return [];
    }

    events(): IExtensionEvent[] {
        return [];
    }
}