angular.module('BankClient')
    .controller('AccountsCtrl', ['$scope', 'AccountService', AccountsCtrl]);

function AccountsCtrl($scope, AccountService) {
    var vm = this;
    vm.selectedAccountNumber = null;
    vm.accounts = [];
    vm.transactions = [];

    refreshAccountList();

    vm.createNewAccount = () => {
        AccountService.createAccount(() => {
            refreshAccountList();
        })
    }

    vm.getAccountHistory = (accountNumber) => {
        vm.selectedAccountNumber = accountNumber;
        AccountService.getAccountHistory(accountNumber, (transactions) => {
            if (transactions == null)
                transactions = { transactions: [] };

            if (!Array.isArray(transactions.transactions))
                transactions.transactions = [transactions.transactions];

            vm.transactions = transactions.transactions;
        });
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