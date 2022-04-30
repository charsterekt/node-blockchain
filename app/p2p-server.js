const WebSocket = require('ws')
const { TRANSACTION_THRESHOLD } = require('../chain-config')

const P2P_PORT = process.env.P2P_PORT || 5001  // Variable P2P server port, or default 5001


// Get a list of peer addresses to connect to
// Peer addresses will be of the following format
// PEERS = ws://localhost:5002 P2P_PORT=5001 HTTP_PORT=3001 npm run dev
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []
// To handle multiple message types we'll create an object to store the message types
const MESSAGE_TYPE = {
    chain: "CHAIN",
    block: "BLOCK",
    transaction: "TRANSACTION"
}


class P2PServer {
    
    constructor(blockchain, transactionPool, wallet) {  // Default constructor
        this.blockchain = blockchain
        this.sockets = []
        // The server should be able to directly access transactions
        this.transactionPool = transactionPool  // So we can send transactions to the peer nodes
        this.wallet = wallet
    }

    // Create a new P2P webserver and connections
    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT })
        // Event listener and a callback function for any new connection
        // On any new connection the current instance will send the current chain to the newly connected peer
        server.on('connection', socket => this.connectSocket(socket))
        // Now connect to the specified peers
        this.connectToPeers()
        console.log(`Listening for peer to peer connections on port: ${P2P_PORT}`)
    }

    // Adding a message handler which will take a socket
    messageHandler(socket) {
        // On receiving a message, execute a callback
        socket.on('message', message => {
            const data = JSON.parse(message)
            console.log("Received data from peer: ", data)
            
            // To sync the chains of the peer, check the chain using longest chain rule
            // Since we have different types of messages we need to handle them differently
            switch(data.type) {
                case MESSAGE_TYPE.chain:
                    this.blockchain.replaceLongestChain(data.chain)
                    break

                case MESSAGE_TYPE.transaction:
                    let thresholdReached = null
                    if (!this.transactionPool.transactionExists(data.transaction)) {
                        // Check if the pool is filled
                        thresholdReached = this.transactionPool.addTransaction(data.transaction)
                        this.broadcastTransaction(data.transaction)

                        if (thresholdReached) {
                            if(this.blockchain.getLeader() === this.wallet.getPublicKey()) {
                                console.log("Creating block")
                                let block = this.blockchain.createBlock(
                                    this.transactionPool.transactions,
                                    this.wallet
                                )
                                this.broadcastBlock(block)
                            }
                        }
                    }
                    break

                case MESSAGE_TYPE.block:
                    if (this.blockchain.isValidBlock(data.block)) {
                        this.broadcastBlock(data.block)
                    }
                    break
            }
        })
    }

    // Note: We need to send a message to each peer when we connect to it
    // On connecting we want to end our version of the chain to each peer to validate it
    // We will send them the chain as a message when we connect
    // Ideally we should send blocks as the chain would be huge, but this is a simple testing chain

    // After connecting to a socket:
    connectSocket(socket) {
        // Add the socket to a list of connected peers
        this.sockets.push(socket)
        console.log("Socket connected")

        // Register a message event listener
        this.messageHandler(socket)
        // Send the blockchain as a message on connection
        this.sendChain(socket)
    }

    connectToPeers() {
        // Connect to each peer
        peers.forEach(peer => {
            // Create a new socket per peer
            const socket = new WebSocket(peer)
            // An open event listener is emitted from the socket when a new connection is established
            // Use it to save the socket into the list through a callback
            socket.on('open', () => this.connectSocket(socket))
        })
    }

    // Helper functions

    // Send the current chain to a socket
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain.chain
        }))
    }

    // Synchronize the chains
    syncChain() {
        this.sockets.forEach(socket => {
            this.sendChain(socket)
        })
    }

    // Send a transaction to each connected socket whenever a new transaction is created
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        })
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
        }))
    }

    broadcastBlock(block) {
        this.sockets.forEach(socket => {
            this.sendBlock(socket, block)
        })
    }

    sendBlock(socket, block) {
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPE.block,
                block: block
            })
        )
    }
}



// Basic export
module.exports = P2PServer