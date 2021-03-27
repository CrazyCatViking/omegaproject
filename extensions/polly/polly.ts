/*
    Polly is a poll extension enabeling creation, and use of polls in the Discord TextChat
    Polly supports polls with a total of 9 options, and has support for single vote polls and 
    multivote polls. To vote in a polly poll the user simply reacts with the corresponding
    reaction emoji to the poll post in the discord textChannel. 

    If the poll is a single vote poll (default) then polly will automatically remove old
    votes from users by deleting old reaction if they vote for an additional entry in the poll.
*/

import { Guild, User, PartialUser, Message, MessageReaction, TextChannel } from "discord.js";
import { checkFlags, createEmbed } from "../../omegaToolkit";
import { Extension } from "../../extension";

//Emojis used for voting in polls
const numberEmoji: string[] = ["1⃣", "2⃣", "3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"];

//Creates and returns the extension
export function createExtension() {
    return new Polly();
}

class Polly extends Extension {
    polls: {[pollId: string]: Poll}; //Stores the polls indexed by pollID 

    constructor() {
        //Sets initial values
        super();
        this.polls = {};
    }

    async init(guild: Guild) {
        //Checks for database object, if undefined it initializes a new one and syncs it to the database
        if (this.databaseObject === undefined) {
            this.databaseObject = {polls: {}};
            this.dbSend();
        }
        
        //Loades stored polls that were active last time the bot was active
        let storedPolls = this.databaseObject["polls"] as {[pollId: string]: any};
        if (storedPolls !== undefined) {
            for (let poll in storedPolls) {
                let newPoll = new Poll(poll, storedPolls[poll].pollName, storedPolls[poll].pollItems, storedPolls[poll].multiVote);
                if (storedPolls[poll].posted) {
                    newPoll.posted = true;
                    newPoll.messageId = storedPolls[poll].messageId;
                    newPoll.channelId = storedPolls[poll].channelId;
                    await this.loadPoll(newPoll, guild);
                }
                this.polls[poll] = newPoll;
            }
        }
    }

    //Handles the 'reactionAdd' event 
    reactionAdd(reaction: MessageReaction, user: User | PartialUser) {
        let reactionManager = reaction.message.reactions;
        let messageId = reaction.message.id;

        //Checks if event corresponds to an active poll
        let thisPoll; 
        for (let poll in this.polls) {
            if (this.polls[poll].messageId === messageId) {
                thisPoll = this.polls[poll]
                break;
            }
        }

        if (thisPoll === undefined) return; //Checks if poll exists
        if (thisPoll.multiVote) return; //Checks if poll i multivote or not
        if (!thisPoll.voters.includes(user.id)) { //Checks if user has voted already
            thisPoll.voters.push(user.id);
            return;
        }
        
        //If user has voted already, removes extra reactions
        let reactions = reactionManager.cache.array();
        for (let i in reactions) {
            if (reactions[i].emoji.name !== reaction.emoji.name) {
                let thisUser = reactions[i].users.cache.find(object => object.id === user.id);
                if (thisUser !== undefined) reactions[i].users.remove(thisUser.id);
            }
        }
    }

    //Handles the 'reactionRemove' event
    reactionRemove(reaction: MessageReaction, user: User | PartialUser) {
        let reactionManager = reaction.message.reactions;
        let messageId = reaction.message.id;
        let reactions = reactionManager.cache.array();
        let otherVote: boolean = false;

        //Checks if message corresponds to active poll
        let thisPoll = {} as Poll; 
        for (let poll in this.polls) {
            if (this.polls[poll].messageId === messageId) {
                thisPoll = this.polls[poll]
                break;
            }
        }

        if (thisPoll === undefined) return; //Checks if poll exists
        if (thisPoll.multiVote) return; //Checks if poll is multivote

        //Checks if user has other votes in addition to the one removed
        for (let i in reactions) {
            let thisUser = reactions[i].users.cache.find(object => object.id === user.id);
            if (thisUser !== undefined) otherVote = true;
        }

        //If user has no other votes, unregister user as a voter
        if (!otherVote) {
            for (let i in thisPoll.voters) {
                let arrayPos = thisPoll.voters.indexOf(i);
                if (thisPoll.voters[i] === user.id) {
                    thisPoll.voters.splice(arrayPos, 1);
                    break;
                }
            }
        }
    }

    //Updates database object
    updateDatabaseObject() {
        let storablePolls: {[pollId: string]: {}} = {};

        for (let poll in this.polls) {
            let pollObject = this.polls[poll].createStorableObject();
            storablePolls[poll] = pollObject;
        }

        if (this.databaseObject !== undefined) this.databaseObject["polls"] = storablePolls;
    }

    //Loads stored poll and connect it to the poll message after bot has restarted
    async loadPoll(newPoll: Poll, guild: Guild) {
        //Get channel the poll was posted in
        let channel = guild.channels.cache.array().find(object => object.id === newPoll.channelId) as TextChannel;
        if (channel === undefined) return;

        //Get the poll message
        let message = await channel.messages.fetch(newPoll.messageId);
        let reactions = message.reactions.cache.array();

        //Check if poll is multivote
        if (newPoll.multiVote) return;

        //If poll is not multivote, check if users have multiple votes
        let voters: string[] = [];
        for (let a in reactions) {
            let reaction = reactions[a];
            let userManager = reaction.users;
            let userCollection = await userManager.fetch();
            let users = userCollection.array();
            for (let b in users) {
                if (voters.includes(users[b].id) && !users[b].bot) {
                    userManager.remove(users[b].id);
                } else if (!users[b].bot) {
                    voters.push(users[b].id);
                }
            }
        }

        newPoll.voters = voters;
    }

    //Commands
    //Lists all stored and active polls
    list(args: string[], message: Message) {   
        let list: string = "";
        for (var poll in this.polls) {
            list = poll + ": " + this.polls[poll].pollName; + "\n";
        }

        let embed = createEmbed(list);
        message.channel.send(embed);
    }  

    //Create a new poll
    create(args: string[], message: Message) {
        let checkedArgs = checkFlags(args);
        let flags = checkedArgs.flags;
        let newArgs = checkedArgs.args;

        let pollId = newArgs[0];
        let pollName = newArgs[1];
        let pollItems = newArgs.slice(2);

        if (pollId === undefined) return;
        if (pollName === undefined) return;
        if (pollItems === undefined) return;

        //Check if there are too many poll items
        if (pollItems.length >= 9) {
            let embed = createEmbed("The maximum number of poll entries is 9");
            message.channel.send(embed);
            return;
        }

        //Check for multivote flag
        let multivote = false;
        if (flags.includes("multivote")) multivote = true;
        
        //Create new poll
        let poll = new Poll(pollId, pollName, pollItems, multivote);
        this.polls[pollId] = poll;

        //Send response
        let embed = createEmbed("A poll with id: " + pollId + " has been successfully created!");
        message.channel.send(embed);

        //Update database
        this.updateDatabaseObject();
        this.dbUpdate();
    }

    //Post poll
    async post(args: string[], message: Message) {
        let pollId = args[0];
        if (pollId === undefined) return;
        if (this.polls[pollId] === undefined) return;

        let thisPoll = this.polls[pollId];
        //check if poll has already been posted
        if (thisPoll.posted) {
            let embed = createEmbed("The poll with id: " + pollId + " has already been posted!");
            message.channel.send(embed);
            return;
        }

        //Generate poll text and send poll message
        let pollText = thisPoll.createPollText();
        let embed = createEmbed(pollText);
        let pollMessage = await message.channel.send(embed);

        //React with initial reactions for voting
        for (let i in thisPoll.pollItems) {
            await pollMessage.react(numberEmoji[i]);
        }

        thisPoll.posted = true;
        thisPoll.messageId = pollMessage.id;
        thisPoll.channelId = pollMessage.channel.id;

        //Update database
        this.updateDatabaseObject();
        this.dbUpdate();
    }

    //Ends poll
    async end(args: string[], message: Message) {
        let pollId = args[0];
        if (pollId === undefined) return;
        if (this.polls[pollId] === undefined) return;

        //Check if poll has been posted yet
        if (!this.polls[pollId].posted) {
            let embed = createEmbed("The poll with id: " + pollId + " has not been posted yet.");
            message.channel.send(embed);
            return;
        }
        
        //Get poll channel
        let channels = message.guild?.channels.cache.array();
        let channel = channels?.find(object => object.id === this.polls[pollId].channelId) as TextChannel;
        if (channel === undefined) return;

        //Get poll message
        let pollMessage = await channel.messages.fetch(this.polls[pollId].messageId);
        let reactions = pollMessage.reactions.cache.array();

        //Check votes
        let pollOptions: {[emoji: string]: {item: string, votes: number}} = {};
        for (let i in this.polls[pollId].pollItems) {
            let pollOption = {item: this.polls[pollId].pollItems[i], votes: 0};
            pollOptions[numberEmoji[i]] = pollOption;
        }
        for (let i in reactions) {
            let num = reactions[i].count as number - 1;
            let emoji = reactions[i].emoji.name;
            pollOptions[emoji].votes = num;
        }
        
        //Generate result
        let results = "**The poll results for " + this.polls[pollId].pollName + " are:**\n";
        for (let option in pollOptions) {
            results = results + option + " " + pollOptions[option].item + " got: " + pollOptions[option].votes + " vote(s)\n";
        }

        //Send result
        let embed = createEmbed(results);
        message.channel.send(embed);

        //Update database
        delete this.polls[pollId];
        this.updateDatabaseObject();
        this.dbUpdate();
    }

    //Deletes poll
    delete(args: string[], message: Message) {
        let pollId = args[0];
        if (pollId === undefined) return;
        if (this.polls[pollId] === undefined) return;
        //Checks if poll has been posted
        if (this.polls[pollId].posted) {
            let embed = createEmbed('The poll with id: " + pollId + " has already been posted. Run the "end" command to end the active poll.');
            message.channel.send(embed);
        }
        
        //Updates database
        delete this.polls[pollId];
        this.updateDatabaseObject();
        this.dbUpdate();
    }
}

//The poll class, stores all information about a poll
class Poll {
    pollId: string;
    pollName: string;
    pollItems: string[];
    multiVote: boolean;
    posted: boolean;
    voters: string[];
    messageId: string;
    channelId: string;

    constructor(pollId: string, pollName: string, pollItems: string[], multiVote: boolean) {
        //Set initial values
        this.pollId = pollId;
        this.pollName = pollName;
        this.pollItems = pollItems;
        this.multiVote = multiVote;
        this.posted = false;
        this.voters = [];

        this.messageId = "";
        this.channelId = "";
    }

    //Creates poll text
    createPollText() {
        let text = "**" + this.pollName + "**\n";
        for (let i in this.pollItems) {
            text = text + numberEmoji[i] + " " + this.pollItems[i] + "\n";
        }

        return text;
    }

    //Creates a .json friendly storable object for storing polls in the database
    createStorableObject() {
        let poll = {pollName: this.pollName, 
                    pollItems: this.pollItems, 
                    multiVote: this.multiVote, 
                    posted: this.posted, 
                    voters: this.voters, 
                    messageId: this.messageId, 
                    channelId: this.channelId
        };

        return poll;
    }
}