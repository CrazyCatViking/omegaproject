import { DbContext } from "./dbContext";
import { ISessionState, ISharedState } from "./types";

export class StateStorage {
    private dbContext?: DbContext;

    protected $sessionState: any;
    protected $sharedState: any;

    constructor(dbContext?: DbContext) {
        this.dbContext = dbContext;
        this.$sessionState = {};
        this.$sharedState = {};
    }

    async initStateStorage() {
        if (!!this.dbContext === false) return;

        const sharedState = await this.dbContext?.getSharedState()
        if (!sharedState?.result) await this.dbContext?.insertSharedState(this.$sharedState);

        this.$sharedState = sharedState?.data ?? {};
    }

    get sessionState() {
        return this.$sessionState;
    }

    get sharedState() {
        return {...this.$sharedState};
    }

    set sessionState(sessionState: any) {
        this.$sessionState = sessionState;
    }

    set sharedState(sharedState: any) {
        this.$sharedState = sharedState;
        if (this.dbContext?.ready) this.dbContext.updateSharedState(sharedState);
    }
}