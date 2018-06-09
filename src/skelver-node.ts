#!/usr/bin/env ts-node
import { Module, DynamicModule, ValidationPipe, INestApplication, NestModule, MiddlewareConsumer } from '@nestjs/common';
import DI from './di';
import { NestFactory } from '@nestjs/core';
import { SkelverController } from './controllers/skelver.controller';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RsaCryptoService, ICryptoService } from './services/crypto/crypto.service';
import { PeerManager, IPeerManager } from './services/peers/peerManager';
import { Scheduler, IScheduler } from './services/scheduler/scheduler';
import { StateManager, IStateManager } from './services/state/stateManager';
import State from './services/state/state';
import BlockChain from './services/blockchain/blockchain';
import { IBlockChainManager, BlockChainManager } from './services/blockchain/blockChainManager';
import NodeInfo from './services/peers/nodeInfo';
import Block from './services/blockchain/block';
import { HttpCommunicator, ICommunicator } from './services/peers/communicator';
import { TransactionManager, ITransactionManager } from './services/transaction/transactionManager';

export class SkelverNode {
    private readonly _port: number;
    private readonly _name: string;
    private readonly _ip: string = "127.0.0.1";
    private _app: INestApplication;

    constructor(name: string, port: number) {
        this._name = name;
        this._port = port;
    }
    
    async init(): Promise<INestApplication> {   

        //initialize crypto and generate app keys
        console.log("Generating Keys for PKI ...");
        const cryptoService = new RsaCryptoService();
        await cryptoService.generateKeyPairAsync();

        // configure state
        const stateManager = new StateManager();
        stateManager.setState(new State({
            blockchain: new BlockChain(),
            peers: new Array<NodeInfo>(),
            node: new NodeInfo({ name: this._name, address: `${this._ip}:${this._port}`})
        }));

        const communicator = new HttpCommunicator();

        //initialize peers + blockchain
        const blockChainManager = new BlockChainManager(stateManager, cryptoService);
        blockChainManager.initialize(cryptoService.publicKey, cryptoService.privateKey);
        
        const peerManager = new PeerManager(stateManager, communicator);
        const transactionManager = new TransactionManager(stateManager);

        // start scheduler
        const scheduler = new Scheduler(peerManager, stateManager);
        scheduler.startGossipTask(3000);
        scheduler.startOutputTask(5000);

        // create application module
        this._app = await NestFactory.create(SkelverModule.create(cryptoService, blockChainManager, peerManager, scheduler, stateManager, communicator, transactionManager));

        // setup server and middleware
        // this._app.useGlobalPipes(new ValidationPipe());
        this._app.useGlobalFilters(new GlobalExceptionFilter());

        return this._app;
    }

    async start() {
        await this._app.listen(this._port, this._ip, () => {
            console.log("✔ Skelver Node '%s' starting on %s:%d ", this._name, this._ip, this._port);
        });
    }
}

class SkelverModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void { }
    
    static create(cryptoService: ICryptoService, blockChainManager: IBlockChainManager,
        peerManager: IPeerManager, scheduler: IScheduler, stateManager: IStateManager, communicator: ICommunicator,
        transactionManager: ITransactionManager): DynamicModule {

        return {
            module: SkelverModule,
            controllers: [SkelverController],
            components: [
                { provide: DI.ICryptoService, useFactory: () => cryptoService },
                { provide: DI.IPeerManager, useFactory: () => peerManager },
                { provide: DI.IScheduler, useFactory: () => scheduler },
                { provide: DI.IStateManager, useFactory: () => stateManager },
                { provide: DI.IBlockChainManager, useFactory: () => blockChainManager },
                { provide: DI.ICommunicator, useFactory: () => communicator },
                { provide: DI.ITransactionManager, useFactory: () => transactionManager}
            ],
          };
    }
}

async function server() {

    if (process.argv.length < 4) {
        console.log("Missing arguments. Ex. > skelver-node [name] [port]");
        return;
    }

    let node = new SkelverNode(process.argv[2], Number(process.argv[3]));
    await node.init();
    await node.start();
}
server();
