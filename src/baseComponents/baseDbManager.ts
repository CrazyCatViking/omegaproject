import { IDatabaseContextKey, IQueryObject, IQueryResult } from "../utility/types";

export abstract class BaseDbManager {
    dataBaseContextKey: IDatabaseContextKey;
    constructor(dataBaseContextKey: IDatabaseContextKey) {
        this.dataBaseContextKey = dataBaseContextKey;
    }

    public async init() {

    }

    public async getDocument(queryObject: IQueryObject) {
        return {} as IQueryResult;
    }

    public async insertDocument(queryObject: IQueryObject) {
        return {} as IQueryResult;
    }

    public async updateDocument(queryObject: IQueryObject) {
        return {} as IQueryResult;
    }

    public async deleteDocument(queryObject: IQueryObject) {
        return {} as IQueryResult;
    }
}