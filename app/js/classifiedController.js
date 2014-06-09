appControllers.controller('ClassifiedListCtrl',['$scope','Classified','$location',function($scope,Classified,$location){
	$scope.classifieds=[];
    $scope.classifieds_selected=[];
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
        $scope.classifieds = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            Classified.query({},{},function(largeLoad){
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
    $scope.classifiedsTable = {
    	columnDefs: [{field:'classified_id', displayName:'Id',width: 90}, 
                    {field:'heading', displayName:'Heading'},
                    {field:'contact_person', displayName:'ConatctPerson'},
                    {field:'email', displayName:'Email'},
                    {field:'phone1', displayName:'Phone'},
                    {field:'area'},
                    {field:'district'}],
        data: 'classifieds',
        selectedItems: $scope.classifieds_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_classified = function(){
        $location.path("/classified/"+$scope.classifieds_selected[0].classified_id);
    }
    $scope.delete_classifieds = function(){
        var classifieds_selected_count= $scope.classifieds_selected.length;
        var deleted=0;
        if(confirm("Delete "+classifieds_selected_count+" classifieds?")){
            $.each($scope.classifieds_selected, function(key, value) {
                Classified.delete({},{'Id':value.classified_id},function(data){
                    deleted++;
                    if(deleted == classifieds_selected_count){
                        alert("Deleted");
                        $scope.classifieds_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('ClassifiedAddCtrl',['$scope','Classified','Country','State','District','Area','Cla_category','Cla_sub_category','Cla_feature','Cla_spec','$upload',function($scope,Classified,Country,State,District,Area,Cla_category,Cla_sub_category,Cla_feature,Cla_spec,$upload){
    $scope.onFileSelect = function($files) {
        $scope.profile_pic = $files[0];
    };
    var save_pic = function(id,category,kind){
        console.log($scope.profile_pic);
        var data ={'id':id,'category':category,'kind':kind};
        if(kind == 'profile')
            var file = $scope.profile_pic;
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
    $scope.classified = {
        'heading':'',
        'description':'',
        'price':'',
        'contact_person':'',
        'phone':'',
        'email':'',
        'posted_on':'',
        'ends_on':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'categories':[],
        'sub_categories':[],
        'features':[],
        'specs':[]
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
        $scope.classified.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.classified.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.classified.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.classified.area_id=$scope.area.area_id;
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
    $scope.categories=Cla_category.query({});
    $scope.$watch('classified.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
        get_features(category_id);
        get_specs(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.classified.sub_categories.length=0;
            return;
        }
        Cla_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.classified.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].sub_category_id);
                    $scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });

    };
    var get_features=function(category_id){
        if(!category_id){
            $scope.classified.features.length=0;
            return;
        }
        Cla_feature.query({'category_id': category_id},function(data){
            $scope.features = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.features.length; j++){
                    if(data[i].feature_id == $scope.classified.features[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].feature_id);
                    $scope.classified.features.push(data[i].feature_id);
                }
            }
        });
    };
    var get_specs = function(category_id){
        if(!category_id){
            $scope.classified.specs.length=0;
            return;
        }
        var toDel=[];
        var ids = category_id.split(',');
        for(var j=0; j < $scope.classified.specs.length; j++){
            var flag=false;
            for(var k=0; k<ids.length;k++){
                if(ids[k]==$scope.classified.specs[j].category_id)
                    flag=true;
            }
            if(!flag){
                toDel.push(j);
            }
        }
        for(var i=0;i<toDel.length;i++)
            $scope.classified.specs.splice(toDel[i] - i, 1);
        Cla_spec.query({'category_id':category_id},function(data){
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.specs.length; j++){
                    if(data[i].spec_id == $scope.classified.specs[j].spec_id){
                        flag = true; 
                    }
                }
                if(!flag){
                    $scope.classified.specs.push(data[i]);
                }
            }
        })
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Classified.save($scope.classified,function(data){
            console.log(data);
            if(data.classified_id>0){
                alert("Successfully registered with id:"+data.classified_id);
                console.log($scope.profile_pic);
                if($scope.profile_pic)
                    save_pic(data.classified_id,'classifieds','profile');
            }
            document.getElementById("userForm").reset();           
        });
    }
}]);
appControllers.controller('ClassifiedViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('ClassifiedHomeCtrl',['$scope','$stateParams','Classified',function($scope,$stateParams,Classified){
    $scope.classified_id = $stateParams.id;
    $scope.name='';
    Classified.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.name=data.name;
    });
}]);
appControllers.controller('ClassifiedEditCtrl',['$scope','$stateParams','Classified','Country','State','District','Area','Cla_category','Cla_sub_category','Cla_feature','Cla_spec',function($scope,$stateParams,Classified,Country,State,District,Area,Cla_category,Cla_sub_category,Cla_feature,Cla_spec){
    $scope.classified = {
        'heading':'',
        'description':'',
        'price':'',
        'contact_person':'',
        'phone':'',
        'email':'',
        'posted_on':'',
        'ends_on':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'categories':[],
        'sub_categories':[],
        'features':[],
        'specs':[]
    };
    $scope.reset_data=function(){
        Classified.query({},{'Id':$stateParams.id},function(data){
            $scope.classified=data;
            var cats=[];
            for (var i in $scope.classified.categories) {
                cats.push($scope.classified.categories[i].category_id);
            }
            $scope.classified.categories = cats;
            var subcats=[];
            for (var i in $scope.classified.sub_categories) {
                subcats.push($scope.classified.sub_categories[i].sub_category_id);
            }
            $scope.classified.sub_categories = subcats;
            var fea=[];
            for (var i in $scope.classified.features) {
                fea.push($scope.classified.features[i].feature_id);
            }
            $scope.classified.features = fea;
            
        });
    };
    $scope.reset_data();
    $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('classified.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.classified.state_id='';
            $scope.classified.district_id='';
            $scope.classified.area_id='';
        }
    });
    $scope.$watch('classified.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++; 
        if(s_change>2){
            $scope.classified.district_id='';
            $scope.classified.area_id='';
        }
    });
    $scope.$watch('classified.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.classified.area_id='';
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
    $scope.categories=Cla_category.query({});
    var x=0;
    $scope.$watch('classified.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
        get_features(category_id);
        get_specs(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.classified.sub_categories.length=0;
            return;
        }
        Cla_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.classified.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].sub_category_id);
                    $scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });

    };
    var get_features=function(category_id){
        if(!category_id){
            $scope.classified.features.length=0;
            return;
        }
        Cla_feature.query({'category_id': category_id},function(data){
            $scope.features = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.features.length; j++){
                    if(data[i].feature_id == $scope.classified.features[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].feature_id);
                    $scope.classified.features.push(data[i].feature_id);
                }
            }
        });
    };
    var get_specs = function(category_id){
        if(!category_id){
            $scope.classified.specs.length=0;
            return;
        }
        var toDel=[];
        var ids = category_id.split(',');
        for(var j=0; j < $scope.classified.specs.length; j++){
            var flag=false;
            for(var k=0; k<ids.length;k++){
                if(ids[k]==$scope.classified.specs[j].category_id)
                    flag=true;
            }
            if(!flag){
                toDel.push(j);
            }
        }
        for(var i=0;i<toDel.length;i++)
            $scope.classified.specs.splice(toDel[i] - i, 1);
        Cla_spec.query({'category_id':category_id},function(data){
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.classified.specs.length; j++){
                    if(data[i].spec_id == $scope.classified.specs[j].spec_id){
                        flag = true; 
                    }
                }
                if(!flag){
                    $scope.classified.specs.push(data[i]);
                }
            }
        })
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Classified.save({'Id':$scope.classified.classified_id},$scope.classified,function(data){
            if(data.classified_id>0){
                alert("Successfully updated");
            }
        });
    }
}]);