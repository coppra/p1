var appControllers = angular.module('appControllers', ['ngTable']);
appControllers.controller('LocationCtrl',['$scope','$http',function($scope,$http){
    $scope.countries= [];
    $scope.states=[];
    angular.element(".edit_group").hide();
    $http.get('../api/locations/country').success(function(data) {
        $scope.countries= data.countries;
    });
    //get_countries();
    $scope.get_countries = function(){
        $http.get('../api/locations/country').success(function(data) {
            $scope.countries= data.countries;
        });
    }
    $scope.get_states = function(country_id,country){
        $scope.country_id = country_id;
        $scope.country = country
        $scope.states = [];
        $http.get('../api/locations/state/?country_id='+country_id).success(function(data) {
            $scope.states= data.states;
        });
    }
    $scope.get_districts = function(state_id,state){
        $scope.state_id = state_id;
        $scope.state = state
        $scope.districts = [];
        $http.get('../api/locations/district/?state_id='+state_id).success(function(data) {
            $scope.districts= data.districts;
        });
    }
    $scope.get_areas = function(district_id,district){
        $scope.district_id = district_id;
        $scope.district = district
        $scope.areas = [];
        $http.get('../api/locations/area/?district_id='+district_id).success(function(data) {
            $scope.areas= data.areas;
        });
    }
    $scope.add_country=function(new_country){
        if(new_country){
            var data={'country':new_country};
            $http.post('../api/locations/country/',data).success(function(){
                $scope.new_country='';
                $scope.get_countries();
            });
        }
    }
    $scope.edit_country = function(country_id,country){
        $scope.cancel_edit();
        $scope.edited_country=country;
        angular.element("tr#"+country_id+" .edit_group").show();
        angular.element("tr#"+country_id+" input").focus();
        angular.element("tr#"+country_id+" .no_edit_group").hide();
    }
    $scope.update_country = function(country_id,country){
        if(country){
            var data={'country':country};
            $http.post('../api/locations/country/'+country_id,data).success(function(){
                $scope.get_countries();
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
            $http.delete('../api/locations/country/'+country_id).success(function(){ 
                $scope.get_countries();
            });
        }
    }
    $scope.add_state = function(new_state){
        if(new_state){
            var data={'state':new_state,'country_id':$scope.country_id};
            $http.post('../api/locations/state/',data).success(function(){
                $scope.new_state='';
                $scope.get_states($scope.country_id);
            });
        }
    }
    $scope.edit_state = function(state_id,state){
        $scope.cancel_edit();
        $scope.edited_state=state;
        angular.element("tr#"+state_id+" .edit_group").show();
        angular.element("tr#"+state_id+" input").focus();
        angular.element("tr#"+state_id+" .no_edit_group").hide();
    }
    $scope.update_state = function(state_id,state){
        if(state){
            var data={'state':state};
            $http.post('../api/locations/state/'+state_id,data).success(function(){
                $scope.get_states($scope.country_id);
            });
        }
    }
    $scope.delete_state = function(state_id){
        if(confirm("Delete?")){
            $scope.states= [];
            $http.delete('../api/locations/state/'+state_id).success(function(){ 
                $scope.get_states($scope.country_id);
            });
        }
    }
    $scope.add_district = function(new_district){
        if(new_district){
            var data={'district':new_district,'state_id':$scope.state_id};
            $http.post('../api/locations/district/',data).success(function(){
                $scope.new_district='';
                $scope.get_districts($scope.state_id);
            });
        }
    }
    $scope.edit_district = function(district_id,district){
        $scope.cancel_edit();
        $scope.edited_district=district;
        angular.element("tr#"+district_id+" .edit_group").show();
        angular.element("tr#"+district_id+" input").focus();
        angular.element("tr#"+district_id+" .no_edit_group").hide();
    }
    $scope.update_district = function(district_id,district){
        if(district){
            var data={'district':district};
            $http.post('../api/locations/district/'+district_id,data).success(function(){
                $scope.get_districts($scope.state_id);
            });
        }
    }
    $scope.delete_district = function(district_id){
        if(confirm("Delete?")){
            $scope.districts= [];
            $http.delete('../api/locations/district/'+district_id).success(function(){ 
                $scope.get_districts($scope.state_id);
            });
        }
    }
    $scope.add_area = function(new_area){
        if(new_area){
            var data={'area':new_area,'district_id':$scope.district_id};
            $http.post('../api/locations/area/',data).success(function(){
                $scope.new_area='';
                $scope.get_areas($scope.district_id);
            });
        }
    }
    $scope.edit_area = function(area_id,area){
        $scope.cancel_edit();
        $scope.edited_area=area;
        angular.element("tr#"+area_id+" .edit_group").show();
        angular.element("tr#"+area_id+" input").focus();
        angular.element("tr#"+area_id+" .no_edit_group").hide();
    }
    $scope.update_area = function(area_id,area){
        if(area){
            var data={'area':area};
            $http.post('../api/locations/area/'+area_id,data).success(function(){
                $scope.get_areas($scope.district_id);
            });
        }
    }
    $scope.delete_area = function(area_id){
        if(confirm("Delete?")){
            $scope.areas= [];
            $http.delete('../api/locations/area/'+area_id).success(function(){ 
                $scope.get_areas($scope.district_id);
            });
        }
    }
}])
appControllers.filter('capitalize', function() {
 return function(input, scope) {
 if (input!=null)
 //input = input.toLowerCase();
 return input.substring(0,1).toUpperCase()+input.substring(1);
 }
});