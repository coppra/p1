<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/products/', 'getProducts');
$app->get('/products/:id','getProduct');
$app->post('/products/','addProduct');
$app->post('/products/:id','updateProduct');
$app->delete('/products/:id','deleteProduct');

$app->get('/products/tag/', 'getTags');
$app->get('/products/tag/:id','getTag');
$app->post('/products/tag/','addTag');
$app->post('/products/tag/:id','updateTag');
$app->delete('/products/tag/:id','deleteTag');

$app->get('/products/spec/','getSpecs');
$app->get('/products/spec/:id','getSpec');
$app->post('/products/spec/','addSpec');
$app->post('/products/spec/:id','updateSpec');
$app->delete('/products/spec/:id','deleteSpec');

$app->run();

function getProducts(){
    $page=1;
    $limit=0;
    $no_of_pages = 0;
    $no_of_rows = 0;
    $conditions_params=array();
    $conditions_params_2=array('category_id','sub_category_id','tag_id','spec_id');
    $conditions = array();
    $query_condition='';
    $app = Slim::getInstance();
    if($app->request()->params('page'))
        $page=intval($app->request()->params('page'));
    if($app->request()->params('limit'))
        $limit=intval($app->request()->params('limit'));
    foreach($conditions_params as $param){
        if($app->request()->params($param)){
            $searches = explode(",", $app->request()->params($param));
            if(sizeof($searches) > 0){
                $search_query = "(";
                foreach($searches as $val){
                    $search_query = $search_query." l.$param = '$val' OR";
                }
                $search_query = substr($search_query, 0, -2);
                $search_query = $search_query.') ';
            }   
            array_push($conditions,  $search_query);
        }
    }
    foreach($conditions_params_2 as $param){
        if($app->request()->params($param)){
            $searches = explode(",", $app->request()->params($param));
            if(sizeof($searches) > 0){
                $search_query = "(";
                foreach($searches as $val){
                    $search_query = $search_query." $param = '$val' OR";
                }
                $search_query = substr($search_query, 0, -2);
                $search_query = $search_query.') ';
            }   
            array_push($conditions,  $search_query);
        }
    }
    if(sizeof($conditions) > 0){
        $query_condition = " WHERE";
        foreach($conditions as $condition){
            $query_condition = $query_condition." ".$condition." AND";
        }
        $query_condition = substr($query_condition, 0, -4);
    }
    $offset = ($page - 1) * $limit;
    $sql_1 = "SELECT COUNT(DISTINCT product_id) FROM products l
                LEFT JOIN products_x_categories USING(product_id)
                LEFT JOIN products_x_sub_categories USING(product_id) 
                LEFT JOIN products_x_tags USING(product_id)"
                .$query_condition;
    // change * to some important fields -- too much data
    $sql_2 = "SELECT DISTINCT l.* FROM products l 
                LEFT JOIN products_x_categories USING(product_id)
                LEFT JOIN products_x_sub_categories USING(product_id) 
                LEFT JOIN products_x_tags USING(product_id)"
                .$query_condition
                ." LIMIT :offset , :limit";
    try {
        $db = getConnection();
        $stmt = $db->query($sql_1);  
        $no_of_rows = $stmt->fetchColumn();
        if($limit == 0){
            $limit=intval($no_of_rows);
        }
        $no_of_pages=0;
        if($limit!=0)
            $no_of_pages = ceil($no_of_rows / $limit);
        $stmt = $db->prepare($sql_2);
        $stmt->bindParam("offset",$offset, PDO::PARAM_INT);
        $stmt->bindParam("limit",$limit, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        // $data =  (array) $data;
        foreach($data as $key => $value){
            $data[$key] = get_object_vars($data[$key]);
            $data[$key]["business_details"]=getBusinessDetails($value->business_id);
            $data[$key]["categories"]=getCategories($value->product_id);
            $data[$key]["sub_categories"]=getSubCategories($value->product_id);
            $data[$key]["tags"]=getProductTags($value->product_id);
            $data[$key]["specs"]=getProductSpecs($value->product_id);
        }
            // print_r($data);
        $db = null;
        echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"results": ' . json_encode($data) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}
function getProduct($id){
    $sql="SELECT DISTINCT l.* FROM products l 
                LEFT JOIN products_x_categories USING(product_id)
                LEFT JOIN products_x_sub_categories USING(product_id) 
                LEFT JOIN products_x_tags USING(product_id) 
                WHERE l.product_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        if(!$data){
            return;
        }
        $data = get_object_vars($data);
        $categories=getCategories($id);
        $sub_categories=getSubCategories($id);
        $tags=getProductTags($id);
        $specs=getProductSpecs($id);
        $data["categories"]=$categories;
        $data["sub_categories"]=$sub_categories;
        $data["tags"]=$tags;
        $data["specs"]=$specs;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addProduct(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO products (name,brand,code,original_price,price,business_id,qty,description) VALUES(:name,:brand,:code,:original_price,:price,:business_id,:qty,:description)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $data->name);
        $stmt->bindParam("brand", $data->brand);
        $stmt->bindParam("code", $data->code);
        $stmt->bindParam("original_price", $data->original_price);
        $stmt->bindParam("price", $data->price);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("qty", $data->qty);
        $stmt->bindParam("description", $data->description);
        $stmt->execute();
        $data->product_id = $db->lastInsertId();
        $db = null;
        if(sizeof($data->categories))
            addCategories($data->product_id,$data->categories);
        if(sizeof($data->sub_categories))
            addSubCategories($data->product_id,$data->sub_categories);
        if(sizeof($data->tags))
            addProductTags($data->product_id,$data->tags);
        if(sizeof($data->specs))
            addProductSpecs($data->product_id,$data->specs);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateProduct($product_id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE products SET name = :name,brand=:brand,code=:code,original_price=:original_price,price=:price,business_id=:business_id,qty=:qty,description=:description WHERE product_id=:product_id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $data->name);
        $stmt->bindParam("brand", $data->brand);
        $stmt->bindParam("code", $data->code);
        $stmt->bindParam("original_price", $data->original_price);
        $stmt->bindParam("price", $data->price);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("qty", $data->qty);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
        deleteCategories($product_id);
        deleteSubCategories($product_id);
        deleteProductTags($product_id);
        deleteProductSpecs($product_id);
        if(sizeof($data->categories))
            addCategories($product_id,$data->categories);
        if(sizeof($data->sub_categories))
            addSubCategories($product_id,$data->sub_categories);
        if(sizeof($data->tags))
            addProductTags($product_id,$data->tags);
        if(sizeof($data->specs))
            addProductSpecs($product_id,$data->specs);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteProduct($product_id){
    $sql="DELETE FROM products WHERE product_id=:product_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getBusinessDetails($id){
    $sql="SELECT l.business_id,l.name,l.caption,c.country,s.state,d.district,a.area FROM localsearch l  
                LEFT JOIN countries c ON c.country_id=l.country_id
                LEFT JOIN states s ON s.state_id=l.state_id
                LEFT JOIN districts d ON d.district_id=l.district_id
                LEFT JOIN areas a ON a.area_id=l.area_id
                LEFT JOIN localsearch_x_categories USING(business_id)
                LEFT JOIN localsearch_x_sub_categories USING(business_id) 
                LEFT JOIN localsearch_x_features USING(business_id) 
                LEFT JOIN localsearch_x_products USING(business_id)  
                WHERE l.business_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data = $stmt->fetchObject();
        if(!$data){
            return;
        }
        //$data = get_object_vars($data);

        $db = null;
        return $data;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteCategories($product_id){
    $sql="DELETE FROM products_x_categories WHERE product_id=:product_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteSubCategories($product_id){
    $sql="DELETE FROM products_x_sub_categories WHERE product_id=:product_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteProductTags($product_id){
    $sql="DELETE FROM products_x_tags WHERE product_id=:product_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteProductSpecs($product_id){
    $sql="DELETE FROM products_x_specs WHERE product_id=:product_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("product_id", $product_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addCategories($product_id,$category_ids){
    $value='';
    foreach($category_ids as $category_id){
        $value = $value."($product_id,$category_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO products_x_categories (product_id,category_id) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addSubCategories($product_id,$sub_category_ids){
    $value='';
    foreach($sub_category_ids as $sub_category_id){
        $value = $value."($product_id,$sub_category_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO products_x_sub_categories (product_id,sub_category_id) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addProductTags($product_id,$tags){
    $value='';
    foreach($tags as $tag){
        //Get tag_id,  if tag not present add tag and get id
        $tag_id=0;
        $sql = "SELECT * FROM pro_tags WHERE tag = :tag LIMIT 1";
        try{
            $db = getConnection();
            $stmt = $db->prepare($sql);
            $stmt->bindParam("tag", $tag);
            $stmt->execute();
            $data = $stmt->fetchObject();
            $db = null;
            if($data){
                $data = get_object_vars($data);
                $tag_id = $data['tag_id'];
            }
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
        if(!$tag_id){
            $sql = "INSERT INTO pro_tags(tag) VALUES(:tag)";
            try {
                $db = getConnection();
                $stmt = $db->prepare($sql);
                $stmt->bindParam("tag", $tag);
                $stmt->execute();
                $tag_id = $db->lastInsertId();
                $db = null;
                //echo json_encode($data);
            } catch(PDOException $e) {
                  echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
        }
        $value = $value."($product_id,$tag_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO products_x_tags (product_id,tag_id) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
          echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addProductSpecs($product_id,$specs){
    $value='';
    foreach ($specs as $spec) {
        if(array_key_exists('value', $spec))
            $value = $value."($product_id,$spec->spec_id,'$spec->value'),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql = "INSERT INTO products_x_specs (product_id,spec_id,value) VALUES".$value;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        //echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getCategories($product_id){
    $sql="SELECT loc_categories.category_id,loc_categories.category FROM loc_categories INNER JOIN products_x_categories USING(category_id) WHERE products_x_categories.product_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $product_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getSubCategories($product_id){
    $sql="SELECT loc_sub_categories.sub_category_id,loc_sub_categories.sub_category FROM loc_sub_categories INNER JOIN products_x_sub_categories USING(sub_category_id) WHERE products_x_sub_categories.product_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $product_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getProductTags($product_id){
    $sql="SELECT pro_tags.tag_id,pro_tags.tag FROM pro_tags INNER JOIN products_x_tags USING(tag_id) WHERE products_x_tags.product_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $product_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function getProductSpecs($product_id){
    $sql="SELECT pro_specs.spec_id,pro_specs.spec,pro_specs.category_id,products_x_specs.value FROM pro_specs INNER JOIN products_x_specs USING(spec_id) WHERE products_x_specs.product_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $product_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

//Specs
function getSpecs(){
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
    $sql = "SELECT * FROM pro_specs ".$condition;
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
function getSpec($id){
    $sql = "SELECT * FROM pro_specs WHERE spec_id = :id";
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
function addSpec(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO pro_specs (spec,category_id) VALUES(:spec,:category_id)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("spec", $data->spec);
        $stmt->bindParam("category_id", $data->category_id);
        $stmt->execute();
        $data->spec_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function updateSpec($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE pro_specs SET spec=:spec WHERE spec_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("spec", $data->spec);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data->spec_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteSpec($id){
    $sql="DELETE FROM pro_specs WHERE spec_id=:id";
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



//Tags

function getTags(){
    $sql = "SELECT * FROM pro_tags";
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

function getTag($id){
    $sql = "SELECT * FROM pro_tags WHERE tag_id = :id";
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

function addTag(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO pro_tags (tag) VALUES(:tag)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("tag", $data->tag);
        $stmt->execute();
        $data->tag_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateTag($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "UPDATE pro_tags SET tag=:tag WHERE tag_id=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("tag", $data->tag);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $data->tag_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteTag($id){
    $sql="DELETE FROM pro_tags WHERE tag_id=:id";
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