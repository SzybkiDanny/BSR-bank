"use strict";

var config = require('config');
var md5 = require('md5');
var mongoose = require('mongoose');
var User = require('../models/user');
var Account = require('../models/account');
var Transaction = require('../models/transaction');

var realmConfig = config.get('realmConfig');

function NRBvalidatior(nrb) {
    nrb = nrb.replace(/[^0-9]+/g, '');
    var wagi = new Array(1, 10, 3, 30, 9, 90, 27, 76, 81, 34, 49, 5, 50, 15, 53, 45, 62, 38, 89, 17, 73, 51, 25, 56, 75, 71, 31, 19, 93, 57);

    if (nrb.length == 26) {
        nrb = nrb + "2521";
        nrb = nrb.substr(2) + nrb.substr(0, 2);
        var Z = 0;
        for (var i = 0; i < 30; i++) {
            Z += nrb[29 - i] * wagi[i];
        }
        if (Z % 97 == 1) {
            return true;
        } else {
            return false;
        }

    } else {
        return false;
    }
}

function createValidAccountNumber(constant) {
    for (var i = 10; i < 100; i++) {
        if (NRBvalidatior(i + constant))
            return i + constant;
    }
}

function login(username, password, callback) {
    User.findOne({
        username: username,
        password: md5(password)
    }, (err, user) => {
        if (err || user == null)
            return callback({ result: false, error: 'Incorrect credentials' });
        else
            return callback({ result: true });
    });
}

function createUser(username, password, callback) {
    console.log('create user');
    User.create({
        username: username,
        password: md5(password)
    }, (err, user) => {
        if (err)
            return callback({ result: false, error: 'This username is already taken' });
        else
            return callback({ result: true });
    });
}

function createAccount(user, callback) {
    Account.count({}, (err, count) => {
        if (err)
            return callback({ result: false });

        var formattedId = formatNumberLength(count, 16);

        User.findOne({
            username: user.username
        }, (err, user) => {

            var newAccountNumber = createValidAccountNumber(`${realmConfig.bankId}${formattedId}`);

            Account.create({
                accountNumber: newAccountNumber,
                owner: user._id
            }, (err, account) => {
                if (err)
                    return callback({ result: false, error: 'The account could not be created' });
                else
                    return callback({ result: true });
            });
        });
    });
}

function getAccountList(user, callback) {
    User.findOne({
        username: user.username,
    }, (err, user) => {
        Account.find({ owner: user._id }, { '_id': 0, 'accountNumber': 1, 'balance': 1, 'created': 1 }, ).lean().exec((err, res) => {
            if (err || res == null)
                return callback(null);
            else
                return callback({ accounts: res });
        });
    });
}

function getAccountHistory(accountNumber, callback) {
    Transaction.find({
        accountPerspective: accountNumber
    }).lean().exec((err, res) => {
        if (err)
            return callback(null);
        else
            return callback({ transactions: res });
    });
}

function isUserAccountOwner(user, accountNumber, success, failure) {
    if (getBankId(accountNumber) != realmConfig.bankId)
        return success();

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
    login,
    createUser,
    createAccount,
    getAccountList,
    getAccountHistory,
    isUserAccountOwner
};