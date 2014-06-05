<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/loc_products/','getLocProducts');
$app->get('/loc_products/:id','getLocProduct');
$app->post('/loc_products/','addLocProduct');
$app->post('/loc_products/:id','updateLocProduct');
$app->delete('/loc_products/:id','deleteLocProduct');

function getLocProducts(){
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
	$sql = "SELECT * FROM loc_products".$condition;
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
function getLocProduct($id){
	$sql = "SELECT * FROM loc_products WHERE product_id = :id";
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
function addLocProduct(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO loc_products (product,category_id) VALUES(:product,:category_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product", $data->product);
        $stmt->bindParam("category_id", $data->category_id);
    	$stmt->execute();
        $data->product_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateLocProduct($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE loc_products SET product=:product WHERE product_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product", $data->product);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->product_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteLocProduct($id){
	$sql="DELETE FROM loc_products WHERE product_id=:id";
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

$app->run();

?>