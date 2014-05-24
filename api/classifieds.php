<?
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/classifieds/', 'getClassifiedses');
$app->get('/classifieds/:id','getClassifieds');
$app->post('/classifieds/','addClassifieds');
$app->post('/classifieds/:id','updateClassifieds');
$app->delete('/classifieds/:id','deleteClassifieds');

$app->run();

function getClassifiedses(){

}

function getClassifieds($id){

}

function addClassifieds(){

}

function updateClassifieds($id){

}

function deleteClassifieds($id){

}
