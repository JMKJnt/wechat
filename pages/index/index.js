//index.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
//获取应用实例
const app = getApp();
Page({
  data: {
    userId: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userRole: "",
    userRoleName: "",
    userPhone: "",
    uerPhoneZ: "",
    userName: "",
    isInsertClassShow:false,
    isClassShow:false
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  exitLogin: function () {
    //弹出确认框
    wx.showModal({
      title: '提示',
      content: '是否确认退出?',
      success: function (res) {
        if (res.confirm) {
          //退出登录
          wx.clearStorageSync("userId", "");
          wx.setStorageSync("data_expiration", "");
          wx.setStorageSync("openid", "");
          //跳转到登录页
          wx.navigateTo({
            url: '../../pages/login/login' // 页面 B
          })
        }
      }
    })

  },
  myActive: function () {
    //我的活动列表
    wx.switchTab({
      url: '../../pages/myActiveList/myActiveList',// 页面 B
      success: function () {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    });
  },
  classClick: function () {
    var that = this;
    wx.navigateTo({
      url: '../../pages/class/class?userId=' + that.data.userId + "&usrRole=" + that.data.userRole// 页面 B
    })
  },
  insertClass: function () {
    var that = this;
    wx.navigateTo({
      url: '../../pages/insertClass/insertClass?classTeacher=' + that.data.userId // 页面 B
    })
  },
  student: function () {
    var that = this;
    wx.navigateTo({
      url: '../../pages/student/student?userId=' + that.data.userId + "&usrRole=" + that.data.userRole // 页面 B
    })
  },
  myInfo: function () {
    var that = this;
    wx.navigateTo({
      url: '../../pages/myInfo/myInfo?userId=' + that.data.userId// 页面 B
    })
  },
  onLoad: function () {
    //判断是否过期，过期则跳入登录页
    var that = this;
    //获取session的userId,判断是否过期，过期返回登录页面，
    if (dataHelper.isExpiration()) {
      //如果过期则返回登录页面
      //跳转到登录页
      wx.navigateTo({
        url: '../../pages/login/login' // 页面 B
      })
    } else {
      that.setData({
        userId: wx.getStorageSync("userId"),
      });
      that.getUserInfoById();
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  onShow: function () {
    var that = this;
    //获取session的userId,判断是否过期，过期返回登录页面，
    if (dataHelper.isExpiration()) {
      //如果过期则返回登录页面
      //跳转到登录页
      // wx.navigateTo({
      //   url: '../../pages/login/login' // 页面 B
      // })
    } else {
      that.setData({
        userId: wx.getStorageSync("userId"),
      });
      that.getUserInfoById();
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getUserInfoById: function () {
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userId", this.data.userId);
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    //根据userID获取用户信息
    userServiceHelper.requestCommonPost("userInfo/getUserInfoById", jsonParam, this.callback_getUserInfoById);
  },
  callback_getUserInfoById: function (dataW) {
    var that = this;
    var data = dataW.data;
    //码表回调
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      var h_str = data.userPhone.slice(0, 5);
      var f_str = data.userPhone.slice(9, 11);
      console.log(f_str);
      that.setData({
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userRoleName: data.userRoleName,
        userPhone: data.userPhone,
        uerPhoneZ: h_str + "****" + f_str
      })
      that.setData({
        isInsertClassShow: that.data.userRole.indexOf("2") >= 0 ? true : false,
        isClassShow: that.data.userRole.indexOf("3") >= 0 || that.data.userRole.indexOf("2") >= 0 ? true : false
      })
    }
  }
})
