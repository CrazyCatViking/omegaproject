/*
    Module and class handling all database interactions with MongoDB. The specific databaseManager corresponding
    to a specific guild only gives access to the guild specific mongoDB collection.
*/

import mongo = require('mongodb'); //MongoDB Node.js Driver

//Module for handling database interaction with mongoDB
export class DatabaseManager {
    url: string; //URL to database
    guildId: string; //Unique Discord Guild id
    database: mongo.Db; //Instance of db from mongoDB node.js driver

    constructor(id: string) {
        //Set initial values
        this.url = "mongodb://localhost:27017";
        this.guildId = id;
        this.database = {} as mongo.Db;
    }

    async init() {
        //Connect DB
        let mongoClient = mongo.MongoClient;
        let db = await mongoClient.connect(this.url, {useUnifiedTopology: true});
        this.database = db.db("omegabeta");

        //Check if guild collection already exists
        let collectionExists = false;
        let collections = await this.database.listCollections({}, {"nameOnly": true}).toArray();
        for (let collection in collections) {
            if (collections[collection].name === this.guildId) {
                collectionExists = true;
                break;
            }
        }

        if (collectionExists) return;

        //If guild collection is missing, create new collection
        await this.database.createCollection(this.guildId);
    }

    //Fetches queried document returns undefined if missing
    async fetchDocument(documentId: string) {  
        let query = await this.queryOne({id: documentId});
        if (query === null) return undefined;
        return query["document"];
    }

    //Sends new document to database
    async sendDocument(_id: string, _document: any) {
        await this.database.collection(this.guildId).insertOne({id: _id, document: _document});
        return;
    }

    //Updates existing document
    async updateDocument(_id: string, updateObj: any) {
        await this.database.collection(this.guildId).updateOne({id: _id}, {$set: {document: updateObj}});
        return;
    }

    //Deletes existing document
    async deleteDocument(query: any) {
        //Implement deleteDocument method.
    }

    //Queries for multiple results
    private async query(query: any) {
        var queryResult = await this.database.collection(this.guildId).find(query).toArray();
        return queryResult;
    }

    //Queries for single document
    private async queryOne(query: any) {
        var queryResult = await this.database.collection(this.guildId).findOne(query);
        return queryResult
    }
}