// 验证函数
var utilsCore = require('shared/utils/lib/core');
var utilsString = require('shared/utils/lib/string');
var _ = window._;

if(!_) {
  _ = utilsString.format;
}

var vaildate = {

  // 纯字符串长度
  len: function(str, min, max) {
    var len = str.length;
    var thisMin = min || 0;

    if (thisMin === max && len !== thisMin) {
      return `${_('String length must be: ')}${min} ${_('bit')}`;
    } else if (len < thisMin || len > max) {
      return `${_('String length range is: ')}${min} - ${max} ${_('bit')}`;
    }
  },

  // UTF-8 字节长度
  utf8Len: function(str, min, max) {
    var len = utilsCore.getUtf8Length(str);
    var thisMin = min || 0;

    if (thisMin === max && len !== thisMin) {
      return `${_('String length must be: ')}${min} bytes`;
    } else if (len < thisMin || len > max) {
      return `${_('String length range is: ')}${min} - ${max} bytes`;
    }
  },

  num: function(str, min, max, expand) {

    if (!utilsString.isInteger(str)) {
      return _("Must be integer");
    }
    console.log('expand', expand);
    if(expand !== undefined) {
      if(parseInt(str, 10) === parseInt(expand, 10)) {
        return ;
      }
    }

    if (min !== undefined && max !== undefined) {
      if (parseInt(str, 10) < min || parseInt(str, 10) > max) {
        const str = typeof (expand) !== 'undefined' ? _("Range: ") + _("%s", expand) + _(" or ") + _("%s - %s", min, max) :
                             _("Range: ") + _("%s - %s", min, max);
        return str;
      }
    }
  },

  mac: {
    all: function(str) {
      var ret = this.specific(str);

      if (ret) {
        return ret;
      }

      if (!(/^([0-9a-fA-F]{2}(:|-)){5}[0-9a-fA-F]{2}$/).test(str)) {
        return _('Please input a valid MAC address like AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF');
      }
    },

    specific: function(str) {
      var subMac1 = str.split(':')[0];
      if (subMac1.charAt(1) && parseInt(subMac1.charAt(1), 16) % 2 !== 0) {
        return _('The second character must be even number.');
      }
      if (str === "00:00:00:00:00:00") {
        return _('Mac can not be 00:00:00:00:00:00');
      }
    }
  },

  /**
   * 一般IP不能
   */
  ip: {
    all: function(str, isSegment) {
      var ret = this.specific(str);
      var ipReg = /^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;

      if (ret) {
        return ret;
      }

      // 如果是网段 ip, 允许最后一位为 0
      if (isSegment) {
        ipReg = /^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
      }

      if (!(ipReg).test(str)) {
        return _("Please input a valid IP address");
      }
    },

    /**
     * 不能为回环地址，A类地址
     */
    specific: function(str) {
      var ipArr = str.split('.'),
        ipHead = ipArr[0];

      if (ipArr[0] === '127') {
        return _("Address begin with 127 is a reserved loopback address, please input another value between 1 to 233");
      }
      if (ipArr[0] > 223) {
        return _('Address begin with %s is invalid, please input a value between 1 to 223.', ipHead);
      }
    }
  },
  ipSegment: {
    all: function(str, noMask) {
      var ret = this.specific(str, noMask);
      var ip = str.split('/')[0];
      var mask = str.split('/')[1];

      if (ret) {
        return ret;
      }

      if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(ip)) {
        return _("Please input a valid IP address");
      }

      // 只有无 noMask 参数是才验证子网
      if (!noMask && mask) {
        if (!(/^([0-9]){1,2}$/.test(mask)) || mask > 32) {
          return _("Network segment mask must be a number between 0-32");
        }
      }
    },

    specific: function(str, noMask) {
      return vaildate.ip.specific(str, noMask);
    }
  },

  dns: {
    all: function(str) {
      var ret = this.specific(str);

      if (ret) {
        return ret;
      }

      if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(str)) {
        return _("Please input a valid IP address");
      }
    },

    specific: function(str) {
      var ipArr = str.split('.'),
        ipHead = ipArr[0];

      if (ipArr[0] === '127') {
        return _("Address begin with 127 is a reserved loopback address, please input another value between 1 to 233");
      }
      if (ipArr[0] > 223) {
        return _('Address begin with %s is invalid, please input a value between 1 to 223.', ipHead);
      }
    }
  },
  iplist: function(str, delimiter) {
    var ipArr = str.split(delimiter);
    var len = ipArr.length;
    var i;
    var ret;
    for (i = 0; i < len; i++) {
      ret = vaildate.ip.all(ipArr[i]);
      if (ret) {
        return ret;
      }
    }
  },
  mask: function(str) {
    var rel = /^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/;

    if (!rel.test(str)) {
      return _("Please input a valid subnet mask");
    }
  },

  email: function(str) {
    var rel = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!rel.test(str)) {
      return _("Please input a valid E-mail address");
    }

  },

  time: function(str) {
    if (!(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).test(str)) {
      return _("Please input a valid time.");
    }
  },
  hex: function(str) {
    if (!(/^[0-9a-fA-F]{1,}$/).test(str)) {
      return _("Must be hex.");
    }
  },

  ascii: function(str, min, max) {

    if (!utilsString.isAscii(str)) {
      return _("Must be ASCII.");
    }
    if (min || max) {
      return this.len(str, min, max);
    }
  },

  pwd: function(str, minLen, maxLen) {
    var ret;

    if (!(/^[0-9a-zA-Z_]+$/).test(str)) {
      return _('Must be numbers, letters or an underscore');
    }

    if (minLen && maxLen) {
      ret = this.len(str, minLen, maxLen);
      if (ret) {
        return ret;
      }
    }
  },

  username: function(str) {
    if (!(/^\w{1,}$/).test(str)) {
      return _("Please input a valid username.");
    }
  },

  ssidPasword: function(str, minLen, maxLen) {
    var ret;

    ret = this.ascii(str);
    if (!ret && minLen && maxLen) {
      ret = this.len(str, minLen, maxLen);
      if (ret) {
        return ret;
      }
    }

    return ret;
  },

  remarkTxt: function(str, banStr) {
    var len = banStr.length,
      curChar,
      i;

    for (i = 0; i < len; i++) {
      curChar = banStr.charAt(i);
      if (str.indexOf(curChar) !== -1) {
        return _("Can't input: %s", curChar);
      }
    }
  },

  required: function(str) {
    if (str === undefined || str === '') {
      return _('%s is required');
    }
  }
};

// exports
if (typeof module === "object" &&
  typeof module.exports === "object") {
  module.exports = vaildate;
}
