<?php
class Log_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
        $this->load->database();
        $this->load->helper(array('array', 'my_customfun_helper'));
		$this->load->library('SqlPage');
	}
	public function get_log_list($data) {
		$sqlpage = new SqlPage();
		$columns = 'id,time,type,operator,operationCommand,operationResult,description';
		$tablenames = 'web_log';
		$pageindex = (int)element('page', $data, 1);
		$pagesize = (int)element('size', $data, 20);
		$datalist = help_data_page_order($this->db, $columns,$tablenames,$pageindex,$pagesize, array(
      array('time', 'DESC')
    ));

		$arr['state'] = array('code' => 2000, 'msg' => 'OK');
		$arr['data'] = array(
            'settings' => array(),
            'page' => array(
				'start' => 1,
				'size' => $pagesize,
				'currPage' => $pageindex,
				'totalPage' => $datalist['total_page'],
				'total' => $datalist['total_row'],
				'nextPage' => ($pageindex + 1) === $datalist['total_page'] ? ($pageindex + 1) : -1,
				'lastPage' => $datalist['total_page']
			),
            'list' => $datalist['data']
		);
		return json_encode($arr);
	}
	public function log_delete($data) {
		$result = null;
		if(count($data['selectedList']) > 0){
			foreach($data['selectedList'] as $res) {
				$this->db->where('id', $res);
				$result = $this->db->delete('web_log');
			}
		}
		$result = json_ok();
		return json_encode($result);
	}
}
