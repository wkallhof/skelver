import BlockChain from "./blockchain";
import { IPeerManager } from "../peers/peerManager";
import { IStateManager, StateManager } from "../state/stateManager";
import { Inject, Component } from "@nestjs/common";
import DI from "../../di";
import Block from "./block";
import { Output, Transaction } from "../transaction/transaction";
import { ICryptoService } from "../crypto/crypto.service";

export interface IBlockChainManager{
    initialize(publicKey: string, privateKey: string): void;
    updateBlockChain(blockChain: BlockChain): void;
    addBlock(block: Block): void;
}

@Component()
export class BlockChainManager implements IBlockChainManager {

    private _blockChain: BlockChain;
    private _stateManager: IStateManager;
    private _cryptoService: ICryptoService;

    constructor(@Inject(DI.IStateManager) stateManager: IStateManager, @Inject(DI.ICryptoService) cryptoService: ICryptoService) {
        this._blockChain = new BlockChain();
        this._blockChain.blocks = new Array<Block>();
        
        this._stateManager = stateManager;
        this._cryptoService = cryptoService;
    }

    public initialize(publicKey: string, privateKey: string): void {
        // create genesis block
        let genesisBlock = new Block();
        genesisBlock.prevHash = null;
        genesisBlock.transactions = new Array<Transaction>();
        
        // create first transaction
        let firstTransaction = new Transaction({
            outputs: new Array<Output>(new Output({ to: publicKey, amount: 500000 })),
            inputs: null
        });

        firstTransaction.id = this._cryptoService.hash(JSON.stringify(firstTransaction));

        genesisBlock.transactions.push(firstTransaction);
        this._blockChain.blocks.push(genesisBlock);
        this.persistState();
    }

    public updateBlockChain(blockChain: BlockChain): void {
        if (this.validateChain(blockChain) && blockChain.blocks.length > this._blockChain.blocks.length) {
            this._blockChain = blockChain; 
            this.persistState();
        }
    }

    public addBlock(block: Block): void{
        if (!this.validateBlock(block)) {
            //TODO: Log
            return;
        }

        this._blockChain.blocks.push(block);
        this.persistState();
    }

    private validateBlock(block: Block) {
        return true;
    }

    private validateChain(blockChain: BlockChain): boolean {
        return true;
    }

    private persistState(): void{
        this._stateManager.updateBlockChain(this._blockChain);
    }
}