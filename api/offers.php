<?
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/offer/', 'getOffers');
$app->get('/offer/:id','getOffer');
$app->post('/offer/','addOffer');
$app->post('/offer/:id','updateOffer');
$app->delete('/offer/:id','deleteOffer');

$app->run();

function getOffers(){

}

function getOffer($id){

}

function addOffer(){

}

function updateOffer($id){

}

function deleteOffer($id){

}

