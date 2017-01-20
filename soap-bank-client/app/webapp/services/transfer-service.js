angular.module('BankClient')
    .factory('TransferService', ['$rootScope', TransferService]);

function TransferService($rootScope) {
    var soapClient = $rootScope.soap.soapClient;

    function isErrorResponse(err, res) {
        if (err) return true;

        if (typeof res.error === 'undefined')
            return false;

        console.log(res.error);

        return true;
    }

    var serviceInstance = {
        makeTransfer: (accountFrom, accountTo, title, amount, success, failure) => {
            soapClient.transferMoney({
                accountFrom: accountFrom,
                accountTo: accountTo,
                title: title,
                amount: amount
            }, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else
                    success(res);
            })
        },
        makeDeposit: (accountTo, amount, success, failure) => {
            soapClient.depositMoney({
                accountTo: accountTo,
                amount: amount
            }, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else
                    success(res);
            })
        },
        makeWithdrawal: (accountFrom, amount, success, failure) => {
            soapClient.withdrawMoney({
                accountFrom: accountFrom,
                amount: amount
            }, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else
                    success(res);
            })
        }
    };

    return serviceInstance;
};