appControllers.controller('ProductListCtrl',['$scope','Product','$location',function($scope,Product,$location){
	$scope.products=[];
    $scope.products_selected=[];
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
        $scope.products = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            Product.query({},{},function(largeLoad){
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
    $scope.productsTable = {
    	columnDefs: [{field:'product_id', displayName:'Id',width: 90}, 
                    {field:'name', displayName:'Name'},
                    {field:'brand', displayName:'Brand'},
                    {field:'price', displayName:'Price'},
                    {field:'business_id', displayName:'Business_id'},
                    {field:'categories[0].category',displayName:'Category'},
                    {field:'business_details.name',displayName:'Bname'}],
        data: 'products',
        selectedItems: $scope.products_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_product = function(){
        $location.path("/product/"+$scope.products_selected[0].product_id);
    }
    $scope.delete_products = function(){
        var products_selected_count= $scope.products_selected.length;
        var deleted=0;
        if(confirm("Delete "+products_selected_count+" products?")){
            $.each($scope.products_selected, function(key, value) {
                Product.delete({},{'Id':value.product_id},function(data){
                    deleted++;
                    if(deleted == products_selected_count){
                        alert("Deleted");
                        $scope.products_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('ProductAddCtrl',['$scope','Product','Loc_category','Loc_sub_category','Pro_tag','Pro_spec','$upload',function($scope,Product,Loc_category,Loc_sub_category,Pro_tag,Pro_spec,$upload){
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
    $scope.product = {
        'name':'',
        'brand':'',
        'code':'',
        'original_price':'',
        'price':'',
        'business_id':'',
        'qty':'',
        'description':'',
        'categories':[],
        'sub_categories':[],
        'tags':[],
        'specs':[]
    };
    $scope.categories=Loc_category.query({});
    var tag_list=[];
    Pro_tag.query({},function(data){
        for(var i=0; i<data.length; i++){
            tag_list.push(data[i]['tag']);
        }
    });
    $scope.tags_select2Options = {
        'multiple': true,
        'simple_tags': true,
        'tags': tag_list  // Can be empty list.
    };
    $scope.$watch('product.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
        get_specs(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.product.sub_categories.length=0;
            return;
        }
        Loc_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.product.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.product.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    // console.log(data[i].sub_category_id);
                    //$scope.product.sub_categories.push(data[i].sub_category_id);
                }
            }
        });
    };

    var get_specs = function(category_id){
        if(!category_id){
            $scope.product.specs.length=0;
            return;
        }
        var toDel=[];
        var ids = category_id.split(',');
        for(var j=0; j < $scope.product.specs.length; j++){
            var flag=false;
            for(var k=0; k<ids.length;k++){
                if(ids[k]==$scope.product.specs[j].category_id)
                    flag=true;
            }
            if(!flag){
                toDel.push(j);
            }
        }
        for(var i=0;i<toDel.length;i++)
            $scope.product.specs.splice(toDel[i] - i, 1);
        Pro_spec.query({'category_id':category_id},function(data){
                console.log(data);
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.product.specs.length; j++){
                    if(data[i].spec_id == $scope.product.specs[j].spec_id){
                        flag = true; 
                    }
                }
                if(!flag){
                    $scope.product.specs.push(data[i]);
                }
            }
        })
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Product.save($scope.product,function(data){
            console.log(data);
            if(data.product_id>0){
                alert("Successfully registered with id:"+data.product_id);
                console.log($scope.profile_pic);
                if($scope.profile_pic)
                    save_pic(data.product_id,'products','profile');
            }
            document.getElementById("userForm").reset();           
        });
    }
}]);
appControllers.controller('ProductViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('ProductHomeCtrl',['$scope','$stateParams','Product',function($scope,$stateParams,Product){
    $scope.product_id = $stateParams.id;
    $scope.name='';
    Product.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.name=data.name;
    });
}]);
appControllers.controller('ProductEditCtrl',['$scope','$stateParams','Product','Loc_category','Loc_sub_category','Pro_tag','Pro_spec','$upload',function($scope,$stateParams,Product,Loc_category,Loc_sub_category,Pro_tag,Pro_spec,$upload){
    $scope.product = {
        'name':'',
        'brand':'',
        'code':'',
        'original_price':'',
        'price':'',
        'business_id':'',
        'qty':'',
        'description':'',
        'categories':[],
        'sub_categories':[],
        'tags':[],
        'specs':[]
    };
    $scope.reset_data=function(){
        Product.query({},{'Id':$stateParams.id},function(data){
            $scope.product=data;
            var cats=[];
            for (var i in $scope.product.categories) {
                cats.push($scope.product.categories[i].category_id);
            }
            $scope.product.categories = cats;
            var subcats=[];
            for (var i in $scope.product.sub_categories) {
                subcats.push($scope.product.sub_categories[i].sub_category_id);
            }
            $scope.product.sub_categories = subcats;
            var tag=[];
            for (var i in $scope.product.tags) {
                tag.push($scope.product.tags[i].tag);
            }
            $scope.product.tags = tag;
            
        });
    };
    $scope.reset_data();
    $scope.categories=Loc_category.query({});
    var tag_list=[];
    Pro_tag.query({},function(data){
        for(var i=0; i<data.length; i++){
            tag_list.push(data[i]['tag']);
        }
    });
    $scope.tags_select2Options = {
        'multiple': true,
        'simple_tags': true,
        'tags': tag_list  // Can be empty list.
    };
    $scope.$watch('product.categories', function (newVal, oldVal) {
        var category_id = newVal.join(',');
        get_sub_categories(category_id);
        get_specs(category_id);
    });
    var get_sub_categories=function(category_id){
        if(!category_id){
            $scope.product.sub_categories.length=0;
            return;
        }
        Loc_sub_category.query({'category_id': category_id},function(data){
            $scope.sub_categories = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.product.sub_categories.length; j++){
                    if(data[i].sub_category_id == $scope.product.sub_categories[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    // console.log(data[i].sub_category_id);
                    //$scope.product.sub_categories.push(data[i].sub_category_id);
                }
            }
        });
    };

    var get_specs = function(category_id){
        if(!category_id){
            $scope.product.specs.length=0;
            return;
        }
        var toDel=[];
        var ids = category_id.split(',');
        for(var j=0; j < $scope.product.specs.length; j++){
            var flag=false;
            for(var k=0; k<ids.length;k++){
                if(ids[k]==$scope.product.specs[j].category_id)
                    flag=true;
            }
            if(!flag){
                toDel.push(j);
            }
        }
        for(var i=0;i<toDel.length;i++)
            $scope.product.specs.splice(toDel[i] - i, 1);
        Pro_spec.query({'category_id':category_id},function(data){
                console.log(data);
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.product.specs.length; j++){
                    if(data[i].spec_id == $scope.product.specs[j].spec_id){
                        flag = true; 
                    }
                }
                if(!flag){
                    $scope.product.specs.push(data[i]);
                }
            }
        })
    };
    $scope.processForm = function(){
        console.log("processing form..");
        Product.save({'Id':$scope.product.product_id},$scope.product,function(data){
            console.log(data);
            if(data.product_id>0){
                alert("Successfully updated");
            }
        });
    }
}]);