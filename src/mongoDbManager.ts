import { MongoClient } from "mongodb";
import { BaseDbManager } from "./baseComponents/baseDbManager";
import { IDatabaseContextKey, IQueryObject, IQueryResult } from "./utility/types";

export class MongoDbManager extends BaseDbManager {
    client: MongoClient;

    constructor(dataBaseContextKey: IDatabaseContextKey) {
        super(dataBaseContextKey);

        this.client = new MongoClient(process.env.DATABASE_URL as string);
    }

    public async init() {
        await this.client.connect();
    }

    private getDatabaseCollection() {
        const db = this.client.db(process.env.DATABASE_NAME);
        return db.collection(this.dataBaseContextKey.collectionKey);
    }

    public async getDocument(queryObject: IQueryObject): Promise<IQueryResult> {
        const collection = this.getDatabaseCollection();
        const document = await collection.findOne(queryObject.query);

        if (!!document) {
            return {result: true, data: document};
        } else {
            return {result: false};
        }
    }

    public async insertDocument(queryObject: IQueryObject): Promise<IQueryResult> {
        if (!!queryObject.data) {
            const collection = this.getDatabaseCollection();
            const result = await collection.insertOne(queryObject.data)

            return {result: result.acknowledged};
        }

        return {result: false};
    }

    public async updateDocument(queryObject: IQueryObject): Promise<IQueryResult> {
        if (!!queryObject.data) {
            const collection = this.getDatabaseCollection();
            const result = await collection.updateOne(queryObject.query, queryObject.data);

            return {result: result.acknowledged};
        }

        return {result: false};
    }

    public async deleteDocument(queryObject: IQueryObject): Promise<IQueryResult> {
        const collection = this.getDatabaseCollection();
        const result = await collection.deleteOne(queryObject.query);
        
        return {result: result.acknowledged};
    }
}