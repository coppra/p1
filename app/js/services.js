'use strict';

/* Services */

var appServices = angular.module('appServices', ['ngResource']);

appServices.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('admin') || { email: '', role: userRoles.public };
    $cookieStore.remove('admin');
    //console.log(currentUser);
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
             return user.role.title === userRoles.super_admin.title || user.role.title === userRoles.admin.title ||  user.role.title === userRoles.franchisee.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('../api/admins/authenticate/',user).success(function(data){
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
            $http.post('../api/admins/logout/').success(function(){
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
appServices.factory('Admin',['$resource',function($resource){
    return $resource('../api/admins/:Id?',{Id:"@Id"},{
        query:{method:'GET','params':{},isArray:false}
    });
}]);
appServices.factory('User',['$resource',function($resource){
    return $resource('../api/users/:Id?',{Id:"@Id"},{
        query:{method:'GET','params':{},isArray:false}
    });
}]);
appServices.factory('Role',['$resource',function($resource){
    return $resource('../api/roles/',{
        query:{method:'GET','params':{},isArray:true}
    });
}]);
appServices.factory('Country',['$resource',function($resource){
	return $resource('../api/locations/country/:Id?', {Id:"@Id"}, {
  		query:{method:'GET','params':{}, isArray:true}
	});
}]);
appServices.factory('State',['$resource',
	function($resource){
		return $resource('../api/locations/state/:Id?', {Id:"@Id"}, {
      		query : {method:'GET','params':{},isArray:true}
    	});
	}
]);
appServices.factory('District',['$resource',
	function($resource){
		return $resource('../api/locations/district/:Id?', {Id:"@Id"}, {
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
            query: {method:'GET', params:{}, isArray:true}
        });
    }
]);
appServices.factory('Loc_sub_category',['$resource',
    function($resource){
        return $resource('../api/categories/loc/sub/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true}
        });
    }
]);
appServices.factory('Loc_feature',['$resource',
    function($resource){
        return $resource('../api/loc_features/:Id?', {Id:"@Id"}, {
            query: {method:'GET', params:{}, isArray:true}
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
appServices.factory('Localsearch',['$resource',function($resource){
    return $resource('../api/localsearch/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:false}
    });
}]);
appServices.factory('Cla_category',['$resource',function($resource){
    return $resource('../api/categories/cla/:Id?', {Id:"@Id"}, {
        query: {method:'GET', params:{}, isArray:true}
    });
}]);
appServices.factory('Cla_sub_category',['$resource',function($resource){
    return $resource('../api/categories/cla/sub/:Id?', {Id:"@Id"}, {
        query: {method:'GET', params:{}, isArray:true}
    });
}]);
appServices.factory('Cla_feature',['$resource',function($resource){
    return $resource('../api/cla_features/:Id?', {Id:"@Id"}, {
        query: {method:'GET', params:{}, isArray:true}
    });
}]);
appServices.factory('Cla_spec',['$resource',function($resource){
    return $resource('../api/cla_specs/:Id?', {Id:"@Id"}, {
        query: {method:'GET', params:{}, isArray:true}
    });
}]);
appServices.factory('Classified',['$resource',function($resource){
    return $resource('../api/classifieds/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:false}
    });
}]);
appServices.factory('Job',['$resource',function($resource){
    return $resource('../api/jobs/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:false}
    });
}]);
appServices.factory('Job_industry',['$resource',function($resource){
    return $resource('../api/jobs/industry/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:true}
    });
}]);
appServices.factory('Job_designation',['$resource',function($resource){
    return $resource('../api/jobs/designation/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:true}
    });
}]);
appServices.factory('Job_tag',['$resource',function($resource){
    return $resource('../api/jobs/tag/:Id?', {Id:"@Id"},{
        query: {method:'GET', isArray:true}
    });
}]);