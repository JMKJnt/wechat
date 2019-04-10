// pages/myActiveList/myActiveList.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var util = require('../../utils/util.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectType: "0",
    userId: "",
    activeList: [],
    statusList: [],
    oldActiveList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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
      //获取码表
      that.getDataInfo();
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
      that.getDataInfo();
    }
  },
  detailClcik: function (event) {
    console.log(event.currentTarget.dataset.activeid);
    //点击进入活动详情
    wx.navigateTo({
      url: '../../pages/activeDetail/activeDetail?id=' + event.currentTarget.dataset.activeid // 页面 B
    })
  },
  selectClick: function (event) {
    var that = this;
    that.setData({
      selectType: event.currentTarget.dataset.id
    });
    //根据点击code隐藏其他信息
    var temp = [];
    if (that.data.selectType == "0") {
      temp = that.data.oldActiveList;
    } else {
      that.data.oldActiveList.forEach((item, i) => {
        if (that.data.selectType == "2") {
          //如果选择状态为进行中则查询 活动参与状态为1，且时间isTime=true
          if (item.registerProgressStatus == "1" && item.isTime) {
            temp.push(item);
          }
        } else {
          if (item.registerProgressStatus == that.data.selectType) {
            temp.push(item);
          }
        }
      });
    }
    that.setData({
      activeList: temp
    });
  },
  gotoActive: function (event) {
    //参加活动
  },
  getDataInfo: function () {
    //码表 1 已参加，3未参加，4已过期
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "processStatus");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getDataInfo);

  },
  callback_getDataInfo: function (dataW) {
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
      var temp = [{ "data_name": "全部", 'data_code': "0" }];
      data.lists.forEach((item, i) => {
        var value = dataHelper.setJson(null, 'data_name', item.data_name);
        value = dataHelper.setJson(value, 'data_code', item.data_code);
        temp.push(jsonHelper.stringToJson(value));
      });
      that.setData({
        statusList: temp
      })
    }
    //根据会员ID获取我的活动列表
    that.getActiveRegisterList();
  },
  getActiveRegisterList: function () {
    //根据userID获取用户报名信息
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var value = dataHelper.setJson(null, 'userId', that.data.userId);
    value = dataHelper.setJson(value, 'curragePage', "1");
    value = dataHelper.setJson(value, 'pageSize', '9999999');
    jsonParam.jsonStr = value;
    userServiceHelper.requestCommonPost("activeInfo/getActiveRegisterList", jsonParam, this.callback_getActiveRegisterList);
  },
  callback_getActiveRegisterList(dataW) {
    var that = this;
    var data = dataW.data;
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      var temp = [];
      data.lists.forEach((item, i) => {
        var value = JSON.stringify(item);
        value = dataHelper.setJson(value, 'ProgressStatusName', that.getNameBydataCode(item.registerProgressStatus));
        value = dataHelper.setJson(value, 'registerTime', item.registerTime.substring(0, 19));
        value = dataHelper.setJson(value, 'activeStartTime', item.activeStartTime.substring(0, 10));
        value = dataHelper.setJson(value, 'activeEndTime', item.activeEndTime.substring(0, 10));
        if (dataHelper.checkEndDate(item.activeStartTime, util.formatTime(new Date())) && dataHelper.checkEndDate(util.formatTime(new Date()), item.activeEndTime)) {
          //跳转
          if (item.registerProgressStatus == "3") {
            value = dataHelper.setJson(value, "yzImg", "../../img/oncj.png")
          }
          else if (item.registerProgressStatus == "1") {
            value = dataHelper.setJson(value, "yzImg", "../../img/cjing.png")
          }
          value = dataHelper.setJson(value, 'isTime', true);
        } else {
          if (item.registerProgressStatus == "3") {
            value = dataHelper.setJson(value, "yzImg", "../../img/oncj.png")
          } else if (item.registerProgressStatus == "1") {
            value = dataHelper.setJson(value, "yzImg", "../../img/ncj.png")
          }
          value = dataHelper.setJson(value, 'isTime', false);
        }
        temp.push(jsonHelper.stringToJson(value));
      })
      that.setData({
        activeList: temp,
        oldActiveList: temp
      })
    }
  },
  getNameBydataCode: function (code) {
    var name = "";
    var that = this;
    that.data.statusList.forEach((item, i) => {
      if (item.data_code == code) {
        name = item.data_name;
      }
    })
    return name;
  }
})