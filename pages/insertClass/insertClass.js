// pages/insertClass/insertClass.js
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
    divisionArray: [],
    levelArray: [],
    schoolIndex: 0,
    displayWarn: "display:none",
    classDesc: "",
    className: "",
    schoolList: [],
    selectSchool: "",
    selectClass: "",
    schoolAddress: "",
    schoolName: "",
    classTeacher: "",
    divisionList: [],
    divisionIndex: 0,
    classDivision: "",
    levelList: [],
    levelIndex: 0,
    classLevel: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options != undefined && options != null && options != "") {
      //判断是否存在activeid,存在则记录
      if (!dataHelper.isEmpty(options.classTeacher)) {
        that.setData({
          classTeacher: options.classTeacher
        })
      }
    }
    //获取学校
    this.getSchoolList();
    this.setValidate();
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
    var that = this;
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: '请求失败：' + data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      //处理数据
      var listT = [];
      var arrayT = [];
      data.lists.forEach((item, i) => {
        var value = dataHelper.setJson(null, "schoolId", item.schoolId);
        value = dataHelper.setJson(value, "schoolName", item.schoolName);
        value = dataHelper.setJson(value, "address", item.schoolAddress);
        listT.push(jsonHelper.stringToJson(value));
        arrayT.push(item.schoolName);
      });
      that.setData({
        schoolList: listT,
        schoolArray: arrayT,
        selectSchool: listT != null && listT.length > 0 ? listT[0].schoolId : "",
        schoolAddress: listT != null && listT.length > 0 ? listT[0].address : "",
      });
    }
    that.getClassDivision();
  },
  //获取班级年段
  getClassDivision: function() {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "classDivision");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getClassDivision);
  },
  //获取班级年段回调
  callback_getClassDivision: function(dataW) {
    var data = dataW.data;
    var that = this;
    console.log(data);
    if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      console.log(data.lists)
      var arrayT = [];
      data.lists.forEach((item, i) => {
        arrayT.push(item.data_name);
      })
      //处理数据 
      that.setData({
        divisionList: data.lists,
        divisionArray: arrayT,
        classDivision: "1"
      });
    }
    that.getClassLevel();
  },
  //获取班级级别
  getClassLevel: function() {
    //获取码表数据  GetDictionaryDataList
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = dataHelper.setJson(null, "Dictionary_code", "classLevel");
    jsonParam.jsonStr = jsonstr;
    userServiceHelper.requestCommonPost("dicDataInfo/getDictionaryDataList", jsonParam, this.callback_getClassLevel);
  },
  //获取班级级别回调
  callback_getClassLevel: function(dataW) {
    var data = dataW.data;
    var that = this;
    console.log(data);
    if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "none",
        duration: 3000
      })
    } else {
      console.log(data.lists)
      var arrayT = [];
      data.lists.forEach((item, i) => {
        arrayT.push(item.data_name);
      })
      //处理数据 
      this.setData({
        levelList: data.lists,
        levelArray: arrayT,
        classLevel: "1"
      });
    }
  },
  bindSchoolChange: function(e) {
    console.log(this.data.schoolList[e.detail.value].schoolId);
    //学校选择器
    this.setData({
      selectSchool: this.data.schoolList[e.detail.value].schoolId,
      schoolIndex: e.detail.value,
      schoolAddress: this.data.schoolList[e.detail.value].address
    })
  },
  bindDivisionChange: function(e) {
    console.log(e.detail.value);
    //班级年段
    this.setData({
      classDivision: this.data.divisionList[e.detail.value].data_code,
      divisionIndex: e.detail.value
    })
  },
  bindLevelChange: function(e) {
    console.log(e.detail.value);
    //班级年段
    this.setData({
      classLevel: this.data.levelList[e.detail.value].data_code,
      levelIndex: e.detail.value
    })
  },
  setValidate: function() {
    var that = this;
    const rules = {
      className: {
        required: true,
        maxLength: 100
      },
      classDesc: {
        required: true,
        maxLength: 100
      }
    };
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      className: {
        required: "请输入班级名称",
        maxLength: "名称字符超长"
      },
      classDesc: {
        required: "请输入班级描述",
        maxLength: "描述字符超长"
      }
    };
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages);
  },
  classDescInput: function(e) {
    var that = this;
    that.setData({
      classDesc: e.detail.value
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
      return false
    } else if (dataHelper.isEmpty(that.data.selectSchool)) {
      const error = "请选择学校";
      that.showWarnInfo(error);
      return false
    } else {
      that.insertClass(params);
    }
  },
  insertClass: function(params) {
    console.log(params);
    var that = this;
    var jsonParam = userServiceHelper.jsonParamCommon();
    var jsonstr = JSON.stringify(params);
    jsonstr = dataHelper.setJson(jsonstr, "classSchool", that.data.selectSchool); //学校名称
    jsonstr = dataHelper.setJson(jsonstr, "classDivision", that.data.classDivision); //班级年段
    jsonstr = dataHelper.setJson(jsonstr, "classLevel", that.data.classLevel); //班级级别
    jsonstr = dataHelper.setJson(jsonstr, "classDesc", that.data.classDesc); //班级描述
    jsonstr = dataHelper.setJson(jsonstr, "classTeacher", that.data.classTeacher); //老师id
    jsonstr = dataHelper.setJson(jsonstr, "classSchoolAddress", that.data.schoolAddress); //学校地址
    jsonstr = dataHelper.setJson(jsonstr, "status", "1"); //是否启用1--启用 2--禁用
    jsonstr = dataHelper.setJson(jsonstr, "classCreate", that.data.classTeacher); //创建人为当前用户$.cookie("userName")
    jsonstr = dataHelper.setJson(jsonstr, "studentList", []);
    jsonParam.jsonStr = jsonstr;
    console.log(jsonParam);
    userServiceHelper.requestCommonPost("classInfo/insertClassInfo", jsonParam, this.callback_insertClass);
  },
  callback_insertClass: function(dataW) {
    var data = dataW.data;
    console.log(data);
    if (data.rspCode == undefined || data.rspCode == null || data.rspCode != "000") {
      wx.showToast({
        title: data.rspDesc,
        icon: "loading",
        duration: 3000
      })
    } else {
      //跳转到我的信息
      wx.switchTab({
        url: '../../pages/index/index', // 页面 B
        success: function() {
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return;
          page.onLoad();
        }
      });
    }
  }
})