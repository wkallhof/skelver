import { Inject, Component } from "@nestjs/common";
import DI from "../../di";
import { IPeerManager } from "../peers/peerManager";
import { IBlockChainManager } from "../blockchain/blockChainManager";
import { ITransactionManager } from "../transaction/transactionManager";
import { IStateManager, StateManager } from "../state/stateManager";

export interface IScheduler{
    startGossipTask(intervalInMilliseconds: number): void;
    stopGossipTask(): void;

    startOutputTask(intervalInMilliseconds: number): void;
    stopOutputTask(): void;
}

@Component()
export class Scheduler implements IScheduler {

    private _gossipInterval: NodeJS.Timer;
    private _outputInterval: NodeJS.Timer;

    private readonly _peerManager: IPeerManager;
    private readonly _stateManager: IStateManager;

    constructor(@Inject(DI.IPeerManager) peerManager: IPeerManager,
        @Inject(DI.IStateManager) stateManager: IStateManager) {
        
        this._peerManager = peerManager;
        this._stateManager = stateManager;
    }

    public startGossipTask(intervalInMilliseconds: number): void {
        this._gossipInterval = setInterval(async () => {
            await this._peerManager.gossipAsync();
            this._peerManager.cleanUp();
        }, intervalInMilliseconds);
    }

    public stopGossipTask(): void {
        if (this._gossipInterval)
            clearInterval(this._gossipInterval);  
    }

    public startOutputTask(intervalInMilliseconds: number): void{
        this._outputInterval = setInterval(async () => {
            const state = this._stateManager.getState();
            process.stdout.write(`[${Date.now()}] - Node: "${state.node.name}" Peers: ${state.peers.length} Blocks: ${state.blockchain.blocks.length} Transactions: ${state.transactions.length}\r`);
        }, intervalInMilliseconds);
    }

    public stopOutputTask(): void{
        if (this._outputInterval)
            clearInterval(this._outputInterval);  
    }
}