'use strict';

/* Services */

var appServices = angular.module('appServices', ['ngResource']);

appServices.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };
    $cookieStore.remove('user');
    console.log(currentUser);
    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined) {
                role = currentUser.role;
            }
            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined) {
                user = currentUser;
            }
            return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('../api/users/authenticate/',user).success(function(data){
                console.log(data);
                changeUser(data);
                success(data);
            }).error(error);
        },
        logout: function(success, error) {
               /* $cookieStore.remove('user');
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();*/
            $http.post('../api/users/logout/').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});
appServices.factory('User',['$resource',
    function($resource){
        return $resource('../api/users/:Id?',{Id:"@Id"},{
            query:{method:'GET','params':{},isArray:false},
            save:{method:'POST','params':{},isArray:false}
        });
    }
]);
appServices.factory('Role',['$resource',
    function($resource){
        return $resource('../api/roles/',{
            query:{method:'GET','params':{},isArray:true}
        })
    }
]);
appServices.factory('Country',['$resource',
	function($resource){
		return $resource('../api/locations/country/:Id?', {Id:"@Id"}, {
      		query: {method:'GET', params:{}, isArray:true}
    	});
	}
]);
appServices.factory('State',['$resource',
	function($resource){
		return $resource('../api/locations/state/:Id?', {Id:"@Id"}, {
      		query : {method:'GET','params':{},isArray:true}
    	});
	}
]);
appServices.factory('District',['$resource',
	function($resource){
		return $resource('../locations/district/:Id?', {Id:"@Id"}, {
      		query: {method:'GET', params:{}, isArray:true}
    	});
	}
]);
appServices.factory('Area',['$resource',
	function($resource){
		return $resource('../api/locations/area/:Id?', {Id:"@Id"}, {
      		query: {method:'GET', params:{}, isArray:true}
    	});
	}
]);

appServices.factory('Loc_category',['$resource',
    function($resource){
        return $resource('../api/categories/loc/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true},
        });
    }
]);
appServices.factory('Loc_sub_category',['$resource',
    function($resource){
        return $resource('../api/categories/loc/sub/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true},
        });
    }
]);
appServices.factory('Loc_feature',['$resource',
    function($resource){
        return $resource('../api/loc_features/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true},
        });
    }
]);
appServices.factory('Loc_product',['$resource',
    function($resource){
        return $resource('../api/loc_products/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true},
        });
    }
]);

