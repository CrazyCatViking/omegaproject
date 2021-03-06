/*
    The permissionManager handles permission checks and stores permission information for commands.
*/

import { GuildMember, Message } from "discord.js";
import { DatabaseManager } from "./databaseManager";

export class PermissionManager {
    userPermissions: {[userId: string]: {name: string, permissions: {[namespace: string]: string[]}}}; //Stores what commands a spcific user has permissions to use
    rolePermissions: {[roleId: string]: {name: string, permissions: {[namespace: string]: string[]}}}; //Stores what commands a specific role has permissions to use

    databaseManager: DatabaseManager; //Guild specific database manager
    databaseObject: {[dataType: string]: {}}; //Database object for local database data

    constructor(databaseManager: DatabaseManager) {
        //Sets initial values
        this.userPermissions = {};
        this.rolePermissions = {};
        this.databaseManager = databaseManager;
        this.databaseObject = {};
    }

    //Initializes permissionManager
    async init() {
        //Fetches and checks the databaseobject and stores it locally
        let document = await this.databaseManager.fetchDocument("permissions");
        if (document === undefined) {
            this.databaseObject = {userPermissions: {}, rolePermissions: {}};
            await this.databaseManager.sendDocument("permissions", this.databaseObject);
        } else {
            this.databaseObject = document;
        }

        this.databaseManager.on('guild', async () => {
            let newDocument = await this.databaseManager.fetchDocument("permissions");
            this.databaseObject = newDocument;

            this.userPermissions = this.databaseObject.userPermissions;
            this.rolePermissions = this.databaseObject.rolePermissions;
        });

        //Sets user and role permissions stored in the database object
        this.userPermissions = this.databaseObject.userPermissions;
        this.rolePermissions = this.databaseObject.rolePermissions;
    }
    
    //Resolves permissions
    resolvePermissions(namespace: string, subCommand: string, guildMember: GuildMember): boolean {
        if (guildMember.permissions.has(8, true)) return true; //Checs if user has admin rights or is the guild/server admin

        if (this.resolveUserPermission(namespace, subCommand, guildMember)) return true; //Checks if user has permission for the specified command
        if (this.resolveRolePermission(namespace, subCommand, guildMember)) return true; //Checks if user has a role with the permissions for the specified command
        
        return false;
    }

    //Sets permissions for specified namespace and subCommands
    setPermission(namespace: string, subCommands: string[], message: Message) {
        /*
            Permissions are set by mentioning users and roles in a message containing a command.
            This command is in the adminTools, and the adminTools calls this method in the permissionManager when the correct admin command is called by a user
            who has permissions to use the admin tools.
            The setPermissions method gets all mentioned users and roles and sets permissions
            for them on the specified commandspace and subCommands
        */

        //Sets permissions for metioned users for the supplied namespace and commands
        let members: GuildMember[] = [];
        if (message.mentions.members === null) return;
        members = message.mentions.members.array();

        for (let i in members) {
            let id = members[i].id;
            let displayName = members[i].displayName;

            if (this.userPermissions[id] === undefined) this.userPermissions[id] = {name: displayName, permissions: {}};

            if (this.userPermissions[id].permissions[namespace] !== undefined) {
                let currentSubCommands = this.userPermissions[id].permissions[namespace];
                for (let i in subCommands) {
                    if (!currentSubCommands.includes(subCommands[i])) this.userPermissions[id].permissions[namespace].push(subCommands[i]);
                }
            } else {
                this.userPermissions[id].permissions[namespace] = subCommands;
            }
        }

        //Sets permissions for mentioned roles for the supplied namespace and commands
        let roles = message.mentions.roles.array();
        for (let i in roles) {
            let id = roles[i].id;
            let roleName = roles[i].name;

            if (this.rolePermissions[id] === undefined) this.rolePermissions[id] = {name: roleName, permissions: {}};
            if (this.rolePermissions[id].permissions[namespace] !== undefined) {
                let currentSubCommands = this.rolePermissions[id].permissions[namespace];
                for (let i in subCommands) {
                   if (!currentSubCommands.includes(subCommands[i])) this.rolePermissions[id].permissions[namespace].push(subCommands[i]);
                }
            } else {
                this.rolePermissions[id].permissions[namespace] = subCommands;
            }

        }

        this.updateDb(); //Updates database
    }

    //Removes permissions for a sepcified namespace and subCommands
    removePermission(namespace: string, subCommands: string[], message: Message) {
        /*
            Permissions are removed by mentioning users and roles in a message containing a command.
            This command is in the adminTools, and the adminTools calls this method in the permissionManager when the correct admin command is called by a user
            who has permissions to use the admin tools.
            The removePermission method gets all mentioned users and roles and removes permissions
            for them on the specified commandspace and subCommands
        */

        //Removes permissions for metioned users for the supplied namespace and commands
        let members: GuildMember[];
        if (message.mentions.members === null) return;
        members = message.mentions.members.array();

        for (let i in members) {
            let id = members[i].id;
            let displayName = members[i].displayName;

            let removedSubCommands: string[] = [];
            if (this.userPermissions[id] === undefined) this.userPermissions[id] = {name: displayName, permissions: {}};
            if (this.userPermissions[id].permissions[namespace] !== undefined) {
                let currentSubCommands = this.userPermissions[id].permissions[namespace];

                for (let i in subCommands) {
                   if (currentSubCommands.includes(subCommands[i])) removedSubCommands.push(subCommands[i]);
                }

                for (let i in removedSubCommands) {
                    let arrayPos = this.userPermissions[id].permissions[namespace].findIndex(permission => permission  === removedSubCommands[i]);
                    this.userPermissions[id].permissions[namespace].splice(arrayPos, 1);
                }

                if (this.userPermissions[id].permissions[namespace].length === 0) delete this.userPermissions[id].permissions[namespace];
            } 
        }

        //Removes permissions for mentioned roles for the supplied namespace and commands
        let roles = message.mentions.roles.array();
        for (let i in roles) {
            let id = roles[i].id;
            let roleName = roles[i].name;

            let removedSubCommands: string[] = [];
            if (this.rolePermissions[id] === undefined) this.rolePermissions[id] = {name: roleName, permissions: {}};
            if (this.rolePermissions[id].permissions[namespace] !== undefined) {
                let currentSubCommands = this.rolePermissions[id].permissions[namespace];

                for (let i in subCommands) {
                   if (currentSubCommands.includes(subCommands[i])) removedSubCommands.push(subCommands[i]);
                }  

                for (let i in removedSubCommands) {
                    let arrayPos = this.rolePermissions[id].permissions[namespace].findIndex(permission => permission === removedSubCommands[i]);
                    this.rolePermissions[id].permissions[namespace].splice(arrayPos, 1);
                }

                if (this.rolePermissions[id].permissions[namespace].length === 0) delete this.rolePermissions[id].permissions[namespace];
            }
        }

        this.updateDb(); //Updates database
    }

    //Checks if a user has the correct permissions
    private resolveUserPermission(namespace: string, subCommand: string, guildMember: GuildMember): boolean {
        if (this.userPermissions[guildMember.id] === undefined) return false;
        if (this.userPermissions[guildMember.id].permissions[namespace] === undefined) return false;
        if (this.userPermissions[guildMember.id].permissions[namespace].includes(subCommand)) return true;
        return false;
    }

    //Checks if a role has the correct permissions
    private resolveRolePermission(namespace: string, subCommand: string, guildMember: GuildMember): boolean {
        let roles = guildMember.roles.cache.array();
        for (let i in roles) {
            if (this.rolePermissions[roles[i].id] !== undefined) {
                if (this.rolePermissions[roles[i].id].permissions[namespace] !== undefined) {
                    if (this.rolePermissions[roles[i].id].permissions[namespace].includes(subCommand)) return true;
                }
            }
        }
        return false;
    }
    
    //Updates the databeseobject and the database
    private updateDb() {
        this.databaseObject.userPermissions = this.userPermissions;
        this.databaseObject.rolePermissions = this.rolePermissions;
        this.databaseManager.updateDocument("permissions", this.databaseObject);
    }
}