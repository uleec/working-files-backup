<?php
defined('BASEPATH') OR exit('No direct script access allowed');
// require_once('/libraries/Response.php');
class NetworkRoute extends CI_Controller {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper('array');
	}
	function fetch(){
		$query=$this->db->select('id,destnet,netmask,gateway')
																				    ->from('route_table')
																			    ->get()->result_array();

    $newArray=null;
    $keys = array(
      'id'=>'id',
      'destnet'=> 'targetAddress',
      'netmask'=>'targetMask',
      'gateway'=>'nextHopIp');


    if ($query !== null) {
      foreach($query as $key=>$val)
      {
        $newArray[$key] = array();
        foreach($val as $k=>$v)
        {
            $newArray[$key][$keys[$k]] = $v;
        }
      }
      $state=array(
        'code'=>2000,
        'msg'=>'OK'
      );

      $result=array(
        'state'=>$state,
        'data'=>array(
          'list'=>$newArray
        )
      );
    } else {
      $result=array(
        'state'=>$state,
        'data'=>array(
          'list'=>'[]'
        )
      );
    }

		return $result;
	}
	function onAction($data) {
        $result = null;                
        $actionType = element('action', $data);
        if ($actionType === 'add') {            
            $arr['destnet'] = element('targetAddress',$data);
            $arr['gateway'] = element('nextHopIp',$data);
            $arr['mask'] = element('targetMask',$data);            
            $request = acnetmg_add_route(json_encode($arr));
        } 
        return $result;
	}

	public function index() {
		$result = null;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$data = json_decode(file_get_contents("php://input"), true);
			$result = $this->onAction($data);
            echo $result;
		}
		elseif($_SERVER['REQUEST_METHOD'] == 'GET') {
			$result = $this->fetch();
            echo json_encode($result, true);
		}
	}
}
