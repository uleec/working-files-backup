<?php
class SystemStatus_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
        $this->load->database();
        $this->load->helper('array');
	}
	public function get_ststemstatus() {
        $retda = array('cpuUsed'=>20,
                        'cpuTotal'=>100,
                        'memoryUsed'=>40,
                        'memoryTotal'=>100,
                        'storeUsed'=>24,
                        'storeTotal'=>100);
        $data = $this->get_used_status();
        $retda['cpuUsed'] = intval($data['cpu_usage']);
        $retda['memoryUsed'] = intval($data['mem_usage']);
        $retda['storeUsed'] = intval($data['store_usage']);

        $stateid = secure_system_info_get(json_encode(array()));

        $obj = json_decode($stateid);
        if(is_object($obj)){
          $objData = $obj->data;

          if(is_object($obj)) {
            foreach($objData as $key => $value) {
              $retda[$key] = $value;
            }
          }
        }
        //
        $version = file_get_contents('/etc/version');
        $version = str_replace('AXC1000_V1_TEST_','',trim($version,'\n'));
        $retda['version'] = str_replace("\n","",$version);
        //
        $runingtime = $this->sys_linux();
        if($runingtime) {
            $retda['running_time'] = $runingtime['uptime'];
        }
        //
        $retda['network_state'] = $this->get_network_state();
        //
        $retda['system_time'] = (string)exec('date "+%Y-%m-%d %H:%M:%S"');

        $arr['state'] = array('code'=>2000,'msg'=>'ok');
        $arr['data'] = $retda;
        return json_encode($arr);
	}
    public function get_used_status() {

        //$fp = popen('top -b -n 2 | grep -E "^(CPU|Mem|Tasks)"', "r"); //获取某一时刻系统cpu和内存使用情况
        $fp = popen('top -b -n 1 | grep -E "^(CPU|Mem)"', "r");
        /*
        Mem: 868004K used, 3049424K free, 234048K shrd, 552K buff, 675848K cached
        CPU:   0% usr   2% sys   0% nic  97% idle   0% io   0% irq   0% sirq
        */
        $rs = "";
        while (!feof($fp)) {
            $rs.= fread($fp, 1024);
        }
        pclose($fp);//关闭

        $sys_info = explode("\n", $rs);
        //$tast_info = explode(",", $sys_info[3]); //进程 数组
        $cpu_info = explode("   ", $sys_info[1]); //CPU占有量  数组  三个空格隔开的
        $mem_info = explode(", ", $sys_info[0]); //内存占有量 数组  内存是逗号隔开的
        //正在运行的进程数
        //$tast_running = trim(trim($tast_info[1], 'running'));
        //CPU占有量
        $cpu_usage = trim($cpu_info[1], '% usr'); //百分比

        //内存占有量
        $mem_total = trim(trim($mem_info[0],'Mem: '),'K used');//已使用的
        $mem_used = trim($mem_info[1],'K free');//自由的未使用的
        $memsum = intval($mem_total) + intval($mem_used);
        $mem_usage = round(100*intval($mem_total)/intval($memsum),2);  //百分比


        $fps = popen('df -k | grep -E "^(/)"',"r");//只计算挂载的
        $strStorage = fread($fps,1024);
        pclose($fps);

        $strStorage = preg_replace("/\s{2,}/",' ',$strStorage);  //把多个空格换成 “_”
        $hd = explode("\n",$strStorage);

        $total_storage = 0;
        $used_storage = 0;
        foreach($hd as $row){
            $sary = explode(" ",trim($row," "));
            if(isset($sary[1])){
                $total_storage = $total_storage + intval($sary[1]);
            }
            if(isset($sary[2])){
                $used_storage = $used_storage + intval($sary[2]);
            }
        }

        $store_usage = round(100 * intval($used_storage) / intval($total_storage),2);
        /*
        $hd_avail = trim($hd[3],'G'); //磁盘可用空间大小 单位G
        $hd_usage = trim($hd[4],'%'); //挂载点 百分比
        //print_r($hd);
        */
        return array('cpu_usage'=>$cpu_usage,'mem_usage'=>$mem_usage,'store_usage'=>$store_usage);
    }

    public function sys_linux(){
        if (false === ($str = @file("/proc/uptime"))) return false;
        $str = explode(" ", implode("", $str));
        $str = trim($str[0]);
        /*
        $min = $str / 60;
        $hours = $min / 60;
        $days = floor($hours / 24);
        $hours = floor($hours - ($days * 24));
        $min = floor($min - ($days * 60 * 24) - ($hours * 60));
        if ($days !== 0) $res['uptime'] = $days." Day ";
        if ($hours !== 0) $res['uptime'] .= $hours." Hour ";
        $res['uptime'] .= $min." Minute ";
        */
        $res['uptime'] = (int)$str;
        return$res;
    }

    public function get_network_state() {
        $arr = array();
        $arr['eth0'] = exec('ethtool eth0');
        $arr['eth1'] = exec('ethtool eth1');
        $arr['eth2'] = exec('ethtool eth2');
        $arr['eth3'] = exec('ethtool eth3');
        $arr['eth4'] = exec('ethtool eth4');
        $arr['eth5'] = exec('ethtool eth5');
        foreach($arr as $k=>$v) {
            $arr[$k] = trim(strstr($v,':'),': ');
        }
        return $arr;
    }
}
