angular.module('BankClient')
    .controller('RegisterCtrl', ['UserService', '$location', RegisterCtrl]);

// Controller for registration page
function RegisterCtrl(UserService, $location) {
    var vm = this;

    // Submitting registration request
    vm.register = () => {
        vm.dataLoading = true;

        UserService.registerUser(vm.user.username, vm.user.password, () => {
            $location.path('/login');
        }, () => {
            vm.dataLoading = false;
        })
    }
}