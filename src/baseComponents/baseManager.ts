import { EventEmitter } from 'stream';
import { DbContext } from '../dbContext';
import { StateStorage } from '../stateStorage';
import { IDatabaseContextKey } from '../utility/types';

export abstract class BaseManager extends EventEmitter {   
    private dbContext?: DbContext;
    private databaseContextKey?: IDatabaseContextKey;
    private $state: StateStorage;
    hashGuildId: string;

    constructor(hashGuildId: string, databseContextKey?: IDatabaseContextKey) {
        super();

        this.databaseContextKey = databseContextKey;
        this.hashGuildId = hashGuildId;

        if (!!this.databaseContextKey) this.sharedStateInit(this.databaseContextKey);
        this.$state = new StateStorage(this.dbContext);
    }

    private async sharedStateInit(databaseContextKey: IDatabaseContextKey) {
        this.dbContext = new DbContext(databaseContextKey);

        await this.dbContext.init();
        await this.$state.initStateStorage();
    }
}