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