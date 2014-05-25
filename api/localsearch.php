<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/localsearch/','getLocalsearches');
$app->get('/localsearch/:id','getLocalsearch');
$app->post('/localsearch/','addLocalsearch');
$app->post('/localsearch/:id','updateLocalsearch');
$app->delete('/localsearch/:id','deleteLocalsearch');

$app->post('/localsearch/rating/','updateRating');

$app->get('/localsearch/search/:id','searchLocalsearch');


$app->run();

function getLocalsearches(){
	$page=1;
	$limit=0;
	$no_of_pages = 0;
	$no_of_rows = 0;
	$conditions_params=['name','user_id','country_id','state_id','district_id','area_id','status'];
	$conditions_params_2=['category_id','sub_category_id','feature_id','product_id'];
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
	$sql_1 = "SELECT COUNT(DISTINCT business_id) FROM localsearch l
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				INNER JOIN localsearch_x_categories USING(business_id)
				INNER JOIN localsearch_x_sub_categories USING(business_id) 
				INNER JOIN localsearch_x_features USING(business_id) 
				INNER JOIN localsearch_x_products USING(business_id) "
				.$query_condition;
	// $sql_2 = "SELECT * FROM localsearch LEFT JOIN countries USING(country_id) LEFT JOIN states USING(state_id) LEFT JOIN districts USING(district_id) LEFT JOIN areas USING(area_id)".$query_condition." LIMIT :offset , :limit";
	$sql_2 = "SELECT DISTINCT l.*,c.country,s.state,d.district,a.area FROM localsearch l 
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				INNER JOIN localsearch_x_categories USING(business_id)
				INNER JOIN localsearch_x_sub_categories USING(business_id) 
				INNER JOIN localsearch_x_features USING(business_id) 
				INNER JOIN localsearch_x_products USING(business_id) "
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
			$categories=getCategories($value->business_id);
			$sub_categories=getSubCategories($value->business_id);
			$features=getFeatures($value->business_id);
			$products=getProducts($value->business_id);
			$data[$key]["categories"]=$categories;
			$data[$key]["sub_categories"]=$sub_categories;
			$data[$key]["features"]=$features;
			$data[$key]["products"]=$products;
		}
			// print_r($data);
		$db = null;
		echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"results": ' . json_encode($data) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
function getLocalsearch($id){
	$sql="SELECT * FROM localsearch WHERE business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        $data = get_object_vars($data);
		$categories=getCategories($data['business_id']);
		$sub_categories=getSubCategories($data['business_id']);
		$data["categories"]=$categories;
		$data["sub_categories"]=$sub_categories;
        $db = null;
        echo json_encode($data);
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addLocalsearch(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO localsearch (name,unique_name,caption,business_type,user_id,address_line_1,address_line_2,area_id,district_id,state_id,country_id,lat,lng,phone1,phone2,email,website,working_hours,established,description,status,priority) VALUES(:name,:unique_name,:caption,:business_type,:user_id,:address_line_1,:address_line_2,:area_id,:district_id,:state_id,:country_id,:lat,:lng,:phone1,:phone2,:email,:website,:working_hours,:established,:description,:status,:priority)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $data->name);
        $stmt->bindParam("unique_name", $data->unique_name);
        $stmt->bindParam("caption", $data->caption);
        $stmt->bindParam("business_type", $data->business_type);
        $stmt->bindParam("user_id", $data->user_id);
        $stmt->bindParam("address_line_1", $data->address_line_1);
        $stmt->bindParam("address_line_2", $data->address_line_2);
        $stmt->bindParam("area_id", $data->area_id);
        $stmt->bindParam("district_id", $data->district_id);
        $stmt->bindParam("state_id", $data->state_id);
        $stmt->bindParam("country_id", $data->country_id);
        $stmt->bindParam("lat", $data->lat);
        $stmt->bindParam("lng", $data->lng);
        $stmt->bindParam("phone1", $data->phone1);
        $stmt->bindParam("phone2", $data->phone2);
        $stmt->bindParam("email", $data->email);
        $stmt->bindParam("website", $data->website);
        $stmt->bindParam("working_hours", $data->working_hours);
        $stmt->bindParam("established", $data->established);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("status", $data->status);
        $stmt->bindParam("priority", $data->priority);
    	$stmt->execute();
        $data->business_id = $db->lastInsertId();
        $db = null;
        if(sizeof($data->categories))
        	addCategories($data->business_id,$data->categories);
        if(sizeof($data->sub_categories))
        	addSubCategories($data->business_id,$data->sub_categories);
        if(sizeof($data->features))
        	addFeatures($data->business_id,$data->features);
        if(sizeof($data->products))
        	addProducts($data->business_id,$data->products);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addCategories($business_id,$category_ids){
	$value='';
	foreach($category_ids as $category_id){
    	$value = $value."($business_id,$category_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO localsearch_x_categories (business_id,category_id) VALUES".$value;
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
function addSubCategories($business_id,$sub_category_ids){
	$value='';
	foreach($sub_category_ids as $sub_category_id){
    	$value = $value."($business_id,$sub_category_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO localsearch_x_sub_categories (business_id,sub_category_id) VALUES".$value;
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
function addFeatures($business_id,$feature_ids){
	$value='';
	foreach($feature_ids as $feature_id){
    	$value = $value."($business_id,$feature_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO localsearch_x_features (business_id,feature_id) VALUES".$value;
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
function addProducts($business_id,$product_ids){
	$value='';
	foreach($product_ids as $product_id){
    	$value = $value."($business_id,$product_id),";
    }
    if($value=='')
    	return;
    $value = substr($value, 0, -1);
	$sql="INSERT INTO localsearch_x_products (business_id,product_id) VALUES".$value;
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
function getCategories($business_id){
	$sql="SELECT loc_categories.category_id,loc_categories.category FROM loc_categories INNER JOIN localsearch_x_categories USING(category_id) WHERE localsearch_x_categories.business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $business_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSubCategories($business_id){
	$sql="SELECT loc_sub_categories.sub_category_id,loc_sub_categories.sub_category FROM loc_sub_categories INNER JOIN localsearch_x_sub_categories USING(sub_category_id) WHERE localsearch_x_sub_categories.business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $business_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getFeatures($business_id){
	$sql="SELECT loc_features.feature_id,loc_features.feature FROM loc_features INNER JOIN localsearch_x_features USING(feature_id) WHERE localsearch_x_features.business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $business_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getProducts($business_id){
	$sql="SELECT loc_products.product_id,loc_products.product FROM loc_products INNER JOIN localsearch_x_products USING(product_id) WHERE localsearch_x_products.business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $business_id);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateRating(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql="SELECT rating,no_of_ratings FROM localsearch WHERE business_id=:id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $data->business_id);
        $stmt->execute();
        $result = $stmt->fetchObject();
        if(!$result){
        	 echo json_encode(array('error'=>"Listing not found"));
        	return;
        }
        if($data->rating > 5)
        	$data->rating =5;
        else if($data->rating < 0)
        	$data->rating =0;
        $new_rating = round((($result->rating * $result->no_of_ratings) + $data->rating)/($result->no_of_ratings + 1),1);
        $new_count = $result->no_of_ratings + 1;
        $db = null;
        $sql_2 = "UPDATE localsearch SET rating=:rating,no_of_ratings=:no_of_ratings WHERE business_id=:id";
		try {
    	    $db = getConnection();
    	    $stmt = $db->prepare($sql_2);
    	    $stmt->bindParam("rating", $new_rating);
    	    $stmt->bindParam("no_of_ratings", $new_count);
    	    $stmt->bindParam("id", $data->business_id);
    		$stmt->execute();
    	    $db = null;
    	    echo json_encode(array('rating'=>$new_rating));
    	} catch(PDOException $e) {
    	    echo '{"error":{"text":'. $e->getMessage() .'}}';
    	}
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function searchLocalsearch($string){
	$words = explode(" ", $string);
	$preposition=array(",", "'", "a", "and", "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "but", "by", "despite", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "out", "outside", "over", "past", "since", "through", "throughout", "till", "to", "toward", "under", "underneath", "until", "up", "upon", "with", "within", "without");
	foreach ($preposition as $del_val) {
		if(($key = array_search($del_val, $words)) !== false) {
    		unset($words[$key]);
		}
	}
	$string="%".$string."%";
	$results = array();
	/*$sql = "SELECT * FROM localsearch WHERE name LIKE :string OR unique_name LIKE :string OR caption LIKE :string OR website LIKE :string OR description LIKE :string ";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("string", $string);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
       	$results=array_merge($results, $data);

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }*/
    $condition='';
    $x=0;
    foreach($words as $word){
		$x++;
		if($x==1)
			$condition .="WHERE (name LIKE '%$word%' OR unique_name LIKE '%$word%' OR caption LIKE '%$word%' OR website LIKE '%$word%' OR description LIKE '%$word%' OR address_line_1 LIKE '%$word%' OR address_line_2 LIKE '%$word%' OR c.country LIKE '%$word%' OR s.state LIKE '%$word%' OR d.district LIKE '%$word%' OR a.area LIKE '%$word%')";
		else
			$condition .="AND (name LIKE '%$word%' OR unique_name LIKE '%$word%' OR caption LIKE '%$word%' OR website LIKE '%$word%' OR description LIKE '%$word%' OR address_line_1 LIKE '%$word%' OR address_line_2 LIKE '%$word%') OR c.country LIKE '%$word%' OR s.state LIKE '%$word%' OR d.district LIKE '%$word%' OR a.area LIKE '%$word%'";
	}
	$sql = "SELECT * FROM localsearch l 
				LEFT JOIN countries c ON c.country_id=l.country_id
				LEFT JOIN states s ON s.state_id=l.state_id
				LEFT JOIN districts d ON d.district_id=l.district_id
				LEFT JOIN areas a ON a.area_id=l.area_id
				 ".$condition;
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->execute();
       	$data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
       	$results=array_merge($results, $data);

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
    //echo json_encode($results);
    echo '{"no_of_results":'.sizeof($results).',"no_of_pages":'.'1'.',"results": ' . json_encode($results) . '}';
}
?>