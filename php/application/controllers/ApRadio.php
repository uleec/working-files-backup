<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ApRadio extends CI_Controller {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper('array');
	}
	function fetch(){
      $retdata = array(
        'groupid'=>(int)element('groupid', $_GET,-1),
        'mac'=>element('mac',$_GET)
      );
      $temp_result=axc_get_apradio(json_encode($retdata));
      $temp_result_array=json_decode($temp_result,true);
      $result=array(
        'state'=>$temp_result_array['state'],
         'data'=>array(
            'groupid'=>(int)element('groupid', $_GET,-1),
            'mac'=>element('mac',$_GET),
            'radio'=>element('data',$temp_result_array)
         )
      );
       echo json_encode($result);

  }
	function onAction($data) {
   	$result = null;
    $result=axc_set_apradio(json_encode($data));
    return $result;
	}
	public function Radio() {
		$result = null;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$data = json_decode(file_get_contents("php://input"), true);
			$result = $this->onAction($data);
      echo $result;
		}
		else if($_SERVER['REQUEST_METHOD'] == 'GET') {
			$result = $this->fetch();
      echo json_encode($result);
		}
		}

  // public function Base() {
	// 	$result = null;
	// 	if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	// 		$data = json_decode(file_get_contents("php://input"), true);
	// 		$result = $this->onAction($data);
  //     echo $result;
	// 	}
	// 	else if($_SERVER['REQUEST_METHOD'] == 'GET') {
	// 		$result = $this->fetch();
  //     echo json_encode($result);
	// 	}
	// 	}
}
