<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class NetworkRoute extends CI_Controller {
	public function __construct() {
		parent::__construct();
		$this->load->helper('array');
		$this->load->model('network/NetworkRoute_Model');
	}
	function fetch() {
		$result = $this->NetworkRoute_Model->get_list($_GET);
		return $result;
	}
	function onAction($data) {
		$result = null;
		$actionType = element('action', $data);
        switch($actionType) {
            case 'add' : $result = $this->NetworkRoute_Model->add($data);
                break;
            case 'delete' : $result = $this->NetworkRoute_Model->delete($data);
                break;
            case 'edit' : $result = $this->NetworkRoute_Model->edit($data);
                break;
            default : $result = json_encode(array('state' => array('code' => 4000, 'msg' => 'No request action')));
                break;
        }
		return $result;
	}
	public function index() {
		$result = null;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$data = json_decode(file_get_contents("php://input"), true);
			$result = $this->onAction($data);
			echo $result;
		} elseif ($_SERVER['REQUEST_METHOD'] == 'GET') {
			$result = $this->fetch();
			echo json_encode($result, true);
		}
	}
}
