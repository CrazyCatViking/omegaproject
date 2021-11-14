import { EventEmitter } from 'stream';

export abstract class BaseManager extends EventEmitter {   
    protected $state: Record<string, any>;
    hashGuildId: string;

    constructor(hashGuildId: string) {
        super();

        this.hashGuildId = hashGuildId;
        this.$state = {};
    }
}