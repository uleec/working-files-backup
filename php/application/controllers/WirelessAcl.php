<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class WirelessAcl extends CI_Controller {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper('array');
	}
	function fetch(){
    $retdata = array(
      'groupid'=>(int)element('groupid', $_GET,-1),
    );
    $result=axc_get_wireless_acl(json_encode($retdata));
    $result=json_decode($result);
    $dyblk=$this->db->select('id,attack_time,attack_cnt,age_time')
              ->from('wids_template')
              ->where('id',$retdata['groupid'])
              ->get()->result_array();
  		$keys = array(
      'id'=>'groupid',
      'attack_time'=> 'attacttime',
      'attack_cnt'=>'attactcnt',
      'age_time'=>'dyaging'
    );
    $dyblk_data = array();
    foreach($dyblk as $key=>$val) {
     $dyblk_data[$key] = array();
      foreach($val as $k=>$v) {
        $dyblk_data[$key][$keys[$k]] = $v;
      }
    }
    $result->data->settings=$dyblk_data['0'];
    return json_encode($result);
  }

	function onAction($data) {
		$result = null;
		$actionType = element('action', $data);
		if ($actionType === 'add') {
      $result=axc_set_wireless_acl(json_encode($data));
		}
		elseif($actionType === 'edit') {
      $result=axc_set_wireless_acl(json_encode($data));
		}
    elseif($actionType === 'delete'){
      $temp_data=array(
        'groupid'=>element('groupid', $data),
        'mac'=>element('selectedList',$data)
      );
       $result=axc_del_wireless_acl(json_encode($temp_data));
    }
    elseif($actionType === 'setting'){
      $result = axc_set_wireless_dyblk(json_encode($data));
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
		else if($_SERVER['REQUEST_METHOD'] == 'GET') {

			$result = $this->fetch();
      echo $result;
		}
	}
}
