<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/categories/loc/','getLocCategories');
$app->get('/categories/loc/:id','getLocCategory');
$app->post('/categories/loc/','addLocCategory');
$app->post('/categories/loc/:id','updateLocCategory');
$app->delete('/categories/loc/:id','deleteLocCategory');

$app->get('/categories/loc/sub/','getLocSubCategories');
$app->get('/categories/loc/sub/:id','getLocSubCategory');
$app->post('/categories/loc/sub/','addLocSubCategory');
$app->post('/categories/loc/sub/:id','updateLocSubCategory');
$app->delete('/categories/loc/sub/:id','deleteLocSubCategory');

$app->get('/categories/cla/','getClaCategories');
$app->get('/categories/cla/:id','getClaCategory');
$app->post('/categories/cla/','addClaCategory');
$app->post('/categories/cla/:id','updateClaCategory');
$app->delete('/categories/cla/:id','deleteClaCategory');

$app->get('/categories/cla/sub/','getClaSubCategories');
$app->get('/categories/cla/sub/:id','getClaSubCategory');
$app->post('/categories/cla/sub/','addClaSubCategory');
$app->post('/categories/cla/sub/:id','updateClaSubCategory');
$app->delete('/categories/cla/sub/:id','deleteClaSubCategory');

$app->run();

function getLocCategories(){
	$condition = '';
    $app = new Slim();
    if($app->request()->params('kind')){
        $kinds = explode(",",$app->request()->params('kind'));
        if(sizeof($kinds) > 0){
            $condition = "  WHERE";
            foreach($kinds as $val){
                $condition = $condition." kind LIKE '$val' OR";
            }
            $condition = substr($condition, 0, -3);
        }
    }
	$sql = "SELECT * FROM loc_categories".$condition;
	try{
		$db = getConnection();
        $stmt= $db->query($sql);
        $categories = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($categories);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getClaCategories(){
    $app = new Slim();
    $sql = "SELECT * FROM cla_categories";
    try{
        $db = getConnection();
        $stmt= $db->query($sql);
        $categories = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($categories);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getLocCategory($id){
	$sql = "SELECT * FROM loc_categories WHERE category_id = :id";
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
function getClaCategory($id){
    $sql = "SELECT * FROM cla_categories WHERE category_id = :id";
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
function addLocCategory(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO loc_categories (category,kind) VALUES(:category,:kind)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("category", $data->category);
        $stmt->bindParam("kind", $data->kind);
    	$stmt->execute();
        $data->category_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addClaCategory(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO cla_categories (category) VALUES(:category)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("category", $data->category);
        $stmt->execute();
        $data->category_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateLocCategory($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE loc_categories SET category=:category,kind=:kind WHERE category_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("category", $data->category);
        $stmt->bindParam("kind", $data->kind);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->category_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateClaCategory($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE cla_categories SET category=:category WHERE category_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("category", $data->category);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data->category_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteLocCategory($id){
	$sql="DELETE FROM loc_categories WHERE category_id=:id";
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
function deleteClaCategory($id){
    $sql="DELETE FROM cla_categories WHERE category_id=:id";
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

function getLocSubCategories(){
	$condition = '';
	$app = new Slim();
	if($app->request()->params('category_id')){
		$category_ids = explode(",",$app->request()->params('category_id'));
		if(sizeof($category_ids) > 0){
			$condition = "	WHERE";
			foreach($category_ids as $val){
				$condition = $condition." category_id LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
	$sql = "SELECT * FROM loc_sub_categories ".$condition;
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
function getClaSubCategories(){
    $condition = '';
    $app = new Slim();
    if($app->request()->params('category_id')){
        $category_ids = explode(",",$app->request()->params('category_id'));
        if(sizeof($category_ids) > 0){
            $condition = "  WHERE";
            foreach($category_ids as $val){
                $condition = $condition." category_id LIKE '$val' OR";
            }
            $condition = substr($condition, 0, -3);
        }
    }
    $sql = "SELECT * FROM cla_sub_categories ".$condition;
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
function getLocSubCategory($id){
	$sql = "SELECT * FROM loc_sub_categories WHERE sub_category_id = :id";
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
function getClaSubCategory($id){
    $sql = "SELECT * FROM cla_sub_categories WHERE sub_category_id = :id";
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
function addLocSubCategory(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO loc_sub_categories (sub_category,category_id) VALUES(:sub_category,:category_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("sub_category", $data->sub_category);
        $stmt->bindParam("category_id", $data->category_id);
    	$stmt->execute();
        $data->sub_category_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addClaSubCategory(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO cla_sub_categories (sub_category,category_id) VALUES(:sub_category,:category_id)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("sub_category", $data->sub_category);
        $stmt->bindParam("category_id", $data->category_id);
        $stmt->execute();
        $data->sub_category_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateLocSubCategory($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE loc_sub_categories SET sub_category=:sub_category WHERE sub_category_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("sub_category", $data->sub_category);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->category_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateClaSubCategory($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE cla_sub_categories SET sub_category=:sub_category WHERE sub_category_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("sub_category", $data->sub_category);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data->category_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteLocSubCategory($id){
	$sql="DELETE FROM loc_sub_categories WHERE sub_category_id=:id";
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
function deleteClaSubCategory($id){
    $sql="DELETE FROM cla_sub_categories WHERE sub_category_id=:id";
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
?>