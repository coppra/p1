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
                Localsearch.delete({},{'Id':value.business_id},function(data){
                    deleted++;
                    console.log(deleted+" = "+businesses_selected_count);
                    if(deleted == businesses_selected_count){
                        alert("deleted")
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        $scope.businesses_selected.length=0;
                    }
                });
            });
        }
    }
}]);
appControllers.controller('AddLocalsearchCtrl',['$scope','Localsearch','Country','State','District','Area','Loc_category','Loc_sub_category','Loc_feature','Loc_product','$upload',function($scope,Localsearch,Country,State,District,Area,Loc_category,Loc_sub_category,Loc_feature,Loc_product,$upload){
    
    $scope.onFileSelect = function($files) {
        $scope.profile_pic = $files[0];
    };
    $scope.onFileSelect2 = function($files) {
        $scope.cover_pic = $files[0];
    };
    var save_pic = function(id,category,kind){
        console.log($scope.profile_pic);
        var data ={'id':id,'category':category,'kind':kind};
        if(kind == 'profile')
            var file = $scope.profile_pic;
        else if(kind == 'cover')
            var file = $scope.cover_pic;
        $scope.upload = $upload.upload({
            url: '../api/upload.php?files',
             data: data,
             // data: {myObj: data},
            file: file
          }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total) );
          }).success(function(data, status, headers, config) {
            console.log(data);
          });
    };
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
        'message':'',
        'description':'',
        'details':'',
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
                console.log($scope.profile_pic);
                if($scope.profile_pic)
                    save_pic(data.business_id,'localsearch','profile');
                if($scope.cover_pic)
                    save_pic(data.business_id,'localsearch','cover');
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

}]);
appControllers.controller('ViewLocalsearchCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('HomeLocalsearchCtrl',['$scope','$stateParams','Localsearch',function($scope,$stateParams,Localsearch){
    $scope.business_id = $stateParams.id;
    $scope.name='';
    Localsearch.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.name=data.name;
    });
}]);
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
        if(c && s && d)
        codeAddress(d.district+", "+s.state+", "+c.country);
    });
    $scope.$watch('localsearch.area_id',function (newVal,oldVal){
        if($scope.localsearch.area_id!=''){
            var c = findElement($scope.countries, "country_id", $scope.localsearch.country_id);
            var s = findElement($scope.states, "state_id",$scope.localsearch.state_id);
            var d = findElement($scope.districts, "district_id", $scope.localsearch.district_id);
            var a = findElement($scope.areas, "area_id", $scope.localsearch.area_id);
            if(c && s && d)
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
    var y=0;
    $scope.$watch('localsearch.business_type', function (newVal, oldVal) {
        y++;
        if(y>2){
            $scope.categories=Loc_category.query({'kind':$scope.localsearch.business_type});
            $scope.localsearch.categories=[];
            $scope.localsearch.sub_categories=[];
            $scope.localsearch.features=[];
            $scope.localsearch.products=[];
        }
    });
    var x=0;
    $scope.$watch('localsearch.categories', function (newVal, oldVal) {
        x++;
        if(x>1){
            $scope.sub_categories=[];
            $scope.features=[];
            $scope.products=[];
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
        Localsearch.save({'Id':$scope.localsearch.business_id},$scope.localsearch,function(data){
            if(data.business_id){
                alert("Successfully updated");
            }
        })
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
}]);
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

}]);
