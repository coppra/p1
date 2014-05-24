<?
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/businesses/', 'getBusinesses');
$app->get('/businesses/:id','getBusiness');
$app->post('/businesses/','addBusiness');
$app->post('/businesses/:id','updateBusiness');
$app->delete('/businesses/:id','deleteBusiness');

$app->run();

function getBusinesses(){
	$conditions = '';
	$app = new Slim();
	if($app->request()->params('search')){	
		$searches = explode(",", $app->request()->params('username'));
		if(sizeof($searches) > 0){
			$condition = "	WHERE";
			foreach($searches as $val){
				$condition = $condition." country LIKE '$val' OR";
			}
			$condition = substr($condition, 0, -3);
		}
	}
}

function getBusiness($id){

}

function addBusiness(){

}

function updateBusiness($id){

}

function deleteBusiness($id){

}
