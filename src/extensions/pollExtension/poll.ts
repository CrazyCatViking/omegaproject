export enum PollStatus {
    New = "New",
    Posted = "Posted",
    Ended = "Ended",
}

export interface IPollMessageData {
    messageId: string,
    channelId: string,
}

export interface IPollStorable {
    mode: string,
    id: string,
    description: string,
    options: string[],
    status: PollStatus,
    pollMessageData?: IPollMessageData,
}

export interface IPollPostable {
    mode: string,
    id: string,
    description: string,
    options: string[],
}

export class Poll {
    private mode: string;
    public id: string;
    public description: string;
    private options: string[];
    public status: PollStatus = PollStatus.New;
    private _pollMessageData?: IPollMessageData;

    constructor(mode: string, id: string, description: string, options: string[]) {
        this.mode = mode;
        this.id = id;
        this.description = description;
        this.options = options;
    }

    public get postablePoll(): IPollPostable {
        return {
            mode: this.mode,
            id: this.id,
            description: this.description,
            options: this.options,
        }
    }

    public get storablePoll(): IPollStorable {
        return {
            mode: this.mode,
            id: this.id,
            description: this.description,
            options: this.options,
            status: this.status,
            pollMessageData: this.pollMessageData,
        }   
    }

    public set pollMessageData(messageData: IPollMessageData) {
        this._pollMessageData = messageData;
        this.status = PollStatus.Posted;
    }

    public getPollMessageData() {
        return this._pollMessageData;
    }

    public endPoll() {
        this.status = PollStatus.Ended;
        this._pollMessageData = undefined;
    }
}