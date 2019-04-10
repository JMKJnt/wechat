//app.js
var util = require('utils/util.js');
var dataHelper = require('utils/dataHelper.js');
var jsonHelper = require('utils/jsonHelper.js');
var userServiceHelper = require('utils/userServiceHelper.js');
App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //获取openid，
        if (res.code) {
          that.getOpenId(res.code);
        }
      }
    })
    // wx.setEnableDebug({
    //   enableDebug: true
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  getOpenId: function(code) {
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    jsonParam.jsonStr = dataHelper.setJson(null, "js_code", code);
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("wechatInfo/getOpenId", jsonParam, this.callback_getOpenId);
  },
  callback_getOpenId:function(dataW){
    var that = this;
    var data = dataW.data;
    console.log(data);
    if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      wx.setStorageSync('openId', data.openid);
      userServiceHelper.getToken();
    }
  }
  
})