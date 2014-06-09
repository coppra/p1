<?php 

require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();
$app->get('/admins/', 'getAdmins');
$app->get('/admins/:id','getAdmin');
$app->post('/admins/authenticate/', 'authenticate');
$app->post('/admins/logout/', 'logout');
$app->post('/admins/','addAdmin');
$app->post('/admins/:id','updateAdmin');
$app->delete('/admins/:id','deleteAdmin');

$app->post('/admins/test/','test');

$app->run();

function getAdmins(){
	$page=1;
	$limit=0;
	$no_of_pages = 0;
	$no_of_rows = 0;
	$conditions_params=array('title','email');
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
	$sql_1 = "SELECT COUNT(admin_id) FROM admins".$query_condition;
	$sql_2 = "SELECT * FROM admins 
				LEFT JOIN countries USING(country_id) 
				LEFT JOIN states USING(state_id) 
				LEFT JOIN districts USING(district_id) 
				LEFT JOIN areas USING(area_id) ".$query_condition." LIMIT :offset , :limit";
	// echo $sql_2.'<br><hr>';
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
		$admins = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"admins": ' . json_encode($admins) . '}';
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getAdmin($id){
	$sql = "SELECT * FROM admins WHERE admin_id=:id LIMIT 1";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $admin = $stmt->fetchObject();
        $db = null;
        echo json_encode($admin);

	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addAdmin(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql= "INSERT INTO admins (title, fname, lname, email, password, phone1, phone2, area_id, district_id, state_id, country_id, address_line_1, address_line_2, status) VALUES (:title,:fname,:lname,:email,SHA1(:password),:phone1,:phone2,:area_id,:district_id,:state_id,:country_id,:address_line_1,:address_line_2,:status)";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("title", $data->title);
		$stmt->bindParam("fname", $data->fname);
		$stmt->bindParam("lname", $data->lname);
		$stmt->bindParam("email", $data->email);
		$stmt->bindParam("password", $data->password);
		$stmt->bindParam("phone1", $data->phone1);
		$stmt->bindParam("phone2", $data->phone2);
		$stmt->bindParam("area_id", $data->area_id);
		$stmt->bindParam("district_id", $data->district_id);
		$stmt->bindParam("state_id", $data->state_id);
		$stmt->bindParam("country_id", $data->country_id);
		$stmt->bindParam("address_line_1", $data->address_line_1);
		$stmt->bindParam("address_line_2", $data->address_line_2);
		$stmt->bindParam("status", $data->status);
		$stmt->execute();
		$result['admin_id'] = $db->lastInsertId();
		$db = null;
        echo json_encode($result);
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
function updateAdmin($admin_id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE admins SET title=:title, fname=:fname, lname=:lname, email=:email, phone1=:phone1, phone2=:phone2, area_id=:area_id, district_id=:district_id, state_id=:state_id, country_id=:country_id, address_line_1=:address_line_1, address_line_2=:address_line_2, status=:status	WHERE admin_id=:admin_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("title", $data->title);
		$stmt->bindParam("fname", $data->fname);
		$stmt->bindParam("lname", $data->lname);
		$stmt->bindParam("email", $data->email);
		$stmt->bindParam("phone1", $data->phone1);
		$stmt->bindParam("phone2", $data->phone2);
		$stmt->bindParam("area_id", $data->area_id);
		$stmt->bindParam("district_id", $data->district_id);
		$stmt->bindParam("state_id", $data->state_id);
		$stmt->bindParam("country_id", $data->country_id);
		$stmt->bindParam("address_line_1", $data->address_line_1);
		$stmt->bindParam("address_line_2", $data->address_line_2);
		$stmt->bindParam("status", $data->status);
		$stmt->bindParam("admin_id", $admin_id);
		$stmt->execute();
		$db = null; 
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
function resetPassword($admin_id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE admins SET password=:password WHERE admin_id=:admin_id";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
		$stmt->bindParam("password", $data->password);
		$stmt->bindParam("admin_id", $admin_id);
		$stmt->execute();
		$db = null; 
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
function authenticate(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());	
	$sql = "SELECT admins.admin_id,admins.email,user_roles.title,user_roles.bitmask FROM admins INNER JOIN user_roles USING(title) WHERE email=:email AND password = SHA1(:password) LIMIT 1";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("email", $data->email);
		$stmt->bindParam("password", $data->password);
		$stmt->execute();
		$count=$stmt->rowCount();
		$result = $stmt->fetchObject(); 
		$db = null; 
		$app = Slim::getInstance();
		if($count == 0){
			//header('HTTP/1.1 400 Anonymous not allowed');
			//$app->response->setStatus(400);
			$app->halt(400,json_encode(array('status' => "ERROR")));
			exit();
		}
		$r = array('admin_id'=>$result->admin_id,"email"=>$result->email,"role"=>array("bitMask"=>$result->bitmask,"title"=>$result->title));
		$app->setCookie('admin', json_encode($r), '2 days');
		echo json_encode($r);
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
function logout(){
	//Delete access token
	$app = Slim::getInstance();
	$app->deleteCookie('admin');

}
function deleteAdmin($id){
	$sql = "DELETE FROM admins WHERE admin_id=:id LIMIT 1";
	try{
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
        echo "Deleted successfully";
	} catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
/*function test(){
	$result = array("id"=>10,"username" => "someone","role" =>array("bitMask" => 1024 , "title"=>"super_admin"),"password"=>"123");
	$app = Slim::getInstance();
	$app->setCookie('user', json_encode($result));
	//$app->setCookie('user',  "%7B%22username%22%3A%22%22%2C%22role%22%3A%7B%22bitMask%22%3A1%2C%22title%22%3A%22public%22%7D%7D");
	//$app->setCookie('user',  "dsf");
	echo json_encode($result);
}*/