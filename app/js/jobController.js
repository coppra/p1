appControllers.controller('JobListCtrl',['$scope','Job','$location',function($scope,Job,$location){
    $scope.jobs=[];
    $scope.jobs_selected=[];
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
        $scope.jobs = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            Job.query({},{},function(largeLoad){
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
    $scope.jobsTable = {
        columnDefs: [{field:'job_id', displayName:'Id',width: 90}, 
                    {field:'job_title', displayName:'Title'},
                    {field:'contact_person', displayName:'ConatctPerson'},
                    {field:'email', displayName:'Email'},
                    {field:'phone1', displayName:'Phone'},
                    {field:'area'},
                    {field:'district'}],
        data: 'jobs',
        selectedItems: $scope.jobs_selected,
        enablePaging: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
    $scope.view_job = function(){
        $location.path("/job/"+$scope.jobs_selected[0].job_id);
    }
    $scope.delete_jobs = function(){
        var jobs_selected_count= $scope.jobs_selected.length;
        var deleted=0;
        if(confirm("Delete "+jobs_selected_count+" jobs?")){
            $.each($scope.jobs_selected, function(key, value) {
                Job.delete({},{'Id':value.job_id},function(data){
                    deleted++;
                    if(deleted == jobs_selected_count){
                        alert("Deleted");
                        $scope.jobs_selected.length=0;
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    }
                });
            });
        }
    }
}]);
appControllers.controller('JobAddCtrl',['$scope','Job','Country','State','District','Area','Job_industry','Job_designation','Job_tag',function($scope,Job,Country,State,District,Area,Job_industry,Job_designation,Job_tag){
    $scope.job = {
        'job_title':'',
        'description':'',
        'salary':'',
        'min_experience':'',
        'max_experience':'',
        'job_type':'full_time',
        'shift':'day',
        'company_name':'',
        'company_brief':'',
        'contact_person':'',
        'phone1':'',
        'phone2':'',
        'email':'',
        'website':'',
        'established':'',
        'business_id':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'start_date':'',
        'end_date':'',
        'industries':[],
        'designations':[],
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
        $scope.job.country_id=newVal.country_id;
    });
    $scope.$watch('state', function (newVal, oldVal) {
        get_districts(newVal.state_id);   
        $scope.job.state_id=newVal.state_id;
        $scope.district={'district_id':'','district':''};
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('district',function (newVal, oldVal){
        get_areas(newVal.district_id);
        $scope.job.district_id=newVal.district_id;
        $scope.area={'area_id':'','area':''};
    });
    $scope.$watch('area',function (newVal,oldVal){
        $scope.job.area_id=$scope.area.area_id;
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
    $scope.industries=Job_industry.query({});
    $scope.$watch('job.industries', function (newVal, oldVal) {
        var industry_id = newVal.join(',');
        get_designations(industry_id);
    });
    var get_designations=function(industry_id){
        if(!industry_id){
            $scope.job.designations.length=0;
            return;
        }
        Job_designation.query({'industry_id': industry_id},function(data){
            $scope.designations = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.job.designations.length; j++){
                    if(data[i].designation_id == $scope.job.designations[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].designation_id);
                    //$scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });
    };
    var tag_list=[];
    Job_tag.query({},function(data){
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
        Job.save($scope.job,function(data){
            console.log(data);
            if(data.job_id>0){
                alert("Successfully registered with id:"+data.job_id);
            }
            document.getElementById("userForm").reset();           
        });
    }
}]);
appControllers.controller('JobViewCtrl',['$scope','$stateParams',function($scope,$stateParams){
    $scope.id=$stateParams.id;
}]);
appControllers.controller('JobHomeCtrl',['$scope','$stateParams','Job',function($scope,$stateParams,Job){
    $scope.job_id = $stateParams.id;
    $scope.name='';
    Job.query({},{'Id':$stateParams.id},function(data){
        console.log(data);
        $scope.name=data.name;
    });
}]);
appControllers.controller('JobEditCtrl',['$scope','$stateParams','Job','Country','State','District','Area','Job_industry','Job_designation','Job_tag',function($scope,$stateParams,Job,Country,State,District,Area,Job_industry,Job_designation,Job_tag){
    $scope.job = {
        'job_title':'',
        'description':'',
        'salary':'',
        'min_experience':'',
        'max_experience':'',
        'job_type':'full_time',
        'shift':'day',
        'company_name':'',
        'company_brief':'',
        'contact_person':'',
        'phone1':'',
        'phone2':'',
        'email':'',
        'website':'',
        'established':'',
        'business_id':'',
        'address_line_1':'',
        'address_line_2':'',
        'area_id':'',
        'district_id':'',
        'state_id':'',
        'country_id':'',
        'start_date':'',
        'end_date':'',
        'industries':[],
        'designations':[],
        'tags':[]
    };
    $scope.reset_data=function(){
        Job.query({},{'Id':$stateParams.id},function(data){
            $scope.job=data;
            var ind=[];
            for (var i in $scope.job.industries) {
                ind.push($scope.job.industries[i].industry_id);
            }
            $scope.job.industries = ind;
            var des=[];
            for (var i in $scope.job.designations) {
                des.push($scope.job.designations[i].designation_id);
            }
            $scope.job.designations = des;
            var tag=[];
            for (var i in $scope.job.tags) {
                tag.push($scope.job.tags[i].tag);
            }
            $scope.job.tags = tag;
        });
    };
    $scope.reset_data();
        $scope.countries=Country.query(function(countries){
      // $scope.country=countries[0];
    }); 
    var c_change=0, s_change=0, d_change=0;
    $scope.$watch('job.country_id', function (newVal, oldVal) {
        get_states(newVal);   
        c_change++;
        if(c_change>2){
            $scope.job.state_id='';
            $scope.job.district_id='';
            $scope.job.area_id='';
        }
    });
    $scope.$watch('job.state_id', function (newVal, oldVal) {
        get_districts(newVal);
        s_change++; 
        if(s_change>2){
            $scope.job.district_id='';
            $scope.job.area_id='';
        }
    });
    $scope.$watch('job.district_id',function (newVal, oldVal){
        get_areas(newVal);
        d_change++;
        if(d_change>2){   
            $scope.job.area_id='';
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
        $scope.industries=Job_industry.query({});
    $scope.$watch('job.industries', function (newVal, oldVal) {
        var industry_id = newVal.join(',');
        get_designations(industry_id);
    });
    var get_designations=function(industry_id){
        if(!industry_id){
            $scope.job.designations.length=0;
            return;
        }
        Job_designation.query({'industry_id': industry_id},function(data){
            $scope.designations = data;
            for (var i = 0; i < data.length; i++) {
                var flag = false;
                for(var j=0; j < $scope.job.designations.length; j++){
                    if(data[i].designation_id == $scope.job.designations[j]){
                        flag = true;
                    }
                }
                if(!flag){
                    console.log(data[i].designation_id);
                    //$scope.classified.sub_categories.push(data[i].sub_category_id);
                }
            }
        });
    };
    var tag_list=[];
    Job_tag.query({},function(data){
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
        Job.save({'Id':$scope.job.job_id},$scope.job,function(data){
            console.log(data);
            if(data.job_id>0){
                alert("Successfully updated");
            }         
        });
    }
}]);
appControllers.controller('JobCategoryCtrl',['$scope','Job_industry','Job_designation','Job_tag',function($scope,Job_industry,Job_designation,Job_tag){
    $scope.new={};
    $scope.industries=Job_industry.query();
    $scope.edit={industry_id:"",industry:""};
    $scope.get_industries=function(){
        $scope.industries=Job_industry.query();
    };
    $scope.add_industry=function(industry){
        if(industry){
            var data={'industry':industry};
            Job_industry.save(data,function(data){
                $scope.new.industry='';
                $scope.industries.push(data);
            });
        }
    };
    $scope.update_industry = function(industry_id,industry){
        if(industry_id){
            var data = Job_industry.get({},{'Id':industry_id});
            data.industry=industry;
            data.$save(function(data){
                $scope.get_industries();
            });
        }
    };
    $scope.delete_industry=function(industry_id){
        if(confirm("Delete industry no."+industry_id+"?")){
            var data={'industry_id':industry_id};
            Job_industry.delete({},{'Id':industry_id},function(){
                $scope.get_industries();
            });
        }
    }
    $scope.reset_edit=function(){
        $scope.edit={'industry_id':'','industry':''};
    }
    $scope.$watch('edit.industry_id', function (newVal, oldVal) {
        $scope.designations=[];
        if(newVal){
            $scope.get_designations(newVal);
        }
    });
    //Sub industries
    $scope.new_sub={};
    $scope.designations=[];
    $scope.edit_sub={'sub_category_id':'','sub_category':''};
    $scope.get_designations=function(industry_id){
        $scope.designations=Job_designation.query({'industry_id':industry_id});
    }
    $scope.add_designation=function(designation,industry_id){
        if(designation && industry_id){
            var data={'designation':designation,'industry_id':industry_id};
            Job_designation.save(data,function(data){
                $scope.designations.push(data);
                $scope.new_sub.designation='';
            })
            
        }
    }
    $scope.update_designation = function(designation_id,designation){
        if(designation_id){
            var data = Job_designation.get({},{'Id':designation_id});
            data.designation=designation;
            data.$save(function(data){
                $scope.get_designations($scope.edit.industry_id);
                $scope.reset_edit_sub();
            });
        }
    }
    $scope.delete_designation=function(designation_id){
        if(confirm("Delete category no."+designation_id+"?")){
            var data={'designation_id':designation_id};
            Job_designation.delete({},{'Id':designation_id},function(){
                $scope.get_designations($scope.edit.industry_id);
                $scope.reset_edit_sub();
            });
        }
    };
    $scope.reset_edit_sub=function(){
        $scope.edit_sub={designation_id:'',designation:''};
    };

   //Tags
   $scope.new_tag={};
    $scope.tags=Job_tag.query();
    $scope.tag_edit={tag_id:"",tag:""};
    $scope.get_tags=function(){
        $scope.tags=Job_tag.query();
    };
    $scope.add_tag=function(tag){
        if(tag){
            var data={'tag':tag};
            Job_tag.save(data,function(data){
                $scope.new_tag.tag='';
                $scope.tags.push(data);
            });
        }
    };
    $scope.update_tag = function(tag_id,tag){
        if(tag_id){
            var data = Job_tag.get({},{'Id':tag_id});
            data.tag=tag;
            data.$save(function(data){
                $scope.get_tags();
            });
        }
    };
    $scope.delete_tag=function(tag_id){
        if(confirm("Delete tag no."+tag_id+"?")){
            var data={'tag_id':tag_id};
            Job_tag.delete({},{'Id':tag_id},function(){
                $scope.get_tags();
            });
        }
    }
    $scope.reset_tag_edit=function(){
        $scope.tag_edit={'tag_id':'','tag':''};
    }
}]);