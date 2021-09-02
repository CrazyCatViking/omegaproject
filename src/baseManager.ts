import { DbContext } from './dbManager';
import { IDatabaseContextKey } from './utility/types';

export class BaseManager {
    dbContext?: DbContext;

    constructor(databseContextKey: IDatabaseContextKey | null) {
        if (!!databseContextKey) this.dbContext = new DbContext(databseContextKey);
    }
}