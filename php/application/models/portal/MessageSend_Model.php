<?php
class MessageSend_Model extends CI_Model {
    public function __construct() {
        parent::__construct();
        $this->load->library('session');
        $this->portalsql = $this->load->database('mysqlportal', TRUE);
        $this->load->helper(array('array', 'my_customfun_helper'));
    }
    function get_list($data) {
        $columns = '*';
        $tablenames = 'portal_message';
        $pageindex = (int)element('page', $data, 1);
        $pagesize = (int)element('size', $data, 20);
        $order = array(array('id','DESC'));	
        $where = array(array('fromname','admin'));
        $datalist = help_data_page_order($this->portalsql,$columns,$tablenames,$pageindex,$pagesize,$order,$where);
        $arr = array(
            'state'=>array('code'=>2000,'msg'=>'ok'),
            'data'=>array(
                'page'=>$datalist['page'],
                'list' => $datalist['data']
            )
        );
        return json_encode($arr);
    }

    function getPram($data){  
        $toid = 0;
        $toname = element('toname',$data,0);
        if($toname){
            $query = $this->portalsql->query("select id from portal_account where loginName='".$toname."'");
            $row = $query->row();
            $toid = (int)$row->id;            
        }
        $arr = array(            
            'title' => element('title',$data,''),// 标题
            'description' => element('description',$data,''),// 内容
            'date' => (string)exec('date "+%Y-%m-%d %H-%M-%S"'),// 当前时间
            'state' => 0,// 消息的状态，0-未读，1-已读
            'ip' => $_SERVER['SERVER_ADDR'],// 发送者ip
            'fromPos' => 0,// 发送者类型
            'fromid' => 1,// 发送者id 暂且默认写admin ID
            'fromname' => 'admin',// 发送者名称            
            'toid' => $toid,//element('toId',$data,''),//接收者id
            'toPos' => 1,// 接收者类型，0-系统用户，1-接入用户
            'toname' => element('toname',$data,''),// 接收者名称            
            'delin' => 0,// 默认值0，值为1表示在收件箱中删除了此条记录
            'delout' => 0,// 默认值0，值为1表示在发件箱中删除了此条记录                    
        );
        return $arr;
    }
    function Add($data) {
        $result = FALSE;
        $insertary = $this->getPram($data);
        $result = $this->portalsql->insert('portal_message', $insertary);
        $result ? $result = json_ok() : $result = json_no('insert error');
        return json_encode($result);
    }
    function Delete($data) {
        $result = FALSE;
        $dellist = $data['selectedList'];
        foreach($dellist as $row) {
            $this->portalsql->where('id', $row['id']);
            $result = $this->portalsql->delete('portal_message');
        }
        $result = $result ? json_ok() : json_no('delete error');
        return json_encode($result);
    }
    function Edit($data) {
        $result = null;
        $updata = $this->getPram($data);
        $updata ['id'] = element('id',$updata);
        $result = $this->portalsql->replace('portal_message',$updata,array('id'=>$updata['id']));
        $result ? $result = json_ok() : $result = json_no('update error');
        return json_encode($result);
    }
    function SendMessage($data){
        $result = FALSE;
        $toid = 0;
        $toname = element('toname',$data);
        if($toname != ""){
            $query = $this->portalsql->query("select id,loginName from portal_account where loginName='".$toname."'");
            $row = $query->row();
            $toid = $row->id;                        
        }
        $insertary = array(
            'title' => element('title',$data,''),// 标题
            'description' => element('description',$data,''),// 内容
            'date' => (string)exec('date "+%Y-%m-%d %H-%M-%S"'),// 当前时间
            'state' => 0,// 消息的状态，0-未读，1-已读
            'ip' => $_SERVER['SERVER_ADDR'],// 发送者ip
            'fromPos' => 0,// 发送者类型
            'fromid' => 1,// 发送者id 暂且默认写admin ID
            'fromname' => 'admin',// 发送者名称            
            'toid' => $toid,//接收者id
            'toPos' => 1,// 接收者类型，0-系统用户，1-接入用户
            'toname' => $toname,// 接收者名称            
            'delin' => 0,// 默认值0，值为1表示在收件箱中删除了此条记录
            'delout' => 0,// 默认值0，值为1表示在发件箱中删除了此条记录                    
        );
        $result = $this->portalsql->insert('portal_message', $insertary);
        $result ? $result = json_ok() : $result = json_no('sendMessage error');
        return json_encode($result);    
    }
}
