// Validator nodes are different from normal nodes in PoS
// Validator nodes can add stake, be elected as leader, and create blocks
// Not all nodes can be a validator
// Only nodes that send a special transaction which contains a validator fee can become a validator
// The fee or coins are later burnt or unused in this case

// The model will contain a list of addresses that are validators and have submitted the fee

class Validators {
    constructor() {  // Default constructor
        this.list = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614']
    }

    // If the conditions match simply add the address to the list
    update(transaction) {
        if (transaction.amount == 30 && transaction.to == "0") {
            this.list.push(transaction.from)
            return true
        }
        return false
    }
}

// In this case the fee is set to 30 and the recipient of the transaction 
// is a special address "0" since those coins are being burnt in this case

// There are three types of transactions in this application
// 1. TRANSACTION: for regular monetary transactions
// 2. STAKE: for staking coins
// 3. VALIDATOR_FEE: fixed amount transaction to become a validator 

// Default export
module.exports = Validators