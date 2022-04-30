// Dependencies
const EDDSA = require("elliptic").eddsa
const SHA256 = require("crypto-js/sha256")
// V1 uses timestamps to generate unique ids. Serves this purpose but not good in production
const uuidv1 = require("uuid/v1")

// Consts
const eddsa = new EDDSA("ed25519")

// Utility functions related to cryptocurrency and the blockchain
class Utility {
    static genKeyPair(secret) {
        return eddsa.keyFromSecret(secret)  // Generate a secret key from the secret phrase
    }

    // Generate a unique id
    static id() {
        return uuidv1()
    }

    // Simple hashing function
    static hash(data) {
        return SHA256(JSON.stringify(data)).toString()
    }

    // Verify the authenticity of the transaction
    // Decrypt it using the public key and verify the hash and digital signature
    static verifySignature(public_key, signature, data_hash) {
        return eddsa.keyFromPublic(public_key).verify(data_hash, signature)
    }
}


// Export the class
module.exports = Utility