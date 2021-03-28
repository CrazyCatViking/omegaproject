import { Guild, Message, NewsChannel, TextChannel } from "discord.js";
import { fetchMessage, fetchChannel } from "../omegaToolkit";

export class MessageTracker {
    messages: {[id: string]: Message}

    constructor() {
        this.messages = {};
    }

    async init(messages: any, guild: Guild) {
        if (messages === undefined) return;

        for (let messageId in messages) {
            let channelId = messages[messageId];
            let thisMessage = await fetchMessage(messageId, channelId, guild);
            if (thisMessage !== undefined) this.messages[messageId] = thisMessage;
        }
    }

    trackMessage(message: Message) {
        if (this.isTracked(message.id)) return;
        this.messages[message.id] = message;
        console.log("tracking message: " + message.id);
        return;
    }

    untrackMessage(messageId: string) {
        if (this.messages[messageId] === undefined) return;
        delete this.messages[messageId];
        return;
    }

    isTracked(messageId: string) {
        if (this.messages[messageId] !== undefined) return true;
        return false;
    }

    getTrackedMessages() {
        let trackedMessages: {shortContent: string, url: string, channelName: string, messageId: string}[] = [];

        for (let messageId in this.messages) {
            let trackedMessage = {shortContent: "", url: "", channelName: "", messageId: ""};

            let channel = this.messages[messageId].channel as TextChannel | NewsChannel;
            trackedMessage.channelName = channel.name;

            let shortContent = this.messages[messageId].content.substring(0, 20) + "...";
            trackedMessage.shortContent = shortContent;
            trackedMessage.url = this.messages[messageId].url;
            trackedMessage.messageId = this.messages[messageId].id;

            trackedMessages.push(trackedMessage);
        }

        return trackedMessages;
    }

    getStorableObjet() {
        let storableObject: {[messageId: string]: string} = {};

        for (let messageId in this.messages) {
            storableObject[messageId] = this.messages[messageId].channel.id;
        }

        return storableObject;
    }
}