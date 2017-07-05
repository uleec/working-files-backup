<?php
class AccessWeixin_Model extends CI_Model {
    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->portalsql = $this->load->database('mysqlportal', TRUE);
        $this->load->helper(array('array', 'db_operation'));        
    }
    function get_list($data) {
        $parameter = array(
            'db' => $this->portalsql, 
            'columns' => 'portal_weixin_wifi.id,portal_weixin_wifi.basip,portal_weixin_wifi.ssid,portal_weixin_wifi.shopId,portal_weixin_wifi.appId,portal_weixin_wifi.secretKey,portal_weixin_wifi.domain,portal_weixin_wifi.outTime', 
            'tablenames' => 'portal_weixin_wifi', 
            'pageindex' => (int) element('page', $data, 1), 
            'pagesize' => (int) element('size', $data, 20), 
            'wheres' => "1=1", 
            'joins' => array(), 
            'order' => array()
        );
        if(isset($data['search'])){
            $parameter['wheres'] = $parameter['wheres'] . " AND basip LIKE '%".$data['search']."%' or ssid Like '%".$data['search']."%'";
        }
        $datalist = help_data_page_all($parameter);
        $arr = array(
            'state'=>array('code'=>2000,'msg'=>'ok'),
            'data'=>array(
                'page'=>$datalist['page'],
                'list' => $datalist['data']
            )
        );
        return json_encode($arr);
    }

    function Add($data) {
        $result = FALSE;
        $insertary = $this->getPram($data);
        $result = $this->portalsql->insert('portal_weixin_wifi', $insertary);
        $result ? $result = json_ok() : $result = json_no('insert error');
        return json_encode($result);
    }
    function Delete($data) {
        $result = FALSE;
        $dellist = $data['selectedList'];
        foreach($dellist as $row) {
            $this->portalsql->where('id', $row['id']);
            $result = $this->portalsql->delete('portal_weixin_wifi');
        }
        $result = $result ? json_ok() : json_no('delete error');
        return json_encode($result);
    }
    function Edit($data) {
        //上传
        $upload_data = $this->uploadWxImg('qrcode');
        if($upload_data['state']['code']==2000){
            $updata = $this->getPram($data);
            $updata ['id'] = element('id',$updata);
            $result = $this->portalsql->replace('portal_weixin_wifi',$updata,array('id'=>$updata['id']));
            if($result){
                return json_encode(json_ok());
            }
        }else{
            return json_encode(json_no($this->upload->display_errors()));
        }        
        return json_encode(json_no('update error'));
    }

    private function getPram($data){   
        if(!isset($data['basip'])){
            $data['basip'] = $this->getInterface();
        }    
        $default_domain = $this->portalsql->select('domain')
                                ->from('config')
                                ->get()->result_array();
        $default_outTime = $this->portalsql->select('outTime')
                        ->from('portal_weixin_wifi')
                        ->where('id=1')
                        ->get()->result_array();
        $arr = array(
            'id'=> element('id',$data),
            'basip' => element('basip',$data, ''),
            'ssid' => element('ssid',$data),
            'shopId' => element('shopId',$data),
            'appId' => element('appId',$data),
            'secretKey' => element('secretKey',$data),
            //'domain' => element('domain',$data,$default_domain['0']['domain']),
            'domain' => 'http://'.$data['basip'].':8080',
            'outTime' => element('outTime',$data,$default_outTime['0']['outTime'])
        );        
        return $arr;
    }

    private function getInterface() {
        $data = $this->db->select('port_name,ip1')
                ->from('port_table')
                ->get()
                ->result_array();
        if( count($data) >0 ){
            return $data[0]['ip1'];
        }
        return  $_SERVER['SERVER_ADDR'];
    }
    private function uploadWxImg($upload_name) {
        $config['upload_path'] = '/usr/web/apache-tomcat-7.0.73/project/AxilspotPortal/weixin';
        $config['overwrite'] = true;
        $config['max_size'] = 0;
        $config['allowed_types'] = 'gif|png|jpg|jpeg';
        $config['file_name'] = 'logo.jpg';
        $this->load->library('upload'); //重点
        $this->upload->initialize($config); // 重点
        if (!$this->upload->do_upload($upload_name)) {
            $error = array(
                'error' => $this->upload->display_errors()
            );
            $result = array(
                'state' => array('code' => 4000, 'msg' => $error)
            );
        } else {
            $data = array(
                'upload_data' => $this->upload->data()
            );
            $result = array(
                'state' => array('code' => 2000, 'msg' => 'OK'), 
                'data' => $data
            );
        }
        return $result;
    }
}
