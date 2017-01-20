var mongoose = require('mongoose');

module.exports = mongoose.model('Transaction', {
    accountPerspective: String,
    accountFrom: String,
    accountTo: String,
    title: String,
    amount: Number,
    balanceAfter: Number,
    operation: String,
    timestamp: {
        type: String,
        default: Date.now
    }
})