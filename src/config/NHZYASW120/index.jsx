import 'shared/scss/styles.scss';
import utils from 'shared/utils';
import baseConf from '../baseConf/baseConfAp';
import guiConfig from './config.json';

window.guiConfig = guiConfig;
// 新的页面，需要替换基本配置中的'modechange'页面
const sModeSettings = require('../../screens/MainAP/screens/ModeSettings/CloudService');
const sWizard = require('../../screens/MainAP/Wizard/indexForNHZY');

// 页面功能项配置
const funConfig = {
  // 覆盖型产品快速设置
  quicksetup: {
    router: false, // 是否有router模式
  },
  // 网络设置
  networksettings: {
    router: false, // 是否有router模式
    hasVlan: true,
    hasMngVlanId: false, // 是否有管理VLAN ID的填写框
    hasUntagVlanId: false, // 是否有untag VLAN ID填写框
    hasPortListTable: true, // 是否有接口VLAN配置的列表显示
    hasVlanInputByTable: false, // 通过后台传递过来的列表显示VLAN输入框，目前是ASW3特有的。
  },
  // 无线设置页面
  basic: {
    devicemodeOptions: [
      { value: 'ap', label: __('AP') },
      // { value: 'sta', label: __('Station') },
      // { value: 'repeater', label: __('Repeater') },
    ],
    radioMaxClientsLimit: false, // 射频最大客户端限制
    // 功能项参见WirelessConfig -> Basic页面下的ssidTableFullMemberOptions变量
    ssidTableKeys: [
      'enable',
      'ssid',
      'vlanId',
      'hideSsid',
      'isolation',
      'security',
      'delete',
      'maxClients',
      // 'speedLimit',
      // 'portalEnable',         // portal功能开关
      // 'airTimeEnable',  // 时间公平性
    ],
    portalFun: true,
  },
  advance: {
    ledThreshFun: false, // 信号强度控制LED灯功能
    beaconIntervalFun: true, // Beacon帧间间隔
    distanceFun: false, // 距离调整拖动条
    dtimIntervalFun: true, // DTIM间隔
    segmentThreshFun: true, // 分片阈值
    ampduFun: true, // ampdu值
    rateSetFun: true, // 速率集
    rssiLimitFun: true, // rssi限制
    airTimeFairnessFun: true, // 时间公平性
  },
  systemmaintenance: {
    poeOutFun: false,
    voipFun: false,
  },
};
const reducers = baseConf.reducers;
const newObjToMerge = {
  id: 'modesettings',
  icon: 'cloud',
  text: __('Cloud Service'),
  routes: [
    {
      id: 'cloudservice',
      path: '/main/modesettings/cloudservice',
      text: __('Cloud Service'),
      component: sModeSettings.Screen,
    },
  ],
};
const newWazirdObj = {
  id: 'wizard',
  component: sWizard.Screen,
};
// 首先以旧路由为标识插入新路由，然后删除旧路由
let routes = utils.config.merge(baseConf.routes, [newObjToMerge, newWazirdObj]);
// 将funConfig合入到routes中
routes = utils.config.merge_funConfig_to_routes(baseConf.routes, funConfig);
const appConfig = Object.assign({}, baseConf.appConfig, guiConfig);

export default {
  reducers,
  routes,
  appConfig,
};

