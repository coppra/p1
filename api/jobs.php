<?php
require 'Slim/Slim.php';
require 'connection.php';
$app = new Slim();

$app->get('/jobs/', 'getJobs');
$app->get('/jobs/:id','getJob');
$app->post('/jobs/','addJob');
$app->post('/jobs/:id','updateJob');
$app->delete('/jobs/:id','deleteJob');

$app->get('/jobs/industry/', 'getIndustries');
$app->get('/jobs/industry/:id','getIndustry');
$app->post('/jobs/industry/','addIndustry');
$app->post('/jobs/industry/:id','updateIndustry');
$app->delete('/jobs/industry/:id','deleteIndustry');

$app->get('/jobs/designation/', 'getDesignations');
$app->get('/jobs/designation/:id','getDesignation');
$app->post('/jobs/designation/','addDesignation');
$app->post('/jobs/designation/:id','updateDesignation');
$app->delete('/jobs/designation/:id','deleteDesignation');

$app->get('/jobs/tag/', 'getTags');
$app->get('/jobs/tag/:id','getTag');
$app->post('/jobs/tag/','addTag');
$app->post('/jobs/tag/:id','updateTag');
$app->delete('/jobs/tag/:id','deleteTag');

$app->run();

function getJobs(){
    $page=1;
    $limit=0;
    $no_of_pages = 0;
    $no_of_rows = 0;
    $conditions_params=array();
    $conditions_params_2=array('industry_id','designation_id');
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
    $sql_1 = "SELECT COUNT(DISTINCT job_id) FROM jobs l
                LEFT JOIN countries c ON c.country_id=l.country_id
                LEFT JOIN states s ON s.state_id=l.state_id
                LEFT JOIN districts d ON d.district_id=l.district_id
                LEFT JOIN areas a ON a.area_id=l.area_id"
                .$query_condition;
    // change * to some important fields -- too much data
    $sql_2 = "SELECT DISTINCT l.*,c.country,s.state,d.district,a.area FROM jobs l 
                LEFT JOIN countries c ON c.country_id=l.country_id
                LEFT JOIN states s ON s.state_id=l.state_id
                LEFT JOIN districts d ON d.district_id=l.district_id
                LEFT JOIN areas a ON a.area_id=l.area_id"
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
            $data[$key]["industries"]=getJobIndustries($value->job_id);
            $data[$key]["designations"]=getJobDesignations($value->job_id);
            $data[$key]["tags"]=getJobTags($value->job_id);
        }
            // print_r($data);
        $db = null;
        echo '{"no_of_results":'.$no_of_rows.',"no_of_pages":'.$no_of_pages.',"results": ' . json_encode($data) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}'; 
    }
}

function getJob($id){
    $sql="SELECT l.*,c.country,s.state,d.district,a.area FROM jobs l  
                LEFT JOIN countries c ON c.country_id=l.country_id
                LEFT JOIN states s ON s.state_id=l.state_id
                LEFT JOIN districts d ON d.district_id=l.district_id
                LEFT JOIN areas a ON a.area_id=l.area_id
                WHERE l.job_id=:id";
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
        $data["industries"]=getJobIndustries($data['job_id']);
        $data["designations"]=getJobDesignations($data['job_id']);
        $data["tags"]=getJobTags($data['job_id']);
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addJob(){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO jobs (job_title,description,salary,min_experience,max_experience,job_type,shift,company_name,company_brief,contact_person,phone1,phone2,email,website,established,business_id,address_line_1,address_line_2,area_id,district_id,state_id,country_id,start_date,end_date) VALUES(:job_title,:description,:salary,:min_experience,:max_experience,:job_type,:shift,:company_name,:company_brief,:contact_person,:phone1,:phone2,:email,:website,:established,:business_id,:address_line_1,:address_line_2,:area_id,:district_id,:state_id,:country_id,:start_date,:end_date)";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_title", $data->job_title);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("salary", $data->salary);
        $stmt->bindParam("min_experience", $data->min_experience);
        $stmt->bindParam("max_experience", $data->max_experience);
        $stmt->bindParam("job_type", $data->job_type);
        $stmt->bindParam("shift", $data->shift);
        $stmt->bindParam("company_name", $data->company_name);
        $stmt->bindParam("company_brief", $data->company_brief);
        $stmt->bindParam("contact_person", $data->contact_person);
        $stmt->bindParam("phone1", $data->phone1);
        $stmt->bindParam("phone2", $data->phone2);
        $stmt->bindParam("email", $data->email);
        $stmt->bindParam("website", $data->website);
        $stmt->bindParam("established", $data->established);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("address_line_1", $data->address_line_1);
        $stmt->bindParam("address_line_2", $data->address_line_2);
        $stmt->bindParam("area_id", $data->area_id);
        $stmt->bindParam("district_id", $data->district_id);
        $stmt->bindParam("state_id", $data->state_id);
        $stmt->bindParam("country_id", $data->country_id);
        $stmt->bindParam("start_date", $data->start_date);
        $stmt->bindParam("end_date", $data->end_date);
        $stmt->execute();
        $data->job_id = $db->lastInsertId();
        $db = null;
        if(sizeof($data->industries))
            addJobIndustries($data->job_id,$data->industries);
        if(sizeof($data->designations))
            addJobDesignations($data->job_id,$data->designations);
        if(sizeof($data->tags))
            addJobTags($data->job_id,$data->tags);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateJob($id){
    $request = Slim::getInstance()->request();
    $data = json_decode($request->getBody());
    $sql = "INSERT INTO jobs (job_title,description,salary,min_experience,max_experience,job_type,shift,company_name,company_brief,contact_person,phone1,phone2,email,website,established,business_id,address_line_1,address_line_2,area_id,district_id,state_id,country_id,start_date,end_date) VALUES(:job_title,:description,:salary,:min_experience,:max_experience,:job_type,:shift,:company_name,:company_brief,:contact_person,:phone1,:phone2,:email,:website,:established,:business_id,:address_line_1,:address_line_2,:area_id,:district_id,:state_id,:country_id,:start_date,:end_date)";
    $sql = "UPDATE jobs SET job_title=:job_title, description=:description, salary=:salary, min_experience=:min_experience, max_experience=:max_experience, job_type=:job_type, shift=:shift, company_name=:company_name, company_brief=:company_brief, contact_person=:contact_person, phone1=:phone1, phone2=:phone2, email=:email, website=:website, established=:established, business_id=:business_id, address_line_1=:address_line_1, address_line_2=:address_line_2, area_id=:area_id, district_id=:district_id, state_id=:state_id, country_id=:country_id, start_date=:start_date, end_date=:end_date WHERE job_id=:job_id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_title", $data->job_title);
        $stmt->bindParam("description", $data->description);
        $stmt->bindParam("salary", $data->salary);
        $stmt->bindParam("min_experience", $data->min_experience);
        $stmt->bindParam("max_experience", $data->max_experience);
        $stmt->bindParam("job_type", $data->job_type);
        $stmt->bindParam("shift", $data->shift);
        $stmt->bindParam("company_name", $data->company_name);
        $stmt->bindParam("company_brief", $data->company_brief);
        $stmt->bindParam("contact_person", $data->contact_person);
        $stmt->bindParam("phone1", $data->phone1);
        $stmt->bindParam("phone2", $data->phone2);
        $stmt->bindParam("email", $data->email);
        $stmt->bindParam("website", $data->website);
        $stmt->bindParam("established", $data->established);
        $stmt->bindParam("business_id", $data->business_id);
        $stmt->bindParam("address_line_1", $data->address_line_1);
        $stmt->bindParam("address_line_2", $data->address_line_2);
        $stmt->bindParam("area_id", $data->area_id);
        $stmt->bindParam("district_id", $data->district_id);
        $stmt->bindParam("state_id", $data->state_id);
        $stmt->bindParam("country_id", $data->country_id);
        $stmt->bindParam("start_date", $data->start_date);
        $stmt->bindParam("end_date", $data->end_date);
        $stmt->bindParam("job_id", $id);
        $stmt->execute();
        $db = null;
        deleteJobIndustries($id);
        deleteJobDesignations($id);
        deleteJobTags($id);
        if(sizeof($data->industries))
            addJobIndustries($id,$data->industries);
        if(sizeof($data->designations))
            addJobDesignations($id,$data->designations);
        if(sizeof($data->tags))
            addJobTags($id,$data->tags);
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteJob($id){
    $sql="DELETE FROM jobs WHERE job_id=:job_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_id", $id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function addJobIndustries($job_id,$industry_ids){
    $value='';
    foreach($industry_ids as $industry_id){
        $value = $value."($job_id,$industry_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO jobs_x_industries (job_id,industry_id) VALUES".$value;
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
function getJobIndustries($job_id){
    $sql="SELECT job_industries.industry_id,job_industries.industry FROM job_industries INNER JOIN jobs_x_industries USING(industry_id) WHERE jobs_x_industries.job_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $job_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteJobIndustries($job_id){
    $sql="DELETE FROM jobs_x_industries WHERE job_id=:job_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_id", $job_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addJobDesignations($job_id,$designation_ids){
    $value='';
    foreach($designation_ids as $designation_id){
        $value = $value."($job_id,$designation_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO jobs_x_designations (job_id,designation_id) VALUES".$value;
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
function getJobDesignations($job_id){
    $sql="SELECT job_designations.designation_id,job_designations.designation FROM job_designations INNER JOIN jobs_x_designations USING(designation_id) WHERE jobs_x_designations.job_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $job_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteJobDesignations($job_id){
    $sql="DELETE FROM jobs_x_designations WHERE job_id=:job_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_id", $job_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function addJobTags($job_id,$tags){
    $value='';
    foreach($tags as $tag){
        //Get tag_id,  if tag not present add tag and get id
        $tag_id=0;
        $sql = "SELECT * FROM job_tags WHERE tag = :tag LIMIT 1";
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
            $sql = "INSERT INTO job_tags(tag) VALUES(:tag)";
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
        $value = $value."($job_id,$tag_id),";
    }
    if($value=='')
        return;
    $value = substr($value, 0, -1);
    $sql="INSERT INTO jobs_x_tags (job_id,tag_id) VALUES".$value;
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
function getJobTags($job_id){
    $sql="SELECT job_tags.tag_id,job_tags.tag FROM job_tags INNER JOIN jobs_x_tags USING(tag_id) WHERE jobs_x_tags.job_id=:id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $job_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        return $data;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
function deleteJobTags($job_id){
    $sql="DELETE FROM jobs_x_tags WHERE job_id=:job_id";
    try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("job_id", $job_id);
        $stmt->execute();
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}
//Industry

function getIndustries(){
	$sql = "SELECT * FROM job_industries";
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

function getIndustry($id){
	$sql = "SELECT * FROM job_industries WHERE industry_id = :id";
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

function addIndustry(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO job_industries (industry) VALUES(:industry)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("industry", $data->industry);
    	$stmt->execute();
        $data->industry_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateIndustry($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE job_industries SET industry=:industry WHERE industry_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("industry", $data->industry);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->industry_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteIndustry($id){
	$sql="DELETE FROM job_industries WHERE industry_id=:id";
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

//Designation

function getDesignations(){
	$condition = '';
    $app = new Slim();
    if($app->request()->params('industry_id')){
        $industry_ids = explode(",",$app->request()->params('industry_id'));
        if(sizeof($industry_ids) > 0){
            $condition = "  WHERE";
            foreach($industry_ids as $val){
                $condition = $condition." industry_id LIKE '$val' OR";
            }
            $condition = substr($condition, 0, -3);
        }
    }
	$sql = "SELECT * FROM job_designations".$condition;
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

function getDesignation($id){
	$sql = "SELECT * FROM job_designations WHERE designation_id = :id";
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

function addDesignation(){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "INSERT INTO job_designations (designation,industry_id) VALUES(:designation,:industry_id)";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("designation", $data->designation);
        $stmt->bindParam("industry_id", $data->industry_id);
    	$stmt->execute();
        $data->designation_id = $db->lastInsertId();
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateDesignation($id){
	$request = Slim::getInstance()->request();
	$data = json_decode($request->getBody());
	$sql = "UPDATE job_designations SET designation=:designation WHERE designation_id=:id";
	try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("designation", $data->designation);
        $stmt->bindParam("id", $id);
    	$stmt->execute();
        $data->industry_id = $id;
        $db = null;
        echo json_encode($data);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

}

function deleteDesignation($id){
	$sql="DELETE FROM job_designations WHERE designation_id=:id";
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
    $sql = "SELECT * FROM job_tags";
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
    $sql = "SELECT * FROM job_tags WHERE tag_id = :id";
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
    $sql = "INSERT INTO job_tags (tag) VALUES(:tag)";
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
    $sql = "UPDATE job_tags SET tag=:tag WHERE tag_id=:id";
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
    $sql="DELETE FROM job_tags WHERE tag_id=:id";
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