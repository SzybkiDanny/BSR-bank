angular.module('BankClient')
    .factory('UserService', ['$rootScope', UserService]);

// Service for user related operations
function UserService($rootScope) {
    var soapClient = $rootScope.soap.soapClient;

    function isErrorResponse(err, res) {
        if (err) return true;

        if (typeof res.error === 'undefined')
            return false;

        console.log(res.error);

        return true;
    }

    var serviceInstance = {
        // Registering new user account
        registerUser: (username, password, success, failure) => {
            soapClient.createUser({ username: username, password: password }, (err, res) => {
                if (isErrorResponse(err, res) || !res.result)
                    failure(res);
                else {
                    success(res);
                    $rootScope.$apply();
                }
            })
        }
    };

    return serviceInstance;
};