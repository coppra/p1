<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/cla_features/','getClaFeatures');
$app->get('/cla_features/:id','getClaFeature');
$app->post('/cla_features/','addClaFeature');
$app->post('/cla_features/:id','updateClaFeature');
$app->delete('/cla_features/:id','deleteClaFeature');

function getClaFeatures(){
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
	$sql = "SELECT * FROM cla_features ".$condition;
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
function getClaFeature($id){
	$sql = "SELECT * FROM cla_features WHERE feature_id = :id";
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
function addClaFeature(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO cla_features (feature,category_id) VALUES(:feature,:category_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("feature", $data->feature);
        $stmt->bindParam("category_id", $data->category_id);
    	$stmt->execute();
        $data->feature_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateClaFeature($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE cla_features SET feature=:feature WHERE feature_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("feature", $data->feature);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->feature_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteClaFeature($id){
	$sql="DELETE FROM cla_features WHERE feature_id=:id";
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