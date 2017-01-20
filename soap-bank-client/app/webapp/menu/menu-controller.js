angular.module('BankClient')
    .controller('MasterCtrl', ['$scope', '$rootScope', '$cookieStore', '$location', 'AuthenticationService', MasterCtrl]);

function MasterCtrl($scope, $rootScope, $cookieStore, $location, AuthenticationService) {
    var mobileView = 992;

    $scope.isLoggedIn = () => {
        return !(typeof $rootScope.globals.currentUser === 'undefined');
    }

    $scope.currentUsername = () => {
        if ($scope.isLoggedIn())
            return $rootScope.globals.currentUser.username;
        return "";
    }

    $scope.getWidth = function () {
        return window.innerWidth;
    };

    $scope.logout = () => {
        AuthenticationService.clearCredentials();
        $location.path('/login');
    }

    $scope.$watch($scope.getWidth, function (newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = !$cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function () {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function () {
        $scope.$apply();
    };
}