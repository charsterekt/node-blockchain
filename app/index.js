const express = require('express')
const Blockchain = require('../blockchain/blockchain')
const BodyParser = require('body-parser')
const P2PServer = require('./p2p-server')
const Wallet = require('../wallet/wallet')
const TransactionPool = require('../wallet/transaction-pool')

// Environment variable to set the port when running
// We will run each new user on a new port
const HTTP_PORT = process.env.HTTP_PORT || 3001;  // Sets default port if no port is given by the user
// we can run our app something like the following to run on a different port
// HTTP_PORT = 3002 npm run dev

// Create an instance of the blockchain class
const blockchain = new Blockchain()
// Create a new instance of the wallet
const wallet = new Wallet(Date.now().toString())  // Using the stringified current time as a secret string
// Create a new instance of the transaction pool which will later be decentralized and synced using the P2P server
const transactionPool = new TransactionPool()

// Instance an express app
const app = express()
app.use(BodyParser.json())  // Using the bodyparser middleware

// ------------------------------------------------------------------
// API ROUTES

// Get request to retrieve the blocks
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain)
})

// Post request to add a new block
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data)
    res.json({
        message: 'Block added successfully',
        block
    })
    // console.log(`New block added successfully: ${block.toString()}`)

    // Sync the chains with the peers
    p2pserver.syncChain()
})

// Endpoint to view a transaction in the pool
app.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions)
})

// Endpoint to create a new transaction
app.post('/transact', (req, res) => {
    const { to, amount, type } = req.body
    const transaction = wallet.createTransaction(
        to, amount, type, blockchain, transactionPool
    )
    // This will broadcast the transaction accross the network
    // The message handlers will add them to the pool
    p2pserver.broadcastTransaction(transaction)

    res.json({
        message: 'Transaction created successfully',
        transaction: transaction
    })
})


// App server configurations
app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`)
})

// --------------------------------------------------------------------------
// P2P Server code
const p2pserver = new P2PServer(blockchain, transactionPool, wallet)  // Passing the blockchain as a dependency
p2pserver.listen()  // Starts the p2p server
