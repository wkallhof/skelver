import NodeInfo from "./nodeInfo";
import { IStateManager } from "../state/stateManager";
import { Inject, Component, Injectable } from "@nestjs/common";
import DI from "../../di";
import { ICommunicator } from "./communicator";
import * as _ from "lodash";

export interface IPeerManager{
    addPeer(peer: NodeInfo): void;
    addPeers(peers: Array<NodeInfo>): void;
    gossipAsync(): Promise<void>;
    cleanUp(): void;
}

@Injectable()
export class PeerManager implements IPeerManager {

    private _peers: Array<NodeInfo>;
    private _stateManager: IStateManager;
    private _communicator: ICommunicator;

    constructor(@Inject(DI.IStateManager) stateManager: IStateManager, @Inject(DI.ICommunicator) communicator: ICommunicator) {
        this._peers = new Array<NodeInfo>();
        this._stateManager = stateManager;
        this._communicator = communicator;
    }

    public async gossipAsync(): Promise<void> {
        const state = this._stateManager.getState();
        this._peers.forEach(async (peer) => {
            try {
                let success = await this._communicator.gossipAsync(peer.address, state);
                if (!success)
                    peer.faulty = true;
            }
            catch (error) {
                peer.faulty = true;
            }

            this.persist();
        });
    }

    public addPeers(peers: Array<NodeInfo>): void {
        peers.forEach((p) => this.addPeer(p));
    }

    public addPeer(peer: NodeInfo): void {
        const currentState = this._stateManager.getState();
        if (peer.address == currentState.node.address) return;
        if (peer.faulty) return;

        if (_.findIndex(this._peers, { "address": peer.address }) >= 0) return;
        
        this._peers.push(peer);
        this._peers = _.uniqBy(this._peers, "address");
        this.persist();
    }

    public cleanUp(): void {
        this._peers = _.reject(this._peers, { "faulty": true });
        this.persist();
    }

    private persist(): void{
        this._stateManager.updatePeers(this._peers);
    }
    
}