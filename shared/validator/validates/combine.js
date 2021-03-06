var utilsString = require('shared/utils/lib/string');
var _ = window._;

if (!_) {
  _ = utilsString.format;
}

// 关联验证
function isSameNet(ip_lan, ip_wan, mask_lan, mask_wan) {
  var ip1Arr = ip_lan.split("."),
    ip2Arr = ip_wan.split("."),
    maskArr1 = mask_lan.split("."),
    maskArr2 = mask_wan.split("."),
    i;

  for (i = 0; i < 4; i++) {
    if ((ip1Arr[i] & maskArr1[i]) != (ip2Arr[i] & maskArr2[i])) {
      return false;
    }
  }
  return true;
}

function isBroadcastIp(ip, mask) {
  var ipArry = ip.split(".");
  var maskArry = mask.split(".");

  for (var i = 0; i < 4; i++) {
    var ipElem = parseInt(ipArry[i], 10);
    var maskElem = parseInt(maskArry[i], 10);
    if ((ipElem | maskElem) != 255) break;
  }

  return i === 4;
}
function getGreaterMask(mask1, mask2) {
  var mask1Arry = mask1.split(".");
  var mask2Arry = mask2.split(".");
  var mask1Elem;
  var mask2Elem;

  for (var i = 0; i < 4; i++) {
    mask1Elem = parseInt(mask1Arry[i], 10);
    mask2Elem = parseInt(mask2Arry[i], 10);
    if (mask1Elem > mask2Elem) {
      return mask2;
    } else if (mask1Elem < mask2Elem) {
      return mask1;
    }
  }

  return mask1;
}
function getMaxMask(maskArr) {
  if (!maskArr || (maskArr && typeof maskArr.reduce !== 'function')) {
    return ;
  }
  return maskArr.reduce(function (x, y) {
    return getGreaterMask(x, y);
  })
}

var combineVaildate = {

  //必须一样
  equal: function (str1, str2, msg) {
    if (str1 != str2) {
      return msg;
    }
  },

  //不能一样
  notEqual: function (str1, str2, msg) {
    if (str1 == str2) {
      return msg;
    }
  },

  //ip mask gateway 组合验证
  needStaticIP: function (ip, mask, gateway) {
    if (ip == gateway) {
      return __("Static IP cannot be the same as default gateway.");
    }

    if (!isSameNet(ip, gateway, mask, mask)) {
      return __("Static IP and default gateway must be in the same network segment");
    }
    if (isBroadcastIp(ip, mask)) {
      return __("%s can not be broadcast address", __('Static IP'));
    }
    if (isBroadcastIp(gateway, mask)) {
      return __("%s can not be broadcast address", __('Gateway'));
    }
  },

  needSameNet: function (ip, mask, gateway, msgOption) {
    // 过滤 undefined 值与空值
    if (!ip || !mask || !gateway) {
      return __("%s and %s must be in the same network segment", msgOption.ipLabel, msgOption.ip2Label);
    }

    if (!isSameNet(ip, gateway, mask, mask)) {
      return __("%s and %s must be in the same network segment", msgOption.ipLabel, msgOption.ip2Label);
    }
    if (isBroadcastIp(ip, mask)) {
      return __("%s can not be broadcast address", msgOption.ipLabel);
    }
    if (isBroadcastIp(gateway, mask)) {
      return __("%s can not be broadcast address", msgOption.ip2Label);
    }
  },

  ipSegment: function (ipElem, maskElem) {
    var ip,
      mask,
      ipArry,
      maskArry,
      len,
      maskArry2 = [],
      netIndex = 0,
      netIndex1 = 0,
      i = 0,
      k;


    ip = ipElem;
    mask = maskElem;

    ipArry = ip.split(".");
    maskArry = mask.split(".");
    len = ipArry.length;

    for (i = 0; i < len; i++) {
      maskArry2[i] = 255 - Number(maskArry[i]);
    }

    for (k = 0; k < 4; k++) { // ip & mask
      if ((ipArry[k] & maskArry[k]) == 0) {
        netIndex1 += 0;
      } else {
        netIndex1 += 1;
      }
    }
    for (k = 0; k < 4; k++) { // ip & 255 - mask
      if ((ipArry[k] & maskArry2[k]) == 0) {
        netIndex += 0;
      } else {
        netIndex += 1;
      }
    }

    if (netIndex == 0 || netIndex1 == 0) {
      return;
    } else {
      return __("Please enter a valid IP segment");
    }
  },

  needSeparateSegment: function(ip, mask, ip1, mask1, msgOption) {
    var maxMask = getGreaterMask(mask, mask1);
    var msg = (msgOption && msgOption.ipLabel) || '';
    var msg1 = (msgOption && msgOption.ip2Label) || '';

    if (isSameNet(ip, ip1, maxMask, maxMask)) {
      if (msg && msg1) {
        return __('%s and %s can not has same segment', msg, msg1);
      } else {
        return __('Can not has same segment');
      }
    }
  },

  noSameSegment: function(ip, mask, ip1, mask1, msgOption) {
    if (typeof mask1 === 'undefined' || typeof mask === 'undefined') {
      return ;
    }
    if (isSameNet(ip, ip1, mask, mask1)) {
      if (msgOption && msgOption.ipLabel && msgOption.ip2Label) {
        return __('%s and %s can not has same segment', msgOption.ipLabel, msgOption.ip2Label);
      } else {
        return __('Can not has same segment');
      }
    }
  },

  noBroadcastIp: function (ip, mask) {
    var isBroadcastIpRet = isBroadcastIp(ip, mask);

    if (isBroadcastIpRet) {
      return __('Broadcast IP address is not allowed!');
    }
  },

  noHostBitsAllZero: function(ip, mask, msgOption) {
    var ipArr = null;
    var maskArr = null;
    var i, curIpNum, curMaskNum;

    if (typeof ip !== 'string') {
      return __('%s must be string', (msgOption && msgOption.ipLabel) || __('IP Address'));
    }

    if(typeof mask !== 'string') {
      return __('%s must be string', (msgOption && msgOption.maskLabel) || __('Subnet Mask'));
    }

    ipArr = ip.split('.');
    maskArr = mask.split('.');

    for (i = 3; i >= 0; i -= 1) {
      curIpNum = parseInt(ipArr[i], 10);
      curMaskNum = parseInt(maskArr[i], 10);

      if ((curIpNum | curMaskNum) !== curMaskNum) {
        return ;
      }
    }
    if (msgOption && msgOption.ipLabel) {
      return __('%s and %s can not has same segment', msgOption.ipLabel);
    } else {
      return __('%s host bits Can not all zero', __('IP Address'));
    }
  },

  // 验证IP是否在subnet子网中，subnet形式为：'192.168.0.0/24'
  isWithinSubnet: function (ip, subnet) {
    var ipAddress = subnet.split('/')[0];
    var maskSize = subnet.split('/')[1];
    var ipNumber = function(ip) {
      var ipArr = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
      if (ipArr) return (+ipArr[1]<<24) + (+ipArr[2]<<16) + (+ipArr[3]<<8) + (+ipArr[4]);
      return null;
    }

    var ipMask = function(size) {
      return -1 << (32 - size);
    }

    if ((ipNumber(ipAddress) & ipMask(maskSize)) !== (ipNumber(ip) & ipMask(maskSize))) {
      return __('The IP address is out of the range of subnet!');
    }
  }
};

// exports
if (typeof module === "object" &&
  typeof module.exports === "object") {
  module.exports = combineVaildate;
}
