// 一份完整的AP页面功能配置单

const funConfig = {
  // 覆盖型产品快速设置
  coverageQuickSetup: {
    router: false, // 是否有router模式
  },
  // 网络设置
  network: {
    router: false, // 是否有router模式
  },
  // 无线设置页面
  basic: {
    devicemodeOptions: [
      { value: 'ap', label: _('AP') },              // AP模式
      { value: 'sta', label: _('Station') },        // Station模式
      { value: 'repeater', label: _('Repeater') },  // Repeater模式
    ],
    // 功能项参见WirelessConfig -> Basic页面下的ssidTableFullMemberOptions变量
    // 决定哪些功能在ssid配置表格上出现
    ssidTableKeys: [    // 多SSID配置表格项
      'enable',         // 该SSID是否启用
      'ssid',           // SSID名称
      'maxClients',     // SSID最大客户端限制
      'airTimeEnable',  // 时间公平性
      'speedLimit',     // SSID限速
      'vlanId',         // VLAN ID
      'hideSsid',       // 该SSID是否隐藏
      'isolation',      // 是否启用客户端隔离
      'security',       // 加密配置
      'delete',         // 删除按钮
    ],
  },
  // 无线高级设置页面
  advance: {
    ledThreshFun: false,        // 信号强度控制LED灯功能
    beaconIntervalFun: true,    // Beacon帧间间隔
    dtimIntervalFun: true,      // DTIM间隔
    segmentThreshFun: true,     // 分片阈值
    ampduFun: true,             // ampdu值
    rateSetFun: true,           // 速率集
    rssiLimitFun: true,         // rssi限制
    airTimeFairnessFun: true,   // 时间公平性
  },
  // 系统维护页面
  systemmaintenance: {
    poeOutFun: false,           // POE输出功能
    voipFun: false,             // VOIP功能
  },
};

// 各个页面的配置参数可通过route传入，然后利用配置参数控制页面功能的显示与否
