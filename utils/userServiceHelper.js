var util = require('util.js');
var dataHelper = require('dataHelper.js');
var serverUrl = "https://www.ruischool.com/";
// var serverUrl = "http://172.20.10.3:8988/";
// var serverUrl = "http://192.168.16.47:8080/";

function jsonParamCommon() {
  var jsonParam = {
    "code": "10002",
    "version": "1.0",
    "jsonStr": {}
  };
  return jsonParam;
}

function requestCommonGet(marked, data, callback) {
  // callback({"d":"1"});
  wx.request({
    url: serverUrl + marked,
    data: data,
    header: {
      "Content-Type": "applciation/json"
    },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: function(res) {
      callback(res);
    },
    fail: function(res) {

    }
  })
}

function requestCommonPost(marked, data, callback) {
  wx.request({
    url: serverUrl + marked,
    data: data,
    header: {
      'content-type': 'application/json'
    },
    method: 'POST',
    success: function(res) {
      callback(res);
    },
    fail: function(res) {}
  })
};
//获取token
function getToken() {
  requestCommonPost("wechatInfo/getToken", {}, callback_getToken);
};

function callback_getToken(dataW) {
  var that = this;
  var data = dataW.data;
  console.log(data);
  if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
    wx.showToast({
      title: data.rspDesc,
      icon: "none",
      duration: 3000
    })
  } else {
    wx.setStorageSync("token", dataW.data.access_token);
  }
}

//发送消息
function sendMsg(formId, activeName, activeTime, activeNum) {
  var data = {
    "keyword1": {
      "value": "百千共读",
      "color": "#173177"
    },
    "keyword2": {
      "value": util.formatTime(new Date()),
      "color": "#173177"
    },
    "keyword3": {
      "value": activeName,
      "color": "#173177"
    },
    "keyword4": {
      "value": activeTime,
      "color": "#173177"
    },
    "keyword5": {
      "value": activeNum,
      "color": "#173177",
      "emphasis_keyword": "keyword5.DATA"
    }
  };
  var jsonParam = jsonParamCommon();
  var jsonstr = dataHelper.setJson(null, "touser", wx.getStorageSync("openId"));
  jsonstr = dataHelper.setJson(jsonstr, "template_id", '-d9IHT8rC4l3kWTd5mrA3bwUij_wzDfewp6jj63urmM');
  jsonstr = dataHelper.setJson(jsonstr, "form_id", formId);
  jsonstr = dataHelper.setJson(jsonstr, "data", data);
  jsonParam.jsonStr = jsonstr;
  console.log(jsonParam);
  requestCommonPost("wechatInfo/sendMsgWechat", jsonParam, callback_sendMsgWechat);
}

function callback_sendMsgWechat(dataW) {
  var that = this;
  var data = dataW.data;
  console.log(data);
  if (dataHelper.isEmpty(data.rspCode) || data.rspCode != "000") {
    wx.showToast({
      title: data.rspDesc,
      icon: "none",
      duration: 3000
    })
  } else {

  }
}
module.exports = {
  requestCommonPost: requestCommonPost,
  requestCommonGet: requestCommonGet,
  jsonParamCommon: jsonParamCommon,
  getToken: getToken,
  sendMsg: sendMsg
}