<?php 

require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();
$app->get('/roles/', 'getRoles');
$app->run();

function getRoles(){
	
	$app = Slim::getInstance();
	$sql = "SELECT * FROM user_roles";
	//echo $sql_2.'<br><hr>';
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);
        $stmt->execute();
		$roles = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($roles);
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}
