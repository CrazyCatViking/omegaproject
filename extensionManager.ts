/*
    The extensionManager handles loading of extensions, enabeling, disabeling and indexes them by namespace and handles interactions
    and stores information on what extensions are registered for specific events. 
*/

import { Extension } from './extension';
import { CommandManager } from './commandManager';
import { DatabaseManager } from './databaseManager';
import { mapDir } from './omegaToolkit';
import { Guild } from 'discord.js';

export class ExtensionManager {
    commandManager: CommandManager; //Guild specific instance of commandManager
    databaseManager: DatabaseManager; //Gild specific instance of databaseManager
    extensions: {[namespace: string]: Extension}; //Stores extensions indexed by namespace
    events: {[eventType: string]: string[]}; //Stores waht extensions are registered for specific events

    constructor(commandManager: CommandManager, databaseManager: DatabaseManager) {
        //Load inital values
        this.extensions = {} as {[namespace: string]: Extension};
        this.events = {} as {[eventType: string]: string[]};
        this.commandManager = commandManager;
        this.databaseManager = databaseManager;
    }

    async init(guild: Guild) {
        //Load extensions
        await this.loadExtensions(guild);
        this.commandManager.updateDb();
    }

    //Enables extension
    enableExtension(namespace: string) {
        //Checks if extensions exists
        if (this.extensions[namespace] === undefined) return;
        if (this.extensions[namespace].enabled) return;
        
        //Enables extension and registers for events
        this.extensions[namespace].enabled = true;
        let events = this.extensions[namespace].events;
        for (let i in events) {
            let thisEvent = events[i];
            if (this.events[thisEvent] === undefined) this.events[thisEvent] = [];
            this.events[thisEvent].push(namespace);
        }


    }

    //Disables extension
    disableExtension(namespace: string) {
        //Check if extension exists
        if (this.extensions[namespace] === undefined) return;
        if (!this.extensions[namespace].enabled) return;

        //Disables extension and removes registered events
        this.extensions[namespace].enabled = false;
        let events = this.extensions[namespace].events;
        for (let i in events) {
            let thisEvent = events[i];
            let arrayPos = this.events[thisEvent].indexOf(namespace);
            this.events[thisEvent].splice(arrayPos, 1);
        }
    }
    
    //Reload extension
    reloadExtensions() {
        //Implement extension reloader
    }

    //Loads all extensions
    private async loadExtensions(guild: Guild) {
        let extensionDirs = mapDir('./extensions');
        for (let dir in extensionDirs) {
            await this.loadExtension(extensionDirs[dir], guild);
        }
    }

    //Unloads all Extensions
    private unloadExtensions() {
        //Implement extension unloading
    }

    //Loads specific extension
    private async loadExtension (dir: string, guild: Guild) {
        const config = require('./extensions/' + dir + '/config.json'); //Extension config file
        const extension = require('./extensions/' + dir + '/' + dir + '.js'); //Extension .js file

        //Creates new extension and sets initial values
        let thisExtension: Extension = extension.createExtension();
        thisExtension.namespace = config.namespace;
        thisExtension.useDB = config.useDB;

        //Sets database listeners and fetches databaseObject from database
        if (thisExtension.useDB) {
            //Handles the 'send' event, sends new document to database
            thisExtension.on('send', (namespace, data) => {
                this.databaseManager.sendDocument(namespace, data);
            });

            //Handles the 'update' event, updates existing document
            thisExtension.on('update', (namespace, data) => {
                this.databaseManager.updateDocument(namespace, data);
            });

            //Handles the 'fetch' event, requests updated databaseObject for the extension
            thisExtension.on('fetch', async (namespace, extension: Extension ) => {
                let document = await this.databaseManager.fetchDocument(namespace);

                if (document === undefined) {
                    extension.emit('dbDone', false);
                    return;
                }
                extension.databaseObject = document;

                extension.emit('dbDone', true);
            }); 

            //Fetches extension database object
            let databaseObject = await this.databaseManager.fetchDocument(config['namespace']);
            if (databaseObject !== undefined) thisExtension.databaseObject = databaseObject;
        }
        
        //Initializes extension
        await thisExtension.init(guild);

        //Sets the extensions eventlist
        thisExtension.events = config.events;
        
        //Registers extension commands and tooltips
        if (config.subCommands !== undefined) this.commandManager.commands[config.namespace] = config.subCommands;
        if (config.help !== undefined) this.commandManager.tooltips[config.namespace] = config.help;

        //Registers extension in extension list indexed by namespace
        this.extensions[config.namespace] = thisExtension;

        //Sets extension to ready
        thisExtension.ready = true;

        return;
    }

    //Unloads extension
    private unloadExtension () {
        //Implement extension unloader
    }
}