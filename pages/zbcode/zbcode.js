// pages/zbcode/zbcode.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var util = require('../../utils/util.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({

  data: {
    contents: '请复制地址到微信中打开',
    userId:"",
    activeId:""
  },
  onLoad: function (options) {
    console.log(options);
     var that=this;
     that.setData({
       contents:options.url,
       activeId:options.activeId
     })
    //获取用户信息
    if (!dataHelper.isExpiration()) {
      that.setData({
        userId: wx.getStorageSync("userId")
      })
    }else {
      //则没有用户数据过期或不存在则跳入登录页面，并携带activeID
      wx.navigateTo({
        url: '../../pages/login/login?activeId=' + this.data.activeId // 页面 B
      })
    }
  },
  copyText: function (e) {
    var that=this;
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
            //复制地址则代表已参加，需更新报名活动参与状态为已参加
            //获取session会员id和活动id
            that.updateProgressStatus();
          }
        })
      }
    })
  },
  updateProgressStatus:function(){
    var that=this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userId", that.data.userId);
    jsonstr=dataHelper.setJson(jsonstr,"activeId",that.data.activeId);
    jsonstr = dataHelper.setJson(jsonstr,"progressStatus","1");
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("activeInfo/updateProgressStatus", jsonParam, this.callback_updateProgressStatus);
  },
  callback_updateProgressStatus:function(dataW){
    var data=dataW.data;
    console.log(data);
    //码表回调
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    }
    //  else {
    //   wx.showToast({
    //     title: "参与成功",
    //     icon: "success",
    //     duration: 3000
    //   })
    // }
  }
})