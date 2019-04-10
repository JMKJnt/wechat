// pages/myInfo/myInfo.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
import WxValidate from '../../utils/wx-validate/WxValidate';
var jsonHelper = require('../../utils/jsonHelper.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    displayWarn: "display:none",
    userId: "",
    userName: "",
    nickName: "",
    userPhone: "",
    userRole: "",
    userRoleName: "",
    passWord: "",
    againPass: "",
    isEditPass: false,
    editTip: "︾", //︾︽
    userEmail: "",
    userAddress: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
    this.setValidate();
  },
  editPass: function() {
    var that = this;
    that.setData({
      isEditPass: !that.data.isEditPass,
      editTip: !that.data.isEditPass ? "︽" : "︾"
    });
    that.setValidate();
  },
  setValidate: function() {
    var that = this;
    const rules = {
      userPhone: {
        required: true,
        tel: true
      },
      userName: {
        required: true,
        maxLength: 50
      },
      passWord: {
        required: that.data.isEditPass,
        minlength: 6,
        isEnglishInt: true,
        equalTo: "againPass"
      },
      againPass: {
        required: that.data.isEditPass,
        minlength: 6,
        isEnglishInt: true,
        equalTo: "passWord"
      }
    };
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      userPhone: {
        required: "请输入手机号",
        tel: "手机号格式不正确"
      },
      userName: {
        required: "请输入姓名",
        maxLength: "姓名长度不可超过50位"
      },
      passWord: {
        required: "请输入密码",
        minlength: "密码必须为6位",
        isEnglishInt: "密码只能是英文或数字",
        equalTo: "密码不一致"
      },
      againPass: {
        required: "请输入确认密码",
        minlength: "密码必须为6位",
        isEnglishInt: "密码只能是英文或数字",
        equalTo: "密码不一致"
      }
    };
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages);
  },
  userNameInput: function(e) {
    var that = this;
    that.setData({
      userName: e.detail.value
    })
  },
  userEmailInput: function (e) {
    var that = this;
    that.setData({
      userEmail: e.detail.value
    })
  },
  userAddressInput: function (e) {
    var that = this;
    that.setData({
      userAddress: e.detail.value
    })
  },
  userPhoneInput: function(e) {
    var that = this;
    that.setData({
      userPhone: e.detail.value
    })
  },
  userNickNameInput: function(e) {
    var that = this;
    that.setData({
      nickName: e.detail.value
    })
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
  formSubmit: function(e) {
    const params = e.detail.value;
    var that = this;
    // 传入表单数据，调用验证方法
    if (!that.WxValidate.checkForm(params)) {
      const error = that.WxValidate.errorList[0]
      that.showWarnInfo(error);
      return false;
    } else {
      this.updateUserInfo(params);
    }
  },
  updateUserInfo: function(param) {
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userId", that.data.userId);
    jsonstr = dataHelper.setJson(jsonstr, "userName", that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, "userPhone", that.data.userPhone);
    jsonstr = dataHelper.setJson(jsonstr, "userRole", that.data.userRole);
    jsonstr = dataHelper.setJson(jsonstr, "nickName", that.data.nickName);
    jsonstr = dataHelper.setJson(jsonstr, "userEmail", that.data.userEmail);
    jsonstr = dataHelper.setJson(jsonstr, "userAddress", that.data.userAddress);
    jsonstr = dataHelper.setJson(jsonstr, "userUpdate", that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, 'userThird', wx.getStorageSync("openid"));
    jsonstr = dataHelper.setJson(jsonstr, "status", "1");
    if (that.data.isEditPass) {
      jsonstr = dataHelper.setJson(jsonstr, "passWord", param.passWord);
    }
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("userInfo/updateUserInfo", jsonParam, that.callback_updateUserInfo);
  },
  callback_updateUserInfo: function(dataW) {
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
      //修改用户信息，保存后返回到我的信息列表
      if (that.data.isEditPass) {
        //跳转到登录
        //退出登录
        wx.clearStorageSync("userId", "");
        wx.setStorageSync("data_expiration", "");
        //跳转到登录页
        wx.navigateTo({
          url: '../../pages/login/login' // 页面 B
        })
      } else {
        wx.switchTab({
          url: '../../pages/index/index', // 页面 B
          success: function() {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      }

    }
  },
  getUserInfoById: function() {
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userId", that.data.userId);
    jsonParam.jsonStr = jsonstr;
    //根据userID获取用户信息
    userServiceHelper.requestCommonPost("userInfo/getUserInfoById", jsonParam, this.callback_getUserInfoById);
  },
  callback_getUserInfoById: function(dataW) {
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
      var h_str = data.userPhone.slice(0, 5);
      var f_str = data.userPhone.slice(9, 11);
      console.log(f_str);
      that.setData({
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        userRoleName: data.userRoleName,
        userPhone: data.userPhone,
        uerPhoneZ: h_str + "****" + f_str,
        nickName: data.nickName,
        userAddress:data.userAddress,
        userEmail:data.userEmail
      })
    }
  }
})