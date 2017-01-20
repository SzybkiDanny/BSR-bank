angular.module('BankClient')
    .factory('AccountService', ['$rootScope', AccountService]);

function AccountService($rootScope) {
    var soapClient = $rootScope.soap.soapClient;

    function isErrorResponse(err, res) {
        if (err) return true;

        if (typeof res.error === 'undefined')
            return false;

        console.log(res.error);

        return true;
    }

    var serviceInstance = {
        createAccount: (success, failure) => {
            soapClient.createAccount(null, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else
                    success(res);
            })
        },
        getAccountList: (success, failure) => {
            soapClient.getAccountList(null, (err, res) => {
                if (isErrorResponse(err, res))
                    failure(res);
                else {
                    success(res.accounts);
                    $rootScope.$apply();
                }
            })
        },
        getAccountHistory: (accountNumber, success, failure) => {
            soapClient.getAccountHistory({ accountNumber: accountNumber }, (err, res) => {
                if (isErrorResponse(err, res))
                    failure(res);
                else {
                    success(res.transactions);
                    $rootScope.$apply();
                }
            })
        }
    };

    return serviceInstance;
};