// Dependencies
const Transaction = require('./transaction')

// To include groups of transactions to account for multiple users we will use a transaction pool
// It will be an object updated in real time
// The object will contain all the new transactions submitted by all the miners in the network
// Users will create transactions from this pool and create the block and that confirms the transaction
// To update the pool we can use the P2P server and broadcast transactions to the network
// Add new received transactions to the pool

class TransactionPool {
    constructor() {
        this.transactions = []  // List to store transactions
    }

    addTransaction(transaction) {
        this.transactions.push(transaction)  // Simply adding transactions to the list

        if (this.transactions.length >= TRANSACTION_THRESHOLD) {
            return true
        } else {
            return false
        }
    }

    // Check if a transaction is valid
    validTransactions() {
        return this.transactions.filter(transaction => {
            if (!Transaction.verifyTransaction(this.transaction)) {
                console.log(`Invalid signature from ${transaction.data.from}`)
            }

            return transaction
        })
    }

    // Simple boolean check to see if a transaction exists
    transactionExists(transaction) {
        return this.transactions.find(t => t.id === transaction.id)
    }

    // Clear the pool to remove unwanted transactions after adding and executing a block
    clear () {
        this.transactions = []
    }
}


// Export the module
module.exports = TransactionPool