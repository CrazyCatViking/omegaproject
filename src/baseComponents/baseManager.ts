import { EventEmitter } from 'stream';
import { DbContext } from '../dbManager';
import { IDatabaseContextKey } from '../utility/types';

export class BaseManager extends EventEmitter {
    dbContext?: DbContext;
    hashGuildId: string;

    constructor(databseContextKey: IDatabaseContextKey | null, hashGuildId: string) {
        super();
        if (!!databseContextKey) this.dbContext = new DbContext(databseContextKey);
        this.hashGuildId = hashGuildId;
    }
}