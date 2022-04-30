// Import dependencies
const SHA256 = require('crypto-js/sha256')
const Utility = require('../utility')

class Block {
  // Block metadata
  constructor(timestamp, prevHash, hash, data, validator, signature) {
    this.timestamp = timestamp
    this.prevHash = prevHash
    this.hash = hash
    this.data = data
    this.validator = validator
    this.signature = signature
  }

  // A helper function to print out the block's details in a readable format
  toString() {
    return `Block - 
          Timestamp : ${this.timestamp}
          Previous Hash : ${this.prevHash}
          Hash      : ${this.hash}
          Data      : ${this.data}
          Validator : ${this.validator}
          Signature : ${this.signature}`
  }

  /*
    We require a genesis or origin block to serve as the origin of the blockchain 
    This genesis block will have dummy hard coded values
    It will be a static function because we don't want to create an instance to call the function.
  */

  static genesis() {
    return new this(`Genesis Time: ${Date.now()}`, "----", "genesis-hash", [])
  }

  // Helper function for create block that generates a hash
  static hash(timestamp, prevHash, data) {
    // We need to convert the data to a string to be able to hash it
    // We make a string of the timestamp, the previous hash, and the data
    return SHA256(JSON.stringify(`${timestamp}${prevHash}${data}`)).toString()
  }

  // Helper function to sign a block
  signBlockHash(hash, wallet) {
    return wallet.sign(hash)
  }

  // The ability to create a new block based on data and the last hash
  static createBlock(prevBlock, data, wallet) {
    let hash  // Using let to preserve scope
    let timestamp = Date.now()
    let prevHash = prevBlock.hash
    hash = Block.hash(timestamp, prevHash, data)

    // Get validator's public key
    let validator = wallet.getPublicKey()

    // Sign the block
    let signature = Block.signBlockHash(hash, wallet)

    return new this(timestamp, prevHash, hash, data, validator, signature)

    // TODO
    // Add a validator and signature in new block
  }

  // Helper function to retrieve the hash of a given block
  static getBlockHash(block) {
    // Destructure the block into an object
    const { timestamp, prevHash, data } = block
    return Block.hash(timestamp, prevHash, data)
  }

  static verifyBlock(block) {
    return Utility.verifySignature(
      block.validator,
      block.signature,
      Block.getBlockHash(block.timestamp, block.prevHash, block.data)
    )
  }

  static verifyLeader(block, leader) {
    return block.validator == leader ? true : false
  }
}

module.exports = Block  // ES6 export