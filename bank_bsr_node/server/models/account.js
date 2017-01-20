var mongoose = require('mongoose');

module.exports = mongoose.model('Account', {
    accountNumber: {
        type: String,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: String,
        default: Date.now
    }

})