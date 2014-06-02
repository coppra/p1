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
                console.log(largeLoad.users);
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
appControllers.controller('LocCategoryCtrl',['$scope','Country','Loc_category','Loc_sub_category','Loc_feature','Loc_product',function($scope,Country,Loc_category,Loc_sub_category,Loc_feature,Loc_product){
    $scope.new={};
    $scope.categories=Loc_category.query();
    $scope.edit={category_id:"",category:""};
    $scope.get_categories=function(){
        $scope.categories=Loc_category.query();
    }
    $scope.add_category=function(category,kind){
        if(category){
            var data={'category':category,'kind':kind};
            Loc_category.save(data,function(data){
                $scope.new.category='';
                $scope.categories.push(data);
            })
        }
    }
    $scope.update_category = function(category_id,category){
        if(category_id){
            var data = Loc_category.get({},{'Id':category_id});
            data.category=category;
            data.$save(function(data){
                $scope.get_categories();
            });
        }
    }
    $scope.delete_category=function(category_id){
        if(confirm("Delete category no."+category_id+"?")){
            var data={'category_id':category_id};
            Loc_category.delete({},{'Id':category_id},function(){
                $scope.get_categories();
            });
        }
    }
    $scope.reset_edit=function(){
        $scope.edit={'category_id':'','category':''};
    }
    $scope.$watch('edit.category_id', function (newVal, oldVal) {
        $scope.sub_categories=[];
        if(newVal){
            $scope.get_sub_categories(newVal);
            $scope.get_features(newVal);
            $scope.get_products(newVal);
        }
    });
    //Sub categories
    $scope.new_sub={};
    $scope.sub_categories=[];
    $scope.edit_sub={'sub_category_id':'','sub_category':''};
    $scope.get_sub_categories=function(category_id){
        $scope.sub_categories=Loc_sub_category.query({'category_id':category_id});
    }
    $scope.add_sub_category=function(sub_category,category_id){
        if(sub_category && category_id){
            var data={'sub_category':sub_category,'category_id':category_id};
            Loc_sub_category.save(data,function(data){
                $scope.sub_categories.push(data);
                $scope.new_sub.sub_category='';
            })
            
        }
    }
    $scope.update_sub_category = function(sub_category_id,sub_category){
        if(sub_category_id){
            var data = Loc_sub_category.get({},{'Id':sub_category_id});
            data.sub_category=sub_category;
            data.$save(function(data){
                $scope.get_sub_categories($scope.edit.category_id);
                $scope.reset_edit_sub();
            });
        }
    }
    $scope.delete_sub_category=function(sub_category_id){
        if(confirm("Delete category no."+sub_category_id+"?")){
            var data={'sub_category_id':sub_category_id};
            Loc_sub_category.delete({},{'Id':sub_category_id},function(){
                $scope.get_sub_categories($scope.edit.category_id);
                $scope.reset_edit_sub();
            });
        }
    }
    $scope.reset_edit_sub=function(){
        $scope.edit_sub={sub_category_id:'',sub_category:''};
    }

    //Features
    $scope.new_feature={};
    $scope.features=[];
    $scope.edit_feature={'feature_id':'','feature':''};
    $scope.get_features=function(category_id){
        $scope.features=Loc_feature.query({'category_id':category_id});
    }
    $scope.add_feature=function(feature,category_id){
        if(feature && category_id){
            var data={'feature':feature,'category_id':category_id};
            Loc_feature.save(data,function(data){
                $scope.features.push(data);
                $scope.new_feature.feature='';
            })
            
        }
    }
    $scope.update_feature = function(feature_id,feature){
        if(feature_id){
            var data = Loc_feature.get({},{'Id':feature_id});
            data.feature=feature;
            data.$save(function(data){
                $scope.get_features($scope.edit.category_id);
                $scope.reset_edit_feature();
            });
        }
    }
    $scope.delete_feature=function(feature_id){
        if(confirm("Delete feature no."+feature_id+"?")){
            var data={'feature_id':feature_id};
            Loc_feature.delete({},{'Id':feature_id},function(){
                $scope.get_features($scope.edit.category_id);
                $scope.reset_edit_feature();
            });
        }
    }
    $scope.reset_edit_feature=function(){
        $scope.edit_feature={feature_id:'',feature:''};
    }

    //Products
    $scope.new_product={};
    $scope.products=[];
    $scope.edit_product={'feature_id':'','feature':''};
    $scope.get_products=function(category_id){
        $scope.products=Loc_product.query({'category_id':category_id});
    }
    $scope.add_product=function(product,category_id){
        if(product && category_id){
            var data={'product':product,'category_id':category_id};
            Loc_product.save(data,function(data){
                console.log(data);
                $scope.products.push(data);
                $scope.new_product.product='';
            });
            
        }
    }
    $scope.update_product = function(product_id,product){
        if(product_id){
            var data = Loc_product.get({},{'Id':product_id});
            data.product=product;
            data.$save(function(data){
                $scope.get_products($scope.edit.category_id);
                $scope.reset_edit_product();
            });
        }
    }
    $scope.delete_product=function(product_id){
        if(confirm("Delete product no."+product_id+"?")){
            var data={'product_id':product_id};
            Loc_product.delete({},{'Id':product_id},function(){
                $scope.get_products($scope.edit.category_id);
                $scope.reset_edit_product();
            });
        }
    }
    $scope.reset_edit_product=function(){
        $scope.edit_product={product_id:'',product:''};
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
appControllers.controller('LocalsearchCtrl',['$scope','Localsearch',function($scope,Localsearch){
    $scope.businesses=[];
    $scope.businesses_selected=[];
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
        $scope.businesses = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if(searchText){
                var ft = searchText.toLowerCase();
                Localsearch.query({},{},function(largeLoad){
                    largeLoad = largeLoad.results;        
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });    
            }
            Localsearch.query({},{},function(largeLoad){
                $scope.setPagingData(largeLoad.results,page,pageSize);
            });
        }, 100);
    };
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.localsearchTable = { 
        data: 'businesses',
        rowTemplate:'<div style="height: 100%" ng-class="{red: row.getProperty(\'status\') < 1}"><div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell ">' +
                           '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div>' +
                           '<div ng-cell></div>' +
                     '</div></div>',
        columnDefs: [{field:'business_id', displayName:'Id',width: 90},
                        {field:'name',displayName:'Name'},
                        {field:'unique_name',displayName:'Unique'},
                        {field:'user_id',displayName:'UserId'},
                        {field:'contact_person',displayName:'ContactPerson'},
                        {field:'phone1',displayName:'Phone'},
                        {field:'email',displayName:'Email'},
                        {field:'district',displayName:'District'},
                        {field:'categories[0].category',displayName:'Category'},
                    ],
        selectedItems: $scope.businesses_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.edit_business = function(business_id){
        alert(business_id);
    }
    $scope.changeSelection = function(business) {
        // console.info(business);
    }
    $scope.delete_businesses = function(){
        var businesses_selected_count= $scope.businesses_selected.length;
        var deleted=0;
        if(confirm("Delete "+businesses_selected_count+" businesss?")){
            $.each($scope.businesses_selected, function(key, value) {
                business.delete({},{'Id':value.business_id},function(data){
                    deleted++;
                    if(deleted == businesss_selected_count){
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        $scope.businesss_selected=[];
                    }
                });
            });
        }
    }
}])
appControllers.controller('AddLocalsearchCtrl',['$scope','Localsearch','Country','State','District','Area','Loc_category','Loc_sub_category','Loc_feature','Loc_product',function($scope,Localsearch,Country,State,District,Area,Loc_category,Loc_sub_category,Loc_feature,Loc_product){
    $scope.localsearch={
        'name':'',
        'caption':'',
        'unique_name':'',
        'business_type':'',
        'user_id':'',
        'contact_person':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'lat':'',
        'lng':'',
        'phone1':'',
        'phone2':'',
        'email':'',
        'website':'',
        'fb':'',
        'gp':'',
        'working_hours':'',
        'established':'',
        'description':'',
        'status':'',
        'categories':[],
        'sub_categories':[],
        'features':[],
        'products':[]
    };
    $scope.reset_data=function(){
        $scope.localsearch={};
    }
    $scope.validate_unique_name = function(){
        console.log($scope.localsearch.unique_name);
        Localsearch.query({'unique_name':$scope.localsearch.unique_name},function(data){
            console.log(data.no_of_results);
        });

    }
    $scope.country={'country_id':'','country':''};
    $scope.state={'state_id':'','state':''};
    $scope.district={'district_id':'','district':''};
    $scope.area={'area_id':'','area':''};
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    $scope.$watch('country', function (newVal, oldVal) {
        get_states(newVal.country_id);   
        $scope.state={'state_id':'','state':''};
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
        $scope.localsearch.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.localsearch.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.localsearch.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.localsearch.area_id=$scope.area.area_id;
        if($scope.area.area!='')
            codeAddress($scope.area.area+", "+$scope.district.district+", "+$scope.state.state);
    });
    /*$scope.$watch('localsearch.country_id', function (newVal, oldVal) {
        get_states(newVal);   
    });
    $scope.$watch('localsearch.state_id', function (newVal, oldVal) {
        get_districts(newVal);   
    });
    $scope.$watch('localsearch.district_id',function (newVal, oldVal){
        get_areas(newVal);
    });*/
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

    $scope.categories=Loc_category.query({'kind':$scope.localsearch.business_type});
    $scope.$watch('localsearch.business_type', function (newVal, oldVal) {
        $scope.categories=Loc_category.query({'kind':$scope.localsearch.business_type});
    });
    $scope.$watch('localsearch.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
        get_features(category_id);
        get_products(category_id); 
    });
    var get_sub_categories=function(category_id){
        $scope.sub_categories = Loc_sub_category.query({'category_id': category_id});
    }
    var get_features=function(category_id){
        $scope.features = Loc_feature.query({'category_id': category_id});
    }
    var get_products=function(category_id){
        $scope.products = Loc_product.query({'category_id': category_id});
    }
     //$scope.list_of_string = ['tag1', 'tag2']
   $scope.cat_select2Options = {
        allowClear:true,
        placeholder: "Select a Categories",
         maximumSelectionSize: 3
    };

    $scope.processForm = function(){
        console.log("processing form..");
        Localsearch.save($scope.localsearch,function(data){
            console.log(data);
            if(data.business_id>0){
                alert("Successfully registered with id:"+data.business_id);
            }
            document.getElementById("userForm").reset();           
        });
    }
    //Map
    var latlng = new google.maps.LatLng(9.9312328, 76.26730410000005);

    var mapOptions = {
        zoom: 13,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.geocoder = new google.maps.Geocoder();
    google.maps.event.addListener($scope.map, 'click', function(event) {      
        $scope.localsearch.lat=event.latLng.lat();
        $scope.localsearch.lng=event.latLng.lng();
        showvalues(event.latLng)
        placeMarker(event.latLng);
    });
    var showvalues=function(location){
        $scope.$apply(function(){
            $scope.localsearch.lat=location.lat();
            $scope.localsearch.lng=location.lng();
        })
    }
    var placeMarker=function(location)
    {
        $scope.marker = new google.maps.Marker({
                position: location,
                map: $scope.map
            });
        if ($scope.oldMarker != undefined){
              $scope.oldMarker.setMap(null);
        }
        $scope.oldMarker = $scope.marker;
            //map.setCenter(location);
    }
    
    function codeAddress(address) {
    //var address = document.getElementById("area").value;
        $scope.geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            $scope.map.setCenter(results[0].geometry.location);
            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                position: results[0].geometry.location
            });
            if ($scope.oldMarker != undefined){
                  $scope.oldMarker.setMap(null);
            }
            $scope.oldMarker = $scope.marker;
            showvalues(results[0].geometry.location);
          } else {
            //alert("Geocode was not successful for the following reason: " + status);
          }
        });
    }

}])