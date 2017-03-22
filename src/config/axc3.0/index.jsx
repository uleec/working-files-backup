import b28n from 'shared/b28n';
import NotFound from 'shared/components/NotFound';
import stringUtils from 'shared/utils/lib/string';
import appReducer from 'shared/reducers/app';
import screensReducer from 'shared/reducers/screens';
import propertiesReducer from 'shared/reducers/properties';
import moment from 'moment';
import { reducer as toastrReducer } from 'react-redux-toastr';

// 公用 样式
import 'shared/scss/styles.scss';
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';

// 公用组件

// 产品配置
import guiConfig from './config.json';

// 多语言处理
const cnCore = require('../lang/cn/core.json');
const cnAxc = require('../lang/cn/axc.json');
const cnPortal = require('../lang/cn/portal.json');
const langEn = require('../lang/en/core.json');

const bodyElem = document.getElementsByTagName('body')[0];

b28n.addDict(cnCore, 'cn');
b28n.addDict(cnAxc, 'cn');
b28n.addDict(cnPortal, 'cn');
b28n.addDict(langEn, 'en');
window.CB = b28n.init({
  supportLang: ['en', 'cn'],
});
window.guiConfig = guiConfig;

if (b28n.getLang() === 'cn') {
  moment.locale('zh-cn');
} else {
  moment.locale('en');
}

bodyElem.className = stringUtils.addClassName(bodyElem.className, b28n.getLang());

/** ***********************************************************
 * 产品界面配置
 */

// 公用组件

// 主APP
const App = require('../../screens/App');
const SharedComponents = require('shared/components');

//
const sLogin = require('../../screens/App/screens/Login');
const sWizard = require('../../screens/App/screens/Wizard');

//
const sMainAxc = require('../../screens/App/screens/MainAxc');

/**
 * 网络设置
 */
// const sNetworkVlan = require('../../screens/App/screens/MainAxc/screens/Network/screens/VLAN');
const sVlanSettings = require('../../screens/App/screens/MainAxc/screens/Network/screens/VLAN/VlanSettings');
const sQinqSettings = require('../../screens/App/screens/MainAxc/screens/Network/screens/VLAN/QinqSettings');
// const sInterfaces = require('../../screens/App/screens/MainAxc/screens/Network/screens/Interfaces');
const sV3Interfaces = require('../../screens/App/screens/MainAxc/screens/Network/screens/V3Interfaces');
const sHostNetwork = require('../../screens/App/screens/MainAxc/screens/Network/screens/HostNetwork');
const sPortSettings = require('../../screens/App/screens/MainAxc/screens/Network/screens/EthernetPort/PortSettings');
const sPortMirring = require('../../screens/App/screens/MainAxc/screens/Network/screens/EthernetPort/PortMirring');
const sPortAggregation = require('../../screens/App/screens/MainAxc/screens/Network/screens/EthernetPort/PortAggregation');
const sDhcpList = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/DHCP/DhcpList');
const sDhcpService = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/DHCP/DhcpService');
const sDpcpStaticList = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/DHCP/DpcpStaticList');
const sSnoopingUserList = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/Snooping/UserList');
const sSnoopingStaticList = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/Snooping/StaticList');
const sDhcpRelay = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/Relay/DhcpRelay');
const sDhcpFilter = require('../../screens/App/screens/MainAxc/screens/Network/screens/DHCP/screens/Filter/DhcpFilter');
// const sNetworkRoutes = require('../../screens/App/screens/MainAxc/screens/Network/screens/Routes');
// const sNetworkNat = require('../../screens/App/screens/MainAxc/screens/Network/screens/Nat');
// const sNetworkRoutes = require('../../screens/App/screens/MainAxc/screens/Network/screens/Routes');
const sNetowrkStaticRoutes = require('../../screens/App/screens/MainAxc/screens/Network/screens/StaticRoutes');
const sBasicVlanInterface = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/BasicACL/VlanInterface');
const sBasicWLAN = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/BasicACL/WLAN');
const sBasicRuleGroup = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/BasicACL/RuleGroup');
const sBasicRuleDetails = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/BasicACL/Rules');
const sBasicRuleBinding = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/BasicACL/BindRules');

const sExtendVlanInterface = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/ExtendACL/VlanInterface');
const sExtendWLAN = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/ExtendACL/WLAN');
const sExtendRuleGroup = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/ExtendACL/RuleGroup');
const sExtendRuleDetails = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/ExtendACL/Rules');
const sExtendRuleBinding = require('../../screens/App/screens/MainAxc/screens/Network/screens/AccessControl/ExtendACL/BindRules');
// const sNetworkNat = require('../../screens/App/screens/MainAxc/screens/Network/screens/Nat');
const sNetworkNatSettings = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/NatEnable');
const sNetworkNatInterfaceType = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/InterfaceType');
const sNetworkNatAddressPool = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/AddressPool');
const sNetworkNatAddressObject = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/AddressObject');
const sNetworkNatServeObject = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/ServeObject');
const sNetworkNatRuleDetails = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/RuleDetails');
const sNetworkNatUlog = require('../../screens/App/screens/MainAxc/screens/Network/screens/NatSettings/screens/ULog');
// const sNetworkAcl = require('../../screens/App/screens/MainAxc/screens/Network/screens/ACL');
// const sNetworkPort = require('../../screens/App/screens/MainAxc/screens/Network/screens/Port');
const sRaduisTemplate =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/RadiusTemplate');
const sNetworkAaa = require('../../screens/App/screens/MainAxc/screens/Network/screens/AAA');
const sPortalServer =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/Portal/screens/PortalServer');
const sPortalRules =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/Portal/screens/PortalRules');
const sPortalMac =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/Portal/screens/PortalMac');
// const sPortalTemplate =
//    require('../../screens/App/screens/MainAxc/screens/Network/screens/Portal/screens/PortalTemplate');
const sNetworkUrlWlan =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/URL/screens/Wlan');
const sNetworkUrlRulesGroup =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/URL/screens/RulesGroup');
const sNetworkUrlFilterRules =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/URL/screens/FilterRules');
const sNetworkUrlBindRules =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/URL/screens/BindRules');

const sPPPOEBaseConfig = require('../../screens/App/screens/MainAxc/screens/Network/screens/PPPOE/screens/Base');
const sPPPOEUserList = require('../../screens/App/screens/MainAxc/screens/Network/screens/PPPOE/screens/User');
const sPPPOEBindVlan = require('../../screens/App/screens/MainAxc/screens/Network/screens/PPPOE/screens/Vlan');

const sDPIOverview =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/DPI/screens/DPIOverview');
// const sFlowInfo =
//     require('../../screens/App/screens/MainAxc/screens/Network/screens/DPI/screens/FlowInfo');
const sMacStatistic =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/DPI/screens/MacStatistic');
const sEthStatistic =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/DPI/screens/EthStatistic');
const sProtoInfo =
    require('../../screens/App/screens/MainAxc/screens/Network/screens/DPI/screens/ProtoInfo');


/**
 * AP组管理
 */
const cGroup = require('../../screens/App/screens/MainAxc/containers/Group');
const sOverview = require('../../screens/App/screens/MainAxc/screens/Monitor/screens/Overview');
const sClientList = require('../../screens/App/screens/MainAxc/screens/Monitor/screens/ClientList');
const sSsidStatus = require('../../screens/App/screens/MainAxc/screens/Monitor/screens/SsidStatus');
const sApList = require('../../screens/App/screens/MainAxc/screens/Monitor/screens/ApList');
const sSafeStatus = require('../../screens/App/screens/MainAxc/screens/Monitor/screens/SafeStatus');
const sWirelessAcl = require('../../screens/App/screens/MainAxc/screens/WLAN/screens/Acl');
const sSsidSettings =
    require('../../screens/App/screens/MainAxc/screens/WLAN/screens/SsidSettings');
const sSmartRf =
    require('../../screens/App/screens/MainAxc/screens/WLAN/screens/SmartRf');
const sTimerPolicy =
    require('../../screens/App/screens/MainAxc/screens/WLAN/screens/TimerPolicy');
const sWips =
    require('../../screens/App/screens/MainAxc/screens/WLAN/screens/SafePolicy/screens/Wips');
const sEndpointProtection =
  require('../../screens/App/screens/MainAxc/screens/WLAN/screens/SafePolicy/screens/EndpointProtection');

// const sFlowReport =
//     require('../../screens/App/screens/MainAxc/screens/Report/screens/FlowReport');
// const sUsersAnalysis =
//     require('../../screens/App/screens/MainAxc/screens/Report/screens/BusinessReport/screens/UsersAnalysis');
const sLiveMap = require('../../screens/App/screens/MainAxc/screens/Map/screens/LiveMap');
const sApPlanMap =
    require('../../screens/App/screens/MainAxc/screens/Map/screens/ApPlanMap');
const sOrbitTrace = require('../../screens/App/screens/MainAxc/screens/Map/screens/OrbitTrace');
const sClientsTraceList = require('../../screens/App/screens/MainAxc/screens/Map/screens/ClientsTrace');
const sClientsTraceSettings = require('../../screens/App/screens/MainAxc/screens/Map/screens/ClientsTrace/Settings');
// const sRfMap = require('../../screens/App/screens/MainAxc/screens/Map/screens/Rf');
const sHeatMap = require('../../screens/App/screens/MainAxc/screens/Map/screens/HeatMap');
// const sClientsTrace = require('../../screens/App/screens/MainAxc/screens/Map/screens/ClientsTrace');

/**
 * 系统管理
 */
const sSystemStatus =
    require('../../screens/App/screens/MainAxc/screens/System/screens/SystemStatus');
const sSystemAdmin =
    require('../../screens/App/screens/MainAxc/screens/System/screens/SystemAdmin');
const sAlarmEvents =
    require('../../screens/App/screens/MainAxc/screens/System/screens/AlarmEvents');
const sLicense =
    require('../../screens/App/screens/MainAxc/screens/System/screens/License');
const sSystemLogList =
    require('../../screens/App/screens/MainAxc/screens/System/screens/SystemLog/screens/LogList');
const sSystemLogMaintenance =
    require('../../screens/App/screens/MainAxc/screens/System/screens/SystemLog/screens/logMaintenance');
// const sSNMP =
//     require('../../screens/App/screens/MainAxc/screens/System/screens/SNMP');
// const sActiveStandby =
//     require('../../screens/App/screens/MainAxc/screens/System/screens/ActiveStandby');
// const sSignatures =
//     require('../../screens/App/screens/MainAxc/screens/System/screens/Signatures');
const sApVersion =
    require('../../screens/App/screens/MainAxc/screens/System/screens/ApVersion');
const sApMaintenance =
    require('../../screens/App/screens/MainAxc/screens/System/screens/ApMaintenance');
const sApModel =
    require('../../screens/App/screens/MainAxc/screens/System/screens/ApModel');
const sAcMaintenance =
    require('../../screens/App/screens/MainAxc/screens/System/screens/AcMaintenance');
const sNetworkTimeProtocol =
    require('../../screens/App/screens/MainAxc/screens/System/screens/NetworkTimeProtocol');

/**
 * Portal
 */
const sPortalOverview =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Overview');
const sPortalBase =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/Base');
// const sPortalBas =
    // require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/Bas');
const sPortalUrlParams =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/UrlParams');
const sPortalWeb =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/Web');
const sPortalDefaultWeb =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/DefaultWeb');
const sPortalWeixin =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/Weixin');
const sPortalSMSGateWay =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/SMSGateway');
const sPortalSMSLog =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/SMSLog');
// const sPortalApSetting =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/ApSetting');
// const sPortalSsid =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/Access/Ssid');

const sPortalNas =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Radius/Nas');
const sPortalOnline =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Radius/Online');
const sPortalConnectLog =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Radius/ConnectLog');

const sPortalSendMessage =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Message/SendMessage');
const sPortalSendBox =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Message/SendBox');
const sPortalReceiveBox =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Message/ReceiveBox');

const sPortalAccountList =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Account/AccountList');
const sPortalAccountListMac =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Account/AccountListMac');
const sPortalConnectRecord =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Account/ConnectRecord');


// const sPortalSendBox =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/Message/SendBox');
// const sPortalReceiveBox =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/Message/ReceiveBox');

// const sPortalPermission =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/System/Permission');
// const sPortalClassification =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/System/Classification');
// const sPortalUser =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/System/User');
// const sPortalRole =
//     require('../../screens/App/screens/MainAxc/screens/Portal/screens/System/Role');

const sPortalCardCategory =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Card/CardCategory');
const sPortalCardList =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Card/CardList');
const sPortalLogList =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Log/LogList');
const sPortalOnlineRecordList =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Log/OnlineRecordList');
const sPortalOnlineList =
    require('../../screens/App/screens/MainAxc/screens/Portal/screens/Log/OnlineList');

const routes = [
  {
    path: '/',
    component: App.Screen,
    formUrl: 'goform/axcInfo',
    indexPath: '/login',
    routes: [
      {
        id: 'main',
        path: '/main/',
        component: sMainAxc.Screen,
        routes: [
          {
            path: '/main/network',
            component: SharedComponents.NavContainer,
            icon: 'sphere',
            text: __('Network '),
            routes: [
              {
                id: 'vlan',
                icon: 'road',
                component: SharedComponents.TabContainer,
                path: '/main/network/vlan',
                text: __('VLAN'),
                noTree: true,
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/vlan/vlansettings') },
                routes: [
                  {
                    id: 'networkVlanSettings',
                    path: '/main/network/vlan/vlansettings',
                    formUrl: 'goform/network/vlan/vlansettings',
                    text: __('VLAN Settings'),
                    component: sVlanSettings.Screen,
                  },
                  {
                    id: 'networkQinqSettings',
                    path: '/main/network/vlan/qinqsettings',
                    formUrl: 'goform/network/vlan/qinqsettings',
                    text: __('QINQ Settings'),
                    component: sQinqSettings.Screen,
                  },
                ],
              },
              {
                id: 'networkHostnetwork',
                path: '/main/network/hostnetwork',
                formUrl: 'goform/network/hostnetwork',
                text: __('Host Network'),
                icon: 'th',
                component: sHostNetwork.Screen,
              },
              {
                id: 'ethernetPort',
                path: '/main/network/ethernetport',
                isIndex: true,
                icon: 'th-large',
                text: __('Ethernet Port'),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/ethernetport/portsettings') },
                routes: [
                  {
                    id: 'ethernetPortSettings',
                    path: '/main/network/ethernetport/portsettings',
                    formUrl: 'goform/network/portsettings',
                    text: __('Settings'),
                    icon: 'th',
                    component: sPortSettings.Screen,
                  },
                  {
                    id: 'ethernetPortMirring',
                    path: '/main/network/ethernetport/portmirring',
                    formUrl: 'goform/network/portmirring',
                    text: __('Mirring'),
                    icon: 'th',
                    component: sPortMirring.Screen,
                  },
                  {
                    id: 'ethernetPortAggregation',
                    path: '/main/network/ethernetport/portaggregation',
                    formUrl: 'goform/network/portaggregation',
                    text: __('Aggregation'),
                    icon: 'th',
                    component: sPortAggregation.Screen,
                  },
                ],
              },
              // { // V2.0版本接口设置
              //   id: 'networkInterface',
              //   icon: 'th',
              //   path: '/main/network/interface',
              //   formUrl: 'goform/network/interface',
              //   text: __('Interfaces'),
              //   component: sInterfaces.Screen,
              // },
              { // V3.0版本接口设置
                id: 'networkInterface',
                icon: 'th',
                path: '/main/network/v3interface',
                formUrl: 'goform/network/v3interface',
                text: __('Interfaces'),
                component: sV3Interfaces.Screen,
              },
              // {
              //   id: 'networkPort',
              //   path: '/main/network/port',
              //   icon: 'th-large',
              //   formUrl: '/goform/network/port',
              //   text: __('Ports'),
              //   component: sNetworkPort.Screen,
              // },
              {
                id: 'networkDhcp',
                icon: 'random',
                path: '/main/network/dhcp',
                text: __('DHCP Config'),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/dhcp/dhcp') },
                routes: [
                  {
                    id: 'dhcp',
                    path: '/main/network/dhcp/dhcp',
                    text: __('DHCP Service'),
                    component: SharedComponents.TabContainer,
                    indexRoute: {
                      onEnter: (nextState, replace) => replace('/main/network/dhcp/service/serviceConfig'),
                    },
                    routes: [
                      {
                        id: 'dhcpService',
                        path: '/main/network/dhcp/service/serviceConfig',
                        formUrl: 'goform/network/dhcp/service/serviceConfig',
                        text: __('DHCP Service'),
                        component: sDhcpService.Screen,
                      },
                      {
                        id: 'dhcpList',
                        path: '/main/network/dhcp/service/list',
                        formUrl: 'goform/network/dhcp/service/list',
                        text: __('DHCP List'),
                        component: sDhcpList.Screen,
                      },
                      {
                        id: 'dhcpStaticList',
                        path: '/main/network/dhcp/service/staticList',
                        formUrl: 'goform/network/dhcp/service/staticList',
                        text: __('DHCP Static List'),
                        component: sDpcpStaticList.Screen,
                      },
                    ],
                  },
                  {
                    id: 'snooping',
                    path: '/main/network/dhcp/snooping',
                    text: __('Snooping'),
                    component: SharedComponents.TabContainer,
                    indexRoute: {
                      onEnter: (nextState, replace) => replace('/main/network/dhcp/snooping/userList'),
                    },
                    routes: [
                      {
                        id: 'userList',
                        path: '/main/network/dhcp/snooping/userList',
                        formUrl: 'goform/network/dhcp/snooping/userList',
                        text: __('Snooping User List'),
                        component: sSnoopingUserList.Screen,
                      },
                      {
                        id: 'staticList',
                        path: '/main/network/dhcp/snooping/staticList',
                        formUrl: 'goform/network/dhcp/snooping/staticList',
                        text: __('Snooping Static List'),
                        component: sSnoopingStaticList.Screen,
                      },
                    ],
                  },
                  {
                    id: 'dhcpRelay',
                    path: '/main/network/dhcp/relay',
                    formUrl: 'goform/network/dhcp/relay',
                    text: __('DHCP Relay'),
                    component: sDhcpRelay.Screen,
                  },
                  {
                    id: 'dhcpFilter',
                    path: '/main/network/dhcp/filter',
                    formUrl: 'goform/network/dhcp/filter',
                    text: __('DHCP Filter'),
                    component: sDhcpFilter.Screen,
                  },
                ],
              },
              // {
              //   id: 'networkNat',
              //   icon: 'exchange',
              //   path: '/main/network/nat',
              //   text: __('NAT'),
              //   formUrl: 'goform/network/nat',
              //   component: sNetworkNat.Screen,
              // },
              {
                id: 'networkNatSettings',
                icon: 'exchange',
                path: '/main/network/natsettings',
                noTree: true,
                text: __('NAT'),
                component: SharedComponents.TabContainer,
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/natsettings/natenable') },
                routes: [
                  {
                    id: 'networkNatEnable',
                    path: '/main/network/natsettings/natenable',
                    formUrl: 'goform/network/natsettings/natenable',
                    text: __('NAT Enable'),
                    component: sNetworkNatSettings.Screen,
                  },
                  {
                    id: 'networkNatInterfaceType',
                    path: '/main/network/natsettings/interfacetype',
                    formUrl: 'goform/network/natsettings/interfacetype',
                    text: __('Interface Type'),
                    component: sNetworkNatInterfaceType.Screen,
                  },
                  {
                    id: 'networkNatAddressPool',
                    path: '/main/network/natsettings/addresspool',
                    formUrl: 'goform/network/natsettings/addresspool',
                    text: __('Address Pool'),
                    component: sNetworkNatAddressPool.Screen,
                  },
                  {
                    id: 'networkNatAddressObject',
                    path: '/main/network/natsettings/addressobject',
                    formUrl: 'goform/network/natsettings/addressobject',
                    text: __('Address Object'),
                    component: sNetworkNatAddressObject.Screen,
                  },
                  {
                    id: 'networkNatServeObject',
                    path: '/main/network/natsettings/serveobject',
                    formUrl: 'goform/network/natsettings/serveobject',
                    text: __('Serve Object'),
                    component: sNetworkNatServeObject.Screen,
                  },
                  {
                    id: 'networkNatRuleDetails',
                    path: '/main/network/natsettings/ruledetails',
                    formUrl: 'goform/network/natsettings/ruledetails',
                    text: __('Rule Details'),
                    component: sNetworkNatRuleDetails.Screen,
                  },
                  {
                    id: 'networkNatUlog',
                    path: '/main/network/natsettings/ulog',
                    formUrl: 'goform/network/natsettings/ulog',
                    text: __('ULOG'),
                    component: sNetworkNatUlog.Screen,
                  },
                ],
              },
              {
                id: 'networkAcl',
                path: '/main/network/acl',
                isIndex: true,
                icon: 'th-large',
                text: __('ACL'),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/acl/basicacl') },
                routes: [
                  {
                    id: 'networkBasicAcl',
                    path: '/main/network/acl/basicacl',
                    text: __('Basic ACL'),
                    icon: 'th',
                    indexRoute: { onEnter: (nextState, replace) => replace('/main/network/acl/basicacl/vlaninterface') },
                    routes: [
                      {
                        id: 'basicAclIndex',
                        path: '/main/network/acl/basicacl/basicaclindex',
                        component: SharedComponents.TabContainer,
                        routes: [
                          {
                            id: 'basicAclVlanInterface',
                            path: '/main/network/acl/basicacl/vlaninterface',
                            formUrl: 'goform/network/basicacl/vlaninterface',
                            text: __('Vlan Interface'),
                            component: sBasicVlanInterface.Screen,
                          },
                          {
                            id: 'basicAclWlan',
                            path: '/main/network/acl/basicacl/wlan',
                            formUrl: 'goform/network/basicacl/wlan',
                            text: __('WLAN'),
                            component: sBasicWLAN.Screen,
                          },
                          {
                            id: 'basicAclRuleGroup',
                            path: '/main/network/acl/basicacl/rulegroup',
                            formUrl: 'goform/network/basicacl/rulegroup',
                            text: __('Rule Group'),
                            component: sBasicRuleGroup.Screen,
                          },
                          {
                            id: 'basicAclRuleDetails',
                            path: '/main/network/acl/basicacl/ruledetails',
                            formUrl: 'goform/network/basicacl/ruledetails',
                            text: __('Rules'),
                            component: sBasicRuleDetails.Screen,
                          },
                          {
                            id: 'basicAclRuleBinding',
                            path: '/main/network/acl/basicacl/rulebinding',
                            formUrl: 'goform/network/basicacl/rulebinding',
                            text: __('Rules Binding'),
                            component: sBasicRuleBinding.Screen,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 'networkExtendAcl',
                    path: '/main/network/acl/extendacl',
                    text: __('Extend ACL'),
                    icon: 'th',
                    indexRoute: { onEnter: (nextState, replace) => replace('/main/network/acl/extendacl/vlaninterface') },
                    routes: [
                      {
                        id: 'extendAclIndex',
                        path: '/main/network/acl/extendacl/extendaclindex',
                        component: SharedComponents.TabContainer,
                        routes: [
                          {
                            id: 'extendAclVlanInterface',
                            path: '/main/network/acl/extendacl/vlaninterface',
                            formUrl: 'goform/network/extendacl/vlaninterface',
                            text: __('Vlan Interface'),
                            component: sExtendVlanInterface.Screen,
                          },
                          {
                            id: 'extendAclWlan',
                            path: '/main/network/acl/extendacl/wlan',
                            formUrl: 'goform/network/extendacl/wlan',
                            text: __('WLAN'),
                            component: sExtendWLAN.Screen,
                          },
                          {
                            id: 'extendAclRuleGroup',
                            path: '/main/network/acl/extendacl/rulegroup',
                            formUrl: 'goform/network/extendacl/rulegroup',
                            text: __('Rule Group'),
                            component: sExtendRuleGroup.Screen,
                          },
                          {
                            id: 'extendAclRuleDetails',
                            path: '/main/network/acl/extendacl/ruledetails',
                            formUrl: 'goform/network/extendacl/ruledetails',
                            text: __('Rules'),
                            component: sExtendRuleDetails.Screen,
                          },
                          {
                            id: 'extendAclRuleBinding',
                            path: '/main/network/acl/extendacl/rulebinding',
                            formUrl: 'goform/network/extendacl/rulebinding',
                            text: __('Rules Binding'),
                            component: sExtendRuleBinding.Screen,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              // 先隐藏ACL
              // {
              //   id: 'networkAcl',
              //   icon: 'ban',
              //   path: '/main/network/acl',
              //   text: __('Access Control'),
              //   formUrl: 'goform/network/acl',
              //   component: sNetworkAcl.Screen,
              // },
              // { // v2.5版本的路由设置
              //   id: 'staticRoutes',
              //   path: '/main/network/static_routes',
              //   text: __('Routes'),
              //   icon: 'map-signs',
              //   formUrl: 'goform/network/route',
              //   component: sNetworkRoutes.Screen,
              // },
              { // v3版本的路由设置
                id: 'staticRoutes',
                path: '/main/network/staticroutes',
                formUrl: 'goform/network/staticroutes',
                text: __('Static Route'),
                icon: 'map-signs',
                component: sNetowrkStaticRoutes.Screen,
              },
              // { // v2.5版本端口设置
              //   id: 'networkPort',
              //   path: '/main/network/port',
              //   icon: 'th-large',
              //   formUrl: '/goform/network/port',
              //   text: __('Ports'),
              //   component: sNetworkPort.Screen,
              // },
              {
                id: 'radiusTemplate',
                icon: 'clone',
                path: '/main/network/radius_template',
                formUrl: 'goform/network/radius/template',
                text: __('Radius Server'),
                component: sRaduisTemplate.Screen,
              }, {
                id: 'networkAaa',
                icon: 'lock',
                path: '/main/network/aaa',
                formUrl: 'goform/network/Aaa',
                text: __('AAA'),
                component: sNetworkAaa.Screen,
              }, {
                id: 'networkURL',
                icon: 'filter',
                path: '/main/network/url',
                formUrl: 'goform/network/url',
                text: __('URL Filter'),
                noTree: true,
                component: SharedComponents.TabContainer,
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/url/wlan') },
                routes: [
                  {
                    id: 'urlWlan',
                    path: '/main/network/url/wlan',
                    formUrl: 'goform/network/url/wlan',
                    text: __('WLAN'),
                    component: sNetworkUrlWlan.Screen,
                  },
                  {
                    id: 'urlRulesGroup',
                    path: '/main/network/url/rulesgroup',
                    formUrl: 'goform/network/url/rulesgroup',
                    text: __('Rules Group'),
                    component: sNetworkUrlRulesGroup.Screen,
                  },
                  {
                    id: 'urlFilterRules',
                    path: '/main/network/url/filterrules',
                    formUrl: 'goform/network/url/filterrules',
                    text: __('Filter Rules'),
                    component: sNetworkUrlFilterRules.Screen,
                  },
                  {
                    id: 'urlBindRules',
                    path: '/main/network/url/bindrules',
                    formUrl: 'goform/network/url/bindrules',
                    text: __('Bind Rules'),
                    component: sNetworkUrlBindRules.Screen,
                  },
                ],
              }, {
                id: 'networkPPPOE',
                icon: 'filter',
                path: '/main/network/pppoe',
                formUrl: 'goform/network/pppoe',
                text: __('PPPOE'),
                noTree: true,
                component: SharedComponents.TabContainer,
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/pppoe/baseConfig') },
                routes: [
                  {
                    id: 'pppoeBase',
                    path: '/main/network/pppoe/baseConfig',
                    formUrl: 'goform/network/pppoe/baseConfig',
                    text: __('Base Config'),
                    component: sPPPOEBaseConfig.Screen,
                  },
                  {
                    id: 'pppoeUser',
                    path: '/main/network/pppoe/userList',
                    formUrl: 'goform/network/pppoe/userList',
                    text: __('User List'),
                    component: sPPPOEUserList.Screen,
                  },
                  {
                    id: 'pppoeVlan',
                    path: '/main/network/pppoe/vlan',
                    formUrl: 'goform/network/pppoe/vlan',
                    text: __('Bind Vlan'),
                    component: sPPPOEBindVlan.Screen,
                  },
                ],
              }, {
                id: 'networkPortal',
                icon: 'copy',
                noTree: true,
                component: SharedComponents.TabContainer,
                path: '/main/network/portal',
                text: __('Portal Policy'),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/portal/server') },
                routes: [
                  {
                    id: 'portalServer',
                    path: '/main/network/portal/server',
                    formUrl: 'goform/network/portal/server',
                    text: __('Server'),
                    component: sPortalServer.Screen,
                  }, {
                    id: 'portalRules',
                    path: '/main/network/portal/rule',
                    formUrl: 'goform/network/portal/rule',
                    text: __('Rules'),
                    component: sPortalRules.Screen,
                  },
                  {
                    id: 'portalMac',
                    path: '/main/network/portal/mac',
                    formUrl: 'goform/network/portal/mac',
                    text: __('White List'),
                    component: sPortalMac.Screen,
                  },
                ],
              }, {
                id: 'dpi',
                icon: 'copy',
                noTree: true,
                component: SharedComponents.TabContainer,
                path: '/main/network/dpi',
                text: __('DPI'),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/network/dpi/dpioverview') },
                routes: [
                  {
                    id: 'dpioverview',
                    path: '/main/network/dpi/dpioverview',
                    formUrl: 'goform/network/dpi/overview',
                    text: __('Overview'),
                    component: sDPIOverview.Screen,
                  },
                  // {
                  //   id: 'flowinfo',
                  //   path: '/main/network/dpi/flowinfo',
                  //   formUrl: 'goform/network/dpi/flowinfo',
                  //   text: __('Flow Info'),
                  //   component: sFlowInfo.Screen,
                  // },
                  {
                    id: 'macstatistic',
                    path: '/main/network/dpi/macstatistic',
                    formUrl: 'goform/network/dpi/macstatistic',
                    text: __('Mac Statistic'),
                    component: sMacStatistic.Screen,
                  }, {
                    id: 'ethstatistic',
                    path: '/main/network/dpi/ethstatistic',
                    formUrl: 'goform/network/dpi/ethstatistic',
                    text: __('Ethernet Statistic'),
                    component: sEthStatistic.Screen,
                  }, {
                    id: 'protoinfo',
                    path: '/main/network/dpi/protoinfo',
                    formUrl: 'goform/network/dpi/protoinfo',
                    text: __('Applications'),
                    component: sProtoInfo.Screen,
                  },
                ],
              },
            ],
          },
          {
            id: 'group',
            path: '/main/group',
            icon: 'group',
            text: __('AP Groups '),
            component: cGroup.Screen,
            indexPath: '/main/group/monitor/overview',
            routes: [
              {
                id: 'monitor',
                isIndex: true,
                path: '/main/group/monitor',
                icon: 'pie-chart',
                text: __('Monitor'),
                routes: [
                  {
                    id: 'overview',
                    path: '/main/group/monitor/overview',
                    formUrl: 'goform/group/overview',
                    text: __('Overview'),
                    component: sOverview.Screen,
                  },
                  // {
                  //   id: 'groupTraffic',
                  //   path: '/main/group/monitor/flow',
                  //   formUrl: 'goform/group/flow/user',
                  //   text: __('Traffic'),
                  //   component: sFlowUser.Screen,
                  //   indexRoute: {
                  //     onEnter: (nextState, replace) => replace('/main/group/monitor/flow/user'),
                  //   },
                  //   routes: [
                  //     {
                  //       id: 'userFlow',
                  //       path: '/main/group/monitor/flow/user',
                  //       formUrl: 'goform/group/flow/user',
                  //       text: __('User'),
                  //       component: sFlowUser.Screen,
                  //     }, {
                  //       id: 'appFlow',
                  //       path: '/main/group/monitor/flow/app',
                  //       formUrl: 'goform/group/flow/app',
                  //       text: __('App'),
                  //       component: sFlowApp.Screen,
                  //     },
                  //   ],
                  // },
                  {
                    id: 'ssidStatus',
                    path: '/main/group/monitor/ssid',
                    formUrl: 'goform/group/ssid',
                    text: __('SSID Status'),
                    component: sSsidStatus.Screen,
                  }, {
                    id: 'safeStatus',
                    path: '/main/group/monitor/safe',
                    formUrl: 'goform/group/safeStatus',
                    text: __('Secure State'),
                    component: sSafeStatus.Screen,
                  },
                ],
              },
              {
                id: 'apList',
                icon: 'bullseye',
                path: '/main/group/aps',
                formUrl: 'goform/group/aps',
                text: __('AP List'),
                component: sApList.Screen,
              }, {
                id: 'groupClient',
                icon: 'desktop',
                path: '/main/group/user',
                formUrl: 'goform/group/client',
                text: __('Client List'),
                component: sClientList.Screen,
              },
              {
                id: 'wireless',
                isIndex: true,
                path: '/main/group/wireless',
                icon: 'wifi',
                noTree: true,
                component: SharedComponents.TabContainer,

                // 不要删除空格
                text: __('Radio '),
                indexRoute: { onEnter: (nextState, replace) => replace('/main/group/wireless/ssid') },
                routes: [
                  {
                    id: 'ssidSettings',
                    path: '/main/group/wireless/ssid',
                    formUrl: 'goform/group/ssidSetting',
                    text: __('SSID Settings'),
                    component: sSsidSettings.Screen,
                  }, {
                    id: 'smartRf',
                    path: '/main/group/wireless/smart',
                    formUrl: 'goform/group/smartRf',
                    text: __('Smart RF'),
                    component: sSmartRf.Screen,
                  },
                ],
              },
              {
                id: 'map',
                isIndex: true,
                path: '/main/group/map',
                icon: 'map',
                text: __('Map'),
                routes: [
                  {
                    id: 'liveMap',
                    path: '/main/group/map/live/list',
                    text: __('Live Map'),
                    formUrl: 'goform/group/map/building',
                    isIndex: true,
                    component: sLiveMap.Screen,
                  }, {

                    id: 'buildMap',
                    path: '/main/group/map/building/:id',
                    text: __('AP Plan Map'),
                    formUrl: 'goform/group/map/apPlan',
                    component: sApPlanMap.Screen,
                    noNav: true,
                  },
                  {
                    id: 'heatMap',
                    path: '/main/group/map/heat_map',
                    formUrl: 'goform/group/map/heatmap',
                    fetchUrl: 'goform/group/map/heatmap',
                    text: __('Heat Map'),
                    component: sHeatMap.Screen,
                  },
                  {
                    id: 'orbitTrace',
                    path: '/main/group/map/orbittrace',
                    formUrl: '/goform/group/map/orbittrace',
                    fetchUrl: '/goform/group/map/orbittrace',
                    text: __('Orbit Trace'),
                    component: sOrbitTrace.Screen,
                  },
                  {
                    id: 'cientsTrace',
                    path: '/main/group/map/clients_trace',
                    text: __('Clients Statistics'),
                    icon: 'bar-chart',
                    noTree: true,
                    component: SharedComponents.TabContainer,
                    routes: [
                      {
                        id: 'clientsTrace',
                        path: '/main/group/map/clients_trace/list',
                        formUrl: '/goform/group/map/clients_trace',
                        text: __('Clients Statistics'),
                        component: sClientsTraceList.Screen,
                      }, {
                        id: 'clientsTrace',
                        path: '/main/group/map/clients_trace/settings',
                        formUrl: 'goform/group/map/clients_trace',
                        text: __('Settings'),
                        component: sClientsTraceSettings.Screen,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'wirelessAcl',
                icon: 'ban',
                path: '/main/group/acl',
                formUrl: '/goform/group/wireless/acl',
                text: __('ACL'),
                component: sWirelessAcl.Screen,
              },
              {
                id: 'wirelessSafePolicy',
                icon: 'certificate',
                path: '/main/group/safe',
                formUrl: 'goform/group/timerPolicy',
                text: __('Safe Policy'),
                noTree: true,
                component: SharedComponents.TabContainer,
                indexRoute: {
                  onEnter: (nextState, replace) => replace('/main/group/safe/wips'),
                },
                routes: [
                  {
                    id: 'wirelessWips',
                    path: '/main/group/safe/wips',
                    formUrl: 'goform/group/wips',
                    text: __('AP Scan Settings'),
                    component: sWips.Screen,
                  }, {
                    id: 'wirelessEndpointProtection',
                    path: '/main/group/safe/endpointProtection',
                    formUrl: 'goform/group/wireless/protection',
                    text: __('Terminal Protection'),
                    component: sEndpointProtection.Screen,
                  },
                ],
              },
              {
                id: 'timerPolicy',
                icon: 'clock-o',
                path: '/main/group/timer',
                formUrl: 'goform/group/timerPolicy',
                text: __('Scheduler'),
                component: sTimerPolicy.Screen,
              },
            ],
          },
          {
            id: 'portal',
            path: '/main/portal',
            icon: 'road',
            text: __('Hotspot'),
            component: SharedComponents.NavContainer,
            indexPath: '/main/portal/overview',
            routes: [
              {
                id: 'portalOverview',
                icon: 'home',
                path: '/main/portal/overview',
                formUrl: 'goform/portal/overview',
                mode: 'cors',
                text: __('Overview'),
                component: sPortalOverview.Screen,
              }, {
                id: 'portalAccess',
                isIndex: true,
                path: '/main/portal/access',
                icon: 'link',
                text: __('Access Auth'),
                indexPath: '/main/portal/access/config',
                routes: [
                  {
                    id: 'portalAccessBase',
                    path: '/main/portal/access/config',
                    formUrl: 'goform/portal/access/config',
                    text: __('Base'),
                    component: sPortalBase.Screen,
                  },
                  {
                    id: 'portalAccessUrlParameter',
                    path: '/main/portal/access/urlParameter',
                    formUrl: 'goform/portal/access/urlParameter',
                    text: __('URL Parameter'),
                    component: sPortalUrlParams.Screen,
                  }, {
                    id: 'portalAccessWeb',
                    path: '/main/portal/access/web',
                    formUrl: 'goform/portal/access/web',
                    text: __('Web Template'),
                    component: sPortalWeb.Screen,
                  }, {
                    id: 'portalAccessDefaultWeb',
                    path: '/main/portal/access/defaultweb',
                    formUrl: 'goform/portal/access/defaultweb',
                    text: __('Default Web'),
                    component: sPortalDefaultWeb.Screen,
                  }, {
                    id: 'portalWechat',
                    path: '/main/portal/access/weixin',
                    formUrl: 'goform/portal/access/weixin',
                    text: __('Wechat Auth'),
                    component: sPortalWeixin.Screen,
                  }, {
                    id: 'portaSMSGateWay',
                    path: '/main/portal/access/smsgateWay',
                    formUrl: 'goform/portal/access/smsgateWay',
                    text: __('SMS GateWay'),
                    component: sPortalSMSGateWay.Screen,
                  }, {
                    id: 'portalSMSLog',
                    path: '/main/portal/access/portalsmslog',
                    formUrl: 'goform/portal/access/portalsmslog',
                    text: __('SMS Log'),
                    component: sPortalSMSLog.Screen,
                  },
                ],
              }, {
                id: 'portalRadius',
                path: '/main/portal/radius',
                icon: 'podcast',
                text: __('Radius'),
                isIndex: true,
                indexPath: '/main/portal/radius/nas',
                routes: [
                  {
                    id: 'portalRadiusNas',
                    path: '/main/portal/radius/nas',
                    formUrl: 'goform/portal/radius/nas',
                    text: __('NAS List'),
                    component: sPortalNas.Screen,
                  }, {
                    id: 'portalRadiusOnlineList',
                    path: '/main/portal/radius/online',
                    formUrl: 'goform/portal/radius/online',
                    text: __('Online List'),
                    component: sPortalOnline.Screen,
                  }, {
                    id: 'portalRadiusConnectLogs',
                    path: '/main/portal/radius/logs',
                    formUrl: 'goform/portal/radius/logs',
                    text: __('Connect Logs'),
                    component: sPortalConnectLog.Screen,
                  },
                ],
              }, {
                id: 'portalAccount',
                isIndex: true,
                path: '/main/portal/account',
                icon: 'user-o',
                text: __('Access Account'),
                indexPath: '/main/portal/account/list',
                routes: [
                  {
                    id: 'portalAccountAccountList',
                    path: '/main/portal/account/list/index',
                    formUrl: 'goform/portal/account/accountList',
                    text: __('Account List'),
                    isIndex: true,
                    component: sPortalAccountList.Screen,
                  }, {
                    id: 'portalAccountAccountListMac',
                    path: '/main/portal/account/list/mac/:loginName',
                    formUrl: 'goform/portal/account/accountListMac',
                    text: __('Account List Mac'),
                    component: sPortalAccountListMac.Screen,
                    noNav: true,
                  },
                  {
                    id: 'portalAccountConnectRecord',
                    path: '/main/portal/account/connectRecord',
                    formUrl: 'goform/portal/account/connectRecord',
                    text: __('Connect Record'),
                    component: sPortalConnectRecord.Screen,
                  },
                ],
              },
              {
                id: 'portalMessage',
                isIndex: true,
                path: '/main/portal/message',
                icon: 'envelope-o',
                text: __('Message'),
                indexPath: '/main/portal/message/send',
                routes: [
                  {
                    id: 'portalSendMessage',
                    path: '/main/portal/message/sendmessage',
                    formUrl: 'goform/portal/message/sendmessage',
                    text: __('Send Message'),
                    component: sPortalSendMessage.Screen,
                  }, {
                    id: 'portalReceiveBox',
                    path: '/main/portal/message/receive',
                    formUrl: 'goform/portal/message/receive',
                    text: __('Receive Box'),
                    component: sPortalReceiveBox.Screen,
                  }, {
                    id: 'portalSendBox',
                    path: '/main/portal/message/send',
                    formUrl: 'goform/portal/message/send',
                    text: __('Send Box'),
                    component: sPortalSendBox.Screen,
                  },
                ],
              },
              {
                id: 'portalLog',
                isIndex: true,
                path: '/main/portal/log',
                icon: 'file-text-o',
                text: __('Online Record Log'),
                routes: [
                  {
                    id: 'portalLogLogList',
                    path: '/main/portal/log/logList',
                    formUrl: 'goform/portal/log/logList',
                    text: __('Log List'),
                    component: sPortalLogList.Screen,
                  }, {
                    id: 'portalLogOnlineList',
                    path: '/main/portal/log/onlineList',
                    formUrl: 'goform/portal/log/onlineList',
                    text: __('Online List'),
                    component: sPortalOnlineList.Screen,
                  }, {
                    id: 'portalLogOnlineRecordList',
                    path: '/main/portal/log/onlineRecordList',
                    formUrl: 'goform/portal/log/onlineRecordList',
                    text: __('Online Record List'),
                    component: sPortalOnlineRecordList.Screen,
                  },
                ],
              },
              {
                id: 'portalCard',
                isIndex: true,
                path: '/main/portal/card',
                icon: 'vcard-o',
                text: __('Rechargeable Card'),
                indexRoute: {
                  onEnter: (nextState, replace) => replace('/main/portal/card/cardcategory'),
                },
                routes: [
                  {
                    id: 'sPortalCardCategory',
                    path: '/main/portal/card/cardcategory',
                    formUrl: 'goform/portal/card/cardcategory',
                    text: __('Card Category'),
                    component: sPortalCardCategory.Screen,
                  }, {
                    id: 'portalCardCardList',
                    path: '/main/portal/card/cardlist',
                    formUrl: 'goform/portal/card/cardlist',
                    text: __('Card List'),
                    component: sPortalCardList.Screen,
                  },
                ],
              },
            ],
          },
          {
            id: 'system',
            path: '/main/system',
            icon: 'cogs',
            text: __('System '),
            component: SharedComponents.NavContainer,
            indexPath: '/main/system/status',
            routes: [
              {
                id: 'systemStatus',
                icon: 'area-chart',
                path: '/main/system/status',
                formUrl: '/goform/system/status',
                text: __('System Status'),
                component: sSystemStatus.Screen,
              }, {
                id: 'alarmEvents',
                icon: 'exclamation-circle',
                path: '/main/system/alarm',
                formUrl: '/goform/system/alarmEvents',
                text: __('Alarm Events'),
                component: sAlarmEvents.Screen,
              }, {
                id: 'systemLog',
                icon: 'file-text-o',
                path: '/main/system/log',
                text: __('System Log'),
                noTree: true,
                component: SharedComponents.TabContainer,
                indexPath: '/main/system/log/list',
                routes: [
                  {
                    id: 'systemLog',
                    path: '/main/system/log/list',
                    formUrl: 'goform/system/log',
                    text: __('Log List'),
                    component: sSystemLogList.Screen,
                  }, {
                    id: 'systemLogMaintenance',
                    path: '/main/system/log/maintenance',
                    formUrl: 'goform/system/log',
                    text: __('Log Maintenance'),
                    component: sSystemLogMaintenance.Screen,
                  },
                ],
              },
              {
                id: 'License',
                isIndex: true,
                path: '/main/system/license',
                formUrl: 'goform/system/license',
                icon: 'file-text',
                text: __('License'),
                component: sLicense.Screen,
              }, {
                id: 'apMaintenance',
                isIndex: true,
                path: '/main/system/ap',
                icon: 'dot-circle-o ',
                text: __('AP Maintenance'),
                noTree: true,
                component: SharedComponents.TabContainer,
                indexPath: '/main/system/ap/base',
                routes: [
                  {
                    id: 'apMaintenanceBase',
                    path: '/main/system/ap/base',
                    formUrl: 'goform/system/maintenance',
                    text: __('Configuration'),
                    component: sApMaintenance.Screen,
                  }, {
                    id: 'apsVersion',
                    path: '/main/system/ap/version',
                    formUrl: 'goform/system/ap/version',
                    text: __('AP Firmware'),
                    component: sApVersion.Screen,
                  }, {
                    id: 'apModel',
                    path: '/main/system/ap/model',
                    formUrl: 'goform/system/ap/model',
                    text: __('AP Model'),
                    component: sApModel.Screen,
                  },
                ],
              }, {
                id: 'acMaintenance',
                isIndex: true,
                formUrl: 'goform/system/maintenance',
                path: '/main/system/maintenance',
                icon: 'cog',
                text: __('AC Maintenance'),
                component: sAcMaintenance.Screen,
              }, {
                id: 'ntp',
                isIndex: true,
                formUrl: 'goform/system/networktimeprotocol',
                path: '/main/system/networktimeprotocol',
                icon: 'clock-o',
                text: __('NTP'),
                component: sNetworkTimeProtocol.Screen,
              }, {
                id: 'admin',
                isIndex: true,
                path: '/main/system/admin',
                formUrl: 'goform/system/admins',
                icon: 'user',
                text: __('Admin Account'),
                component: sSystemAdmin.Screen,
              },
            ],
          },
          {
            id: 'notFound',
            component: NotFound,
          },
        ],
      },
      {
        path: '/wizard',
        component: sWizard.Screen,
      },
      {
        id: 'login',
        path: '/login',
        mainPath: '/main/group/monitor/overview',
        component: sLogin.Screen,
      },
      {
        id: 'notFound',
        component: NotFound,
      },
    ],
  },
];


// 配置模块页面 store
const reducers = {
  // shared reducers
  app: appReducer,
  screens: screensReducer,
  properties: propertiesReducer,

  // product comstom reducers
  product: sMainAxc.reducer,

  toastr: toastrReducer,
};

const app = {
  reducers,
  routes,
  appConfig: guiConfig,
};


export default app;

