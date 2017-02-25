<?php
class DpiEth_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
		$this->load->database();
		$this->load->helper(array('array', 'my_customfun_helper'));
	}
	function get_list($data) {
		$result = null;
        $cgiary = array(
            'time'=>(string)element('timeType',$data,0),
            'pagesize'=>'0'
        );
		$ary = array();
		for($i = 0; $i < 6; $i++){
			$str = "eth".$i;
			$ary[] = $this->gtePram($str);
		}
		$result = ndpi_send_allethx_allmsg_intime(json_encode($cgiary));
		$cgiary = json_decode($result,true);
		if(is_array($cgiary) && $cgiary['state']['code'] === 2000){
			for($i = 0; $i < 6; $i++){
				foreach($cgiary['data']['list'] as $row){
					if($ary[$i]['ethx_name'] === $row['ethx_name']){					                      
                        $curRate = ((int)$row['eth_bytes_pre'] - (int)$row['eth_bytes'])/(int)$row['interval_time'];//版本编好再打开
                        $tary['active_eth'] = "1";
                        $tary['ethx_name']=$row['ethx_name'];
                        $tary['userNum']= (string)$this->get_user_num($data,$row['ethx_name']);
                        $tary['application']= explode('/',$row['detected_protos']);
                        $tary['curRate']= (string)$curRate;

                        $ary[$i] = $tary;
					}
				}
			}
		}
        //获取网卡状态
		$ethstate = $this->get_eth_state();
		for($k = 0; $k < 6; $k++){
			foreach($ary as $res){
				if($ethstate[$k]['ifname'] === $res['ethx_name']){
					$ary[$k]['active_eth'] =(string)$ethstate[$k]['value'];
					break;
				}
			}

		}    
        //   
        $ethmac = $this->get_eth_allmac($data);     
		$retary = array(
			'state'=>array('code'=>2000,'msg'=>'ok'),
			'data'=>array(
                'page'=>$ethmac['page'],
				'list'=>$ary,
                'ethxClientList'=>$ethmac['data']
			)
		);      
		return json_encode($retary);        
	}
    //获取用户数
    function get_user_num($data,$eth){
        $result = 0;
        $cgiary = array(
            'time'=>(string)element('timeType',$data,0),
            'page'=>(string)element('page',$data,1),
            'pagesize'=>(string)element('size',$data,20),
            'ethx'=>$eth
        );        
        $cgistr = ndpi_send_ethx_allmac_intime(json_encode($cgiary));
        $obj = json_decode($cgistr);    
        if( is_object($obj) && $obj->state->code === 2000 ){
            $result = $obj->data->total_msg->list_recnum;
        }
        return $result;        
    }
	function gtePram($ethstr){
		$arr = array(
            'ethx_name'=>$ethstr,          
            'userNum'=>0,
            'application'=>'',
            'curRate'=>'',
            'active_eth'=>''
        );
		return $arr;
	}
	function get_eth_state(){
        $query=$this->db->select('attr_name,attr_value')
                        ->from('ndpi_attr')
                        ->join('ndpi_params','ndpi_params.attr_id = ndpi_attr.id')
                        ->get()->result_array();
        $interfaces  = array();
        foreach ($query as $v){
            $interfaces[$v['attr_name']]=$v['attr_value'];
        }
        $arr = array(
                array('ifname'=>'eth0','value'=>0),
                array('ifname'=>'eth1','value'=>0),
                array('ifname'=>'eth2','value'=>0),
                array('ifname'=>'eth3','value'=>0),
                array('ifname'=>'eth4','value'=>0),
                array('ifname'=>'eth5','value'=>0),
                array('ifname'=>'eth6','value'=>0)
            );
        foreach ($interfaces as $k=>$v ){
            for($i = 0; $i < 6; $i++){
                if($arr[$i]['ifname']==$interfaces[$k]){
                    $arr[$i]['value'] = 1;
                }
            }
        }
		return $arr;
	}
	function set_eth($data){
        $result = null;
		$state = (string)element('active_eth',$data);
		$arr = array('interface'=>$data['ethx_name']);
		if($state === "1"){
        	$result = ndpi_set_interface_to_config(json_encode($arr));
		}
		if($state === "0"){
			$result = ndpi_del_interface_from_config(json_encode($arr));
		}
        return $result;
    }
    private function get_eth_allmac($data){
        $result = array(
            'page'=>array(),
            'data'=>array()
        );
        $cgiarr = array(
            'time'=>(string)element('timeType',$data),
            'page'=>(string)element('page',$data),
            'pagesize'=>(string)element('size',$data),
            'ethx'=>(string)element('ethx',$data,'eth0'),            
        );
        $cgidata = ndpi_send_ethx_allmac_intime(json_encode($cgiarr));
        $dataary = json_decode($cgidata,true);
        if(is_array($dataary) && $dataary['state']['code'] === 2000){
            $arr['startline'] = 1;
            $arr['size'] = (int)element('size',$data,20);
            $arr['currPage'] = (int)element('page',$data,1);
            $arr['totalPage'] = element('sum_page',$dataary['data']['total_msg'],1);
            $arr['total'] = element('list_recnum',$dataary['data']['total_msg'],20);
            $arr['nextPage'] = (int)$data['page']+1;
            $arr['lastline'] = element('sum_page',$dataary['data']['total_msg'],1);

            $result['page'] = $arr;
            
            $macAry = array();
            foreach($dataary['data']['list'] as $row){
                $row['application'] =  explode('/',$row['detected_protos']);
                //$row['trafficPercent'] = 'test';
                $row['curRate'] = $this->get_ethbytes_mac($cgiarr,$row['mac']);
                $macAry[] = $row;
            }            
            $result['data'] = $macAry;
        }
        return $result;
    }
    //mac 获取速率
    private function get_ethbytes_mac($data,$mac){
        $result = 0;
        $cgiary = array(
            'time'=>element('time',$data),
            'page'=>element('page',$data),
            'pagesize'=>element('pagesize',$data),
            'mac'=>$mac
        );
        $cgistr = ndpi_send_search_one_mac_msg_to_php(json_encode($cgiary));
        $cgidata = json_decode($cgistr,true);
        if(is_array($cgidata) && $cgidata['state']['code'] === 2000){
            if(count($cgidata['data']['list']) > 0){
                $result = $cgidata['data']['list'][0]['mac_speed'];
            }
        }
        return $result;
    }
}
