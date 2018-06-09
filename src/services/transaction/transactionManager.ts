import { Inject, Component, Injectable } from "@nestjs/common";
import { IStateManager } from "../state/stateManager";
import {Transaction} from "./transaction";
import DI from "../../di";
import * as _ from "lodash";
import { ICryptoService } from "../crypto/crypto.service";

export interface ITransactionManager{
    addTransaction(transaction: Transaction): void;
    mergeTransactions(transactions: Array<Transaction>): void;
    validateTransactionSignatureAsync(tx: Transaction): Promise<boolean>
    createTransactionAsync(from: string, to: string, amount: number, privateKey: string): Promise<Transaction>
    getTransactions(): Array<Transaction>;
    removeTransaction(id: string): void;
}

@Injectable()
export class TransactionManager implements ITransactionManager{

    private readonly _stateManager: IStateManager;
    private readonly _cryptoService: ICryptoService;
    private _transactions: Array<Transaction>;

    constructor(@Inject(DI.IStateManager) stateManager: IStateManager, @Inject(DI.ICryptoService) cryptoService: ICryptoService) {
        this._transactions = new Array<Transaction>();
        this._stateManager = stateManager;
        this._cryptoService = cryptoService;
    }

    public addTransaction(transaction: Transaction): void {
        //TODO: Validate

        this._transactions.push(transaction);
        this.persist();
    }

    public mergeTransactions(transactions: Array<Transaction>): void {
        //TODO: validate this

        this._transactions = _.union(this._transactions, transactions);
        this.persist();
    }

    public async validateTransactionSignatureAsync(tx: Transaction): Promise<boolean> {
        //check if genesis transaction
        //TODO: make sure this is right?
        if (!tx.from) return true;

        return await this._cryptoService.validateAsync(tx.hash, tx.id, tx.from);
    }

    public async createTransactionAsync(from: string, to: string, amount: number, privateKey: string) : Promise<Transaction> {
        let tx = new Transaction({
            from: from,
            to: to,
            amount: amount
        });

        tx.hash = this._cryptoService.hash(`${tx.from}${tx.to}${tx.amount}`);
        tx.id = await this._cryptoService.signAsync(tx.hash, privateKey);
        return tx;
    }

    public getTransactions(): Array<Transaction> {
        return _.clone(this._transactions);
    }

    public removeTransaction(id: string): void {
        this._transactions = _.reject(this._transactions, { "id": id });
        this.persist();
    }

    private persist(): void {
        this._stateManager.updateTransactions(this._transactions);
    }
}