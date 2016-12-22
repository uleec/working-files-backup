<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class SystemModel extends CI_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->load->database();
        $this->load->helper(array('array', 'my_customfun_helper'));
        $this->load->library('SqlPage');
    }
    function fetch(){
        $sqlpage = new SqlPage();
        $columns = 'id,name,radio_num as radionum,vender';
        $tablenames = 'ap_model';
        $pageindex = (int)element('page', $_GET, 1);
        $pagesize = (int)element('size', $_GET, 20);
        $datalist = $sqlpage->sql_data_page($columns,$tablenames,$pageindex,$pagesize);
        $page=array(
            "start"=>(int) element('start',$_GET,1),
            "size"=> (int)element('size',$_GET,20),
            "currPage"=>(int)element('currPage',$_GET,1),
            "totalPage"=>(int)element('totalPage',$_GET,1),
            "total"=>(int)element('total_row',$datalist,20),
            "pageCount"=>(int)element('total_page',$datalist,11),
            "nextPage"=>(int)element('nextPage',$_GET,-1),
            "lastPage"=>(int)element('lastPage',$_GET,1)
        );
        $result['state'] = array('code' => 2000, 'msg' => 'ok');
        $result['data'] = array(
            'page' => $page,
            'list' => $datalist['data']
        );
        return $result;
    }
    
    function onAction($data) {
        $result = null;
        $actionType = element('action', $data);
        $selectList = element('selectedList', $data);
        if ($actionType === 'add') {
            $temp_data = $this->getCgiParam($data);
            $result = axc_add_apmodel(json_encode($temp_data));
            //log
            $cgiObj = json_decode($result);			
            if( is_object($cgiObj) && $cgiObj->state->code === 2000) {     
                $logary = array(
                    'type'=>'Add',
                    'operator'=>element('username',$_SESSION,''),
                    'operationCommand'=>"Add ApModel ".$temp_data['name'],
                    'operationResult'=>'ok',
                    'description'=>""
                );
                Log_Record($this->db,$logary);
            }
        } elseif ($actionType === 'edit') {
            $temp_data = $this->getCgiParam($data);
            $result = axc_modify_apmodel(json_encode($temp_data));
            //log
            $cgiObj = json_decode($result);			
            if( is_object($cgiObj) && $cgiObj->state->code === 2000) {     
                $logary = array(
                    'type'=>'Update',
                    'operator'=>element('username',$_SESSION,''),
                    'operationCommand'=>"Update ApModel ".$temp_data['name'],
                    'operationResult'=>'ok',
                    'description'=>json_encode($temp_data)
                );
                Log_Record($this->db,$logary);
            }
        } elseif ($actionType === 'delete') {
            foreach ($selectList as $item) {
                $deleteItem = array('name' => element('name', $item));
                $result = axc_del_apmodel(json_encode($deleteItem));
                //log
                $cgiObj = json_decode($result);			
                if( is_object($cgiObj) && $cgiObj->state->code === 2000) {     
                    $logary = array(
                        'type'=>'Delete',
                        'operator'=>element('username',$_SESSION,''),
                        'operationCommand'=>"Delete ApModel ".$deleteItem['name'],
                        'operationResult'=>'ok',
                        'description'=>""
                    );
                    Log_Record($this->db,$logary);
                }
            }
        }
        return $result;
    }
    public function index() {
        $result = null;
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $result = $this->onAction($data);
            echo $result;
        } else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $result = $this->fetch();
            echo json_encode($result);
        }
    }
    function getCgiParam($oriData) {
        $retData = array(
            'name'=>element('name', $oriData),
            'hardware'=>element('hardware', $oriData,''),
            'radionum'=>(int)element('radionum', $oriData),
            'vendor'=>(int)element('vendor', $oriData),
        );
        return $retData;
    }
}
