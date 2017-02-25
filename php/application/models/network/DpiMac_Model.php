<?php
class DpiMac_Model extends CI_Model {
    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->helper(array('array', 'my_customfun_helper'));
    }
    function get_list($data) {
        $result = null;
        $cgiary = array(
            'time'=>(string)element('timeType',$data,'0'), 
            'page'=>(string)element('page',$data,'0'), 
            'pagesize'=>(string)element('size',$data,'20'),        
        );
        $mac = element('search',$data,'');
        $result = ndpi_send_allmac_allmsg_intime(json_encode($cgiary));
        $resAry = json_decode($result,true);
        $page_cfg = array();
        $listData = array();
        if(count($resAry) > 0 && $resAry['state']['code'] === 2000) {
            $page_cfg = array(
                'startline'=>1,
                'size'=>(int)element('size',$data,20),
                'currPage'=>(int)element('page',$data,0), 
                'totalPage'=>element('sum_pages',$resAry['data']['total_msg'],1),// 总页数
                'total'=>element('second_list_recnum',$resAry['data']['total_msg'],1),// 总行数 
                'nextPage'=> (int)$data['page']+1, 
                'lastline'=>element('sum_pages',$resAry['data']['total_msg'],1),// 最后一页
            );
            foreach($resAry['data']['list'] as $row){                
                //(upbytes+downbytes)/sum_bytes（total_msg里面的参数）
                $trafficPercent = ((int)$row['upbytes']+(int)$row['downbytes']) / (int)$resAry['data']['total_msg']['sum_pages'];
                $cary = array(
                    'name'=>'--',
                    'mac'=>element('mac',$row,''),
                    'ip'=>element('ip',$row,''),
                    'osType'=>element('osType',$row,''),
                    'traffic'=>element('upbytes',$row,''),//upbytes+downbytes
                    'application'=>explode('/',$row['detected_protos']),
                    'curRate'=>element('mac_speed',$row,100),
                    'trafficPercent'=>$trafficPercent
                );
                $listData[] = $cary;
            }
        }
        if($mac){
            foreach($listData as $row){
                 if(array_search($mac,$row)){
                     $listData = array($row);
                     break;
                 }
            }
        }
        $arr =  array(
            'state'=>array('code'=>2000,'msg'=>'ok'),
            'data'=>array(
                'page'=>$page_cfg,
                'list'=>$listData
            )
        );
        return json_encode($arr);
    }
}
