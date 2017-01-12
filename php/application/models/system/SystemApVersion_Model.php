<?php
class SystemApVersion_Model extends CI_Model {
	public function __construct() {
		parent::__construct();
		$this->load->library('session');
		$this->load->database();
		$this->load->helper(array('array', 'my_customfun_helper'));
	}
	function get_apversion_list() {
		$result = null;
		$query=$this->db->select('id,model,subversion,fm_name,upd_path,active')
		                        ->from('ap_firmware')
		                        ->get()->result_array();
		$keys = array(
		            'id'=>'id',
		            'model'=> 'model',
		            'subversion'=>'softVersion',
		            'fm_name'=>'fileName',
		            'upd_path'=>'uploadPath',
		            'active'=>'active'
		        );
		$newArray = array();
		foreach($query as $key=>$val) {
			$newArray[$key] = array();
			foreach($val as $k=>$v) {
				$newArray[$key][$keys[$k]] = $v;
			}
		}
		$page=array(
		            "start"=>(int) element('start',$_GET,1),
		            "size"=> (int)element('size',$_GET,20),
		            "currPage"=>(int)element('currPage',$_GET,1),
		            "totalPage"=>(int)element('totalPage',$_GET,1),
		            "total"=>(int)element('total',$_GET,11),
		            "pageCount"=>(int)element('pageCount',$_GET,11),
		            "nextPage"=>(int)element('nextPage',$_GET,-1),
		            "lastPage"=>(int)element('lastPage',$_GET,1)
		        );
		$result=array(
		            'state'=>array('code'=>2000,'msg'=>'OK'),
		            'data'=>array(
		                'page'=>$page,
		                'list'=>$newArray
		                )
		        );
		return $result;
	}
	function do_upload(){
		$config['upload_path'] = '/etc/Ap_ver';
		$config['overwrite']=true;
		$config['max_size'] = 0;
		$config['allowed_types'] = '*';

		$this->load->library('upload', $config);
		if (!$this->upload->do_upload('versionFile')) {
			$error = array('error' => $this->upload->display_errors());
			$result = array(
			                'state'=>array(
			                    'code'=>4000,
			                    'msg'=>$error
			                )
			            );
		}
		else {
			$data = array('upload_data' => $this->upload->data());
			$result = array(
			                'state'=>array(
			                    'code'=>2000,
			                    'msg'=>'OK'
			                ),
			                'data'=>$data
			            );
		}
		return $result;
	}

	function add_apversion($data) {
		$result = null;
		$upload_data=$this->do_upload();
		if($upload_data['state']['code']==2000){
			$filename=$this->upload->data('file_name');
			$filepath=$this->upload->data('full_path');
			$retData = array(
			                'vendor'=>element('vendor',$data, 48208),
			                'model'=>element('model', $data),
			                'sfver'=>element('softVersion', $data),
			                'fmname'=>$filename,
			                'filepath'=>$filepath,
			                'active'=>(int)element('active', $data,0)
			            );

			$result = axc_add_apfirmware(json_encode($retData ));
			//l			og
			            $cgiObj = json_decode($result);
			if( is_object($cgiObj) && $cgiObj->state->code === 2000) {
				$logary = array(
				                    'type'=>'Add',
				                    'operator'=>element('username',$_SESSION,''),
				                    'operationCommand'=>"Add AP Version ".$retData['vendor'],
				                    'operationResult'=>'ok',
				                    'description'=>""
				                );
				Log_Record($this->db,$logary);
			}

		}
		return $result;
	}

	function up_apversion($data) {
		$result = null;
		$upload_data=$this->do_upload();
		if($upload_data['state']['code']==2000){
			$filename=$this->upload->data('file_name');
			$filepath=$this->upload->data('full_path');
			$retData = array(
			                'vendor'=>element('vendor',$data, 48208),
			                'model'=>element('model', $data,''),
			                'sfver'=>element('softVersion', $data,''),
			                'fmname'=>$filename,
			                'filepath'=>$filepath,
			                'active'=>(int)element('active', $data,0)
			            );
		}
		$result=axc_modify_apfirmware(json_encode($retData));
		//l		og
		        $cgiObj = json_decode($result);
		if( is_object($cgiObj) && $cgiObj->state->code === 2000) {
			$logary = array(
			                'type'=>'Update',
			                'operator'=>element('username',$_SESSION,''),
			                'operationCommand'=>"Update AP Version ".$retData['vendor'],
			                'operationResult'=>'ok',
			                'description'=>""
			            );
			Log_Record($this->db,$logary);
		}
		return $result;
	}

	function del_apversion($selectList) {
		$result = null;
		foreach($selectList as $item) {
			$deleteItem = array(
			              'model'=>element('model', $item),
			              'sfver'=>element('softVersion', $item),
			          );
			$result=axc_del_apfirmware(json_encode($deleteItem));
		}
		return $result;
	}

	function active_apversion($data) {
		$result = null;
		$retData = array(
		            'vendor'=>element('vendor',$data, 48208),
		            'model'=>element('model', $data),
		            'sfver'=>element('softVersion', $data),
		            'fmname'=>element('fileName', $data),
		            'filepath'=>element('uploadPath', $data),
		            'active'=>(int)element('active', $data,0)
		        );
		$result=axc_active_apfirmware(json_encode($retData));
		return $result;
	}
}