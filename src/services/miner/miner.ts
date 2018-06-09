import { Component, Inject, Injectable } from "@nestjs/common";
import DI from "../../di";
import { IStateManager } from "../state/stateManager";
import { ITransactionManager } from "../transaction/transactionManager";
import { IBlockChainManager } from "../blockchain/blockChainManager";
import { ICryptoService } from "../crypto/crypto.service";
import { Transaction } from "../transaction/transaction";
import Block from "../blockchain/block";

@Injectable()
export default class Miner{

    private readonly _cryptoService: ICryptoService;
    private readonly _blockChainManager: IBlockChainManager;
    private readonly _transactionManager: ITransactionManager;
    private readonly _stateManager: IStateManager;

    private _mining: boolean;

    private _mineInterval: NodeJS.Timer;

    constructor(@Inject(DI.ITransactionManager) transactionManager: ITransactionManager,
                @Inject(DI.IBlockChainManager) blockChainManager: IBlockChainManager,
                @Inject(DI.ICryptoService) cryptoService: ICryptoService,
                @Inject(DI.IStateManager) stateManager: IStateManager) {
        
        this._transactionManager = transactionManager;
        this._blockChainManager = blockChainManager;
        this._cryptoService = cryptoService;
        this._stateManager = stateManager;
    }

    public async start(intervalInMilliseconds: number) {
        this._mineInterval = setInterval(async () => {
            if (!this._mining) {
                this._mining = true;
                await this.mine();
                this._mining = false;
            }
                
        }, intervalInMilliseconds);
    }

    public stop() {
        if (this._mineInterval)
            clearInterval(this._mineInterval); 
    }

    private async mine() : Promise<void> {
        // look for any outstanding transactions to add to block
        let transactions = this._transactionManager.getTransactions();
        if (!transactions || transactions.length === 0) return;

        // ensure it is valid
        let tx = transactions.pop();
        //if (!this._transactionManager.validateTransactionSignatureAsync(tx)) return;

        // grab the last block for hash reference
        let topBlock = this._blockChainManager.getTopBlock();

        let block = new Block({
            transaction : tx,
            prevHash : topBlock ? topBlock.hash : null
        });

        console.log("Calculating Nonce");
        let nonce = await this.calculateNonce(block);
        block.hash = this.createBlockHash(block, nonce);
        console.log("Nonce found! %s Hash: %s", nonce, block.hash);

        this._blockChainManager.addBlock(block);
    }

    private calculateNonce(block: Block): Promise<string> {
        return new Promise((resolve, reject) => {
            let nonce = "Too weak, too weak for the bow of a mighty king!"
            let count = 0;
            while (!this.validNonce(nonce, block)) {
                nonce = this.incrementString(nonce);
                count++;
            }
            resolve(nonce);
        });
    }

    private validNonce(nonce: string, block: Block) {
        const difficulty = this._stateManager.getState().difficulty;
        return this.createBlockHash(block, nonce).startsWith("0".repeat(difficulty));
    }

    private createBlockHash(block: Block, nonce: string) {
        return this._cryptoService.hash([block.transaction.hash, block.prevHash, nonce].filter(n => n).join(""));
    }

    private incrementString(s: string): string{
        return ((parseInt(s, 36) + 1).toString(36)).replace(/0/g, 'a');
    }


}