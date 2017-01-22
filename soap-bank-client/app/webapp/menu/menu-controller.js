
angular.module('BankClient')
    .controller('MasterCtrl', ['$scope', '$rootScope', '$cookieStore', '$location', 'AuthenticationService', MasterCtrl]);

// Controller for sidebar
function MasterCtrl($scope, $rootScope, $cookieStore, $location, AuthenticationService) {
    var mobileView = 992;

    // Checking is user is logged in
    $scope.isLoggedIn = () => {
        return !(typeof $rootScope.globals.currentUser === 'undefined');
    }

    // Return current user's username
    $scope.currentUsername = () => {
        if ($scope.isLoggedIn())
            return $rootScope.globals.currentUser.username;
        return "";
    }

    $scope.getWidth = function () {
        return window.innerWidth;
    };

    // Signing user out
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