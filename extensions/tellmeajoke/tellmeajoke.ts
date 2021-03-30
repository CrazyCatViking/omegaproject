import { Message } from "discord.js";
import { Extension } from "../../extension";
import ICanHazDadJokeClient from 'icanhazdadjoke-client';
import { createEmbed } from "../../omegaToolkit";

export function createExtension() {
    return new Tellmeajoke();
}

class Tellmeajoke extends Extension {
    jokeClient: ICanHazDadJokeClient;

    constructor() {
        super();
        this.jokeClient = new ICanHazDadJokeClient();
    }

    //Handle message event
    async message(message: Message) {
        if (message.content.toLowerCase() === "omega, tell me a joke") {
            let joke = await this.jokeClient.getRandomJoke();
            let embed = createEmbed(joke.joke);
            message.channel.send(embed);
        }
    }
}