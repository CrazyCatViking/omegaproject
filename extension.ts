/*
    The extension class is ment to be extended by specific unique extensions and serves as a common interface 
    for interaction between the bot application, and extensions loaded at runtime.

    Extensions are designed to be as isolated from the rest of the bot as possible, therefore
    the Extension class is an EventEmitter, so it's able to trigger events like database update, send and fetch 
    rquests, without having access to the actual databaseManager. 

    This makes it possible to implement large changes to the bot's architecture, without risking breaking 
    extension compatability.

    Extensions need a config.json file with configuration information and information on commands, events and tootips.
*/

import { EventEmitter } from "events";
import Discord = require("discord.js");

//Example of create function used to create extensions at runtime. Needed for all extensions
function createExtension() {
    return new Extension();
}

export class Extension extends EventEmitter {
    namespace: string; //Namespace for the extension used when calling a command associated with the extension
    ready: Boolean; //Indicates if extension is ready for use or not
    enabled: Boolean; //Indicates if extension is enabled or not
    useDB: Boolean; //DB Usage flag to let bot know if the extension uses DB functionality
    dbStatus: string; //Indicates if a fetch request is running or not
    events: string[]; //Array containing events the extension is registered for

    databaseObject?: {[id: string]: {}}; //Database object that stores local copy of database information

    constructor () {
        //Sets default values for extension data
        super();
        this.namespace = "";
        this.ready = false;
        this.enabled = false;
        this.useDB = false;
        this.dbStatus = "idle";
        this.events = [];
    }

    //Initializes Extension, takes Discord.Guild as input in case extension requires information about channels, messages etc, for initialization.
    async init(guild: Discord.Guild) {
        this.ready = true;
        return;
    }

    //Events
    message(message: Discord.Message) {
        return;
    }

    reactionAdd(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        return;
    }

    reactionRemove(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        return;
    }

    messageDelete(message: Discord.Message | Discord.PartialMessage) {
        return;
    }


    //Methods that handle database interaction
    dbUpdate() {
        this.emit('update', this.namespace, this.databaseObject);
    }

    dbSend() {
        this.emit('send', this.namespace, this.databaseObject);
    }

    dbFetch() {
        if (this.dbStatus !== "idle") return;

        this.dbStatus = "working";
        this.emit('fetch', this.namespace, this);
    }
}