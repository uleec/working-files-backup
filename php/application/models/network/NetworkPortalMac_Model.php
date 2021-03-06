<?php
class NetworkPortalMac_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper(array('array', 'my_customfun_helper'));
	}
    function get_portal_white_list($data){
        $columns = 'blackwhite_list.*,portal_auth.portal_name';
        $tablenames = 'blackwhite_list';
        $pageindex = (int)element('page', $data, 1);
        $pagesize = (int)element('size', $data, 20);
        $where = array();
        $joins = array(array('portal_auth','blackwhite_list.portal_id = portal_auth.id','left'));
        $datalist = help_data_page($this->db,$columns,$tablenames,$pageindex,$pagesize,$where,$joins);
        $arr = array();
        if(count($datalist['data']) > 0) {
            $index = 0;
            foreach ($datalist['data'] as $row) {
                $witeary = $this->get_white_info($row['id']);
                $index++;
                $witeary['index'] = $index;
                $arr[] = $witeary;
            }
        }
        $ret = array(
            'state'=>array('code'=>2000,'msg'=>'ok'),
            'data'=>array(
                'page'=>$datalist['page'],
                'list'=>$arr
            )
        );
		return json_encode($ret);
    }
    function add_portal_wite($data){
        $result = null;
        $res = $this->is_add_sum($data['src_mac']);       
        if( $res['totalsum'] < 513 && $res['ismac'] === 0){
            $arr = array(
                'template_name'=> 'ethx_all',//$this->get_portal_tmpname($data['interface_bind']),
                'if_name'=>'ethx_all',//(string)$data['interface_bind'],
                'src_mac'=>(string)$data['src_mac']
            );
            $result = portal_add_template_whitelist(json_encode($arr));
        }else{
            $result = json_encode(array('state'=>array('code'=>6112,'msg'=>'Has the largest')));
        }
        return $result;
    }
    function del_portal_wite($data) {
        $arr = array();    
        $idary = $data['selectedList'];                 
        foreach($idary as $row) {    
            $lsary = $this->delete_portal_white($row['id']);
            if(is_array($lsary)){           
                $arr[] = $lsary; 
            }
        }
        $cgiary = array('white_list'=>$arr);                          
        $result = portal_del_template_whitelist(json_encode($cgiary));
        return $result;
    }
    function get_white_info($id) {        
        $query = $this->db->select('blackwhite_params.attr_value,blackwhite_attr.attr_name')
                        ->from('blackwhite_params')
                        ->join('blackwhite_attr','blackwhite_params.attr_id=blackwhite_attr.id','left')
                        ->where('blackwhite_params.blackwhite_id',$id)
                        ->get()->result_array();
        $arr = array();
        if(count($query) > 0 ) {
            $arr['id'] = $id;
            foreach($query as $row ) {                
                if( $row['attr_name'] === 'if_name') {
                    $arr['interface_bind'] = $row['attr_value'];
                }
                if( $row['attr_name'] === 'src_mac') {
                    $arr['src_mac'] = $row['attr_value'];
                }                
            }
        }  
        return $arr;                      
    }
    function get_portal_tmpname($v){
        $result = '';
        $querydata = $this->db->select('portal_auth.portal_name')
                            ->from('portalserver_params')
                            ->join('portal_server','portalserver_params.portalserver_id=portal_server.id','left')
                            ->join('portal_auth','portal_server.portal_id = portal_auth.id','left')
                            ->where('portalserver_params.attr_value',$v)
                            ->get()
                            ->result_array();
        if(count($querydata) > 0) {
            $result = $querydata[0]['portal_name'];
        }
        return $result;
    }
    function delete_portal_white($id){
        $result = null;
        $query = $this->db->select('blackwhite_list.rule_id,portal_auth.portal_name')
                            ->from('blackwhite_list')
                            ->join('portal_auth','blackwhite_list.portal_id=portal_auth.id','left')
                            ->where('blackwhite_list.id',$id)
                            ->get()->result_array();
        if( count($query) > 0) {
            $result['template_name'] = $query[0]['portal_name'];
            $result['rule_id'] = (string)$query[0]['rule_id'];            
        }
        return $result;
    }
    private function is_add_sum($mac){ 
        $totalsum = 0;
        $ismac = 0;  
        $query = $this->db->query("select * from blackwhite_params")->result_array();
        foreach($query as $row){
            if($row['attr_id'] === 6){//6代表mac
                //计算mac 数量
                $totalsum = $totalsum + 1;
                if($row['attr_value'] === $mac){
                    //判断是否存在某个mac
                    $ismac = 1;
                }
            }
        }
        return array('totalsum'=>$totalsum,'ismac'=>$ismac);
    }
}