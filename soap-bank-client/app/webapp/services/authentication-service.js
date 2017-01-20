angular.module('BankClient')
    .factory('AuthenticationService', ['$rootScope', '$cookies', AuthenticationService]);

function AuthenticationService($rootScope, $cookies) {
    var soapClient = $rootScope.soap.soapClient;

    function isErrorResponse(err, res) {
        if (err) return true;

        if (typeof res.error === 'undefined')
            return false;

        console.log(res.error);

        return true;
    }

    var serviceInstance = {
        login: (username, password, success, failure) => {
            soapClient.login({ username: username, password: password }, (err, res) => {
                if (isErrorResponse(err, res) || !res.result) {
                    failure(res);
                }
                else {
                    soapClient.setSecurity(new soap.BasicAuthSecurity(username, password));
                    success(res);
                }
                $rootScope.$apply();
            })
        },
        setCredentials: (username, password) => {
            soapClient.setSecurity(new soap.BasicAuthSecurity(username, password));

            $rootScope.globals = {
                currentUser: {
                    username: username
                }
            };

            var cookieExp = new Date();
            cookieExp.setDate(cookieExp.getDate() + 7);
            $cookies.putObject('globals', $rootScope.globals, { expires: cookieExp });
        },
        clearCredentials: () => {
            soapClient.setSecurity(new soap.BasicAuthSecurity('', ''));
            $rootScope.globals = {};
            $cookies.remove('globals');
        }
    };

    return serviceInstance;
};