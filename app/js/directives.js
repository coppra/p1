'use strict';

/* Directives */
var appDirectives =  angular.module('appDirectives',[]);
appDirectives.directive('pwCheck', [function () {
	return {
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			var firstPassword = '#' + attrs.pwCheck;
			elem.add(firstPassword).on('keyup', function () {
				scope.$apply(function () {
					var v = elem.val()===$(firstPassword).val();
					ctrl.$setValidity('pwmatch', v);
				});
			});
		}
	}
}]);
appDirectives.directive('checkUser', ['$rootScope', '$location', 'userSrv', function ($root, $location, userSrv) {
	return {
		link: function (scope, elem, attrs, ctrl) {
			$root.$on('$routeChangeStart', function(event, currRoute, prevRoute){
				if (!prevRoute.access.isFree && !userSrv.isLogged) {
					// reload the login route
				}
				/*
				* IMPORTANT:
				* It's not difficult to fool the previous control,
				* so it's really IMPORTANT to repeat the control also in the backend,
				* before sending back from the server reserved information.
				*/
			});
		}
	}
}]);

appDirectives.directive('accessLevel', ['Auth', function(Auth) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var prevDisp = element.css('display')
                , userRole
                , accessLevel;

            $scope.user = Auth.user;
            $scope.$watch('user', function(user) {
                if(user.role)
                    userRole = user.role;
                updateCSS();
            }, true);

            attrs.$observe('accessLevel', function(al) {
                if(al) accessLevel = $scope.$eval(al);
                updateCSS();
            });

            function updateCSS() {
                if(userRole && accessLevel) {
                    if(!Auth.authorize(accessLevel, userRole))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                }
            }
        }
    };
}]);

appDirectives.directive('activeNav', ['$location', function($location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var anchor = element[0];
            if(element[0].tagName.toUpperCase() != 'A')
                anchor = element.find('a')[0];
            var path = anchor.href;

            scope.location = $location;
            scope.$watch('location.absUrl()', function(newPath) {
                path = normalizeUrl(path);
                newPath = normalizeUrl(newPath);

                if(path === newPath ||
                    (attrs.activeNav === 'nestedTop' && newPath.indexOf(path) === 0)) {
                    element.addClass('active');
                } else {
                    element.removeClass('active');
                }
            });
        }

    };

    function normalizeUrl(url) {
        if(url[url.length - 1] !== '/')
            url = url + '/';
        return url;
    }

}]);
appDirectives.directive('uniqueUniquename', function($http,Localsearch) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            function validate(value) {
                Localsearch.query({'unique_name': ngModel.$viewValue},function(data){
                    if (data.no_of_results == 0 ) {
                      ngModel.$setValidity('unique', true);
                    } else {
                      ngModel.$setValidity('unique', false);
                    }
                });
            }
            scope.$watch( function() {
              return ngModel.$viewValue;
            }, validate);
        }
      };
});
appDirectives.directive('validAccount', function($http,User) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            function validate(value) {
                User.query({'user_id': ngModel.$viewValue},function(data){
                    if (data.no_of_results == 1 ) {
                      ngModel.$setValidity('valid', true);
                    } else {
                      ngModel.$setValidity('valid', false);
                    }
                });
            }
            scope.$watch( function() {
              return ngModel.$viewValue;
            }, validate);
        }
      };
});