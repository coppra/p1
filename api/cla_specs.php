<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/cla_specs/','getClaSpecs');
$app->get('/cla_specs/:id','getClaSpec');
$app->post('/cla_specs/','addClaSpec');
$app->post('/cla_specs/:id','updateClaSpec');
$app->delete('/cla_specs/:id','deleteClaSpec');

function getClaSpecs(){
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
	$sql = "SELECT * FROM cla_specs ".$condition;
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
function getClaSpec($id){
	$sql = "SELECT * FROM cla_specs WHERE spec_id = :id";
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
function addClaSpec(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO cla_specs (spec,category_id) VALUES(:spec,:category_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("spec", $data->spec);
        $stmt->bindParam("category_id", $data->category_id);
    	$stmt->execute();
        $data->spec_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateClaSpec($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE cla_specs SET spec=:spec WHERE spec_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("spec", $data->spec);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->spec_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteClaSpec($id){
	$sql="DELETE FROM cla_specs WHERE spec_id=:id";
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