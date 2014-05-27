'use strict';

/* App Module */

var cpanelApp = angular.module('cpanelApp', [
  'ngCookies',
  'ui.router',
  'ui.bootstrap',
  'appControllers',
  'appFilters',
  'appServices',
  'appDirectives',
  'ngGrid'
]);
cpanelApp.config(['$stateProvider', '$urlRouterProvider','$locationProvider','$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    var access = routingConfig.accessLevels;
    //Public routes
    $stateProvider
        .state('public', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.public
            }
        })
        .state('public.404', {
            url: '/404',
            templateUrl: './partials/404.html'
        });
    // Anonymous routes
    $stateProvider
        .state('anon', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.anon
            }
        })
        .state('anon.login', {
            url: '/login',
            templateUrl: './partials/login.html',
            controller: 'LoginCtrl'
        });
    $stateProvider
        .state('executive',{
            abstract:true,
            template:"<ui-view>",
            data:{
                access:access.admin
            }
        })
        .state('executive.profile',{
            abstract:true,
            url:'/',
            templateUrl:'./partials/profile.html'
        })
        .state('executive.profile.dashboard',{
            url:'',
            templateUrl:'./partials/profile/dashboard.html'

        })
        .state('executive.profile.myprofile',{
            url:'myprofile/',
            templateUrl:'./partials/profile/myprofile.html',
            controller:'ProfileEditCtrl'
        })
        .state('executive.profile.password',{
            url:'password/',
            templateUrl:'./partials/profile/password.html'
        })
    $stateProvider
        .state('admin',{
            abstract:true,
            template:"<ui-view>",
            data:{
                access:access.admin
            }
        })
        .state('admin.location',{
            url:'/location',
            templateUrl:'./partials/location.html',
            controller:'LocationCtrl'
        })
        .state('admin.users',{
            url:'/users',
            templateUrl:'./partials/users.html',
            controller:'UserListCtrl'
        })
        .state('admin.addUser',{
            url:'/users/new',
            templateUrl:'./partials/adduser.html',
            controller:'AddUserCtrl'
        })
        .state('admin.editUser',{
             abstract:true,
            url:'/users/:id',
            templateUrl:'./partials/edituser.html'
        })
        .state('admin.editUser.profile',{
            url:'',
            templateUrl:'./partials/editprofile.html',
            controller:''
        })
        .state('admin.editUser.business',{
            url:'/business/',
            templateUrl:'./partials/editbusiness.html',
        })
        .state('admin.loc_categories',{
            url:'/loc_categories/',
            templateUrl:'./partials/loc_categories.html',
            controller:'LocCategoryCtrl'
        });
  //  $urlRouterProvider.otherwise('/404');
    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    $urlRouterProvider.rule(function($injector, $location) {
        if($location.protocol() === 'file')
            return;

        var path = $location.path()
        // Note: misnomer. This returns a query object, not a search string
            , search = $location.search()
            , params
            ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
            return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
            return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
            params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
    });

  //  $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('#/login');
                }
                return $q.reject(response);
            }
        };
    });
}])
.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (!Auth.authorize(toState.data.access)) {
            $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
            event.preventDefault();
            
            if(fromState.url === '^') {
                if(Auth.isLoggedIn()) {
                    $state.go('user.home');
                } else {
                    $rootScope.error = null;
                    $state.go('anon.login');
                }
            }
        }
    });

}]);