<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/loc_features/','getLocFeatures');
$app->get('/loc_features/:id','getLocFeature');
$app->post('/loc_features/','addLocFeature');
$app->post('/loc_features/:id','updateLocFeature');
$app->delete('/loc_features/:id','deleteLocFeature');

function getLocFeatures(){
	// add filter for business type
	$sql = "SELECT * FROM loc_features";
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
function getLocFeature($id){
	$sql = "SELECT * FROM loc_features WHERE feautre_id = :id";
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
function addLocFeature(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO loc_features (feature,category_id,priority) VALUES(:feature,:category_id,:priority)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("feature", $data->feature);
        $stmt->bindParam("category_id", $data->category_id);
        $stmt->bindParam("priority", $data->priority);
    	$stmt->execute();
        $data->feature_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateLocFeature($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE loc_features SET feature=:feature,category_id=:category_id,priority=:priority WHERE feature_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("feature", $data->feature);
        $stmt->bindParam("category_id", $data->category_id);
        $stmt->bindParam("priority", $data->priority);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->feature_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteLocFeature($id){
	$sql="DELETE FROM loc_features WHERE feature_id=:id";
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