
const AppData = {
  appid: null,
  payInfo: null,
  cb: null
}

function isWx() {
  const ua = window.navigator.userAgent.toLowerCase();
  // console.log(ua);
  if (ua.match(/MicroMessenger/i)) {
    return true;
  } else {
    return false;
  }
}

function WXPay(payinfo) {
  // console.log(payInfo);
  AppData.payInfo = payinfo;
  return new Promise(function (resolve, reject) {
    AppData.cb = function (res) {
      // console.log(res)
      if (res && res.err_msg == "get_brand_wcpay_request:ok") {
        resolve(res)
      }
      else {
        reject(res)
      }
    }

    if (typeof WeixinJSBridge == "undefined") {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      onBridgeReady();
    }
  })
}

function onBridgeReady() {
  // return new Promise(function (resolve, reject) {
  var opts = {
    "appId": AppData.payInfo.appId, // "wx2421b1c4370ec43b",     //公众号名称，由商户传入
    "timeStamp": AppData.payInfo.timeStamp, //"1395712654",         //时间戳，自1970年以来的秒数
    "nonceStr": AppData.payInfo.nonceStr, //"e61463f8efa94090b1f366cccfbbb444", //随机串
    "package": AppData.payInfo.package, //"prepay_id=u802345jgfjsdfgsdg888",
    "signType": AppData.payInfo.signType, //"MD5",         //微信签名方式：
    "paySign": AppData.payInfo.paySign, //"70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
  };
  // alert(JSON.stringify(opts));
  WeixinJSBridge.invoke(
    'getBrandWCPayRequest', opts,
    function (res) {
      // alert(JSON.stringify(res))
      //
      AppData.cb && AppData.cb(res);
      // if (res.err_msg == "get_brand_wcpay_request:ok") {
      //
      //   resolve(res)
      // }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
      // else {
      //   reject(res)
      // }
    }
  );
  // });
}

module.exports = {
  Scene: {
    SESSION:  0, // 聊天界面
    TIMELINE: 1, // 朋友圈
    FAVORITE: 2  // 收藏
  },

  Type: {
    APP:     1,
    EMOTION: 2,
    FILE:    3,
    IMAGE:   4,
    MUSIC:   5,
    VIDEO:   6,
    WEBPAGE: 7
  },

  isInstalled: function (onSuccess, onError) {
    if (AppData.appid) {
      if (onSuccess) onSuccess(true)
    } else {
      if (onError) onSuccess(false);
    }
  },

  init: function(appid, onSuccess, onError) {
    // exec(success, fail, 'WeChat', "init", [appid])
    AppData.appid = appid;
    if (isWx()) {
      var script=document.createElement("script");
      // script.setAttribute("type", "text/javascript");
      script.setAttribute("src", "http://res.wx.qq.com/open/js/jweixin-1.2.0.js");
      document.getElementsByTagName("head")[0].appendChild(script);
    }
    else {
      //
      var script = document.createElement("script");
      script.setAttribute("src", "http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js");
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    if (onSuccess) onSuccess('ok')
  },

  /**
   * Share a message to wechat app
   *
   * @example
   * <code>
   * Wechat.share({
     *     message: {
     *        title: "Message Title",
     *        description: "Message Description(optional)",
     *        mediaTagName: "Media Tag Name(optional)",
     *        thumb: "http://YOUR_THUMBNAIL_IMAGE",
     *        media: {
     *            type: Wechat.Type.WEBPAGE,   // webpage
     *            webpageUrl: "https://github.com/xu-li/cordova-plugin-wechat"    // webpage
     *        }
     *    },
     *    scene: Wechat.Scene.TIMELINE   // share to Timeline
     * }, function () {
     *     alert("Success");
     * }, function (reason) {
     *     alert("Failed: " + reason);
     * });
   * </code>
   */
  share: function (message, onSuccess, onError) {
    // exec(onSuccess, onError, "Wechat", "share", [message]);
  },

  /**
   * Sending an auth request to Wechat
   *
   * @example
   * <code>
   * Wechat.auth(function (response) { alert(response.code); });
   * </code>
   */
  auth: function (scope, state, onSuccess, onError) {
    if (typeof scope == "function") {
      // Wechat.auth(function () { alert("Success"); });
      // Wechat.auth(function () { alert("Success"); }, function (error) { alert(error); });
      // return exec(scope, state, "Wechat", "sendAuthRequest");
      onError = state;
      onSuccess = scope;
      scope = 'snsapi_userinfo'; // snsapi_userinfo
      state = 'wechat'
    }
    else if (typeof state == "function") {
      // Wechat.auth("snsapi_userinfo", function () { alert("Success"); });
      // Wechat.auth("snsapi_userinfo", function () { alert("Success"); }, function (error) { alert(error); });
      // return exec(state, onSuccess, "Wechat", "sendAuthRequest", [scope]);
      onError = onSuccess;
      onSuccess = state;
      state = 'wechat';
    }

    var redirect = window.location.protocol + '//'
      + window.location.hostname
      + (window.location.port ? (':' + window.location.port) : '')
      // + (window.location.port !== 80 ? (':' + window.location.port) : '')
      + '/'; //  '/%23wxlogin';

    // return exec(onSuccess, onError, "Wechat", "sendAuthRequest", [scope, state]);
    if (isWx()) {
      // let redirect = window.location.href + '?wxlogin';
      // alert(redirect)
      window.location.href = // redirect + "?code=1231231";
        'https://open.weixin.qq.com/connect/oauth2/authorize' +
        '?appid=' + AppData.appid +
        '&redirect_uri=' + redirect +
        '&response_type=code&scope=' + scope + '&state=' + state + '#wechat_redirect';
    } else {
      var obj = new WxLogin({
        self_redirect:true,
        id:"login_container",
        appid: AppData.appid,
        scope: scope,
        redirect_uri:redirect,
        state: state,
        style: "",
        href: ""
      });
    }

  },

  /**
   * Send a payment request
   *
   * @link https://pay.weixin.qq.com/wiki/doc/api/app.php?chapter=9_1
   * @example
   * <code>
   * var params = {
     *     mch_id: '10000100', // merchant id
     *     prepay_id: 'wx201411101639507cbf6ffd8b0779950874', // prepay id returned from server
     *     nonce: '1add1a30ac87aa2db72f57a2375d8fec', // nonce string returned from server
     *     timestamp: '1439531364', // timestamp
     *     sign: '0CB01533B8C1EF103065174F50BCA001', // signed string
     * };
   * Wechat.sendPaymentRequest(params, function () {
     *     alert("Success");
     * }, function (reason) {
     *     alert("Failed: " + reason);
     * });
   * </code>
   */
  sendPaymentRequest: function (params, onSuccess, onError) {
    // exec(onSuccess, onError, "Wechat", "sendPaymentRequest", [params]);
    if (isWx()) {
      // var xhr = new XMLHttpRequest()  // 创建异步请求
      // // 异步请求状态发生改变时会执行这个函数
      // xhr.onreadystatechange = function () {
      //   // status == 200 用来判断当前HTTP请求完成
      //   if (xhr.readyState == 4 && xhr.status == 200) {
      //     resolve(JSON.parse(xhr.responseText))  // 标记已完成
      //   }
      // }
      // //连接服务器
      // xhr.open('POST', 'https://read.k-kbox.com/api/ximalaya' + uri.relative, true);
      // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // //发送请求
      // xhr.send(params.join("&"));
      WXPay(params)
        .then((ret) => {
          if (onSuccess) {
            onSuccess(ret)
          }
        })
        .catch((err) => {
          if (onError) {
            onError(err)
          }
        })

    } else {
      if (onError) {
        // h5
        onError({
          err_msg: '请在微信内支付'
        })

      }
    }
  },

  /**
   * jumpToBizProfile （跳转到某个微信公众号）2016-11-11 测试是失效的，囧
   *
   * @link https://segmentfault.com/a/1190000007204624
   * @link https://segmentfault.com/q/1010000003907796
   * @example
   * <code>
   * var params = {
     *     info: 'gh_xxxxxxx', // 公众帐号原始ID
     *     type:  'Normal' // 普通号
     * }
   * or
   * var params = {
     *     info: 'extMsg', // 相关的硬件二维码串
     *     type:  'Device' // 硬件号
     * };
   * Wechat.jumpToBizProfile(params, function () {
     *     alert("Success");
     * }, function (reason) {
     *     alert("Failed: " + reason);
     * });
   * </code>
   */

  jumpToBizProfile: function (params, onSuccess, onError) {
    // exec(onSuccess, onError, "Wechat", "jumpToBizProfile", [params]);
  },

  /**
   * jumpToWechat （因为jumpToBizProfile失效了，暂时新增了一个临时的api)
   *
   * @link https://segmentfault.com/a/1190000007204624
   * @example
   * <code>
   * var url = "wechat://" 现阶段貌似只支持这一个协议了
   * Wechat.jumpToWechat(url, function () {
     *     alert("Success");
     * }, function (reason) {
     *     alert("Failed: " + reason);
     * });
   * </code>
   */
  jumpToWechat: function (url, onSuccess, onError) {
    // exec(onSuccess, onError, "Wechat", "jumpToWechat", [url]);
  },

  /**
   * chooseInvoiceFromWX exq:choose invoices from Wechat card list
   *
   * @example
   * <code>
   * params: signType, cardSign, nonceStr, timeStamp  all required
   * Wechat.chooseInvoiceFromWX(params, function () {
     *     alert("Success");
     * }, function (reason) {
     *     alert("Failed: " + reason);
     * });
   * </code>
   */
  chooseInvoiceFromWX: function (params, onSuccess, onError) {
    // exec(onSuccess, onError, "Wechat", "chooseInvoiceFromWX", [params]);
  }

}