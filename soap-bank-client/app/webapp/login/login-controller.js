angular.module('BankClient')
    .controller('LoginCtrl', ['$location', 'AuthenticationService', LoginCtrl]);

function LoginCtrl($location, AuthenticationService) {
    var vm = this;

    AuthenticationService.clearCredentials();

    vm.login = () => {
        vm.dataLoading = true;
        AuthenticationService.login(vm.username, vm.password, () => {
            AuthenticationService.setCredentials(vm.username, vm.password);
            $location.path('/');
        }, () => {
            vm.dataLoading = false;
        })
    }
}