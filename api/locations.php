<?php
require 'Slim/Slim.php';
require 'connection.php';

$app = new Slim();

$app->get('/locations/country/', 'getCountries');
$app->get('/locations/country/:id', 'getCountry');
$app->post('/locations/country/','addCountry');
$app->post('/locations/country/:id','updateCountry');
$app->delete('/locations/country/:id','deleteCountry');

$app->get('/locations/state/', 'getStates');
$app->get('/locations/state/:id', 'getState');
$app->post('/locations/state/','addState');
$app->post('/locations/state/:id','updateState');
$app->delete('/locations/state/:id','deleteState');

$app->get('/locations/district/', 'getDistricts');
$app->get('/locations/district/:id', 'getDistrict');
$app->post('/locations/district/','addDistrict');
$app->post('/locations/district/:id','updateDistrict');
$app->delete('/locations/district/:id','deleteDistrict');

$app->get('/locations/area/', 'getAreas');
$app->get('/locations/area/:id', 'getArea');
$app->post('/locations/area/','addArea');
$app->post('/locations/area/:id','updateArea');
$app->delete('/locations/area/:id','deleteArea');

$app->run();

function getCountries(){
	$condition = '';
	$app = new Slim();
	if($app->request()->params('country')){	
		$searches = explode(",", $app->request()->params('country'));
		if(sizeof($searches) > 0){
			$condition = "	WHERE";
			foreach($searches as $val){
				$condition = $condition." country LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
	$sql = "SELECT * FROM countries ".$condition;
	try{
		$db = getConnection();
        $stmt= $db->query($sql);
        $countries = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        //echo '[{"countries": ' . json_encode($countries) . '}]';
        echo json_encode($countries);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getCountry($id) {
    $sql = "SELECT * FROM countries WHERE country_id=:id";
    try {
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
function addCountry(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO countries (country) VALUES(:country)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("country", $data->country);
    	$stmt->execute();
        $data->country_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateCountry($id){
	$request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE countries SET country = :country WHERE country_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->bindParam("country", $data->country);
    	$stmt->execute();
        $data->country_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteCountry($id){
	$sql = "DELETE FROM countries WHERE country_id = :id";
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

function getStates(){
	$condition = '';
	$app = new Slim();
	if($app->request()->params('country_id')){
		$country_ids = explode(",",$app->request()->params('country_id'));
		if(sizeof($country_ids) > 0){
			$condition = "	WHERE";
			foreach($country_ids as $val){
				$condition = $condition." country_id LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
	$sql = "SELECT * FROM states ".$condition;
	try{
		$db = getConnection();
        $stmt = $db->query($sql);
        $states = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        //echo '{"states": ' . json_encode($states) . '}';
        echo json_encode($states);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getState($id){
	$sql = "SELECT * FROM states WHERE state_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addState(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO states (state,country_id) VALUES(:state,:country_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("state", $data->state);
        $stmt->bindParam("country_id", $data->country_id);
    	$stmt->execute();
        $data->state_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateState($id){
	$request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE states SET state = :state WHERE state_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->bindParam("state", $data->state);
    	$stmt->execute();
        $data->state_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteState($id){
	$sql = "DELETE FROM states WHERE state_id = :id";
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

function getDistricts(){
	$condition = '';
	$app = new Slim();
	if($app->request()->params('state_id')){
		$state_ids = explode(",",$app->request()->params('state_id'));
		if(sizeof($state_ids) > 0){
			$condition = "	WHERE";
			foreach($state_ids as $val){
				$condition = $condition." state_id LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
	$sql = "SELECT * FROM districts ".$condition;
	try{
		$db = getConnection();
        $stmt = $db->query($sql);
        $states = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($states);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getDistrict($id){
	$sql = "SELECT * FROM districts WHERE district_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addDistrict(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO districts (district,state_id) VALUES(:district,:state_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("district", $data->district);
        $stmt->bindParam("state_id", $data->state_id);
    	$stmt->execute();
        $data->district_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateDistrict($id){
	$request = Slim::getInstance()->request();
    $body = $request->getBody();
    $data = json_decode($body);
    $sql = "UPDATE districts SET district = :district WHERE district_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->bindParam("district", $data->district);
    	$stmt->execute();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteDistrict($id){
	$sql = "DELETE FROM districts WHERE district_id = :id";
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

function getAreas(){
	$condition = '';
	$app = new Slim();
	if($app->request()->params('district_id')){
		$district_ids = explode(",",$app->request()->params('district_id'));
		if(sizeof($district_ids) > 0){
			$condition = "	WHERE";
			foreach($district_ids as $val){
				$condition = $condition." district_id LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
	$sql = "SELECT * FROM areas ".$condition;
	try{
		$db = getConnection();
        $stmt = $db->query($sql);
        $areas = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        //echo '{"areas": ' . json_encode($areas) . '}';
        echo json_encode($areas);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getArea($id){
	$sql = "SELECT * FROM areas WHERE area_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addArea(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO areas (area,district_id) VALUES(:area,:district_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("area", $data->area);
        $stmt->bindParam("district_id", $data->district_id);
    	$stmt->execute();
        $data->area_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateArea($id){
	$request = Slim::getInstance()->request();
    $body = $request->getBody();
    $data = json_decode($body);
    $sql = "UPDATE areas SET area = :area WHERE area_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->bindParam("area", $data->area);
    	$stmt->execute();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteArea($id){
	$sql = "DELETE FROM areas WHERE area_id = :id";
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