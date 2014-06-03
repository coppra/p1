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
        pageSize: 50,
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
        'status':1,
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
        placeholder: "Select Categories",
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
appControllers.controller('ViewLocalsearchCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}])
appControllers.controller('EditLocalsearchCtrl',['$scope','$stateParams','Localsearch','Country','State','District','Area','Loc_category','Loc_sub_category','Loc_feature','Loc_product',function($scope,$stateParams,Localsearch,Country,State,District,Area,Loc_category,Loc_sub_category,Loc_feature,Loc_product){
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
        Localsearch.query({},{'Id':$stateParams.id},function(data){
            console.log(data);
            $scope.localsearch=data;
            //convert localsearch json format to update 
            var cats=[];
            for (var i in $scope.localsearch.categories) {
                cats.push($scope.localsearch.categories[i].category_id);
            }
            $scope.localsearch.categories = cats;
            var subcats=[];
            for (var i in $scope.localsearch.sub_categories) {
                subcats.push($scope.localsearch.sub_categories[i].sub_category_id);
            }
            $scope.localsearch.sub_categories = subcats;
            var fea=[];
            for (var i in $scope.localsearch.features) {
                fea.push($scope.localsearch.features[i].feature_id);
            }
            $scope.localsearch.features = fea;
            var pro=[];
            for (var i in $scope.localsearch.products) {
                pro.push($scope.localsearch.products[i].product_id);
            }
            $scope.localsearch.products = pro;

        });
    }
   
    $scope.reset_data();
    $scope.validate_unique_name = function(){
        console.log($scope.localsearch.unique_name);
        Localsearch.query({'unique_name':$scope.localsearch.unique_name},function(data){
            console.log(data.no_of_results);
        });

    }  
    function findElement(arr, propName, propValue) {
      for (var i=0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
          return arr[i];
    }
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('localsearch.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.localsearch.state_id='';
            $scope.localsearch.district_id='';
            $scope.localsearch.area_id='';
        }
    });
    $scope.$watch('localsearch.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++;  
        if(s_change>2){
            $scope.localsearch.district_id='';
            $scope.localsearch.area_id='';
        }
    });
    $scope.$watch('localsearch.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.localsearch.area_id='';
        }
        var c = findElement($scope.countries, "country_id", $scope.localsearch.country_id);
        var s = findElement($scope.states, "state_id",$scope.localsearch.state_id);
        var d = findElement($scope.districts, "district_id", $scope.localsearch.district_id);
        codeAddress(d.district+", "+s.state+", "+c.country);
    });
    $scope.$watch('localsearch.area_id',function (newVal,oldVal){
        if($scope.localsearch.area_id!=''){
            var c = findElement($scope.countries, "country_id", $scope.localsearch.country_id);
            var s = findElement($scope.states, "state_id",$scope.localsearch.state_id);
            var d = findElement($scope.districts, "district_id", $scope.localsearch.district_id);
            var a = findElement($scope.areas, "area_id", $scope.localsearch.area_id);
            codeAddress(a.area+", "+d.district+", "+s.state+", "+c.country);
        }
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

    $scope.categories=Loc_category.query({'kind':$scope.localsearch.business_type});
    $scope.$watch('localsearch.business_type', function (newVal, oldVal) {
        //$scope.categories=Loc_category.query({'kind':$scope.localsearch.business_type});
    });
    var x=0;
    $scope.$watch('localsearch.categories', function (newVal, oldVal) {
        x++;
        if(x>1){
            var category_id = newVal.join(',');
            get_sub_categories(category_id);
            get_features(category_id);
            get_products(category_id); 
        }
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
        placeholder: "Select Categories",
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
    $scope.$watch('localsearch.lat', function (newVal, oldVal) {
        set_map();
    });
    $scope.$watch('localsearch.lng', function (newVal, oldVal) {
        set_map();
    });
    //Map
    var set_map = function(){
        var latlng = new google.maps.LatLng($scope.localsearch.lat, $scope.localsearch.lng);
        placeMarker(latlng);
    }
    var latlng = new google.maps.LatLng($scope.localsearch.lat, $scope.localsearch.lng);
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
        $scope.map.setCenter(location);
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
