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
  'ngGrid',
  'ui.select2',
  'wysiwyg.module',
  'colorpicker.module',
  'angularFileUpload'
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
                access:access.executive
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
        });
    $stateProvider
        .state('admin',{
            abstarct:true,
            template:"<ui-view>",
            data:{
                access:access.admin
            }
        })
        .state('admin.admin',{
            url:'/admin',
            templateUrl:'./partials/admin/list.html',
            controller:'AdminListCtrl'
        })
        .state('admin.newadmin',{
            url:'/admin/new',
            templateUrl:'./partials/admin/new.html',
            controller:'AdminAddCtrl'
        })
        .state('admin.viewadmin',{
            abstarct:true,
            url:'/admin/:id/',
            templateUrl:'./partials/admin/view.html',
            controller:'AdminViewCtrl'
        })
            .state('admin.viewadmin.home',{
                url:'',
                templateUrl:'./partials/admin/home.html',
                controller:'AdminHomeCtrl'
            })
            .state('admin.viewadmin.edit',{
                url:'edit/',
                templateUrl:'./partials/admin/edit.html',
                controller:'AdminEditCtrl' 
            });
    $stateProvider
        .state('franchisee',{
            abstarct:true,
            template:"<ui-view>",
            data:{
                access:access.franchisee
            }
        })
        .state('franchisee.user',{
            url:'/user',
            templateUrl:'./partials/user/list.html',
            controller:'UserListCtrl'
        })
        .state('franchisee.newuser',{
            url:'/user/new',
            templateUrl:'./partials/user/new.html',
            controller:'UserAddCtrl'
        })
        .state('franchisee.viewuser',{
            url:'/user/:id/',
            templateUrl:'./partials/user/view.html',
            controller:'UserViewCtrl'
        })
            .state('franchisee.viewuser.home',{
                url:'',
                templateUrl:'./partials/user/home.html',
                controller:'UserHomeCtrl'
            })
            .state('franchisee.viewuser.edit',{
                url:'edit/',
                templateUrl:'./partials/user/edit.html',
                controller:'UserEditCtrl'
            });
    $stateProvider
        .state('executive.localsearch',{
            url:'/localsearch',
            templateUrl:'./partials/localsearch.html',
            controller:'LocalsearchCtrl'
        })
        .state('executive.addlocalsearch',{
            url:'/localsearch/new',
            templateUrl:'./partials/addlocalsearch.html',
            controller:'AddLocalsearchCtrl'
        })
        .state('executive.viewlocalsearch',{
            abstract:true,
            url:'/localsearch/:id/',
            templateUrl:'./partials/localsearch/viewlocalsearch.html',
            controller:'ViewLocalsearchCtrl'
        })
            .state('executive.viewlocalsearch.home',{
                url:'',
                templateUrl:'./partials/localsearch/home.html',
                controller:'HomeLocalsearchCtrl'
            })
            .state('executive.viewlocalsearch.edit',{
                url:'edit/',
                templateUrl:'./partials/localsearch/edit.html',
                controller:'EditLocalsearchCtrl'
            })
        .state('executive.loc_categories',{
            url:'/loc_categories',
            templateUrl:'./partials/localsearch/categories.html',
            controller:'LocCategoryCtrl'
        })
        .state('executive.cla_categories',{
            url:'/cla_categories',
            templateUrl:'./partials/classified/categories.html',
            controller:'ClaCategoryCtrl'
        })
        .state('executive.job_categories',{
            url:'/job_categories',
            templateUrl:'./partials/job/categories.html',
            controller:'JobCategoryCtrl'
        })
        .state('executive.classified',{
            url:'/classified',
            templateUrl:'./partials/classified/list.html',
            controller:'ClassifiedListCtrl'
        })
        .state('executive.newclassified',{
            url:'/classified/new',
            templateUrl:'./partials/classified/new.html',
            controller:'ClassifiedAddCtrl'
        })
        .state('executive.viewclassified',{
            abstarct:true,
            url:'/classified/:id/',
            templateUrl:'./partials/classified/view.html',
            controller:'ClassifiedViewCtrl'
        })
            .state('executive.viewclassified.home',{
                url:'',
                templateUrl:'./partials/localsearch/home.html',
                controller:'ClassifiedHomeCtrl'
            })
            .state('executive.viewclassified.edit',{
                url:'edit/',
                templateUrl:'./partials/classified/edit.html',
                controller:'ClassifiedEditCtrl'
            });
/*    $stateProvider
        .state('admin',{
            abstract:true,
            template:"<ui-view>",
            data:{
                access:access.franchisee
            }
        })
        .state('admin.location',{
            url:'/location',
            templateUrl:'./partials/location.html',
            controller:'LocationCtrl'
        });*/
    $urlRouterProvider.otherwise('/404');
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
                    $state.go('executive.profile.dashboard');
                } else {
                    $rootScope.error = null;
                    $state.go('anon.login');
                }
            }
        }
    });

}]);
