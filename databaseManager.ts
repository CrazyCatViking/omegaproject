/*
    Module and class handling all database interactions with MongoDB. The specific databaseManager corresponding
    to a specific guild only gives access to the guild specific mongoDB collection.
*/

import EventEmitter = require('events');
import mongo = require('mongodb'); //MongoDB Node.js Driver

//Module for handling database interaction with mongoDB
export class DatabaseManager extends EventEmitter {
    url: string; //URL to database
    guildId: string; //Unique Discord Guild id
    database: mongo.Db; //Instance of db from mongoDB node.js driver
    changeStreams: {[listener: string]: mongo.ChangeStream}; //Change Stream for events when db upates

    constructor(id: string) {
        super();
        //Set initial values
        this.url = "mongodb://localhost:27017";
        this.guildId = id;
        this.database = {} as mongo.Db;
        this.changeStreams = {};
    }

    async init() {
        //Connect DB
        let mongoClient = mongo.MongoClient;
        let db = await mongoClient.connect(this.url, {useUnifiedTopology: true});
        this.database = db.db("omegabeta");

        //Check if guild collection already exists
        let collections = await this.database.listCollections({}, {"nameOnly": true}).toArray();

        let collection = collections.find(coll => coll.name === this.guildId);
        if (collection) return;

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

    //Create change stream
    registerChangeStream(listener: string, documentId: string) {
        let changeStream = this.database.collection(this.guildId).watch();
        changeStream.on("change", () => {
            this.emit(listener);
        });
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