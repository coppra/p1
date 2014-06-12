appControllers.controller('OfferListCtrl',['$scope','Offer','$location',function($scope,Offer,$location){
    $scope.offers=[];
    $scope.offers_selected=[];
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
        $scope.offers = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            Offer.query({},{},function(largeLoad){
                $scope.setPagingData(largeLoad.results,page,pageSize);
            });
        }, 100);
    };
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage,$scope.searchText);
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
    $scope.offersTable = {
        columnDefs: [{field:'offer_id', displayName:'Id',width: 90}, 
                    {field:'offer_title', displayName:'Title'},
                    {field:'value', displayName:'OfferValue'},
                    {field:'name', displayName:'Company'},
                    {field:'district', displayName:'District'},
                    {field:'start_date'},
                    {field:'end_date'}],
        data: 'offers',
        selectedItems: $scope.offers_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_offer = function(){
        $location.path("/offer/"+$scope.offers_selected[0].offer_id);
    }
    $scope.delete_offers = function(){
        var offers_selected_count= $scope.offers_selected.length;
        var deleted=0;
        if(confirm("Delete "+offers_selected_count+" offers?")){
            $.each($scope.offers_selected, function(key, value) {
                Offer.delete({},{'Id':value.offer_id},function(data){
                    deleted++;
                    if(deleted == offers_selected_count){
                        alert("Deleted");
                        $scope.offers_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('OfferAddCtrl',['$scope','Offer','Loc_category','Loc_sub_category','Offer_tag','Country','State','District','Area',function($scope,Offer,Loc_category,Loc_sub_category,Offer_tag,Country,State,District,Area){
    $scope.offer = {
        'offer_title':'',
        'value':'',
        'description':'',
        'business_id':'',
        'start_date':'',
        'end_date':'',
        'user_id':'',
        'name':'',
        'caption':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'categories':[],
        'sub_categories':[],
        'tags':[]
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
        $scope.offer.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.offer.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.offer.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.offer.area_id=$scope.area.area_id;
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
    $scope.categories=Loc_category.query({"kind":"business,service"});
    $scope.$watch('offer.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.offer.sub_categories.length=0;
            return;
        }
        Loc_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.offer.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.offer.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    // console.log(data[i].sub_category_id);
                    //$scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });

    };
    var tag_list=[];
    Offer_tag.query({},function(data){
        for(var i=0; i<data.length; i++){
            tag_list.push(data[i]['tag']);
        }
    })
    $scope.tags_select2Options = {
        'multiple': true,
        'simple_tags': true,
        'tags': tag_list  // Can be empty list.
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Offer.save($scope.offer,function(data){
            console.log(data);
            if(data.offer_id>0){
                alert("Successfully registered with id:"+data.offer_id);
            }
            document.getElementById("userForm").reset();           
        });
    }
}]);
appControllers.controller('OfferViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('OfferHomeCtrl',['$scope','$stateParams','Offer',function($scope,$stateParams,Offer){
    $scope.offer_id = $stateParams.id;
    $scope.name='';
    Offer.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.name=data.name;
    });
}]);
appControllers.controller('OfferEditCtrl',['$scope','$stateParams','Offer','Country','State','District','Area','Loc_category','Loc_sub_category','Offer_tag',function($scope,$stateParams,Offer,Country,State,District,Area,Loc_category,Loc_sub_category,Offer_tag){
    $scope.offer = {
        'offer_id':'',
        'offer_title':'',
        'value':'',
        'description':'',
        'business_id':'',
        'start_date':'',
        'end_date':'',
        'user_id':'',
        'name':'',
        'caption':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'categories':[],
        'sub_categories':[],
        'tags':[]
    };
    $scope.reset_data=function(){
        Offer.query({},{'Id':$stateParams.id},function(data){
            $scope.offer=data;
            var cats=[];
            for (var i in $scope.offer.categories) {
                cats.push($scope.offer.categories[i].category_id);
            }
            $scope.offer.categories = cats;
            var subcats=[];
            for (var i in $scope.offer.sub_categories) {
                subcats.push($scope.offer.sub_categories[i].sub_category_id);
            }
            $scope.offer.sub_categories = subcats;
            var tag=[];
            for (var i in $scope.offer.tags) {
                tag.push($scope.offer.tags[i].tag);
            }
            $scope.offer.tags = tag;
            
        });
    };
    $scope.reset_data();
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('offer.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.offer.state_id='';
            $scope.offer.district_id='';
            $scope.offer.area_id='';
        }
    });
    $scope.$watch('offer.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++; 
        if(s_change>2){
            $scope.offer.district_id='';
            $scope.offer.area_id='';
        }
    });
    $scope.$watch('offer.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.offer.area_id='';
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
    $scope.categories=Loc_category.query({});
    var x=0;
    $scope.$watch('offer.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.offer.sub_categories.length=0;
            return;
        }
        Loc_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.offer.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.offer.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    //console.log(data[i].sub_category_id);
                   // $scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });

    };

    var tag_list=[];
    Offer_tag.query({},function(data){
        for(var i=0; i<data.length; i++){
            tag_list.push(data[i]['tag']);
        }
    });
    $scope.tags_select2Options = {
        'multiple': true,
        'simple_tags': true,
        'tags': tag_list  // Can be empty list.
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Offer.save({'Id':$scope.offer.offer_id},$scope.offer,function(data){
            console.log(data);
            if(data.offer_id>0){
                alert("Successfully updated");
            }        
        });
    }
}]);