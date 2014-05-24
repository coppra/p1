<?
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/product/', 'getProducts');
$app->get('/product/:id','getProduct');
$app->post('/product/','addProduct');
$app->post('/product/:id','updateProduct');
$app->delete('/product/:id','deleteProduct');

$app->run();

function getProducts(){

}

function getProduct($id){

}

function addProduct(){

}

function updateProduct($id){

}

function deleteProduct($id){

}

