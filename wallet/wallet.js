const Utility = require('../utility')
const Transaction = require('./transaction')
const { INITIAL_BALANCE } = require('../chain-config')

// We need a wallet to have a cryptocurrency that we can use to simulate transactions
// A wallet will have a private and public key pair to create a digital signature
// This is a form of asymmetric cryptography
// Digital signatures will be used to verify the miner creating the block and transaction
// Once data is signed and encrypted using the private key it can only be verified using the public key

// The wallet class will have 3 main properties, balance, key pair, and public key

class Wallet {
    constructor(secret) {  // Default constructor with a secret variable passed when creating the wallet
        this.balance = INITIAL_BALANCE
        this.key_pair = Utility.genKeyPair(secret)
        this.public_key = this.key_pair.getPublic("hex")
    }

    // Helper to-string function
    toString() {
        return `Wallet - 
            public_key: ${this.public_key.toString()}
            balance: ${this.balance}
        `
    }

    // Use the wallet's key pair to sign transactions and add the signature to the input object
    sign (data_hash) {
        return this.key_pair.sign(data_hash).toHex()
    }

    // Since the wallet is responsible for creating a transaction we need a function to do so
    // The function will create a new transaction, sign it using our wallet, and add it to the transaction pool
    createTransaction(to, amount, type, blockchain, transactionPool) {

        this.balance = this.getBalance(blockchain)  // Check if there's balance before making transactions
        if (amount > this.balance) {
            console.log(
                `Amount: ${amount} exceeds the current balance: ${this.balance}`
            )
            return
        }

        let transaction = Transaction.newTransaction(this, to, amount, type)
        transactionPool.addTransaction(transaction)
        return transaction
    }

    // Helper functions
    getBalance(blockchain) {
        return blockchain.getBalance(this.public_key)
    }

    getPublicKey() {
        return this.public_key
    }
}

// Export the module
module.exports = Wallet