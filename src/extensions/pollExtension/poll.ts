export enum PollStatus {
    New = "New",
    Posted = "Posted",
    Ended = "Ended",
}

export enum PollModes {
    SingleVote = "singl-evote",
    MultiVote = "multi-vote",
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
    id: string,
    description: string,
    options: string[],
}

export class Poll {
    private mode: string;
    public id: string;
    public description: string;
    private _options: string[];
    public status: PollStatus;
    private _pollMessageData?: IPollMessageData;

    constructor(mode: string, id: string, description: string, options: string[], status: PollStatus = PollStatus.New, messageData?: IPollMessageData) {
        this.mode = mode;
        this.id = id;
        this.description = description;
        this._options = options;
        this._pollMessageData = messageData;
        this.status = status;
    }

    public get pollMode() {
        return this.mode;
    }

    public get postablePoll(): IPollPostable {
        return {
            id: this.id,
            description: this.description,
            options: this._options,
        }
    }

    public get storablePoll(): IPollStorable {
        return {
            mode: this.mode,
            id: this.id,
            description: this.description,
            options: this._options,
            status: this.status,
            pollMessageData: this._pollMessageData,
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

    public get options() {
        return [...this._options];
    }
}