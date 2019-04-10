// pages/login/login.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
import WxValidate from '../../utils/wx-validate/WxValidate';
var jsonHelper = require('../../utils/jsonHelper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useId: "",
    userPhone: "",
    passWord: "",
    displayWarn: "display:none",
    activeId: "",
    roleList:[],
    role:""
  },
  userPhoneInput: function (e) {
    var that = this;
    that.setData({
      userPhone: e.detail.value
    })
  },
  passWordInput: function (e) {
    var that = this;
    that.setData({
      passWord: e.detail.value
    })
  },
  register: function () {
    //跳转到注册页面判断是否存在活动ID 存在则带入条件
    if (!dataHelper.isEmpty(this.data.activeId)) {
      wx.navigateTo({
        url: '../../pages/register/register?activeId=' + this.data.activeId // 页面 B
      })
    } else {
      wx.navigateTo({
        url: '../../pages/register/register' // 页面 B
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options);
    if (options != undefined && options != null && options != "") {
      //判断是否存在activeid,存在则记录
      if (!dataHelper.isEmpty(options.activeId)) {
        that.setData({
          activeId: options.activeId
        })
      }
    }
    that.getDatainfo();
    that.setValidate();
  },
  getDatainfo: function () {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "roleType");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getDatainfo);

  },
  callback_getDatainfo: function (dataW) {
    //码表回调
    var data = dataW.data;
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      //处理数据，添加选中状态 
      var listT = [];
      data.lists.forEach((item, i) => {
        var value = JSON.stringify(item);
        value = dataHelper.setJson(value, "checkStatus", item.data_code == '1' ? "checked" : "");
        listT.push(jsonHelper.stringToJson(value));
      });
      data.lists = listT;
      this.setData({
        roleList: data.lists,
        role: "1"
      });
    }
  },
  setValidate: function () {
    var that = this;
    const rules = {
      userPhone: {
        required: true,
        tel: true
      },
      passWord: {
        required: true,
        minlength: 6,
        isEnglishInt: true
      }
    };
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      userPhone: {
        required: "请输入手机号",
        tel: "手机格式不正确"
      },
      passWord: {
        required: "请输入密码",
        minlength: "密码必须为6位",
        isEnglishInt: "密码只能是英文或数字"
      }
    };
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages);
  },
  /**
   * 表单验证->(可自定义验证形式)
   */
  showWarnInfo(error) {
    // 当前page是this对象
    let page = this;
    // 延时时间等待
    let delayTime = 1;
    // 延时等待毫秒,现设置为1000
    let delayMillsecond = 1000;
    // 调用显示警告函数
    dataHelper.showWran(page, error, delayTime, delayMillsecond);
  },
  formSubmit: function (e) {
    const params = e.detail.value;
    var that = this;
    // 传入表单数据，调用验证方法
    if (!that.WxValidate.checkForm(params)) {
      const error = that.WxValidate.errorList[0]
      that.showWarnInfo(error);
      return false;
    } else if (dataHelper.isEmpty(that.data.role)){
      const error = {
        "msg": "请选择身份"
      };
      that.showWarnInfo(error);
      return false;
    }else{
      that.login(params);
    }
  },
  checkedClick: function (event) {
    //点击选择
    this.setData({
      role: event.currentTarget.dataset.value
    });
  },
  login: function (params) {
    console.log(params);
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userPhone", that.data.userPhone);
    jsonstr = dataHelper.setJson(jsonstr, "passWord", that.data.passWord);
    jsonstr=dataHelper.setJson(jsonstr,"userRole",that.data.role);
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("userInfo/login", jsonParam, this.callback_login);
  },
  callback_login: function (dataW) {
    var that = this;
    var data = dataW.data;
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: '用户或密码错误',
        icon: "none",
        duration: 3000
      })
    } else {
      var timestamp = Date.parse(new Date());
      var expiration = timestamp + 3600000;//1个小时过期时间
      wx.setStorageSync("userId", data.userId);
      wx.setStorageSync("data_expiration", expiration);
      //跳转到我的活动列表页
      //判断是否存在activeId,存在则跳转到活动详情
      if (that.data.activeId != undefined && that.data.activeId != null && that.data.activeId != "") {
        wx.navigateTo({
          url: '../../pages/activeDetail/activeDetail?id=' + that.data.activeId,// 页面 B
        });
      } else {
        wx.switchTab({
          url: '../../pages/activeList/activeList',// 页面 B
          success: function () {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        });
      }
    }
  }
})