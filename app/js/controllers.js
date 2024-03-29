'use strict';

/* Controllers */

var appControllers = angular.module('appControllers', ['ngTable']);

appControllers.controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;
    //console.log($scope.user);
    $scope.logout = function() {
        Auth.logout(function() {
            $location.path('/login');
        }, function() {
            $rootScope.error = "Failed to logout";
        });
    };
}]);
appControllers.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {
    $scope.rememberme = true;
    $scope.login = function() {
        Auth.login({
                'email': $scope.email,
                'password': $scope.password
            },
            function(res) {
                $rootScope.error = "";
                $location.path('/');
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);
appControllers.controller('UserListCtrl',['$scope','User','$filter','$http','ngTableParams' ,function($scope,User,$filter,$http, ngTableParams) {
    $scope.users=[];
    $scope.users_selected=[];
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [20, 50, 100],
        pageSize: 20,
        currentPage: 1
    };
    $scope.setPagingData = function(data, page, pageSize){ 
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.users = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            User.query({},{},function(largeLoad){
                $scope.setPagingData(largeLoad.users,page,pageSize);
            });
        }, 100);
    };
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    
    /*$http.get('../api/users/').success(function(data) {
        $scope.users = data.users;
    });*/
    $scope.usersTable = { 
        data: 'users',
        columnDefs: [{field:'user_id', displayName:'Id',width: 90}, 
                    {field:'username', displayName:'User',enableCellEdit: true},
                    {field:'email'},
                    {field:'phone1', displayName:'Phone'},
                    {field:'area'},
                    {field:'district'},
                    {field:'acc_type'}],
        selectedItems: $scope.users_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.edit_user = function(user_id){
        alert(user_id);
    }
    $scope.changeSelection = function(user) {
        // console.info(user);
    }
    $scope.delete_users = function(){
        var users_selected_count= $scope.users_selected.length;
        var deleted=0;
        if(confirm("Delete "+users_selected_count+" users?")){
            $.each($scope.users_selected, function(key, value) {
                User.delete({},{'Id':value.user_id},function(data){
                    deleted++;
                    if(deleted == users_selected_count){
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        $scope.users_selected=[];
                    }
                });
            });
        }
    }
}]);
appControllers.controller('ProfileEditCtrl',['$scope','User','Role','Auth','Country','State','District','Area',function($scope,User,Role,Auth,Country,State,District,Area){
    $scope.roles = Role.query();
    $scope.user = Auth.user;
    $scope.edited_user ={
                    'email':'',
                    'acc_type':'4_user',
                    'name':'',
                    'phone1':'',
                    'phone2':'',
                    'area_id':'',
                    'district_id':'',
                    'state_id':'',
                    'country_id':'',
                    'address_line_1':'',
                    'address_line_2':'',
                    'address_line_3':'',
                    'status':''
                };
    User.get({},{"id":1},function(data){
        $scope.edited_user =data;
        console.log(data); 
        
    });
    $scope.country={'country_id':'','country':''};
    $scope.state={'state_id':'','state':''};
    $scope.district={'district_id':'','district':''};
    $scope.area={'area_id':'','area':''};
    $scope.countries=Country.query(function(countries){
       //$scope.country=countries[0];
    }); 
    $scope.$watch('country', function (newVal, oldVal) {
        get_states(newVal.country_id);   
        $scope.user.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.user.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.user.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.user.area_id=$scope.area.area_id;
    });
    var get_states = function(country_id){
        $scope.states = State.query({'country_id': country_id},function(states){
        });
    }
    var get_districts=function(state_id){
        $scope.districts = District.query({'state_id':state_id},function(districts){
        });
    }
    var get_areas=function(district_id){
        $scope.areas = Area.query({'district_id':district_id},function(areas){
        });
    }

}]);
appControllers.controller('LocationCtrl',['$scope','$http','Country','State','District','Area',function($scope,$http,Country,State,District,Area){
    $scope.countries= [];
    $scope.states=[];
    angular.element(".edit_group").hide();
   /* $http.get('../api/locations/country').success(function(data) {
        $scope.countries= data.countries;
    });*/
    $scope.country_selected = [];
    $scope.state_selected = [];
    $scope.district_selected = [];
    $scope.area_selected = [];
    $scope.countries=Country.query(); 
    $scope.get_countries = function(){
        $scope.countries=Country.query(); 
    }
    $scope.get_states = function(country_id,country){
        $scope.country_id = country_id;
        $scope.country = country
        $scope.states = State.query({'country_id': country_id});
    }
    $scope.get_districts = function(state_id,state){
        $scope.state_id = state_id;
        $scope.state = state
        $scope.districts = District.query({'state_id':state_id});
    }
    $scope.get_areas = function(district_id,district){
        $scope.district_id = district_id;
        $scope.district = district
        $scope.areas = Area.query({'district_id':district_id});
    }
    $scope.add_country=function(new_country){
        if(new_country){
            var data={'country':new_country};
            Country.save(data,function(data){
                $scope.countries.push(data);
                $scope.new_country='';
            })
        }
    }
    $scope.add_state = function(new_state){
        if(new_state){
            var data={'state':new_state,'country_id':$scope.country_id};
            State.save(data,function(data){
                $scope.states.push(data);
                $scope.new_state='';                
            });
        }
    }
    $scope.add_district = function(new_district){
        if(new_district){
            var data={'district':new_district,'state_id':$scope.state_id};
            District.save(data,function(data){
                $scope.districts.push(data);
                $scope.new_district='';
            });
        }
    }
    $scope.add_area = function(new_area){
        if(new_area){
            var data={'area':new_area,'district_id':$scope.district_id};
            Area.save(data,function(data){
                $scope.areas.push(data);
                $scope.new_area='';
            });
        }
    }

    $scope.edit_country = function(country_id,country){
        $scope.cancel_edit();
        $scope.edited_country=country;
        angular.element("table#countries tr#"+country_id+" .edit_group").show();
        angular.element("table#countries tr#"+country_id+" input").focus();
        angular.element("table#countries tr#"+country_id+" .no_edit_group").hide();
    }
    $scope.update_country = function(country_id,country){
        if(country){
            var data = Country.get({},{'Id':country_id});
            data.country = country;
            data.$save(function(data){
                $scope.get_countries();
            }); 
        }
    }
    $scope.edit_state = function(state_id,state){
        $scope.cancel_edit();
        $scope.edited_state=state;
        angular.element("table#states tr#"+state_id+" .edit_group").show();
        angular.element("table#states tr#"+state_id+" input").focus();
        angular.element("table#states tr#"+state_id+" .no_edit_group").hide();
    }
    $scope.update_state = function(state_id,state){
        if(state){
            var data = State.get({},{'Id':state_id});
            data.state = state;
            data.$save(function(data){
                $scope.get_states($scope.country_id);
            });
        }
    }
    $scope.edit_district = function(district_id,district){
        $scope.cancel_edit();
        $scope.edited_district=district;
        angular.element("table#districts tr#"+district_id+" .edit_group").show();
        angular.element("table#districts tr#"+district_id+" input").focus();
        angular.element("table#districts tr#"+district_id+" .no_edit_group").hide();
    }
    $scope.update_district = function(district_id,district){
        if(district){
            var data = District.get({},{'Id':district_id});
            data.district = district;
            data.$save(function(data){
                $scope.get_districts($scope.state_id);
            });
        }
    }
    $scope.edit_area = function(area_id,area){
        $scope.cancel_edit();
        $scope.edited_area=area;
        angular.element("table#areas tr#"+area_id+" .edit_group").show();
        angular.element("table#areas tr#"+area_id+" input").focus();
        angular.element("table#areas tr#"+area_id+" .no_edit_group").hide();
    }
    $scope.update_area = function(area_id,area){
        if(area){
            var data=Area.get({},{'id':area_id});
            data.area = area;
            data.$save(function(data){
                $scope.get_areas($scope.district_id);
            });
        }
    }
    $scope.cancel_edit = function(){
        angular.element(".edit_group").hide();
        angular.element(".no_edit_group").show();
    }
    $scope.delete_country = function(country_id){
        if(confirm("Delete?")){
            $scope.countries= [];
            Country.delete({},{'Id':country_id},function(){
                $scope.get_countries();
            });
        }
    }
    $scope.delete_state = function(state_id){
        if(confirm("Delete?")){
            $scope.states= [];
            State.delete({},{'Id':state_id},function(){
                $scope.get_states($scope.country_id);
            });
        }
    }
    $scope.delete_district = function(district_id){
        if(confirm("Delete?")){
            $scope.districts= [];
            District.delete({},{'Id':district_id},function(){
                $scope.get_districts($scope.state_id);
            });
        }
    }
    $scope.delete_area = function(area_id){
        if(confirm("Delete?")){
            $scope.areas= [];
            Area.delete({},{'Id':area_id},function(){
                $scope.get_areas($scope.district_id);
            });
        }
    }
}])

appControllers.controller('AddUserCtrl',['$scope','$http','User','Country','State','District','Area',function($scope,$http,User,Country,State,District,Area){
    $scope.user = {
                    'email':'',
                    'password':'',
                    'acc_type':'4_user',
                    'name':'',
                    'phone1':'',
                    'phone2':'',
                    'area_id':'',
                    'district_id':'',
                    'state_id':'',
                    'country_id':'',
                    'address_line_1':'',
                    'address_line_2':'',
                    'address_line_3':'',
                    'status':''
                };
    $scope.country={'country_id':'','country':''};
    $scope.state={'state_id':'','state':''};
    $scope.district={'district_id':'','district':''};
    $scope.area={'area_id':'','area':''};
    $scope.countries=Country.query(function(countries){
       $scope.country=countries[0];
    }); 
    $scope.$watch('country', function (newVal, oldVal) {
        get_states(newVal.country_id);   
        $scope.user.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.user.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.user.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.user.area_id=$scope.area.area_id;
    });
    var get_states = function(country_id){
        $scope.states = State.query({'country_id': country_id},function(states){
        });
    }
    var get_districts=function(state_id){
        $scope.districts = District.query({'state_id':state_id},function(districts){
        });
    }
    var get_areas=function(district_id){
        $scope.areas = Area.query({'district_id':district_id},function(areas){
        });
    }
    //$scope.country=$scope.countries[0];
    $scope.validate_email = function(){
        $http.get('../api/users/?email='+$scope.user.email).success(function(data) {
            console.log(data);
            if(data.no_of_results!=0){
                $scope.user.email = '';
            }
        });
    };
    $scope.processForm = function(){
        User.save($scope.user,function(data){
            document.getElementById("userForm").reset();           
        });

    };
}])
