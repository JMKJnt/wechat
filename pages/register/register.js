// pages/register/register.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var dataHelper = require('../../utils/dataHelper.js');
import WxValidate from '../../utils/wx-validate/WxValidate';
var jsonHelper = require('../../utils/jsonHelper.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    schoolArray: [],
    schoolIndex: 0,
    classArray: [],
    classIndex: 0,
    displayWarn: "display:none",
    roleList: [],
    role: "",
    userPhone: "",
    userName: "",
    passWord: "",
    againPass: "",
    schoolList: [],
    classList: [],
    selectSchool: "",
    selectClass: "",
    schoolName: "",
    className: "",
    activeId: "",
    isLoad: false,
    timeJS: 15,
    isSelectClass: false,
    userEmail: "",
    userAddress: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options != undefined && options != null && options != "") {
      //判断是否存在activeid,存在则记录
      if (!dataHelper.isEmpty(options.activeId)) {
        that.setData({
          activeId: options.activeId
        })
      }
    }
    this.getDatainfo();
    this.setValidate();
    // this.setIntervalinfo();
  },
  getDatainfo: function() {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "roleType");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getDatainfo);
  },
  callback_getDatainfo: function(dataW) {
    //码表回调
    console.log(dataW);
    var data = dataW.data;
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
        role: "1,"
      });
    }
    //获取学校
    this.getSchoolList();
  },
  getSchoolList: function() {
    //获取学校列表
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "status", "1");
    jsonstr = dataHelper.setJson(jsonstr, "curragePage", "1");
    jsonstr = dataHelper.setJson(jsonstr, "pageSize", "99999999");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("classInfo/getSchoolList", jsonParam, this.callback_getSchoolList);

  },
  callback_getSchoolList: function(dataW) {
    console.log(dataW.data);
    var data = dataW.data;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      //处理数据
      var listT = [];
      var arrayT = [];
      var that = this;
      data.lists.forEach((item, i) => {
        var value = dataHelper.setJson(null, "schoolId", item.schoolId);
        value = dataHelper.setJson(value, "schoolName", item.schoolName);
        listT.push(jsonHelper.stringToJson(value));
        arrayT.push(item.schoolName);
      });
      that.setData({
        schoolList: listT,
        schoolArray: arrayT,
        selectSchool: listT != null && listT.length > 0 ? listT[0].schoolId : ""
      });
      this.getClassList(this.data.schoolList[0].schoolId);
    }
  },
  getClassList: function(school) {
    //根据选择学校信息 查询班级信息
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "status", "1");
    jsonstr = dataHelper.setJson(jsonstr, "curragePage", "1");
    jsonstr = dataHelper.setJson(jsonstr, "classSchool", school);
    jsonstr = dataHelper.setJson(jsonstr, "pageSize", "99999999");
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("classInfo/getClassInfoList", jsonParam, this.callback_getClassList);
  },
  callback_getClassList: function(dataW) {
    //获取班级信息回调
    console.log(dataW.data);
    var data = dataW.data;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      //处理数据
      var listT = [];
      var arrayT = [];
      var that = this;
      data.lists.forEach((item, i) => {
        var value = dataHelper.setJson(null, "classId", item.classId);
        value = dataHelper.setJson(value, "className", item.className);
        listT.push(jsonHelper.stringToJson(value));
        arrayT.push(item.className);
      });
      that.setData({
        classList: listT,
        classArray: arrayT,
        selectClass: listT != null && listT.length > 0 ? listT[0].classId : ""
      });
    }
  },
  bindSchoolChange: function(e) {
    console.log(this.data.schoolList[e.detail.value].schoolId);
    //学校选择器
    this.setData({
      selectSchool: this.data.schoolList[e.detail.value].schoolId,
      schoolIndex: e.detail.value,
      classArray: [],
      selectClass: "",
      classList: [],
      className: ""
    })
    this.getClassList(this.data.selectSchool);
  },
  bindClassChange: function(e) {
    //选择班级
    this.setData({
      selectClass: this.data.classList[e.detail.value].classId,
      classIndex: e.detail.value
    })
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
        required: true,
        minlength: 6,
        isEnglishInt: true,
        equalTo: "againPass"
      },
      againPass: {
        required: true,
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
  userEmailInput: function(e) {
    var that = this;
    that.setData({
      userEmail: e.detail.value
    })
  },
  userAddressInput: function(e) {
    var that = this;
    that.setData({
      userAddress: e.detail.value
    })
  },
  checkedClick: function(event) {
    //循环roleList,判断里边的checkstatus
    var that = this;
    var roles = "";
    that.setData({
      isSelectClass: false
    })
    that.data.roleList.forEach((item, i) => {
      if (item.data_code == event.currentTarget.dataset.value) {
        item.checkStatus = item.checkStatus == 'checked' ? "unchecked" : 'checked';
      }
      if (item.checkStatus == 'checked') {
        if (item.data_code == '3') {
          that.setData({
            isSelectClass: true
          })
        }
        roles += item.data_code + ","
      }
    })
    //点击选择
    that.setData({
      role: roles.substring(0, roles.length - 1)
    });
    console.log(that.data.role);
  },
  sureClick: function() {
    var that = this;
    if (that.data.timeJS <= 0) {
      that.setData({
        isLoad: false
      })
      //并且跳转到新增班级
      var that = this;
      wx.navigateTo({
        url: '../../pages/insertClass/insertClass?classTeacher=' + wx.getStorageSync("userId") // 页面 B
      })

      // wx.switchTab({
      //   url: '../../pages/index/index',// 页面 B
      //   success: function () {
      //     var page = getCurrentPages().pop();
      //     if (page == undefined || page == null) return;
      //     page.onLoad();
      //   }
      // });
    }
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
      return false
    } else if (that.data.isSelectClass && dataHelper.isEmpty(that.data.selectSchool)) {
      const error = {
        "msg": "请选择学校"
      };
      that.showWarnInfo(error);
      return false
    } else if (that.data.isSelectClass && dataHelper.isEmpty(that.data.selectClass)) {
      const error = {
        "msg": "请选择班级"
      };
      that.showWarnInfo(error);
      return false
    } else {
      wx.showModal({
        title: '提示',
        content: '身份注册后不可修改是否确认注册?',
        success: function(res) {
          if (res.confirm) {
            that.register(params);
          }
        }
      })

    }
  },
  register: function(params) {
    console.log(params);
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = JSON.stringify(params);
    jsonstr = dataHelper.setJson(jsonstr, 'userName', params.userName);
    jsonstr = dataHelper.setJson(jsonstr, 'userRole', that.data.role);
    jsonstr = dataHelper.setJson(jsonstr, 'nickName', that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, 'userCreate', that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, 'classId', that.data.selectClass);
    jsonstr = dataHelper.setJson(jsonstr, 'schoolId', that.data.selectSchool);
    jsonstr=dataHelper.setJson(jsonstr,"userEmail",that.data.userEmail);
    jsonstr=dataHelper.setJson(jsonstr,"userAddress",that.data.userAddress);
    jsonstr = dataHelper.setJson(jsonstr, 'userThird', wx.getStorageSync("openid"));
    jsonstr = dataHelper.setJson(jsonstr, 'userWechatUnicon', "");
    jsonstr = dataHelper.setJson(jsonstr, 'status', "1");
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("userInfo/insertUserInfo", jsonParam, this.callback_insertUserInfo);
  },
  callback_insertUserInfo: function(dataW) {
    var data = dataW.data;
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      var that = this;
      //将userid存入session，直接跳转我的活动
      var timestamp = Date.parse(new Date());
      var expiration = timestamp + 3600000; //1个小时过期时间
      wx.setStorageSync("userId", data.userId);
      wx.setStorageSync("data_expiration", expiration);
      //如果注册role为老师，则弹出提示，并进入我的信息列表
      if (that.data.role.indexOf("2") >= 0) {
        that.setData({
          isLoad: true
        })
        that.setIntervalinfo();
      } else {
        //跳转到我的活动列表页
        //判断是否存在activeId,存在则跳转到活动详情
        if (!dataHelper.isEmpty(that.data.activeId)) {
          wx.navigateTo({
            url: '../../pages/activeDetail/activeDetail?id=' + that.data.activeId, // 页面 B
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
    }
  },
  setIntervalinfo: function() {
    var that = this;
    var times = 15;
    //倒计时开始
    var timer = setInterval(function() {
      times--;
      if (times <= 0) {
        clearInterval(timer);
      }
      that.setData({
        timeJS: times
      })
    }, 1000)
  }
})