// pages/student/student.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classId: "",
    className: "",
    schoolId:"",
    schoolName: "",
    studentList: []
  },
  phonecall:function(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    //根据会员id查询会员基本信息
    if (options.classId == undefined || options.classId == null || options.classId == "") {
      //跳转到登录
      wx.navigateTo({
        url: '../../pages/login/login' // 页面 B
      })
    } else {
      this.setData({
        classId: options.classId
      });
      //获取班级信息信息
      this.getClassInfo();
    }
  },
  getClassInfo: function () {
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "classId", this.data.classId);
    jsonParam.jsonStr = jsonstr;
    //根据userID获取用户信息
    userServiceHelper.requestCommonPost("classInfo/getClassInfoById", jsonParam, this.callback_getClassInfo);
  },
  callback_getClassInfo: function (dataW) {
    var that = this;
    var data=dataW.data;
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
        classId: data.classId,
        className: data.className,
        schoolId: data.classSchool,
        studentList: data.studentList
      })
    }
  }
})