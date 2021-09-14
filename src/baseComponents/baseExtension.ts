import { DbContext } from "../utility/dbContext";
import { IDatabaseContextKey, IExtensionCommand, IExtensionContextCommand, IExtensionEvent } from "../utility/types";
import { StateStorage } from "../utility/stateStorage";

export abstract class BaseExtension {
    dbContext?: DbContext;
    enabled: boolean = true;
    name: string = "baseExtension";
    protected $state: StateStorage;

    constructor(databaseContextKey?: IDatabaseContextKey) {
        if (!!databaseContextKey) this.sharedStateInit(databaseContextKey);
        this.$state = new StateStorage(this.dbContext);
    }

    private async sharedStateInit(databaseContextKey: IDatabaseContextKey) {
        this.dbContext = new DbContext(databaseContextKey);
        
        await this.dbContext.init();
        await this.$state.initStateStorage();
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