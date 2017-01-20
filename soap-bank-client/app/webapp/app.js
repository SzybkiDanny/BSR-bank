'use strict';

var soap = require('soap');
var url = 'http://localhost:8080/bank?wsdl';
var soapClient;

soap.createClient(url, (err, client) => {
    if (err) throw err;

    soapClient = client;

    angular.element(document).ready(() => {
        angular.bootstrap(document, ['BankClient']);
    });
});


var app = angular.module('BankClient', ['ui.bootstrap', 'ngRoute', 'ngCookies'])
    .config(config)
    .run(run);

config.$inject = ['$routeProvider', '$locationProvider'];
function config($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'AccountsCtrl',
            templateUrl: 'webapp/my-accounts/my-accounts-view.html',
            controllerAs: 'vm'
        })

        .when('/transfers', {
            controller: 'TransfersCtrl',
            templateUrl: 'webapp/transfers/transfers-view.html',
            controllerAs: 'vm'
        })

        .when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'webapp/login/login-view.html',
            controllerAs: 'vm'
        })

        .when('/register', {
            controller: 'RegisterCtrl',
            templateUrl: 'webapp/register/register-view.html',
            controllerAs: 'vm'
        })

        .otherwise({ redirectTo: '/login' });
}

run.$inject = ['$rootScope', '$location', '$cookies', '$http'];
function run($rootScope, $location, $cookies, $http) {
    $rootScope.globals = $cookies.getObject('globals') || {};

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var restrictedPage = !['/login', '/register'].includes($location.path());
        var loggedIn = $rootScope.globals.currentUser;
        if (restrictedPage && !loggedIn) {
            $location.path('/login');
        }
    });

    $rootScope.soap = {};
    $rootScope.soap.soapClient = soapClient;
}