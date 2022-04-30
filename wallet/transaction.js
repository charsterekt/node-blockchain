const Utility = require("../utility")
const {
    TRANSACTION_FEE
} = require("../chain-config")

// Each transaction needs a unique id and follows a structure like so:
/*
{
  id: <here goes some identifier>
  type: <transactions type: stake,validator,transaction>
  input: {
          timestamp: <time of creation>,
          from: <senders address>,
          signature: <signature of the transaction>
         }
  output: {
           to: <recievers address>
           amount: <amount transfered>
           fee: <transactions fee>
          }
}
*/

// Transaction utilities
class Transaction {
    constructor() {  // Default constructor
        this.id = Utility.id()
        this.type = null
        this.input = null  // will be an object as shown above
        this.output = null  // likewise
    }

    // Create a transaction using the sender's wallet instance, amount, and recipient address
    // Check if the sender has enough balance and only then create a transaction object
    // The object will have all the properties passed to the function
    // Divide into two functions for readability

    static newTransaction(sender_wallet, to, amount, type) {
        if (amount + TRANSACTION_FEE > sender_wallet.balance) {  // Trip case
            console.log("Insufficient funds")
            return
        }

        return Transaction.generateTransaction(sender_wallet, to, amount, type)
    }

    static generateTransaction(sender_wallet, to, amount, type) {
        const transaction = new this()  // New instance
        transaction.type = type
        transaction.output = {
            to: to,
            amount: amount - TRANSACTION_FEE,
            fee: TRANSACTION_FEE
        }
        Transaction.signTransaction(transaction, sender_wallet)
        return transaction
    }

    // Sign the transaction input using the sender's wallet on new transactions
    static signTransaction(transaction, sender_wallet) {
        transaction.input = {
            timestamp: Date.now(),
            from: sender_wallet.public_key,
            signature: sender_wallet.sign(Utility.hash(transaction.output))
        }
    }

    // Verify the signature in the transaction
    static verifyTransaction(transaction) {
        return Utility.verifySignature(
            transaction.input.from,  // sender
            transaction.input.signature,
            Utility.hash(transaction.output)
        )
    }
    
}


// Exporting the module
module.exports = Transaction