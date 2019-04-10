// pages/activeList/activeList.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
var jsonHelper = require('../../utils/jsonHelper.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    activeRQ: false,
    activeName: "",
    roleList: [],
    dataList: [],
    roleName: "全部",
    roleType: "",
    isLoadTime: false,
    timeType: "",
    timeName: "状态",
    defaultType:"0",
    defaultName:"默认",
    isLoadDefault:false
  },
  bClickHide:function(){
    var that = this;
    that.setData({
      isLoad: false,
      isLoadTime:false,
      isLoadDefault: false
    });
  },
  roleClick: function (event) {
    //选择角色条件
    var that = this;
    that.setData({
      roleType: event.currentTarget.dataset.id,
      roleName: event.currentTarget.dataset.name,
      isLoad: false
    });
    //查询活动列表
    that.getActiveInfoList();
  },
  defaultClick:function(e){
    console.log(e.currentTarget.dataset);
    var that = this;
    that.setData({
      defaultType: e.currentTarget.dataset.id,
      defaultName: e.currentTarget.dataset.name,
      isLoadDefault: false
    });
    //查询活动列表
    that.getActiveInfoList();
  },
  timeClick: function (e) {
    console.log(e.currentTarget.dataset);
    var that = this;
    that.setData({
      timeType: e.currentTarget.dataset.id,
      timeName: e.currentTarget.dataset.name,
      isLoadTime: false
    });
    //查询活动列表
    that.getActiveInfoList();
  },
  activeSearch: function (e) {
    var that = this;
    that.setData({
      activeName: e.detail.value
    })
    //查询活动列表
    that.getActiveInfoList();
  },
  roleSelect: function (event) {
    //查询查询活动列表
    var that = this;
    that.setData({
      isLoad: true
    });
  },
  timeSelect: function (e) {
    var that = this;
    that.setData({
      isLoadTime: true
    });
  },
  defaultSelect: function (e) {
    var that = this;
    that.setData({
      isLoadDefault: true
    });
  },
  detailClick: function (event) {
    //查看详情
    wx.navigateTo({
      url: '../../pages/activeDetail/activeDetail?id=' + event.currentTarget.dataset.id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDatainfo();
  },
  getDatainfo: function () {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "roleType");
    jsonParam.jsonStr = jsonstr;

    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getDatainfo);

  },
  callback_getDatainfo: function (dataW) {
    console.log(dataW.data);
    var data = dataW.data;
    //码表回调
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: '请求失败：' + data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      //处理数据，添加选中状态 
      var listT = [{ "data_name": "全部", "data_code": "0" }];
      data.lists.forEach((item, i) => {
        listT.push(item);
      });
      data.lists = listT;
      this.setData({
        roleList: data.lists,
        roleType: "0"
      });
    }
    this.getActiveInfoList();
  },
  getActiveInfoList: function () {
    //获取活动列表
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var value = dataHelper.setJson(null, 'activeName', that.data.activeName);
    value = dataHelper.setJson(value, 'activeStatus', "2");
    value = dataHelper.setJson(value, 'activeApplicableRole', that.data.roleType);
    value = dataHelper.setJson(value, 'registerStatus', that.data.timeType);
    value = dataHelper.setJson(value, 'isNumCy', that.data.defaultType);
    value = dataHelper.setJson(value, 'curragePage', "1");
    value = dataHelper.setJson(value, 'pageSize', '9999999');
    jsonParam.jsonStr = value;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("activeInfo/getActiveInfoList", jsonParam, this.callback_getActiveInfoList);

  },
  callback_getActiveInfoList: function (dataW) {
    var data = dataW.data;
    console.log(data);
    var that = this;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: '请求失败：' + data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      that.setData({
        dataList: data.lists
      });
    }
  }
})