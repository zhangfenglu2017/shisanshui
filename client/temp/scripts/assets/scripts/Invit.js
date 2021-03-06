"use strict";
cc._RFpush(module, '37d962bf0NPxaQIYUcZDwR3', 'Invit');
// scripts\Invit.js

var Socket = require('socket');
cc.Class({
  'extends': cc.Component,

  properties: {
    labelNumbers: [cc.Label],
    callbackJoinRoom: null
  },

  // use this for initialization
  onLoad: function onLoad() {
    this.clickClear();
  },

  clickNumber: function clickNumber(event, number) {
    var label = this._lastEmptyLabel();
    if (label) {
      label.string = number;
    } else {
      return;
    }
    var isComplete = this._lastEmptyLabel() == null;
    var inviteNumber = this._roomNumber();
    if (inviteNumber.length == 6) {
      this.callbackJoinRoom = inviteNumber;
    }
  },

  sendCode: function sendCode() {
    //发送邀请码
    var userId = Socket.instance.userInfo.id;
    var inviteNumber = this.callbackJoinRoom;
    console.log(inviteNumber, "------------------------");
    if (inviteNumber.length == 6) {
      Socket.sendInviteCode(inviteNumber, userId);
      this.callbackJoinRoom = ''; //清空邀请码
    }
  },

  clickClear: function clickClear() {
    this.callbackJoinRoom = '';
    this.labelNumbers.forEach(function (label) {
      label.string = "";
    });
  },

  clickDeleteOne: function clickDeleteOne() {
    var label = this._lastNumberLabel();
    if (label) {
      label.string = "";
    }
  },

  _lastEmptyLabel: function _lastEmptyLabel() {
    for (var index in this.labelNumbers) {
      var label = this.labelNumbers[index];
      if (label.string == null || label.string.length <= 0) {
        return label;
      }
    }
    return null;
  },

  _lastNumberLabel: function _lastNumberLabel() {
    for (var index = this.labelNumbers.length - 1; index >= 0; --index) {
      var label = this.labelNumbers[index];
      if (label.string && label.string.length > 0) {
        return label;
      }
    }

    return null;
  },

  _roomNumber: function _roomNumber() {
    return this.labelNumbers.reduce(function (roomNumber, label) {
      return roomNumber + (label.string || "");
    }, "");
  }
});

cc._RFpop();