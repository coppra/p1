<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/offers/', 'getOffers');
$app->get('/offers/:id','getOffer');
$app->post('/offers/','addOffer');
$app->post('/offers/:id','updateOffer');
$app->delete('/offers/:id','deleteOffer');

$app->get('/offers/tag/', 'getTags');
$app->get('/offers/tag/:id','getTag');
$app->post('/offers/tag/','addTag');
$app->post('/offers/tag/:id','updateTag');
$app->delete('/offers/tag/:id','deleteTag');

$app->run();

function getOffers(){
    $page=1;
    $limit=0;
    $no_of_pages = 0;
    $no_of_rows = 0;
    $conditions_params=array();
    $conditions_params_2=array();
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
    $query_condition_1 = 'WHERE l.business_id > 0';
    $query_condition_2 = 'WHERE l.business_id = 0';
    if($query_condition){
    	$query_condition_1 = 'AND l.business_id > 0';
   		$query_condition_2 = 'AND l.business_id = 0';
    }
    $offset = ($page - 1) * $limit;
    //Test for business_id to localsearch or offer_business
    $sql_1 = "SELECT COUNT(DISTINCT l.offer_id) FROM offers l
    			LEFT JOIN localsearch ll ON ll.business_id = l.business_id
                LEFT JOIN countries c ON c.country_id=ll.country_id
                LEFT JOIN states s ON s.state_id=ll.state_id
                LEFT JOIN districts d ON d.district_id=ll.district_id
                LEFT JOIN areas a ON a.area_id=ll.area_id ".
                $query_condition.$query_condition_1.
                " UNION
                 SELECT COUNT(DISTINCT l.offer_id) FROM offers l 
    			LEFT JOIN offer_businesses o ON o.offer_id = l.offer_id
                LEFT JOIN countries cc ON cc.country_id=o.country_id
                LEFT JOIN states ss ON ss.state_id=o.state_id
                LEFT JOIN districts dd ON dd.district_id=o.district_id
                LEFT JOIN areas aa ON aa.area_id=o.area_id ".
                $query_condition.$query_condition_2;
    $sql_2 = "SELECT DISTINCT l.*,l.business_id,ll.name,ll.caption,ll.address_line_1,ll.address_line_2,c.country_id,s.state_id,d.district_id,a.area_id,c.country,s.state,d.district,a.area FROM offers l 
                LEFT JOIN localsearch ll ON ll.business_id = l.business_id 
                LEFT JOIN countries c ON c.country_id=ll.country_id
                LEFT JOIN states s ON s.state_id=ll.state_id
                LEFT JOIN districts d ON d.district_id=ll.district_id
                LEFT JOIN areas a ON a.area_id=ll.area_id ".
                $query_condition.$query_condition_1." UNION
				 SELECT DISTINCT l.*,l.business_id,o.name,o.caption,o.address_line_1,o.address_line_2,c.country_id,s.state_id,d.district_id,a.area_id,c.country,s.state,d.district,a.area FROM offers l 
    			LEFT JOIN offer_businesses o ON o.offer_id = l.offer_id
                LEFT JOIN countries c ON c.country_id=o.country_id
                LEFT JOIN states s ON s.state_id=o.state_id
                LEFT JOIN districts d ON d.district_id=o.district_id
                LEFT JOIN areas a ON a.area_id=o.area_id ".
                $query_condition.$query_condition_2;
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
        foreach($data as $key => $value){
            $data[$key] = get_object_vars($data[$key]);
            $data[$key]["categories"]=getCategories($value->offer_id);
            $data[$key]["sub_categories"]=getSubCategories($value->offer_id);
            $data[$key]["tags"]=getOfferTags($value->offer_id);
        }
        $db = null;
        echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"results": ' . json_encode($data) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}

function getOffer($id){
	$sql="SELECT DISTINCT l.*,l.business_id,ll.name,ll.caption,ll.address_line_1,ll.address_line_2,c.country_id,s.state_id,d.district_id,a.area_id,c.country,s.state,d.district,a.area FROM offers l 
                LEFT JOIN localsearch ll ON ll.business_id = l.business_id 
                LEFT JOIN countries c ON c.country_id=ll.country_id
                LEFT JOIN states s ON s.state_id=ll.state_id
                LEFT JOIN districts d ON d.district_id=ll.district_id
                LEFT JOIN areas a ON a.area_id=ll.area_id WHERE l.business_id>0 AND l.offer_id=:id"
                ." UNION
				SELECT DISTINCT l.*,l.business_id,o.name,o.caption,o.address_line_1,o.address_line_2,c.country_id,s.state_id,d.district_id,a.area_id,c.country,s.state,d.district,a.area FROM offers l 
    			LEFT JOIN offer_businesses o ON o.offer_id = l.offer_id
                LEFT JOIN countries c ON c.country_id=o.country_id
                LEFT JOIN states s ON s.state_id=o.state_id
                LEFT JOIN districts d ON d.district_id=o.district_id
                LEFT JOIN areas a ON a.area_id=o.area_id WHERE l.business_id=0 AND l.offer_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        $db = null;
        $data = get_object_vars($data);
        $data["categories"]=getCategories($id);
        $data["sub_categories"]=getSubCategories($id);
        $data["tags"]=getOfferTags($id);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addOffer(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO offers (offer_title,value,description,business_id,start_date,end_date,user_id) VALUES(:offer_title,:value,:description,:business_id,:start_date,:end_date,:user_id)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_title", $data->offer_title);
        $stmt->bindParam("value", $data->value);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("start_date", $data->start_date);
        $stmt->bindParam("end_date", $data->end_date);
        $stmt->bindParam("user_id", $data->user_id);
        $stmt->execute();
        $data->offer_id = $db->lastInsertId();
        $db = null;
        if(!$data->business_id && $data->offer_id){
        	//Store business details in offer_businesses
        	$sql2="INSERT INTO offer_businesses(offer_id,name,caption,address_line_1,address_line_2,area_id,district_id,state_id,country_id)VALUES(:offer_id,:name,:caption,:address_line_1,:address_line_2,:area_id,:district_id,:state_id,:country_id)";
        	try{
        		$db = getConnection();
        		$stmt = $db->prepare($sql2);
        		$stmt->bindparam("offer_id",$data->offer_id);
        		$stmt->bindparam("name",$data->name);
        		$stmt->bindparam("caption",$data->caption);
        		$stmt->bindParam("address_line_1", $data->address_line_1);
        		$stmt->bindParam("address_line_2", $data->address_line_2);
        		$stmt->bindParam("area_id", $data->area_id);
        		$stmt->bindParam("district_id", $data->district_id);
        		$stmt->bindParam("state_id", $data->state_id);
        		$stmt->bindParam("country_id", $data->country_id);
        		$stmt->execute();
        		$db = null;
        	}catch(PDOException $e) {
    		    echo '{"error":{"text":'. $e->getMessage() .'}}';
    		}
        }
        if(sizeof($data->categories))
            addCategories($data->offer_id,$data->categories);
        if(sizeof($data->sub_categories))
            addSubCategories($data->offer_id,$data->sub_categories);
        if(sizeof($data->tags))
            addTags($data->offer_id,$data->tags);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateOffer($id){
	$request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE offers SET offer_title=:offer_title,value=:value,description=:description,business_id=:business_id,start_date=:start_date,end_date=:end_date,user_id=:user_id WHERE offer_id=:offer_id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_title", $data->offer_title);
        $stmt->bindParam("value", $data->value);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("start_date", $data->start_date);
        $stmt->bindParam("end_date", $data->end_date);
        $stmt->bindParam("user_id", $data->user_id);
        $stmt->bindParam("offer_id", $id);
        $stmt->execute();
        $db = null;
        if(!$data->business_id && $data->offer_id){
        	//Store business details in offer_businesses
        	$sql2="UPDATE offer_businesses SET name=:name,caption=:caption,address_line_1=:address_line_1, address_line_2=:address_line_2, area_id=:area_id, district_id=:district_id,state_id=:state_id,country_id=:country_id WHERE offer_id=:offer_id";
        	try{
        		$db = getConnection();
        		$stmt = $db->prepare($sql2);
        		$stmt->bindparam("offer_id",$id);
        		$stmt->bindparam("name",$data->name);
        		$stmt->bindparam("caption",$data->caption);
        		$stmt->bindParam("address_line_1", $data->address_line_1);
        		$stmt->bindParam("address_line_2", $data->address_line_2);
        		$stmt->bindParam("area_id", $data->area_id);
        		$stmt->bindParam("district_id", $data->district_id);
        		$stmt->bindParam("state_id", $data->state_id);
        		$stmt->bindParam("country_id", $data->country_id);
        		$stmt->execute();
        		$db = null;
        	}catch(PDOException $e) {
    		    echo '{"error":{"text":'. $e->getMessage() .'}}';
    		}
        }
        deleteCategories($id);
        deleteSubCategories($id);
        deletetags($id);
        if(sizeof($data->categories))
            addCategories($id,$data->categories);
        if(sizeof($data->sub_categories))
            addSubCategories($id,$data->sub_categories);
        if(sizeof($data->tags))
            addTags($id,$data->tags);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteOffer($id){
    $sql="DELETE FROM offers WHERE offer_id=:offer_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_id", $id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addCategories($offer_id,$category_ids){
    $value='';
    foreach($category_ids as $category_id){
        $value = $value."($offer_id,$category_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO offers_x_categories (offer_id,category_id) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addSubCategories($offer_id,$sub_category_ids){
    $value='';
    foreach($sub_category_ids as $sub_category_id){
        $value = $value."($offer_id,$sub_category_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO offers_x_sub_categories (offer_id,sub_category_id) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addTags($offer_id,$tags){
    $value='';
    foreach($tags as $tag){
        //Get tag_id,  if tag not present add tag and get id
        $tag_id=0;
        $sql = "SELECT * FROM offer_tags WHERE tag = :tag LIMIT 1";
        try{
            $db = getConnection();
            $stmt = $db->prepare($sql);
            $stmt->bindParam("tag", $tag);
            $stmt->execute();
            $data = $stmt->fetchObject();
            $db = null;
            if($data){
                $data = get_object_vars($data);
                $tag_id = $data['tag_id'];
            }
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
        if(!$tag_id){
            $sql = "INSERT INTO offer_tags(tag) VALUES(:tag)";
            try {
                $db = getConnection();
                $stmt = $db->prepare($sql);
                $stmt->bindParam("tag", $tag);
                $stmt->execute();
                $tag_id = $db->lastInsertId();
                $db = null;
                //echo json_encode($data);
            } catch(PDOException $e) {
                  echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
        }
        $value = $value."($offer_id,$tag_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO offers_x_tags (offer_id,tag_id) VALUES".$value;
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
function deleteCategories($offer_id){
    $sql="DELETE FROM offers_x_categories WHERE offer_id=:offer_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_id", $offer_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteSubCategories($offer_id){
    $sql="DELETE FROM offers_x_sub_categories WHERE offer_id=:offer_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_id", $offer_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteTags($offer_id){
    $sql="DELETE FROM offers_x_tags WHERE offer_id=:offer_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("offer_id", $offer_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getCategories($offer_id){
    $sql="SELECT loc_categories.category_id,loc_categories.category FROM loc_categories INNER JOIN offers_x_categories USING(category_id) WHERE offers_x_categories.offer_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $offer_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSubCategories($offer_id){
    $sql="SELECT loc_sub_categories.sub_category_id,loc_sub_categories.sub_category FROM loc_sub_categories INNER JOIN offers_x_sub_categories USING(sub_category_id) WHERE offers_x_sub_categories.offer_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $offer_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getOfferTags($offer_id){
    $sql="SELECT offer_tags.tag_id,offer_tags.tag FROM offer_tags INNER JOIN offers_x_tags USING(tag_id) WHERE offers_x_tags.offer_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $offer_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
//Tags

function getTags(){
    $sql = "SELECT * FROM offer_tags";
    try{
        $db = getConnection();
        $stmt= $db->query($sql);
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getTag($id){
    $sql = "SELECT * FROM offer_tags WHERE tag_id = :id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addTag(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO offer_tags (tag) VALUES(:tag)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("tag", $data->tag);
        $stmt->execute();
        $data->tag_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateTag($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE offer_tags SET tag=:tag WHERE tag_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("tag", $data->tag);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data->tag_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteTag($id){
    $sql="DELETE FROM offer_tags WHERE tag_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e){
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}