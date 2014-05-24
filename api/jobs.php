<?
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/job/', 'getJobs');
$app->get('/job/:id','getJob');
$app->post('/job/','addJob');
$app->post('/job/:id','updateJob');
$app->delete('/job/:id','deleteJob');

$app->run();

function getJobs(){

}

function getJob($id){

}

function addJob(){

}

function updateJob($id){

}

function deleteJob($id){

}

