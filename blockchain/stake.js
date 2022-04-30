// We need a way to track the number of coins staked by a node
// Since the node with the maximum stake is chosen as the leader or block forger
// We can find the next leader by looking up the staked coins in the model
// The functionality would be very similar to the account model
// Usually the stakes are stored on each individual node
// We can simplify this by generalizing the model as an object with a similar key value hash

// Again, not much major documentation

class Stake {
    constructor() {  // Default constructor
        this.addresses = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614']
        this.balance = {'5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614': 0}
    }

    initialize(address) {
        if (this.balance[address] == undefined) {
            this.balance[address] = 0
            this.addresses.push(address)
        }
    }

    addStake(from, amount) {
        this.initialize(from)
        this.balance[from] += amount
    }

    getStake(address) {
        this.initialize(address)
        return this.balance[address]
    }

    getMax(addresses) {
        let balance = -1
        let leader = undefined
        addresses.forEach(address => {
            if (this.getBalance(address) > balance) {
                leader = address
            }
        })
        return leader
    }

    update(transaction) {
        let amount = transaction.output.amount
        let from = transaction.input.from
        this.addStake(from, amount)
    }
}

// Default export
module.exports = Stake