appControllers.controller('UserListCtrl',['$scope','User','$location',function($scope,User,$location){
	$scope.users=[];
    $scope.users_selected=[];
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [20, 50, 100],
        pageSize: 50,
        currentPage: 1
    };
    $scope.title='';
    $scope.populateList = function(){
    	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage,$scope.searchText,$scope.title);
    }
    $scope.setPagingData = function(data, page, pageSize){ 
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.users = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText,title) {
        setTimeout(function () {
            var data;
            User.query({'title':title},{},function(largeLoad){
                $scope.setPagingData(largeLoad.users,page,pageSize);
            });
        }, 100);
    };
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage,$scope.searchText,$scope.title);
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
    $scope.usersTable = {
        data: 'users',
        selectedItems: $scope.users_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_user = function(){
        $location.path("/user/"+$scope.users_selected[0].user_id);
    }
    $scope.delete_users = function(){
        var users_selected_count= $scope.users_selected.length;
        var deleted=0;
        if(confirm("Delete "+users_selected_count+" users?")){
            $.each($scope.users_selected, function(key, value) {
                User.delete({},{'Id':value.user_id},function(data){
                    deleted++;
                    if(deleted == users_selected_count){
                        alert("Deleted");
                        $scope.users_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('UserAddCtrl',['$scope','User','Country','State','District','Area',function($scope,User,Country,State,District,Area){
    $scope.user = {
        'title':'',
        'fname':'',
        'lname':'',
        'email':'',
        'phone1':'',
        'phone2':'',
        'area_id':null,
        'district_id':null,
        'state_id':null,
        'country_id':null,
        'address_line_1':'',
        'address_line_2':'',
        'status':'active',
        'admin_id':''
    };
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
    };
    var get_districts=function(state_id){
        $scope.districts = District.query({'state_id':state_id},function(districts){
        });
    };
    var get_areas=function(district_id){
        $scope.areas = Area.query({'district_id':district_id},function(areas){
        });
    };
    $scope.processForm = function(){
        console.log("processing form..");
        User.save($scope.user,function(data){
            console.log(data);
            if(data.user_id>0){
                alert("Successfully registered with id:"+data.user_id);
                document.getElementById("userForm").reset();           
            }
        });
    }
}]);
appControllers.controller('UserViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('UserHomeCtrl',['$scope','$stateParams','User',function($scope,$stateParams,User){
   alert(1);
    $scope.admin_id = $stateParams.id;
    $scope.fname='';
    User.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.fname=data.fname;
    });
}]);
appControllers.controller('UserEditCtrl',['$scope','$stateParams','User','Country','State','District','Area',function($scope,$stateParams,
    User,Country,State,District,Area){
    $scope.user = {
        'title':'',
        'fname':'',
        'lname':'',
        'email':'',
        'phone1':'',
        'phone2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'address_line_1':'',
        'address_line_2':'',
        'status':'',
        'admin_id':''
    };
    $scope.reset_data=function(){
        User.query({},{'Id':$stateParams.id},function(data){
            $scope.user=data;
        });
    }
    $scope.reset_data();
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('user.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.user.state_id='';
            $scope.user.district_id='';
            $scope.user.area_id='';
        }
    });
    $scope.$watch('user.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++;  
        if(s_change>2){
            $scope.user.district_id='';
            $scope.user.area_id='';
        }
    });
    $scope.$watch('user.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.user.area_id='';
        }
    });

    var get_states = function(country_id){
        $scope.states = State.query({'country_id': country_id},function(states){
        });
    };
    var get_districts=function(state_id){
        $scope.districts = District.query({'state_id':state_id},function(districts){
        });
    };
    var get_areas=function(district_id){
        $scope.areas = Area.query({'district_id':district_id},function(areas){
        });
    };
    $scope.processForm = function(){
        console.log("Updating data");
        User.save({'Id':$scope.user.user_id},$scope.user,function(data){
            console.log(data);
            if(data.status=='updated'){
                alert("Successfully updated");
            }
        });
    };
}]);