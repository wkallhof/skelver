import State from "./state";
import NodeInfo from "../peers/nodeInfo";
import BlockChain from "../blockchain/blockchain";
import {Transaction} from "../transaction/transaction";
import { Component } from "@nestjs/common";

export interface IStateManager{
    getState(): State;
    setState(state: State): void;
    updatePeers(peers: Array<NodeInfo>): void;
    updateBlockChain(blockChain: BlockChain): void;
    updateTransactions(transactions: Array<Transaction>): void;
}

@Component()
export class StateManager implements IStateManager {

    private _state: State;

    constructor() {
        this._state = new State();
    }

    getState(): State {
        return this._state;
    }

    updatePeers(peers: Array<NodeInfo>): void{
        this._state.peers = peers;
    }

    updateBlockChain(blockChain: BlockChain): void{
        this._state.blockchain = blockChain;
    }

    updateTransactions(transactions: Array<Transaction>) {
        this._state.transactions = transactions;
    }

    setState(state: State): void {
        //TODO: Do some validation here

        this._state = state;
    }
}