appControllers.controller('AdminListCtrl',['$scope','Admin','$location',function($scope,Admin,$location){
	$scope.admins=[];
    $scope.admins_selected=[];
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
        $scope.admins = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText,title) {
        setTimeout(function () {
            var data;
            Admin.query({'title':title},{},function(largeLoad){
                $scope.setPagingData(largeLoad.admins,page,pageSize);
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
    $scope.adminsTable = {
    	columnDefs: [{field:'admin_id', displayName:'Id',width: 90}, 
                    {field:'fname', displayName:'FirstName'},
                    {field:'lname', displayName:'LastName'},
                    {field:'email', displayName:'Email'},
                    {field:'phone1', displayName:'Phone'},
                    {field:'area'},
                    {field:'district'}],
        data: 'admins',
        selectedItems: $scope.admins_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_admin = function(){
        $location.path("/admin/"+$scope.admins_selected[0].admin_id);
    }
    $scope.delete_admins = function(){
        var admins_selected_count= $scope.admins_selected.length;
        var deleted=0;
        if(confirm("Delete "+admins_selected_count+" admins?")){
            $.each($scope.admins_selected, function(key, value) {
                Admin.delete({},{'Id':value.admin_id},function(data){
                    deleted++;
                    if(deleted == admins_selected_count){
                        alert("Deleted");
                        $scope.admins_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('AdminAddCtrl',['$scope','Admin','Country','State','District','Area',function($scope,Admin,Country,State,District,Area){
	$scope.admin = {
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
        'status':'active'
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
        $scope.admin.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.admin.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.admin.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.admin.area_id=$scope.area.area_id;
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
        Admin.save($scope.admin,function(data){
            console.log(data);
            if(data.admin_id>0){
                alert("Successfully registered with id:"+data.admin_id);
                document.getElementById("userForm").reset();           
            }
        });
    }
}]);
appControllers.controller('AdminViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('AdminHomeCtrl',['$scope','$stateParams','Admin',function($scope,$stateParams,Admin){
   alert(1);
    $scope.admin_id = $stateParams.id;
    $scope.fname='';
    Admin.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.fname=data.fname;
    });
}]);
appControllers.controller('AdminEditCtrl',['$scope','$stateParams','Admin','Country','State','District','Area',function($scope,$stateParams,
    Admin,Country,State,District,Area){
    $scope.admin = {
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
        'status':''
    };
    $scope.reset_data=function(){
        Admin.query({},{'Id':$stateParams.id},function(data){
            $scope.admin=data;
        });
    }
    $scope.reset_data();
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('admin.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.admin.state_id='';
            $scope.admin.district_id='';
            $scope.admin.area_id='';
        }
    });
    $scope.$watch('admin.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++;  
        if(s_change>2){
            $scope.admin.district_id='';
            $scope.admin.area_id='';
        }
    });
    $scope.$watch('admin.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.admin.area_id='';
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
        Admin.save({'Id':$scope.admin.admin_id},$scope.admin,function(data){
            if(data.admin_id){
                alert("Successfully updated");
            }
        });
    };
}]);