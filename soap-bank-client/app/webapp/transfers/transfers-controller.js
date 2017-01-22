angular.module('BankClient')
    .controller('TransfersCtrl', ['$scope', 'AccountService', 'TransferService', TransfersCtrl]);

// Controller for money transferring page
function TransfersCtrl($scope, AccountService, TransferService) {
    var vm = this;
    vm.accounts = [];
    vm.selectedAccountFrom = null;
    vm.accountTo = null;
    vm.operationType = 'Transfer';
    vm.title = null;
    vm.amount = 0;

    refreshAccountList();

    // Submitting client operation
    vm.submitOperation = () => {
        if (vm.operationType == 'Transfer') {
            TransferService.makeTransfer(vm.selectedAccountFrom.accountNumber, vm.accountTo, vm.title, vm.amount,
                (result) => {
                    console.log(result);
                })
        }
        else if (vm.operationType == 'Deposit') {
            TransferService.makeDeposit(vm.accountTo, vm.amount,
                (result) => {
                    console.log(result);
                })
        }
        else if (vm.operationType == 'Withdrawal') {
            TransferService.makeWithdrawal(vm.selectedAccountFrom.accountNumber, vm.amount,
                (result) => {
                    console.log(result);
                })
        }
    }

    function refreshAccountList() {
        AccountService.getAccountList((accounts) => {
            if (accounts == null)
                accounts = { accounts: [] };

            if (!Array.isArray(accounts.accounts))
                accounts.accounts = [accounts.accounts];

            vm.accounts = accounts.accounts;
        })
    }
}