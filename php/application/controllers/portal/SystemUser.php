<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class SystemUser extends CI_Controller {
	public function __construct() {
		parent::__construct();		
		$this->load->helper('array');
        $this->load->model('portal/SystemUser_Model');
	}
    public function index() {
		$result = null;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$data = json_decode(file_get_contents("php://input"), true);
			$result = $this->onAction($data);
			echo $result;
		} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
			$result = $this->fetch();
			echo $result;
		}
	}
	function fetch() {
		return $this->SystemUser_Model->get_list($_GET);
	}
	function onAction($data) {
		$result = null;
		$actionType = element('action', $data);
		switch($actionType) {
            case 'add' : $result = $this->SystemUser_Model->Add($data);
                break;
            case 'delete' : $result = $this->SystemUser_Model->Delete($data);
                break;
            case 'edit' : $result = $this->SystemUser_Model->Edit($data);
                break;
            default : $result = json_encode(array('state' => array('code' => 4000, 'msg' => 'No request action')));
                break;
        }
		return $result;
	}
	
}
