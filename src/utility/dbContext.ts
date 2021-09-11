import { BaseDbManager } from "../baseComponents/baseDbManager";
import { MongoDbManager } from "../managers/mongoDbManager";
import { IDatabaseContextKey, ISharedState } from "../utility/types";

export class DbContext {
    private dbManager: BaseDbManager;
    private databaseContextKey: IDatabaseContextKey;
    private contextReady: boolean = false;

    constructor(databaseContextKey: IDatabaseContextKey) {
        this.databaseContextKey = databaseContextKey;
        this.dbManager = new MongoDbManager(databaseContextKey);    
    }

    public async init() {
        await this.dbManager.init();
        this.contextReady = true;
    }

    public async getSharedState() {
        const queryResults = await this.dbManager.getDocument({query: {key: this.databaseContextKey.documentKey}});
        return queryResults;
    }

    public async updateSharedState(sharedState: ISharedState) {
        const queryResults = await this.dbManager.updateDocument({query: {key: this.databaseContextKey.documentKey}, data: sharedState});

        if (!queryResults.result) throw("Failed to update shared state");
    }

    public async insertSharedState(sharedState: ISharedState) {
        const queryResults = await this.dbManager.insertDocument({query: {}, data: {key: this.databaseContextKey.documentKey, document: sharedState}});

        if (!queryResults.result) throw("Failed to insert shared state");
    }

    public async deleteSharedState() {
        const queryResults = await this.dbManager.deleteDocument({query: {key: this.databaseContextKey.documentKey}});

        if (!queryResults.result) throw("Failed to delete shared state");
    }

    public get ready() {
        return this.contextReady;
    }
}