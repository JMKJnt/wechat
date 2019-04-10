// pages/class/class.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: "",
    userName: "",
    userRole: "",
    userRoleName: "",
    className: "",
    schoolId: "",
    schoolName: "",
    classTeacherName: "",
    classTeacherPhone: "",
    classList: [],
    isTeacher: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    //根据会员id查询会员基本信息
    if (options.userId == undefined || options.userId == null || options.userId == "") {
      //跳转到登录
      wx.navigateTo({
        url: '../../pages/login/login' // 页面 B
      })
    } else {
      this.setData({
        userId: options.userId
      })
      //获取用户信息
      this.getUserInfoById();
    }
  },
  studentClick: function (e) {
    //跳转到学生页
    wx.navigateTo({
      url: '../../pages/student/student?classId=' + e.currentTarget.dataset.id // 页面 B
    })
  },
  getUserInfoById: function () {
    var jsonParam = userServiceHelper.jsonParamCommon();
    var that = this;
    var jsonstr = dataHelper.setJson(null, "userId", that.data.userId);
    jsonParam.jsonStr = jsonstr;
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
        title: '请求失败：' + data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      that.setData({
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userRoleName: data.userRoleName,
        className: data.classList.length > 0 ? data.classList[0].className : '',
        schoolId: data.classList.length > 0 ? data.classList[0].schoolId : '',
        schoolName: data.classList.length > 0 ? data.classList[0].schoolName : '',
        classTeacherName: data.classList.length > 0 ? data.classList[0].classTeacherName : '',
        classTeacherPhone: data.classList.length > 0 ? data.classList[0].classTeacherPhone : '',
        classList: data.classList
      })
      that.setData({
        isTeacher: that.data.userRole.indexOf("2") >= 0 ? true : false
      })
      console.log(that.data.classList);
    }
  }
})