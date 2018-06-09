import BlockChain from "./blockchain";
import { IPeerManager } from "../peers/peerManager";
import { IStateManager, StateManager } from "../state/stateManager";
import { Inject, Component, Injectable } from "@nestjs/common";
import DI from "../../di";
import Block from "./block";
import { Transaction } from "../transaction/transaction";
import { ICryptoService } from "../crypto/crypto.service";
import * as _ from "lodash";
import { ITransactionManager } from "../transaction/transactionManager";

export interface IBlockChainManager{
    updateBlockChain(blockChain: BlockChain): void;
    addBlock(block: Block): void;
    getTopBlock(): Block;
}

@Injectable()
export class BlockChainManager implements IBlockChainManager {

    private _blockChain: BlockChain;
    private _stateManager: IStateManager;
    private _cryptoService: ICryptoService;
    private _transactionManager: ITransactionManager;

    constructor(@Inject(DI.IStateManager) stateManager: IStateManager,
                @Inject(DI.ICryptoService) cryptoService: ICryptoService,
                @Inject(DI.ITransactionManager) transactionManager: ITransactionManager) {
        
        this._blockChain = new BlockChain();
        this._blockChain.blocks = new Array<Block>();
        
        this._stateManager = stateManager;
        this._cryptoService = cryptoService;
        this._transactionManager = transactionManager;
    }

    public updateBlockChain(blockChain: BlockChain): void {
        if (this.validateChain(blockChain) && blockChain.blocks.length > this._blockChain.blocks.length) {
            this._blockChain = blockChain; 
            this.persistState();
        }
    }

    public addBlock(block: Block): void{
        console.log("adding block");
        if (!this.validateBlock(block)) {
            //TODO: Log
            return;
        }

        this._blockChain.blocks.push(block);
        this._transactionManager.removeTransaction(block.transaction.id);
        this.persistState();
        console.log("persist done");
    }

    public getTopBlock(): Block {
        if (!this._blockChain || !this._blockChain.blocks || this._blockChain.blocks.length == 0)
            return null;
        
        return _.clone(_.last(this._blockChain.blocks));
    }

    private validateBlock(block: Block) {
        return block
            && block.hash
            && block.transaction;
    }

    private validateChain(blockChain: BlockChain): boolean {
        return true;
    }

    private persistState(): void{
        this._stateManager.updateBlockChain(this._blockChain);
    }
}