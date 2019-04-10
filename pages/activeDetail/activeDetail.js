// pages/activeDetail/activeDetail.js
var userServiceHelper = require('../../utils/userServiceHelper.js');
var util = require('../../utils/util.js');
var dataHelper = require('../../utils/dataHelper.js');
import WxValidate from '../../utils/wx-validate/WxValidate';
var jsonHelper = require('../../utils/jsonHelper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    displayWarn: "display:none",
    isLoad: false,
    activeId: "",
    activeBanner: "",
    activeName: "",
    activeApplicableRole: "",
    signStartTime: "",
    signEndTime: "",
    activeStartTime: "",
    activeEndTime: "",
    roleSelectType: "",
    detailList: [],
    teacherList: [],
    roleTypeList: [],
    userPhone: "",
    userName: "",
    userId: "",
    userRole: "",
    classList: [], //班级列表
    classId: "", //选择班级
    isRegisterActive: false, //是否已参加活动
    registerStatus: "", //1 未开始 2 进行中，3已截止
    activePstatus: "", //1 已开始或者已过期 2 即将开始
    Zb_code: "",
    isClick: false,
    formId: "",
    classNum: "",
    activeIsQuestion: false,
    isQuestionTZ:false//
  },
  roleSelect: function(event) {
    //用户id不为空，则角色不可换
    var that = this;
    if (!dataHelper.isEmpty(that.data.userId)) {
      if (that.data.userRole != event.currentTarget.dataset.code) {
        wx.showToast({
          title: '角色不可更改',
          icon: "none",
          duration: 800
        })
      } else {
        that.setData({
          roleSelectType: event.currentTarget.dataset.code
        })
      }
    } else {
      //则没有用户数据过期或不存在则跳入登录页面，并携带activeID
      wx.navigateTo({
        url: '../../pages/login/login?activeId=' + this.data.activeId // 页面 B
      })
    }
  },
  classSelect: function(event) {
    var that = this;
    that.setData({
      classId: event.currentTarget.dataset.classid
    })
  },
  register: function(event) {
    var that = this;
    //点击我要报名时，判断是否用户ID是否存在，存在则弹框
    if (!dataHelper.isEmpty(that.data.userId)) {
      setTimeout(function() {
        if (!that.data.isRegisterActive && that.data.registerStatus == '2') {
          //判断是否需要填写问卷，是，则跳转问卷链接
          if (that.data.activeIsQuestion && !that.data.isQuestionTZ) {
            wx.navigateTo({
              url: '../../pages/question/question?activeId=' + that.data.activeId + "&activeName=" + that.data.activeName, // 页面 B
            });
          } else {
            //要延时执行的代码
            that.setData({
              isLoad: true
            })
          }
        }
      }, 1000);
    } else {
      //则没有用户数据过期或不存在则跳入登录页面，并携带activeID
      wx.navigateTo({
        url: '../../pages/login/login?activeId=' + this.data.activeId // 页面 B
      })
    }
  },
  gotoZb: function(e) {
    var that = this;
    that.setData({
      Zb_code: e.currentTarget.dataset.zbcode
    });
    console.log(that.data.Zb_code);
    wx.navigateTo({
      url: '../../pages/zbcode/zbcode?url=' + that.data.Zb_code + '&activeId=' + that.data.activeId // 页面 B
    })

  },
  submit: function() {
    //新增报名活动，如果userid不为空则判断roletype 是否适用
    var that = this;
    if (!dataHelper.isEmpty(that.data.userId) && that.data.activeApplicableRole.indexOf(that.data.userRole) >= 0) {
      that.setData({
        roleSelectType: that.data.userRole,
        isClick: true
      });
      //则可参加活动
      that.insertRegisterActive();
    } else if (dataHelper.isEmpty(that.data.userId)) {
      //则没有用户数据过期或不存在则跳入登录页面，并携带activeID
      wx.navigateTo({
        url: '../../pages/login/login?activeId=' + that.data.activeId // 页面 B
      })
    } else {
      wx.showToast({
        title: '活动角色不符合',
        icon: "none",
        duration: 3000
      })
    }
  },
  formSubmit: function(e) {
    console.log(e.detail);
    var that = this;
    //是否确认报名
    wx.showModal({
      title: '提示',
      content: that.data.roleSelectType == "2" ? '是否为学生报名?' : '是否确认报名?',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            formId: e.detail.formId
          })
          that.submit();
        }
      }
    })
    // }
  },
  colsePop: function(event) {
    this.setData({
      isLoad: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if (!dataHelper.isEmpty(options)) {
      this.setData({
        activeId: options.id,
        isQuestionTZ: dataHelper.isEmpty(options.isQuestionTZ) ? false : options.isQuestionTZ
      })
    }

    this.getDatainfo();
  },
  getDataNameBycode: function(codeStr) {
    var resultList = new Array();
    var strList = [];
    var that = this;
    if (codeStr.indexOf(',') >= 0) {
      strList = codeStr.split(',');
      strList.forEach((str, i) => {
        that.data.roleTypeList.forEach((item, i) => {
          if (item.data_code == str) {
            resultList.push(item);
          }
        })
      })
    } else {
      that.data.roleTypeList.forEach((item, i) => {
        if (item.data_code == codeStr) {
          resultList.push(item);
        }
      })
    }
    return resultList;
  },
  getDatainfo: function() {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "roleType");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getDatainfo);

  },
  callback_getDatainfo: function(dataW) {
    var data = dataW.data;
    console.log(data);
    //码表回调
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      //处理数据
      this.setData({
        roleTypeList: data.lists
      });
    }
    this.getActiveInfoById();
  },
  getActiveInfoById: function() {
    var that = this;
    //根据活动ID互殴活动信息
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "activeId", that.data.activeId);
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("activeInfo/getActiveInfoById", jsonParam, this.callback_getActiveInfoById);
  },
  callback_getActiveInfoById: function(dataW) {
    var data = dataW.data;
    //获取活动信息回调
    console.log(data);
    var that = this;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      var detailList = data.activeDetail != undefined && data.activeDetail != null && data.activeDetail != "" ? data.activeDetail.split(";") : [];
      var detailT = new Array();
      if (detailList.length > 0) {
        detailList.forEach((item, i) => {
          if (item != undefined && item != null && item != "") {
            var value = dataHelper.setJson(null, "content", item);
            detailT.push(jsonHelper.stringToJson(value));
          }
        });
      }
      //处理数据 content
      that.setData({
        activeName: data.activeName,
        activeBanner: data.activeBanner,
        teacherList: data.activeTeaList,
        signStartTime: data.signStartTime.substr(0, 10),
        signEndTime: data.signEndTime.substr(0, 10),
        activeStartTime: data.activeStartTime.substr(0, 10),
        activeEndTime: data.activeEndTime.substr(0, 10),
        activeApplicableRole: data.activeApplicableRole,
        detailList: detailT,
        roleTypeList: that.getDataNameBycode(data.activeApplicableRole),
        roleSelectType: data.activeApplicableRole.indexOf(",") >= 0 ? data.activeApplicableRole.split(',')[0] : data.activeApplicableRole,
        Zb_code: data.Zb_code,
        activeIsQuestion: data.activeIsQuestion == "1" ? true : false
      });
      //判断时间
      if (!dataHelper.checkEndDate(data.signStartTime, util.formatTime(new Date()))) {
        //未开始
        that.setData({
          registerStatus: "1"
        })
      } else if (dataHelper.checkEndDate(data.signStartTime, util.formatTime(new Date())) && !dataHelper.checkEndDate(data.signEndTime, util.formatTime(new Date()))) {
        //报名中
        that.setData({
          registerStatus: "2"
        })
      } else if (dataHelper.checkEndDate(data.signEndTime, util.formatTime(new Date()))) {
        //已截止
        that.setData({
          registerStatus: "3"
        })
      }

      if (!dataHelper.checkEndDate(data.activeStartTime, util.formatTime(new Date()))) {
        //即将开始
        that.setData({
          activePstatus: "2"
        })
      } else {
        //已开始或已截止
        that.setData({
          activePstatus: "1"
        })
      }
    }
    //获取用户信息
    if (!dataHelper.isExpiration()) {
      that.setData({
        userId: wx.getStorageSync("userId")
      })
      that.getUserInfoById();
    }
  },
  insertRegisterActive: function() {
    var that = this;
    //根据活动ID互殴活动信息
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "activeId", that.data.activeId);
    jsonstr = dataHelper.setJson(jsonstr, "userPhone", that.data.userPhone);
    jsonstr = dataHelper.setJson(jsonstr, "userName", that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, "userId", that.data.userId);
    jsonstr = dataHelper.setJson(jsonstr, "userRole", that.data.userRole == "" ? that.data.roleSelectType : that.data.userRole);
    jsonstr = dataHelper.setJson(jsonstr, 'classId', that.data.classId);
    jsonstr = dataHelper.setJson(jsonstr, "registerSource", "2");
    jsonstr = dataHelper.setJson(jsonstr, "activeCreate", that.data.userName);
    jsonstr = dataHelper.setJson(jsonstr, "status", "1");
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("activeInfo/insertRegisterActive", jsonParam, this.callback_insertRegisterActive);
  },
  callback_insertRegisterActive: function(dataW) {
    var data = dataW.data;
    console.log(data);
    var that = this;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      wx.showToast({
        title: '报名成功',
        icon: 'success',
        duration: 2000
      });
      //成功之后给老师发送消息 先判断是否存在token
      if (dataHelper.isTokenExpiration()) {
        userServiceHelper.getToken();
      }
      //请求发送模板消息
      setTimeout(function() {
        userServiceHelper.sendMsg(that.data.formId, that.data.activeName, (that.data.activeStartTime + "至" + that.data.activeEndTime), (data.activeNum + "_" + that.data.classNum));
        that.setData({
          isLoad: false
        });
      }, 200)

      //页面跳转到我的活动列表
      setTimeout(function() {
        wx.switchTab({
          url: '../../pages/myActiveList/myActiveList',
          success: function() {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        });
      }, 2000)
    }
  },
  getUserInfoById: function() {
    var that = this;
    //根据活动ID互殴活动信息
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "userId", that.data.userId);
    jsonstr = dataHelper.setJson(jsonstr, "activeId", that.data.activeId); //当前活动
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("userInfo/getUserInfoById", jsonParam, this.callback_getUserInfoById);
  },
  callback_getUserInfoById: function(dataW) {
    var data = dataW.data;
    console.log(data);
    var that = this;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      console.log(data.userRole);
      that.setData({
        userPhone: data.userPhone,
        userName: data.userName,
        userId: data.userId,
        userRole: data.userRole,
        roleSelectType: that.data.activeApplicableRole.indexOf(data.userRole) >= 0 ? (data.userRole.indexOf("2") >= 0 ? "2" : data.userRole.indexOf("3") >= 0 ? "3" : data.userRole.substr(0,1)) : that.data.roleSelectType,
        classList: data.classList,
        classId: data.classList.length > 0 ? data.classList[0].classId : "",
        isRegisterActive: data.isRegisterActive,
        classNum: data.classList.length > 0 ? data.classList[0].classNum : "",
      })
    }
  }
})