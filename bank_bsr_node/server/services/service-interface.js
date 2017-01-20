"use strict";

import * as accountService from './account-service';
import * as transferService from './transfer-service';

var config = require('config');
var realmConfig = config.get('realmConfig');

var service = {
    Bank: {
        AccountService: {
            login: (args, cb) => {
                accountService.login(args.username, args.password, cb);
            },

            createUser: (args, cb) => {
                accountService.createUser(args.username, args.password, cb);
            },

            createAccount: (args, cb, headers, req) => {
                var userInfo = getUserInfoFromBase64(req.headers.authorization);
                var success = () => {
                    accountService.createAccount(userInfo, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, success, failure);
            },

            getAccountList: (args, cb, headers, req) => {
                var userInfo = getUserInfoFromBase64(req.headers.authorization);
                var success = () => {
                    accountService.getAccountList(userInfo, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, success, failure);
            },

            getAccountHistory: (args, cb, headers, req) => {
                if (!isAccountFormatCorrect(args.accountNumber))
                    return cb({ result: false, error: "Incorrect account number" });

                var userInfo = getUserInfoFromBase64(req.headers.authorization);
                var success = () => {
                    accountService.getAccountHistory(args.accountNumber, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, () => {
                    accountService.isUserAccountOwner(userInfo, args.accountNumber, success, () => {
                        return cb({ result: false, error: "Authorization failed" });
                    });
                }, failure);
            },

            transferMoney: (args, cb, headers, req) => {
                if (!isAccountFormatCorrect(args.accountFrom))
                    return cb({ result: false, error: "Incorrect sender account number" });

                if (!isAccountFormatCorrect(args.accountTo))
                    return cb({ result: false, error: "Incorrect recipient account number" });

                if (args.accountFrom == args.accountTo) {
                    return cb({ result: false, error: "Account numbers must be different" });
                }

                var userInfo = getUserInfoFromBase64(req.headers.authorization);

                var success = () => {
                    transferService.makeMoneyTransfer(args.accountFrom,
                        args.accountTo, args.title, args.amount, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, () => {
                    accountService.isUserAccountOwner(userInfo, args.accountFrom, success, () => {
                        return cb({ result: false, error: "Authorization failed" });
                    });
                }, failure);
            },

            depositMoney: (args, cb, headers, req) => {
                if (!isAccountFormatCorrect(args.accountTo))
                    return cb({ result: false, error: "Incorrect recipient account number" });

                var userInfo = getUserInfoFromBase64(req.headers.authorization);
                var success = () => {
                    transferService.makeMoneyDeposit(args.accountTo, args.amount, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, success, failure);
            },

            withdrawMoney: (args, cb, headers, req) => {
                if (!isAccountFormatCorrect(args.accountFrom))
                    return cb({ result: false, error: "Incorrect sender account number" });

                var userInfo = getUserInfoFromBase64(req.headers.authorization);
                var success = () => {
                    transferService.makeMoneyWithdrawal(args.accountFrom, args.amount, cb);
                }
                var failure = () => {
                    return cb({ result: false, error: "Authentication failed" });
                }

                authenticateUser(userInfo, () => {
                    accountService.isUserAccountOwner(userInfo, args.accountFrom, success, () => {
                        return cb({ result: false, error: "Authorization failed" });
                    });
                }, failure);
            }
        }
    }
}

function getUserInfoFromBase64(base64) {
    var encodedString = base64.substring(6);
    var decodedString = Buffer.from(encodedString, 'base64').toString('ascii');
    var splitString = decodedString.split(':');

    return { username: splitString[0], password: splitString[1] };
}

function authenticateUser(userInfo, success, failure) {
    if (userInfo.username == realmConfig.bankUsername && userInfo.password == realmConfig.bankPassword)
        return success();
        
    accountService.login(userInfo.username, userInfo.password, (result) => {
        if (result.result)
            return success();
        else
            return failure();
    })
}

function isAccountFormatCorrect(accountNumber) {
    return accountNumber.length == 26;
}

export default service