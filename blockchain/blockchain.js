// Import the dependencies
// We need the block class as a basic unit for the blockchain
const Block = require('./block')  // relative import
const Account = require('./account')
const Stake = require('./stake')
const Validators = require('./validators')
const Wallet = require('../wallet/wallet')

let secret = "I was the first leader"

const TRANSACTION_TYPE = {
    transaction: "TRANSACTION",
    stake: "STAKE",
    validator_fee: "VALIDATOR_FEE",
}

class Blockchain {
    constructor() {  // Genesis block via default constructor
        this.chain = [Block.genesis()]
        this.accounts = new Account()  // Instance an account
        this.stakes = new Stake()  // Instance a stake
        this.validators = new Validators()  // Instance validators
    }

    // Add a block to the chain
    addBlock(data) {
        const block = Block.createBlock(
            this.chain[this.chain.length-1], // last block
            data,
            new Wallet(secret)
        )
        this.chain.push(block)  // Append the block to the chain
        // console.log("New block added")
        return block
    }

    createBlock(transactions, wallet) {
        return Block.createBlock(
            this.chain[this.chain.length-1], // last block
            transactions,
            wallet
        )
    }

    // To support multiple contributors we need a source of validation
    // We will use the longest chain rule like in Bitcoin
    // Checks the most valid blocks in the chain to check overall validity of the chain
    isValidChain(chain) {
        // Check if the genesis block is valid
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }

        // Check if the chain is valid
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i]
            const prevBlock = chain[i-1]

            // Check if the hash is valid
            if (block.prevHash !== prevBlock.hash ||
                block.hash !== Block.getBlockHash(block)) {
                return false
            }
        }
        return true
    }

    // So if a new chain is deemed longest, according to the chain rule
    // We have to discard the current chain and take the longest valid chain as the main blockchain
    replaceLongestChain(newChain) {
        if (newChain.length <= this.chain.length){  // False case
            console.log("Recieved chain is not longer than the current chain")
            return
        } else if (this.isValidChain(newChain)){  // Validate
            console.log("Recieved chain is invalid")
            return
        }
        // The function will never reach here if a new chain doesn't mactch the criterion
        // This means that if this code fires the longest chain is adopted as the newest
        console.log("Replacing the current chain with new chain")
        this.chain = newChain 
    }

    // Helper for the account model
    getBalance(public_key) {
        return this.accounts.getBalance(public_key)
    }

    // Get the address of the node with the maximum coins staked
    getLeader() {
        // The list is of the nodes that have paid the validator fee and are eligible to be elected as leader
        return this.stakes.getMax(this.validators.list)
    }

    // A received block may be invalid, corrupted, or old. Honest nodes should only broadcast authenticated blocks
    // Check the validity of blocks for authenticity
    // The possible invalidities are hash, prevHash, leader, or signature
    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length-1]
        // Check hash, prevHash, leader, signature
        if (
            block.prevHash === lastBlock.hash &&
            block.hash === Block.getBlockHash(block) &&
            Block.verifyBlock(block) &&
            Block.verifyLeader(block, this.getLeader())
        ) {
            console.log("Valid block")
            this.addBlock(block)
            return true
        } else {
            return false
        }
    }  // This will enable the leader to create blocks and broadcast it

    // When a node does receive a valid block it must execute all the transactions within the block to have the latest state
    // For each type of transaction the process is handled differently
    executeTransactions(block) {
        block.data.forEach(transaction => {
            switch (transaction.type) {
                case TRANSACTION_TYPE.transaction:
                    this.accounts.update(transaction)
                    this.accounts.transferFee(block, transaction)
                    break

                case TRANSACTION_TYPE.stake:
                    this.stakes.update(transaction)
                    this.accounts.decrement(
                        transaction.input.from,
                        transaction.output.amount
                    )
                    this.accounts.transferFee(block, transaction)
                    break
                
                case TRANSACTION_TYPE.validator_fee:
                    if (this.validators.update(transaction)) {
                        this.accounts.decrement(
                            transaction.input.from,
                            transaction.output.amount
                        )
                        this.accounts.transferFee(block, transaction)
                    }
                    break
            }
        })
    }

}

module.exports = Blockchain  // ES6 export