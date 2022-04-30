// ICO stands for Initial Coin Offering
// Proof of Stake systems cannot work without an ICO or Proof of Work system initially working until enough coins are mined
// We need an initial leader that will hold all the coins and transfer them to the other nodes
// This ICO must be hardcoded into the classes, mappings, and lists and should have enough initial balance and stake
// We will need to create a separate app solely responsible for the ICO
// Later this node can be disconnected from the network
// Let's get the hard coded secret wallet's public key to set as the default in our models

// Steps to generate a public key:
// Run a node console in the wallet directory and run the following commands
// > let Wallet = require('./wallet')
// > let leader = new Wallet('i am the first leader')
// > leader.getPublicKey()
// Generated public key: '5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614'

// This will be similar to index.js for the API server, but will have a known wallet

// dependencies
const express = require('express')
const Blockchain = require('../blockchain/blockchain')
const bodyarser = require('body-parser')
const P2PServer = require('../app/p2p-server')
const Wallet = require('../wallet/wallet')
const TransactionPool = require('../wallet/transaction-pool')
const { TRANSACTION_THRESHOLD } = require('../chain-config')

// Constants
const HTTP_PORT = 3001

// App config
const app = express()
app.use(bodyparser.json())

// Initializations
const blockchain = new Blockchain()
const wallet = new Wallet("I was the first leader")
const transactionPool = new TransactionPool()
const p2pserver = new P2PServer(blockchain, transactionPool, wallet)

// Endpoints

app.get("/ico/transactions", (req, res) => {
    res.json(transactionPool.transactions)
})

app.get("/ico/blocks", (req, res) => {
    res.json(blockchain.chain)
})

app.post("/ico/transact", (req, res) => {
    const { to, amount, type } = req.body
    const transaction = wallet.createTransaction(
        to, amount, type, blockchain, transactionPool
    )
    p2pserver.broadcastTransaction(transaction)

    if (transactionPool.transactions.length >= TRANSACTION_THRESHOLD) {
        let block = blockchain.createBlock(transactionPool.transactions, wallet)
        p2pserver.broadcastBlock(block)
    }
    res.json({
        message: "Transaction created successfully",
        transaction: transaction
    })
})

app.get("ico/public-key", (req, res) => {
    res.json({ public_key: wallet.public_key })
})

app.get("/ico/balance", (req, res) => {
    res.json({ balance: blockchain.getBalance(wallet.public_key) })
})

app.post("/ico/balance-of", (req, res) => {
    res.json({ balance: blockchain.getBalance(req.body.public_key) })
})


// Run the server
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`)
}) 
p2pserver.listen()