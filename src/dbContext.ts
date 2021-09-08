import { BaseDbManager } from "./baseComponents/baseDbManager";
import { MongoDbManager } from "./mongoDbManager";
import { IDatabaseContextKey, IQueryObject } from "./utility/types";

export class DbContext {
    private dbManager: BaseDbManager;

    constructor(databaseContextKey: IDatabaseContextKey) {
        this.dbManager = new MongoDbManager(databaseContextKey);    
    }

    public async init() {
        this.dbManager.init();
    }

    public async getSharedState(queryObject: IQueryObject) {
        const queryResults = await this.dbManager.getDocument(queryObject);

        if (!queryResults.result) throw("Failed to fetch shared state");

        return queryResults.data;
    }

    public async updateSharedState(queryObject: IQueryObject) {
        const queryResults = await this.dbManager.updateDocument(queryObject);

        if (!queryResults.result) throw("Failed to update shared state");
    }

    public async deleteSharedState(queryObject: IQueryObject) {
        const queryResults = await this.dbManager.deleteDocument(queryObject);

        if (!queryResults.result) throw("Failed to delete shared state");
    }
}