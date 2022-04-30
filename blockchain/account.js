// The account model can be considered as a large key-value hash table
// The key is the accounts of the nodes and the value is the balance
// We can use an object for this
// The model should be able to increment and decrement balance
// It should be able to transfer coins, transfer fee
// It should be able to update the account state and get the balance

// The proposed functions are very basic and won't be extensively documented

class Account {
    constructor() {  // Default constructor
        this.addresses = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614']
        this.balance = {'5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614': 1000}
    }

    initialize(address) {
        if (this.balance[address] == undefined) {
            this.balance[address] = 0
            this.addresses.push(address)
        }
    }

    transfer(from, to, amount) {
        this.initialize(from)
        this.initialize(to)
        this.increment(to, amount)
        this.decrement(from, amount)
    }

    increment(to, amount) {
        this.balance[to] += amount
    }

    decrement(from, amount) {
        this.balance[from] -= amount
    }

    getBalance(address) {
        this.initialize(address)
        return this.balance[address]
    }

    update(transaction) {
        let amount = transaction.output.amount
        let from = transaction.input.from
        let to = transaction.output.to
        this.transfer(from, to, amount)
    }

    transferFee(block, transaction) {
        let amount = transaction.output.fee
        let from = block.input.from
        let to = block.validator
        this.transfer(from, to, amount)
    }
}


// Default export
module.exports = Account