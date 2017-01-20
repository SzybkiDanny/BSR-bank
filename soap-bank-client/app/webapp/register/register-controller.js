angular.module('BankClient')
    .controller('RegisterCtrl', ['UserService', '$location', RegisterCtrl]);

function RegisterCtrl(UserService, $location) {
    var vm = this;

    vm.register = () => {
        vm.dataLoading = true;

        UserService.registerUser(vm.user.username, vm.user.password, () => {
            $location.path('/login');
        }, () => {
            vm.dataLoading = false;
        })
    }
}