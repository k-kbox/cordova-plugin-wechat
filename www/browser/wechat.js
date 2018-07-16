function iswx() {
  const ua = window.navigator.userAgent.toLowerCase();
  // console.log(ua);
  if (ua.match(/MicroMessenger/i)) {
    return true;
  } else {
    return false;
  }
}

var payInfo;
var cb;

export function WXPay(payinfo) {
  // console.log(payInfo);
  payInfo = payinfo;
  return new Promise(function (resolve, reject) {
    cb = function (res) {
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
    "appId": payInfo.appId, // "wx2421b1c4370ec43b",     //公众号名称，由商户传入
    "timeStamp": payInfo.timeStamp, //"1395712654",         //时间戳，自1970年以来的秒数
    "nonceStr": payInfo.nonceStr, //"e61463f8efa94090b1f366cccfbbb444", //随机串
    "package": payInfo.package, //"prepay_id=u802345jgfjsdfgsdg888",
    "signType": payInfo.signType, //"MD5",         //微信签名方式：
    "paySign": payInfo.paySign, //"70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
  };
  // alert(JSON.stringify(opts));
  WeixinJSBridge.invoke(
    'getBrandWCPayRequest', opts,
    function (res) {
      // alert(JSON.stringify(res))
      //
      cb && cb(res);
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
  init: function(appid, success, fail) {
    // exec(success, fail, 'WeChat', "init", [appid])
    if (success) success('ok')
  },

  /**
   *
   * @param url
   * @param params
   * @param success
   * @param fail
   */
  unifiedOrder: function(url, params, success, fail) {
    // exec(success, fail, "WeChat", "unifiedOrder", [params]);
    var xhr = new XMLHttpRequest()  // 创建异步请求
    // 异步请求状态发生改变时会执行这个函数
    xhr.onreadystatechange = function () {
      // status == 200 用来判断当前HTTP请求完成
      if (xhr.readyState == 4){
        if (xhr.status == 200) {
          if (success) success(JSON.parse(xhr.responseText))  // 标记已完成
        } else {
          if (fail) fail({code: xhr.status, message: xhr.responseText})
        }
      }
    }
    //连接服务器
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    //发送请求
    xhr.send(params);
  },

  pay: function (params, success, fail) {
// exports.pay = function (payinfo, success, error) {
    if (iswx()) {
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
          if (success) {
            success(ret)
          }
        })
        .catch((err) => {
          if (fail) {
            fail(err)
          }
        })

    } else {
      if (fail) {
        // h5
        fail({
          err_msg: '请在微信内支付'
        })

      }
    }
  }
}