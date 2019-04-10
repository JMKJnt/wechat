// pages/question/question.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    itemList1: [],
    itemList2: [],
    activeId: "",
    activeName: "",
    question1: "1",
    question2: "1"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if (!dataHelper.isEmpty(options.activeId)) {
      this.setData({
        activeId: options.activeId
      })
    }
    if (!dataHelper.isEmpty(options.activeName)) {
      this.setData({
        activeName: "12",
        itemList1: [{
          "name": "正在参加" + options.activeName + "活动",
          "value": "1",
          "checked": true
        }, {
          "name": "首次报名参加",
          "value": "2",
          "checked": false
        }, {
          "name": "没有参加" + options.activeName + "，但参与过以往期数的活动",
          "value": "3",
          "checked": false
        }],
        itemList2: [{
          "name": "1次",
          "value": "1",
          "checked": true
        }, {
          "name": "5次以上",
          "value": "2",
          "checked": false
        }, {
          "name": "10次以上",
          "value": "3",
          "checked": false
        }, {
          "name": "15次以上",
          "value": "4",
          "checked": false
        }]
      })
    }
  },
  submit: function() {
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "activeId", that.data.activeId);
    jsonstr = dataHelper.setJson(jsonstr, "questionUserId", wx.getStorageSync("userId"));
    jsonstr = dataHelper.setJson(jsonstr, "questionCreate", wx.getStorageSync("userId"));
    jsonstr = dataHelper.setJson(jsonstr, "questionIsActive", that.data.question1);
    jsonstr = dataHelper.setJson(jsonstr, "questionActiveNum", that.data.question2);
    jsonstr = dataHelper.setJson(jsonstr, "status", "1");
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("activeInfo/insertQuestionInfo", jsonParam, this.callback_insertQuestionInfo);
  },
  callback_insertQuestionInfo: function(dataW) {
    var that = this;
    var data = dataW.data;
    if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
      wx.showToast({
        title: '提交失败',
        icon: "none",
        duration: 3000
      })
    } else {
      //判断是否存在activeId,存在则跳转到活动详情
      if (!dataHelper.isEmpty(that.data.activeId)) {
        wx.navigateTo({
          url: '../../pages/activeDetail/activeDetail?id=' + that.data.activeId +"&isQuestionTZ=true", // 页面 B
        });
      } else {
        wx.switchTab({
          url: '../../pages/activeList/activeList', // 页面 B
          success: function() {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        });
      }
    }
  },
  radioChange1: function(e) {
    var that = this;
    that.setData({
      question1: e.detail.value
    })
  },
  radioChange2: function(e) {
    var that = this;
    that.setData({
      question2: e.detail.value
    })
  }
})