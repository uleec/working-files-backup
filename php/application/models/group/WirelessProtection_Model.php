<?php
class WirelessProtection_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper('array');				
	}
    public function get_terminalprotect_info($data) {
        $sqldata = $this->db->select('enable,attack_time,attack_cnt,age_time')
                            ->from('wids_template')
                            ->where('id',$data['groupid'])
                            ->get()->result_array();

        $pdata = array();                                    
        $pdata['widsenable'] = $sqldata[0]['enable'];
        $pdata['attacttime'] = $sqldata[0]['attack_time'];
        $pdata['attactcnt'] = $sqldata[0]['attack_cnt'];
        $pdata['dyaging'] = $sqldata[0]['age_time'];

        $arr['state'] = array("code"=>2000,"msg"=>"ok");
        $arr['data'] = array("settings"=>$pdata);
        return json_encode($arr);
    }
    public function set_terminalprotect_info($data) {
        $result = null;
        $arr['groupid'] = (int)element('groupid',$data,-1);
        $arr['widsenable'] = (int)element('widsenable',$data,-1);
        $arr['attacttime'] = (int)element('attacttime',$data,-1);
        $arr['attactcnt'] = (int)element('attactcnt',$data,-1);
        $arr['dyaging'] = (int)element('dyaging',$data,-1);
        $result = axc_set_wireless_dyblk(json_encode($arr));
        return $result;
    }
}