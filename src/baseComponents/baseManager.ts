import { EventEmitter } from 'stream';
import { DbContext } from '../dbContext';
import { IDatabaseContextKey, IManagerState } from '../utility/types';

export abstract class BaseManager extends EventEmitter {   
    private dbContext?: DbContext;
    private databaseContextKey?: IDatabaseContextKey;
    $state: IManagerState;
    hashGuildId: string;

    constructor(hashGuildId: string, databseContextKey?: IDatabaseContextKey) {
        super();

        this.databaseContextKey = databseContextKey;
        this.hashGuildId = hashGuildId;
        this.$state = {};
        if (!!this.databaseContextKey) this.sharedStateInit(this.databaseContextKey);
    }

    private async sharedStateInit(databaseContextKey: IDatabaseContextKey) {
        this.dbContext = new DbContext(databaseContextKey);
        await this.dbContext.init();
        this.$state.sharedState = await this.dbContext.getSharedState({ query: {documentKey: this.databaseContextKey?.documentKey}});
    }
}