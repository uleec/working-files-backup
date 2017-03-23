<?php
class MapOrbit_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
        $this->load->database();
		$this->mysql = $this->load->database('mysqli', TRUE);        
		$this->load->helper(array('array', 'my_customfun_helper'));
	}
	function get_list($data) { 
        $list = array();
        $macList = array();
                    
        $build_id = $data['curMapId'];//区域id
        $groupid = $data['groupid'];
        $sta_mac = $data['mac'];    
        $strtime = $data['date'].' '.$data['fromTime'];
        $endtime = $data['date'].' '.$data['toTime'];
        //得到区域中所有Ap (同一张图中的Ap)
        $apmac_list = $this->get_ap_mac($build_id);
        //1.$apmac_list[] = array('ap_mac'=>'14:c1:ff:b0:00:3e');
        foreach($apmac_list as $row){
            //1.1得到某Ap下所有终端
            $macList = array_merge($macList, $this->get_mac($groupid,$row['ap_mac'])); 
        }
        //2.通过终端mac 查询数据    
        //call active_orbit_func(3,'68:c9:7b:cd:a3:da','2017-03-21 21:00:30','2017-03-22 20:00:00');   
        if( ($sta_mac === "" || $sta_mac === null) && count($macList) > 0) {
            $sta_mac = $macList[0];
        }
        if($sta_mac){            
            $sql = "call active_orbit_func({$groupid},'{$sta_mac}','{$strtime}','{$endtime}')";            
            $queryd = $this->mysql->query($sql);        
            foreach($apmac_list as $rows){
                foreach($queryd->result_array() as $row) {
                    if($row['ApMac'] === $rows['ap_mac']){
                        $list[] = array(
                            'lat'=>$row['Lat'],
                            'lng'=>$row['Lon'],
                            'time'=>$row['m_timestamp'],
                        );
                    }
                }                               
            }            
        }        
        $arr = array(
            'state'=>array('code'=>2000,'msg'=>'ok'),
            'data'=>array(
                'macList'=>$macList,
                'list'=>$list
            )   
        );
        return json_encode($arr);
	}
    //获取分组下所有终端mac地址
    function get_mac($groupid,$apmac){        
        $sql = "select ApMac,StaMac from (select * from sta_flow_sample group by StaMac) as t1 where ApGroupId=".$groupid." and ApMac='".$apmac."'";
        $query = $this->mysql->query($sql);

        $ary = array();
        foreach($query->result_array() as $row){
            array_push($ary,$row['StaMac']);
        }
        
        return $ary;
    }  

    //用内部平面图查找该 图中所有AP mac
    private function get_ap_mac($build_id){
        $result = array();
        $query = $this->db->query("select ap_mac from ap_map where build_id=".$build_id);

        $result = $query->result_array();
        return $result;        
    }
}