"use strict";

var config = require('config');
var request = require('request');
var mongoose = require('mongoose');
var User = require('../models/user');
var Account = require('../models/account');
var Transaction = require('../models/transaction');

var realmConfig = config.get('realmConfig');
var bankAddresses = config.get('bankAddresses');

function makeMoneyTransfer(accountFrom, accountTo, title, amount, callback) {
    if (amount <= 0)
        return callback({ result: false, error: 'The amount must be positive' });

    if (isInternalAccount(accountFrom) && isInternalAccount(accountTo)) {
        Account.findOne({
            accountNumber: accountFrom
        }, (err, account) => {
            if (err || account == null)
                return callback({ result: false, error: 'Account does not exist' });

            if (account.balance - amount >= -realmConfig.maxDebit) {
                transferMoneyInternally(accountFrom, accountTo, amount, () => {
                    addInternalTransferTransactions(accountFrom, accountTo, title, amount);
                    return callback({ result: true });
                }, () => {
                    return callback({ result: false, error: 'Cannot perform the transfer' });
                });
            }
            else
                return callback({ result: false, error: 'Not enough money to perform the transfer' });
        });
    }
    else if (isInternalAccount(accountFrom)) {
        Account.findOne({
            accountNumber: accountFrom
        }, (err, account) => {
            if (err || account == null)
                return callback({ result: false, error: 'Account does not exist' });

            if (account.balance - amount >= -realmConfig.maxDebit) {
                var config = bankAddresses[getBankId(accountTo)];

                if (typeof config === 'undefined')
                    return callback({ result: false, error: 'Unknown bank' });

                request({
                    url: `http://${config.username}:${config.password}@${config.address}:${config.port}/accounts/${accountTo}`,
                    method: 'POST',
                    json: { amount: amount * 100, from: accountFrom, title: title }
                }, (err, response, body) => {
                    if (err)
                        return callback({ result: false, error: err });

                    if (response.statusCode != 201)
                        return callback({ result: false, error: typeof body !== 'undefined' ? 
                            (typeof body.error !== 'undefined' ? body.error : 'Missing error field') 
                            : 'Unknown error occured' });

                    makeInternalOperation(accountFrom, -amount, () => {
                        addSingleTransaction(accountFrom, accountFrom, accountTo, title, 'EXTERNAL OUTGOING', -amount);
                        return callback({ result: true });
                    }, () => {
                        return callback({ result: false, error: 'Cannot transfer money' });
                    });
                })
            }
            else
                return callback({ result: false, error: 'Not enough money to perform the transfer' });
        });
    }
    else if (isInternalAccount(accountTo)) {
        makeInternalOperation(accountTo, amount, () => {
            addSingleTransaction(accountTo, accountFrom, accountTo, title, 'EXTERNAL INCOMING', amount);
            return callback({ result: true });
        }, () => {
            return callback({ result: false, error: 'Cannot deposit money' });
        });
    }
}

function makeMoneyDeposit(accountTo, amount, callback) {
    if (amount <= 0)
        return callback({ result: false, error: 'The amount must be positive' });

    if (isInternalAccount(accountTo)) {
        makeInternalOperation(accountTo, amount, () => {
            addSingleTransaction(accountTo, null, accountTo, null, 'DEPOSIT', amount);
            return callback({ result: true });
        }, () => {
            return callback({ result: false, error: 'Cannot deposit money' });
        });
    }
    else
        return callback({ result: false, error: 'Cannot deposit money in another bank' });
}

function makeMoneyWithdrawal(accountFrom, amount, callback) {
    if (amount <= 0)
        return callback({ result: false, error: 'The amount must be positive' });

    makeInternalOperation(accountFrom, -amount, () => {
        addSingleTransaction(accountFrom, accountFrom, null, null, 'WITHDRAWAL', -amount);
        return callback({ result: true });
    }, () => {
        return callback({ result: false, error: 'Cannot withdraw money' });
    });
}

function isInternalAccount(accountNumber) {
    return getBankId(accountNumber) == realmConfig.bankId;
}

function transferMoneyInternally(accountFrom, accountTo, amount, success, failure) {
    Account.count({
        $or: [
            { accountNumber: accountFrom },
            { accountNumber: accountTo }]
    }, (err, count) => {
        if (err || count < 2)
            failure();

        makeInternalOperation(accountFrom, -amount, () => {
            makeInternalOperation(accountTo, amount, success, failure)
        }, failure)
    });
}

function makeInternalOperation(accountNumber, amount, success, failure) {
    Account.count({ accountNumber: accountNumber }, (err, count) => {
        if (err || count < 1)
            failure();

        Account.update({ accountNumber: accountNumber }, { $inc: { balance: amount } },
            (err, res) => {
                if (res.ok == 1)
                    success();
                else
                    failure();
            });
    });
}

function addInternalTransferTransactions(accountFrom, accountTo, title, amount) {
    if (accountFrom)
        addSingleTransaction(accountFrom, accountFrom, accountTo, title, 'INTERNAL OUTGOING', -amount);

    if (accountTo)
        addSingleTransaction(accountTo, accountFrom, accountTo, title, 'INTERNAL INCOMING', amount);
}

function addSingleTransaction(accountPerspective, accountFrom, accountTo, title, operation, amount) {
    Account.findOne({
        accountNumber: accountPerspective
    }, (err, account) => {
        if (err || account == null)
            return callback({ result: false, error: 'Account does not exist' });

        Transaction.create({
            accountPerspective: accountPerspective,
            accountFrom: accountFrom || "",
            accountTo: accountTo || "",
            title: title || "",
            amount: amount,
            operation: operation,
            balanceAfter: account.balance
        });
    });
}

function isUserAccountOwner(user, accountNumber, success, failure) {
    User.findOne({
        username: user.username,
    }, (err, user) => {
        Account.findOne({
            owner: user._id,
            accountNumber: accountNumber
        }).lean().exec((err, res) => {
            if (err || res == null)
                failure();
            else
                success();
        });
    });
}

function formatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}

function getBankId(accountNumber) {
    return accountNumber.substring(2, 10);
}

export {
    makeMoneyTransfer,
    makeMoneyDeposit,
    makeMoneyWithdrawal
};