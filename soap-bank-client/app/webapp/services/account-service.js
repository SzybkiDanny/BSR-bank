angular.module('BankClient')
    .factory('AccountService', ['$rootScope', AccountService]);

// Service for account related operations
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
        // Creating new account
        createAccount: (success, failure) => {
            soapClient.createAccount(null, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else
                    success(res);
            })
        },
        // Fetching list of accounts
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
        // Fetching account history
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