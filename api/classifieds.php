<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/classifieds/', 'getClassifieds');
$app->get('/classifieds/:id','getClassified');
$app->post('/classifieds/','addClassified');
$app->post('/classifieds/:id','updateClassified');
$app->delete('/classifieds/:id','deleteClassified');

$app->run();

function getClassifieds(){
	$page=1;
	$limit=0;
	$no_of_pages = 0;
	$no_of_rows = 0;
	$conditions_params=array();
	$conditions_params_2=array('category_id','sub_category_id','feature_id','spec_id');
	$conditions = array();
	$query_condition='';
	$app = Slim::getInstance();
	if($app->request()->params('page'))
		$page=intval($app->request()->params('page'));
	if($app->request()->params('limit'))
		$limit=intval($app->request()->params('limit'));
	foreach($conditions_params as $param){
		if($app->request()->params($param)){
			$searches = explode(",", $app->request()->params($param));
			if(sizeof($searches) > 0){
				$search_query = "(";
				foreach($searches as $val){
					$search_query = $search_query." l.$param = '$val' OR";
				}
				$search_query = substr($search_query, 0, -2);
				$search_query = $search_query.') ';
			}	
			array_push($conditions,  $search_query);
		}
	}
	foreach($conditions_params_2 as $param){
		if($app->request()->params($param)){
			$searches = explode(",", $app->request()->params($param));
			if(sizeof($searches) > 0){
				$search_query = "(";
				foreach($searches as $val){
					$search_query = $search_query." $param = '$val' OR";
				}
				$search_query = substr($search_query, 0, -2);
				$search_query = $search_query.') ';
			}	
			array_push($conditions,  $search_query);
		}
	}
	if(sizeof($conditions) > 0){
		$query_condition = " WHERE";
		foreach($conditions as $condition){
			$query_condition = $query_condition." ".$condition." AND";
		}
		$query_condition = substr($query_condition, 0, -4);
	}
	$offset = ($page - 1) * $limit;
	$sql_1 = "SELECT COUNT(DISTINCT classified_id) FROM classifieds l
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				LEFT JOIN classifieds_x_categories USING(classified_id)
				LEFT JOIN classifieds_x_sub_categories USING(classified_id) 
				LEFT JOIN classifieds_x_features USING(classified_id)"
				.$query_condition;
    // change * to some important fields -- too much data
	$sql_2 = "SELECT DISTINCT l.*,c.country,s.state,d.district,a.area FROM classifieds l 
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				LEFT JOIN classifieds_x_categories USING(classified_id)
				LEFT JOIN classifieds_x_sub_categories USING(classified_id) 
				LEFT JOIN classifieds_x_features USING(classified_id)"
				.$query_condition
				." LIMIT :offset , :limit";
	try {
		$db = getConnection();
		$stmt = $db->query($sql_1);  
		$no_of_rows = $stmt->fetchColumn();
		if($limit == 0){
		 	$limit=intval($no_of_rows);
		}
		$no_of_pages=0;
		if($limit!=0)
			$no_of_pages = ceil($no_of_rows / $limit);
		$stmt = $db->prepare($sql_2);
        $stmt->bindParam("offset",$offset, PDO::PARAM_INT);
       	$stmt->bindParam("limit",$limit, PDO::PARAM_INT);
        $stmt->execute();
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		// $data =  (array) $data;
		foreach($data as $key => $value){
			$data[$key] = get_object_vars($data[$key]);
			$categories=getCategories($value->classified_id);
			$sub_categories=getSubCategories($value->classified_id);
			$features=getFeatures($value->classified_id);
			$specs=getSpecs($value->classified_id);
			$data[$key]["categories"]=$categories;
			$data[$key]["sub_categories"]=$sub_categories;
			$data[$key]["features"]=$features;
			$data[$key]["specs"]=$specs;
		}
			// print_r($data);
		$db = null;
		echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"results": ' . json_encode($data) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getClassified($id){
	$sql="SELECT l.*,c.country,s.state,d.district,a.area FROM classifieds l  
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				LEFT JOIN classifieds_x_categories USING(classified_id)
				LEFT JOIN classifieds_x_sub_categories USING(classified_id) 
				LEFT JOIN classifieds_x_features USING(classified_id) 
				WHERE l.classified_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        if(!$data){
        	return;
        }
        $data = get_object_vars($data);
		$categories=getCategories($data['classified_id']);
		$sub_categories=getSubCategories($data['classified_id']);
		$features=getFeatures($data['classified_id']);
		$specs=getSpecs($data['classified_id']);
		$data["categories"]=$categories;
		$data["sub_categories"]=$sub_categories;
		$data["features"]=$features;
		$data["specs"]=$specs;
        $db = null;
        echo json_encode($data);
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addClassified(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO classifieds (heading,description,price,contact_person,phone,email,posted_on,ends_on,address_line_1,address_line_2,area_id,district_id,state_id,country_id) VALUES(:heading,:description,:price,:contact_person,:phone,:email,:posted_on,:ends_on,:address_line_1,:address_line_2,:area_id,:district_id,:state_id,:country_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("heading", $data->heading);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("price", $data->price);
        $stmt->bindParam("contact_person", $data->contact_person);
        $stmt->bindParam("phone", $data->phone);
        $stmt->bindParam("email", $data->email);
        $stmt->bindParam("posted_on", $data->posted_on);
        $stmt->bindParam("ends_on", $data->ends_on);
        $stmt->bindParam("address_line_1", $data->address_line_1);
        $stmt->bindParam("address_line_2", $data->address_line_2);
        $stmt->bindParam("area_id", $data->area_id);
        $stmt->bindParam("district_id", $data->district_id);
        $stmt->bindParam("state_id", $data->state_id);
        $stmt->bindParam("country_id", $data->country_id);
    	$stmt->execute();
        $data->classified_id = $db->lastInsertId();
        $db = null;
        if(sizeof($data->categories))
        	addCategories($data->classified_id,$data->categories);
        if(sizeof($data->sub_categories))
        	addSubCategories($data->classified_id,$data->sub_categories);
        if(sizeof($data->features))
        	addFeatures($data->classified_id,$data->features);
        if(sizeof($data->specs))
        	addSpecs($data->classified_id,$data->specs);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

}

function updateClassified($classified_id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE classifieds SET heading=:heading, description=:description, price=:price, contact_person=:contact_person, phone=:phone, email=:email,posted_on=:posted_on,ends_on=:ends_on,address_line_1=:address_line_1,address_line_2=:address_line_2,area_id=:area_id,district_id=:district_id,state_id=:state_id,country_id=:country_id WHERE classified_id=:classified_id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("heading", $data->heading);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("price", $data->price);
        $stmt->bindParam("contact_person", $data->contact_person);
        $stmt->bindParam("phone", $data->phone);
        $stmt->bindParam("email", $data->email);
        $stmt->bindParam("posted_on", $data->posted_on);
        $stmt->bindParam("ends_on", $data->ends_on);
        $stmt->bindParam("address_line_1", $data->address_line_1);
        $stmt->bindParam("address_line_2", $data->address_line_2);
        $stmt->bindParam("area_id", $data->area_id);
        $stmt->bindParam("district_id", $data->district_id);
        $stmt->bindParam("state_id", $data->state_id);
        $stmt->bindParam("country_id", $data->country_id);
        $stmt->bindParam("classified_id", $classified_id);
    	$stmt->execute();
        $db = null;
        deleteCategories($classified_id);
        deleteSubCategories($classified_id);
        deleteFeatures($classified_id);
        deleteSpecs($classified_id);
        if(sizeof($data->categories))
        	addCategories($classified_id,$data->categories);
        if(sizeof($data->sub_categories))
        	addSubCategories($classified_id,$data->sub_categories);
        if(sizeof($data->features))
        	addFeatures($classified_id,$data->features);
        if(sizeof($data->specs))
        	addSpecs($classified_id,$data->specs);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteClassified($classified_id){
	$sql="DELETE FROM classifieds WHERE classified_id=:classified_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("classified_id", $classified_id);
        $stmt->execute();
        $db = null;
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteCategories($classified_id){
	$sql="DELETE FROM classifieds_x_categories WHERE classified_id=:classified_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("classified_id", $classified_id);
        $stmt->execute();
        $db = null;
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteSubCategories($classified_id){
	$sql="DELETE FROM classifieds_x_sub_categories WHERE classified_id=:classified_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("classified_id", $classified_id);
        $stmt->execute();
        $db = null;
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteFeatures($classified_id){
	$sql="DELETE FROM classifieds_x_features WHERE classified_id=:classified_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("classified_id", $classified_id);
        $stmt->execute();
        $db = null;
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteSpecs($classified_id){
	$sql="DELETE FROM classifieds_x_specs WHERE classified_id=:classified_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("classified_id", $classified_id);
        $stmt->execute();
        $db = null;
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addCategories($classified_id,$category_ids){
	$value='';
	foreach($category_ids as $category_id){
    	$value = $value."($classified_id,$category_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO classifieds_x_categories (classified_id,category_id) VALUES".$value;
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
    	$stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addSubCategories($classified_id,$sub_category_ids){
	$value='';
	foreach($sub_category_ids as $sub_category_id){
    	$value = $value."($classified_id,$sub_category_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO classifieds_x_sub_categories (classified_id,sub_category_id) VALUES".$value;
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
    	$stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addFeatures($classified_id,$feature_ids){
	$value='';
	foreach($feature_ids as $feature_id){
    	$value = $value."($classified_id,$feature_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO classifieds_x_features (classified_id,feature_id) VALUES".$value;
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
    	$stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addSpecs($classified_id,$specs){
	$value='';
	foreach ($specs as $spec) {
		if(array_key_exists('value', $spec))
			$value = $value."($classified_id,$spec->spec_id,'$spec->value'),";
	}
	if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql = "INSERT INTO classifieds_x_specs (classified_id,spec_id,value) VALUES".$value;
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
    	$stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getCategories($classified_id){
	$sql="SELECT cla_categories.category_id,cla_categories.category FROM cla_categories INNER JOIN classifieds_x_categories USING(category_id) WHERE classifieds_x_categories.classified_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $classified_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSubCategories($classified_id){
	$sql="SELECT cla_sub_categories.sub_category_id,cla_sub_categories.sub_category FROM cla_sub_categories INNER JOIN classifieds_x_sub_categories USING(sub_category_id) WHERE classifieds_x_sub_categories.classified_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $classified_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getFeatures($classified_id){
	$sql="SELECT cla_features.feature_id,cla_features.feature FROM cla_features INNER JOIN classifieds_x_features USING(feature_id) WHERE classifieds_x_features.classified_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $classified_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSpecs($classified_id){
	$sql="SELECT cla_specs.spec_id,cla_specs.spec,cla_specs.category_id,classifieds_x_specs.value FROM cla_specs INNER JOIN classifieds_x_specs USING(spec_id) WHERE classifieds_x_specs.classified_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $classified_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;
        echo json_encode($data);
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}