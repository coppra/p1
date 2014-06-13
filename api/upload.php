<?php
include_once("ak_php_img_lib_1.0.php");
function create_folder($id,$category){
	$dir = "./uploads/$category/gallery/" . $id . "/";
	if (!file_exists($dir)) {	
   	 	mkdir("./uploads/$category/gallery/" . $id);
   	 	mkdir("./uploads/$category/gallery/".$id."/thumbs");
	}
	if(!file_exists($dir."thumbs")){
		mkdir("./uploads/$category/gallery/".$id."/thumbs");
	}
}
function getdir($category,$kind,$id){
	$dir='./uploads/';
	switch ($category) {
		case 'localsearch':
			$dir = $dir.'localsearch/';
			break;
		case 'classifieds':
			$dir = $dir.'classifieds/';
			break;
		case 'offers':
			$dir = $dir.'offers/';
			break;
		case 'products':
			$dir = $dir.'products/';
			break;
		default:
			# code...
			break;
	}
	switch($kind){
		case 'profile':
			$dir = $dir.'profile/';
			break;
		case 'cover':
			$dir = $dir.'cover/';
			break;
		case 'gallery':
			create_folder($id,$category);
			$dir = $dir.'gallery/'.$id.'/';
	}
	return $dir;
}
function save_image($imfile,$id,$uploaddir,$kind){
	$fileName = strtolower($imfile["name"]);  // The file name
	$fileTmpLoc = $imfile["tmp_name"]; // File in the PHP tmp folder
	$fileType = $imfile["type"]; // The type of file it is
	$fileSize = $imfile["size"]; // File size in bytes
	$fileErrorMsg = $imfile["error"]; // 0 for false... and 1 for true
	$kaboom = explode(".", $fileName); // Split file name into an array using the dot
	$fileExt = end($kaboom); // Now target the last array element to get the file extension
	// START PHP Image Upload Error Handling --------------------------------------------------
	//$fileExit='.jpg';
	if (!$fileTmpLoc) { // if file not chosen
    	echo "ERROR: Please browse for a file before clicking the upload button.";
    	exit();
	} else if($fileSize > 5242880) { // if file size is larger than 5 Megabytes
    	echo "ERROR: Your file was larger than 5 Megabytes in size.";
    	unlink($fileTmpLoc); // Remove the uploaded file from the PHP temp folder
    	exit();
	} else if (!preg_match("/.(gif|jpg|png)$/i", $fileName) ) {
     // This condition is only if you wish to allow uploading of specific file types    
     	echo "ERROR: Invalid extension"; 
    	unlink($fileTmpLoc); // Remove the uploaded file from the PHP temp folder
     	exit();
	} else if ($fileErrorMsg == 1) { // if file upload error key is equal to 1
    	echo "ERROR: An error occured while processing the file. Try again.";
    	exit();
	}
	// END PHP Image Upload Error Handling ---------------------------------
	// Place it into your "uploads" folder mow using the move_uploaded_file() function
	
	if($kind =='profile'){
		$moveResult = move_uploaded_file($fileTmpLoc, $uploaddir."$id.jpg");
		// Check to make sure the move result is true before continuing
		if ($moveResult != true) {
    		echo "ERROR: File not uploaded. Try again.";
    		unlink($fileTmpLoc); // Remove the uploaded file from the PHP temp folder
    		exit();
		}
		$target_file = $uploaddir."$id.jpg";
		$resized_file = $uploaddir."$id.jpg";
		ak_img_resize($target_file,$resized_file,400,400,$fileExt);
		//Crop to square NO duplicate thumbnail
		list($w_orig, $h_orig) = getimagesize($resized_file);
		$min = min($w_orig, $h_orig);
		ak_img_thumb($target_file, $resized_file, $min, $min, $fileExt);
	}
	else if($kind =='cover'){
		$moveResult = move_uploaded_file($fileTmpLoc, $uploaddir."$id.jpg");
		// Check to make sure the move result is true before continuing
		if ($moveResult != true) {
    		echo "ERROR: File not uploaded. Try again.";
    		unlink($fileTmpLoc); // Remove the uploaded file from the PHP temp folder
    		exit();
		}
		$target_file = $uploaddir."$id.jpg";
		$resized_file = $uploaddir."$id.jpg";
		ak_img_resize($target_file,$resized_file,1000,800,$fileExt);
	}
	else if($kind =='gallery'){
		$moveResult = move_uploaded_file($fileTmpLoc, $uploaddir."$fileName");
		// Check to make sure the move result is true before continuing
		if ($moveResult != true) {
    		echo "ERROR: File not uploaded. Try again.";
    		unlink($fileTmpLoc); // Remove the uploaded file from the PHP temp folder
    		exit();
		}
		$target_file = $uploaddir."$fileName";
		$resized_file = $uploaddir."$fileName";
		ak_img_resize($target_file,$resized_file,800,800,$fileExt);
		
		list($w_orig, $h_orig) = getimagesize($resized_file);
		$min = min($w_orig, $h_orig);
		$target_file = $uploaddir."$fileName";
		$resized_file = $uploaddir."thumbs/$fileName";
		ak_img_thumb($target_file, $resized_file, $min, $min, $fileExt);
		
		$target_file = $uploaddir."thumbs/$fileName";
		$resized_file = $uploaddir."thumbs/$fileName";
		$wmax = 200;
		$hmax = 200;
		ak_img_resize($target_file, $resized_file, $wmax, $hmax, $fileExt);
	}

	/*$target_file = "./uploads/thumbs/$fileName";
	$resized_file = "./uploads/thumbs/$fileName";
	$wmax = 200;
	$hmax = 200;
	ak_img_resize($target_file, $resized_file, $wmax, $hmax, $fileExt);
	echo json_encode($fileName);*/
}
function resize($target_file,$resized_file,$wmax,$hmax,$fileExt){

}
$category = $_POST['category'];
$kind = $_POST['kind'];
$id = $_POST['id'];
$uploaddir ='';
if(isset($_GET['files']))
{	
	$error = false;
	$files = array();
	 $uploaddir = getdir($category,$kind,$id);
	 save_image($_FILES['file'],$id,$uploaddir,$kind);
	
	 //echo json_encode(sizeof($_FILES));
	 // echo json_encode($_FILES['file']);
	/*foreach($_FILES as $file)
	{	
	echo json_encode($file);
		//save_image($file);
	}*/
	//$data = ($error) ? array('error' => 'There was an error uploading your files') : array('files' => $files);
}
?>