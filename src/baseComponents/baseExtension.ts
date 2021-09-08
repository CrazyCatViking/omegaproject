import { BaseCommand } from "./baseCommand";
import { DbContext } from "../dbContext";
import { IDatabaseContextKey, IExtensionCommand, IExtensionContextCommand, IExtensionEvent, IExtensionState } from "../utility/types";

export abstract class BaseExtension {
    dbContext?: DbContext;
    enabled: boolean = true;
    name: string = "baseExtension";
    $state?: IExtensionState;

    constructor(databaseContextKey: IDatabaseContextKey | null) {
        if (!!databaseContextKey) this.dbContext = new DbContext(databaseContextKey);
    }

    commands(): IExtensionCommand[] {
        return [];
    }

    contextCommands(): IExtensionContextCommand[] {
        return [];
    }

    events(): IExtensionEvent[] {
        return [];
    }
}