import { Get, Controller, Inject, Res, Param, HttpException, Post, Body } from '@nestjs/common';
import { BaseController } from './base.controller';
import { ICryptoService } from '../services/crypto/crypto.service';
import DI from '../di';
import { IPeerManager } from '../services/peers/peerManager';
import NodeInfo from '../services/peers/nodeInfo';
import State from '../services/state/state';
import { IBlockChainManager } from '../services/blockchain/blockChainManager';
import { ITransactionManager } from '../services/transaction/transactionManager';
import Block from "../services/blockchain/block";
import {Transaction} from '../services/transaction/transaction';

/**
 * Main Home controller to handle routing in the application
 * 
 * @export
 * @class HomeController
 * @extends {BaseController}
 */
@Controller()
export class SkelverController extends BaseController {

    private readonly _cryptoService: ICryptoService;
    private readonly _peerManager: IPeerManager;
    private readonly _blockChainManager: IBlockChainManager;
    private readonly _transactionManager: ITransactionManager;

    constructor(@Inject(DI.ICryptoService) cryptoService: ICryptoService,
        @Inject(DI.IPeerManager) peerManager: IPeerManager, @Inject(DI.IBlockChainManager) blockChainManager: IBlockChainManager,
        @Inject(DI.ITransactionManager) transactionManager : ITransactionManager)
    {
        super();
        this._cryptoService = cryptoService;
        this._peerManager = peerManager;
        this._blockChainManager = blockChainManager;
        this._transactionManager = transactionManager;
    }

    @Post("gossip")
    async gossip(@Res() res, @Body() state: State) {
        //TODO: Validate

        //console.log("Gossip from : %s", state.node.address);
        this._peerManager.addPeers(state.peers);
        this._peerManager.addPeer(state.node);
        this._blockChainManager.updateBlockChain(state.blockchain);
        this._transactionManager.mergeTransactions(state.transactions);
    }

    @Get("pubKey")
    async pubKey() {
        return this._cryptoService.publicKeyHash;
    }

    @Post("addPeer")
    async addPeer(@Body() body) {
        //TODO: Take in the request address at this point to update state
        // to reflect a public address
        const peer = new NodeInfo({ address: body.address, name: body.name });
        this._peerManager.addPeer(peer);
    }

    // @Post("addBlock")
    // async addBlock(@Body() body) {
    //     this._blockChainManager.addBlock(new Block({
    //         prevHash: "test",
    //         hash: "test2",
    //         transactions: new Array<Transaction>()
    //     }));
    // }

    @Post("createTransaction")
    async createTransaction(@Body() body) {
        let tx = await this._transactionManager.createTransactionAsync(body.from, body.to, body.amount, this._cryptoService.privateKey);
        this._transactionManager.addTransaction(tx);
    }
}
