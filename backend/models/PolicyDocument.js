const mongoose = require('mongoose');

const policyDocumentSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true
    },
    textChunk: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number], // Array of numbers for vector embeddings
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PolicyDocument', policyDocumentSchema);
